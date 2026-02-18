<?php
session_start();

// 📦 Adatbázis kapcsolat
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();

// 🔄 Frissítési információs sor lekérdezése
$stmt = $pdo->prepare("SELECT * FROM all_tabla WHERE vonalkod = 'vonalkod' LIMIT 1");
$stmt->execute();
$infoSor = $stmt->fetch(PDO::FETCH_ASSOC);

// 🔡️ Jogosultság ellenőrzés
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt = $pdo->prepare("SELECT * FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt->execute(['nev' => $felhasznalo]);
$adat = $stmt->fetch(PDO::FETCH_ASSOC);

if ($adat['ALL_tábla_kezelő'] !== 'OK') {
    header("Location: /Iroda/belepes.php?hiba=jogosultsag");
    exit;
}

// 🔄 Gombok kezelése
$talalat = $_SESSION['keresett_adat'] ?? [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $melyik = $_POST['melyik'] ?? '';

    if ($melyik === 'keres') {
        $ujMezo1 = $_POST['mezo1'] ?? '';
        $ujMezo2 = $_POST['mezo2'] ?? '';
        $eredetiMezo1 = $_SESSION['eredeti_mezo1'] ?? null;
        $eredetiMezo2 = $_SESSION['eredeti_mezo2'] ?? null;


        try {
            if (($eredetiMezo1 === null && $ujMezo1 !== '') || ($ujMezo1 !== '' && $ujMezo1 !== $eredetiMezo1)) {
                $stmt = $pdo->prepare("SELECT * FROM all_tabla WHERE vonalkod = :ertek LIMIT 1");
                $stmt->execute(['ertek' => $ujMezo1]);
                $talalat = $stmt->fetch(PDO::FETCH_ASSOC);
            } elseif (($eredetiMezo2 === null && $ujMezo2 !== '') || ($ujMezo2 !== '' && $ujMezo2 !== $eredetiMezo2)) {
                $stmt = $pdo->prepare("SELECT * FROM all_tabla WHERE szerz_azon = :ertek LIMIT 1");
                $stmt->execute(['ertek' => $ujMezo2]);
                $talalat = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                echo "<script>alert('\u2139\ufe0f Nem történt változás a mezőkben.');</script>";
            }

            if ($talalat) {
                $_SESSION['keresett_adat'] = $talalat;
                $_SESSION['eredeti_mezo1'] = $ujMezo1;
                $_SESSION['eredeti_mezo2'] = $ujMezo2;
            } elseif (!$talalat) {
                echo "<script>alert('\u274c Nincs találat a megadott adatokra.');</script>";
            }
        } catch (PDOException $e) {
            echo "<script>alert('\u274c Adatbázis hiba: " . addslashes($e->getMessage()) . "');</script>";
        }
    } elseif ($melyik === 'torles') {
        unset($_SESSION['keresett_adat'], $_SESSION['eredeti_mezo1'], $_SESSION['eredeti_mezo2']);
        header("Location: all_tabla_kezelo.php");
        exit;
    } elseif ($melyik === 'ablak') {
        echo "<script>window.open('ablak.php', '_blank');</script>";
        echo "<script>window.location.href='all_tabla_kezelo.php';</script>";
        exit;
    }
     elseif ($melyik === 'vissza') {
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/m-va.php"); // vagy ahova vissza szeretnéd irányítani
    exit;
}
}

// 🧠 Fordítási logika
function forditas($kod) {
    return match($kod) {
        '10'=>'állománynyilvántartásban nem szereplő új szerződés',
        '20'=>'új szerződés',
        '23'=>'reaktivált szerződés',
        '26'=>'díj szempontjából átdolgozott szerződés (1 éven túli indexált szerződés)',
        '60'=>'törlésre előjegyzett szerződés',
        '61'=>'átdolgozás miatt törölt szerződés',
        '63'=>'DNF-EL MEGSZÜNT',
        '66'=>'érdekmúlás haláleset miatt',
        '67'=>'érdekmúlás eladás miatt',
        '70'=>'felmondás az ügyfél részéről',
        '71'=>'felmondás a biztosító részéről',
        '80'=>'érvénytelen szerződés miatt törölt',
        '99'=>'ÜGYFÉL ÁLTAL TÖRÖLT',
        '6A'=>'érdekmúlás közös megegyezéssel',
        '7A'=>'érdekmúlás társasházi szerződés miatt',
        '7B'=>'szerződés törlés - márciusi felmondás miatt',
        '9A'=>'adminisztratív okból sztornózott ajánlat',
        '9B'=>'adminisztratív okból sztornózott szerződés',
        default => 'ismeretlen'
    };
}
?>
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>M-VA</title>
  <link rel="icon" type="image/png" href="/Iroda/Marika-min.png">
  <style>
    h1 {
      text-align: center;
      font-family: Arial, sans-serif;
    }
    body {
      background-color: black;
      color: white;
    }
    form {
      max-width: 900px;
      margin: 20px auto;
      padding: 30px;
      border: 1px solid #ccc;
      border-radius: 100px;
      font-family: Arial, sans-serif;
      background-color: #222;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .sor {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    label {
      min-width: 80px;
      text-align: right;
    }
    input[type="text"] {
      width: 150px;
      padding: 6px;
      border: 1px solid #ccc;
      border-radius: 100px;
    }
    .gomb {
      margin-left: 10px;
      padding: 8px 16px;
      font-size: 14px;
      background-color: #0ef;
      border: none;
      border-radius: 100px;
      cursor: pointer;
      color: #000;
    }
    .sor.full {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 10px;
      margin-bottom: 10px;
    }
    .sor.full label {
      white-space: nowrap;
      min-width: 100px;
      text-align: left;
    }
    .sor.full input {
      flex-grow: 1;
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
      border-radius: 100px;
    }
  .vissza-gomb {
 position: absolute;
  top: 10px;
  left: 80px;
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
}
  </style>
</head>
<body>
<h1>Adatbázis állapot Ki: <?= htmlspecialchars($infoSor['nev'] ?? 'ismeretlen') ?> // Mikor: <?= htmlspecialchars($infoSor['dátum'] ?? 'ismeretlen') ?></h1>

<form method="POST">
  <div class="sor">
    <label for="mezo1">vonalkod:</label>
    <input type="text" id="mezo1" name="mezo1" value="<?= htmlspecialchars($talalat['vonalkod'] ?? '') ?>">
    <label for="mezo2">szerz_azon:</label>
    <input type="text" id="mezo2" name="mezo2" value="<?= htmlspecialchars($talalat['szerz_azon'] ?? '') ?>">
  </div>
  <div class="sor">
    <label for="mezo3">szerkot:</label>
    <input type="text" id="mezo3" name="mezo3" value="<?= htmlspecialchars($talalat['szerkot'] ?? '') ?>">
    <label for="mezo4">dijrend:</label>
    <input type="text" id="mezo4" name="mezo4" value="<?= htmlspecialchars($talalat['dijrend'] ?? '') ?>">
  </div>
  <div class="sor full">
    <label for="mezo5">szervege\\allapot:</label>
    <input type="text" id="mezo5" name="mezo5" value="<?= isset($talalat['szervege'], $talalat['allapot']) ? htmlspecialchars($talalat['szervege'] . ' / ' . forditas($talalat['allapot'])) : '' ?>">
  </div>
  <div class="sor full">
    <label for="mezo6">nev:</label>
    <input type="text" id="mezo6" name="mezo6" value="<?= htmlspecialchars($talalat['nev'] ?? '') ?>">
  </div>
  <div class="sor full">
    <label for="mezo7">cim:</label>
    <input type="text" id="mezo7" name="mezo7" value="<?= htmlspecialchars($talalat['cim'] ?? '') ?>">
  </div>
  <div class="sor full">
    <label for="mezo8">email:</label>
    <input type="text" id="mezo8" name="mezo8" value="<?= htmlspecialchars($talalat['email'] ?? '') ?>">
  </div>
  <div class="sor">
    <button class="gomb" type="submit" name="melyik" value="keres">🔍 Keresés</button>
    <button class="gomb" type="submit" name="melyik" value="ablak">🪟 Ablak</button>
    <button class="gomb" type="submit" name="melyik" value="torles">♻️ Új keresés</button>
    <button class="vissza-gomb" type="submit" name="melyik" value="vissza">⬅ M-VA</button>
  </div>
</form>

<script>
document.querySelector("form").addEventListener("submit", function(e) {
  const gomb = e.submitter?.value;
  if (gomb === "ablak") {
    e.preventDefault();
    window.open("ablak.php", "_blank");
    this.submit(); // újratölti az oldalt (megőrzi az adatokat)
  }
});
</script>
</body>
</html>
