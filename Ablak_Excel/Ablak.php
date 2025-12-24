<?php
// Funkció4 – Munkaidő és távollét nyilvántartás

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] .'/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();
date_default_timezone_set('Europe/Budapest');

// 🔐 Jogosultság ellenőrzés
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt = $pdo->prepare("SELECT * FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt->execute(['nev' => $felhasznalo]);
$adat = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$adat || $adat['Szabadság_és_Táppénz_kezelő'] !== 'OK') {
    header("Location: /Iroda/belepes.php?hiba=jogosultsag");
    exit;
}

// 📅 Legfrissebb betöltés_dátum
$stmt2 = $pdo->query("SELECT MAX(`betöltés_dátum`) AS legfrissebb FROM call_center_hasznalat");
$legfrissebbDatum = $stmt2->fetchColumn();



// 📅 Hónap beállítása (URL paraméterből vagy alapból aktuális hónap)
$ev = isset($_GET['ev']) ? (int)$_GET['ev'] : date('Y');
$honap = isset($_GET['honap']) ? (int)$_GET['honap'] : date('n');

// Napok számának friss számítása az aktuális hónapra
$napokValos = cal_days_in_month(CAL_GREGORIAN, $honap, $ev); // pl. 28, 30, 31
$maxNapok   = 31;
$napNevek = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];


// Előző és következő hónap számítása
$elozoHonap = $honap - 1;
$elozoEv = $ev;
if ($elozoHonap < 1) {
    $elozoHonap = 12;
    $elozoEv--;
}

$kovetkezoHonap = $honap + 1;
$kovetkezoEv = $ev;
if ($kovetkezoHonap > 12) {
    $kovetkezoHonap = 1;
    $kovetkezoEv++;
}

$honapNevek = [
    1 => 'Január', 2 => 'Február', 3 => 'Március', 4 => 'Április',
    5 => 'Május', 6 => 'Június', 7 => 'Július', 8 => 'Augusztus',
    9 => 'Szeptember', 10 => 'Október', 11 => 'November', 12 => 'December'
];

// 📊 'A' jelölések előkészítése a call_center_hasznalat táblából
$aJelolesek = [];

try {
    $stmtA = $pdo->prepare("
        SELECT
            LPAD(TRIM(`Operátor név`), 4, '0') AS op_kod,
            DATE(`Dátum`) AS datum
        FROM call_center_hasznalat
        WHERE YEAR(`Dátum`) = :ev
          AND MONTH(`Dátum`) = :honap
          AND TIME_TO_SEC(IFNULL(`Hasznos munkavégzés`, '0:00:00')) > 0
        GROUP BY op_kod, DATE(`Dátum`)
    ");
    $stmtA->execute([
        'ev'    => $ev,
        'honap' => $honap
    ]);

    while ($row = $stmtA->fetch(PDO::FETCH_ASSOC)) {
        $opKod = $row['op_kod'];                // pl. "0004", "0106", "0120"
        $nap   = (int)date('j', strtotime($row['datum'])); // nap sorszáma 1..31

        if (!isset($aJelolesek[$opKod])) {
            $aJelolesek[$opKod] = [];
        }
        $aJelolesek[$opKod][$nap] = 'A';
    }
} catch (Exception $e) {
    // hiba esetén marad az üres tömb
}

$MVA_EMBED = defined('MVA_EMBED') && MVA_EMBED === true;
$API_BASE   = $MVA_EMBED ? 'Ablak_Excel/' : ''; // végén legyen /, vagy legyen üres

//
?>

<!DOCTYPE html>
<html lang="hu">
<head>
  <!-- Tom Select CSS + JS -->
<link href="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js"></script>
  <meta charset="UTF-8">
  <title>Munkaidő nyilvántartás - <?php echo "$ev.$honap"; ?></title>
  <link rel="icon" type="image/png" href="/Iroda/Marika-min.png">
<link rel="stylesheet" href="css/ablak.css?v=<?php echo filemtime(__DIR__ . '/css/ablak.css'); ?>">
</head>
<body>

<h2 class="honap-fejlec">
    <a href="?ev=<?php echo $elozoEv; ?>&honap=<?php echo $elozoHonap; ?>">&lt;</a>
    <?php echo sprintf('%04d.%02d (%s)', $ev, $honap, $honapNevek[$honap]); ?>
    <a href="?ev=<?php echo $kovetkezoEv; ?>&honap=<?php echo $kovetkezoHonap; ?>">&gt;</a>
</h2>

<div class="sticky-gombok" style="display:flex; justify-content:space-between; align-items:center;">
  <!-- Bal oldali gombok -->
  <div style="display:flex; gap:10px;">
    <button onclick="ujKulsoSorHozzaadasa()">➕ Külsős hozzáadása</button>
    <button onclick="exportMunkaido()">📤 Exportálás Excelbe</button>
  </div>
  
  <!-- Középső blokk -->
  <div style="display:flex; justify-content:center; align-items:center; gap:10px; flex:1;">
<span style="font-weight:bold;">Rendszer Adat:</span>
<span id="legfrissebbDatum"><?php echo htmlspecialchars($legfrissebbDatum ?: 'nincs adat'); ?></span>
    <button onclick="betoltes()">📥 Betöltés</button>
    <button onclick="ratoltes()">🔄 Rátöltés</button>
    <button onclick="exportCallCenter()">📤 Exportálás</button>
    <button id="btnSzerkesztoMod" onclick="toggleSzerkesztoMod()" style="padding:10px; cursor:pointer;">
    👁️ Csak olvasás
</button>
<button onclick="exportalasVegleges()" style="background-color: #673ab7; color: white; padding: 10px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold;">
    📄 Bérszámfejtési Lista (Végleges)
</button>
  </div>


  <!-- Jobb oldali színes kódválasztó -->
  <div class="tipus-valaszto">
    <span id="tipusPreview" class="kod-preview">🖱</span>
    <select id="tipusSelect">
     <option value="eger">🖱 Egér</option>
  <option value="rendszer-adat" data-kod="A">rendszerből Adat</option>
  <option value="rendes-szabadsag" data-kod="SZ">Rendes szabadság</option>
  <option value="tanulmanyi-szabadsag" data-kod="SZ">Tanulmányi szabadság</option>
  <option value="kozeli-hozzatartozo-halala-miatt" data-kod="SZ">Közeli hozzátartozó halála miatt</option>
  <option value="tappenz" data-kod="TP">Táppénz</option>
  <option value="tappenz-gyap" data-kod="TP">Táppénz (GYÁP)</option>
  <option value="fizetes-nelkuli-szabadsag" data-kod="fn">Fizetés nélküli szabadság</option>
    </select>
  </div>
</div>

<input type="file" id="ratoltesFile" name="ratoltes_file" accept=".txt" style="display:none;">
<input type="file" id="betoltesFile" name="betoltes_file" accept=".txt" style="display:none;">



<table class="munkaido">

<thead>
  <!-- 1. sor: Dátumfejlécek -->
    <tr class="fejlec-datumok">
    <th>OP szám</th>
    <th>Név</th>
    <?php
      setlocale(LC_TIME, 'hu_HU.UTF-8');
      for ($nap = 1; $nap <= $maxNapok; $nap++) {
        if ($nap <= $napokValos) {
          $datum     = sprintf('%04d-%02d-%02d', $ev, $honap, $nap);
          $timestamp = strtotime($datum);
          $napNev    = $napNevek[date('w', $timestamp)];
          $kiiras    = date('Y.m.d', $timestamp) . ' ' . $napNev;
          echo '<th class="forgatott-fejlec"><div>' . $kiiras . '</div></th>';
        } else {
          // Nem létező nap (pl. február 30–31) – szürke, inaktív oszlop
          echo '<th class="forgatott-fejlec inaktiv-nap"><div>' . $nap . '.</div></th>';
        }
      }

    ?>
    <th><div>Összes<br>szabi</div></th>
    <th><div>Összes<br>táppénz</div></th>
    <th><div>Fizetetlen<br>szabadság</div></th>
  </tr>

  <!-- 2. sor: Napok típusa -->
  <tr class="fejlec-napok-tipusa">
    <th style="text-align: center;" id="sliderContainer">
      <button onclick="valtMinusz()">◀</button>
      <span id="sliderValue">&lt;Egér&gt;</span>
      <button onclick="valtPlusz()">▶</button>
    </th>
    <th class="ures-cella" style="text-align: center;">Napok típusa</th>

    <?php for ($nap = 1; $nap <= $maxNapok; $nap++): ?>
      <?php
        $classes = 'ures-cella napok-tipusa';
        if ($nap > $napokValos) {
          $classes .= ' inaktiv-nap';
        }
      ?>
      <th class="<?php echo $classes; ?>" onclick="beirErtek(this)">-</th>
    <?php endfor; ?>


    <th></th><th></th><th></th>
  </tr>
</thead>

 <tbody id="tabla-body"></tbody>
</table>
<script>
  // Konfiguráció a JS-nek
  window.AblakCfg = {
    ev: <?php echo (int)$ev; ?>,
    honap: <?php echo (int)$honap; ?>,
    napokSzama: 31, // fix 31 oszlop a táblában
    napokValos: <?php echo (int)$napokValos; ?>, // tényleges napok száma az adott hónapban
    apiBase: "<?php echo $API_BASE; ?>"
  };


  // 'A' jelölések: window.AJelolesek[op_kod][nap] = 'A'
  window.AJelolesek = <?php echo json_encode($aJelolesek, JSON_UNESCAPED_UNICODE); ?>;
</script>
<script src="js/ablak.js?v=<?php echo filemtime(__DIR__ . '/js/ablak.js'); ?>"></script>
</body>
</html>


