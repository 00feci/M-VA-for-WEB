<?php
session_start();

// 🚪 Kijelentkezés kezelése
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['kijelentkezes'])) {
    session_unset();
    session_destroy();
    header("Location: /Iroda/belepes.php");
    exit;
}

// 📦 Adatbázis kapcsolat - Robusztusabb útvonal kezelés
$config_path = __DIR__ . '/../sql_config.php'; // Alapértelmezett: egy szinttel feljebb
if (!file_exists($config_path)) {
    $config_path = __DIR__ . '/../../sql_config.php'; // Ha mégis két szinttel feljebb lenne
}

try {
    require_once $config_path;
    if (!function_exists('csatlakozasSzerver1')) {
        die("Hiba: Az adatbázis csatlakozási függvény nem található.");
    }
    $pdo = csatlakozasSzerver1();
} catch (Exception $e) {
    die("Hiba a konfigurációs fájl betöltésekor: " . $e->getMessage());
}

// 🛡️ Felhasználó ellenőrzése
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt = $pdo->prepare("SELECT * FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt->execute(['nev' => $felhasznalo]);
$adat = $stmt->fetch(PDO::FETCH_ASSOC);

// Biztonsági ellenőrzés: ha nem létezik a felhasználó vagy nincs joga
if (!$adat || ($adat['m-va'] ?? 'NINCS') !== 'OK') {
    header("Location: /Iroda/belepes.php?hiba=jogosultsag");
    exit;
}
?>
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>M-VA</title>
  <link rel="icon" type="image/png" href="/Iroda/Marika-min.png">
  <style>
    h1 { text-align: center; font-family: Arial, sans-serif; }
    body { background-color: black; color: white; }
    form {
        max-width: 400px; margin: 20px auto; padding: 30px;
        border: 1px solid #ccc; border-radius: 100px;
        font-family: Arial, sans-serif; background-color: #222;
        display: flex; flex-direction: column; align-items: center;
    }
  /* ✨ A végleges, egységes V8-as gomb stílus */
    .gomb {
        width: 250px;
        height: 66px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-family: 'Segoe UI', sans-serif;
        font-size: 16pt;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin: 10px auto;
        cursor: pointer;
        text-decoration: none;
    }

    /* 🔥 Hover effekt: Neon kék ragyogás minden aktív gombra */
    .gomb:hover:not([disabled]):not(.piros) {
        background: rgba(255, 255, 255, 0.1);
        border-color: #00d2ff; /* Visszahoztuk a modern kék színt */
        box-shadow: 0 0 20px rgba(0, 210, 255, 0.4);
        transform: translateY(-3px) scale(1.02);
    }

  /* Ikonok alaphelyzete */
    .gomb span { 
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        display: inline-block; 
    }

    /* ✨ Egyedi animációk az ikonokhoz */
    @keyframes dobban {
        0%, 100% { transform: scale(1.2); }
        50% { transform: scale(1.4); }
    }

    .gomb:hover .forgo { transform: rotate(180deg) scale(1.2); }  /* Pörög (Beállítások) */
    .gomb:hover .billen { transform: rotate(-15deg) scale(1.2); } /* Megdől (Szerződés) */
    .gomb:hover .dobban { animation: dobban 0.8s infinite; }      /* Pulzál (Szabadság) */
    .gomb:hover .lift { transform: translateY(-5px) scale(1.1); } /* Felemelkedik (Betöltő) */
    .gomb:hover .suhan { transform: translateX(5px) rotate(10deg); } /* Oldalra mozdul (Email) */
    .gomb:hover .nagyit { transform: scale(1.3); }               /* Kiemelkedik (Kezelő/Toborzás) */

    /* 🔒 Tiltott állapot (Vörös üveg) */
    .piros, .gomb[disabled] {
        background: rgba(139, 0, 0, 0.6) !important;
        border-color: darkred !important;
        color: white;
        cursor: not-allowed !important;
        opacity: 0.6;
        transform: none !important;
        box-shadow: none !important;
    }
  </style>
</head>
<body>

<h1>Üdvözlöm, <?= htmlspecialchars($adat['név']) ?>!</h1>

<?php
$jog1 = $adat['Szerződés'] ?? 'NINCS';
$jog2 = $adat['Szabadság_és_Táppénz_kezelő'] ?? 'NINCS';
$jog3 = $adat['ALL_tábla_betöltő'] ?? 'NINCS';
$jog4 = $adat['ALL_tábla_kezelő'] ?? 'NINCS';
$jog5 = $adat['Toborzás'] ?? 'NINCS';
$jog6 = $adat['Hóvégi_zárás'] ?? 'NINCS';
$jog7 = $adat['Tömeges_de_egyedi_e-mail'] ?? 'NINCS';
$jog8 = $adat['Beállítások'] ?? 'NINCS';
?>

<form method="POST" enctype="multipart/form-data" action="gomb_kilk.php">
  <button type="submit" name="funkcio" value="Szerződés" class="gomb <?= $jog1 === 'OK' ? 'zold' : 'piros' ?>" <?= $jog1 !== 'OK' ? 'disabled' : '' ?>>
        <span class="billen">📄</span> <?= $jog1 === 'OK' ? 'Szerződés kezelő' : 'Nincs hozzáférés' ?>
    </button>
    <button type="submit" name="funkcio" value="Szabadság_és_Táppénz_kezelő" class="gomb <?= $jog2 === 'OK' ? 'zold' : 'piros' ?>" <?= $jog2 !== 'OK' ? 'disabled' : '' ?>>
        <span class="dobban">📅</span> <?= $jog2 === 'OK' ? 'SZ és TP kezelő' : 'Nincs hozzáférés' ?>
    </button>
    <button type="button" class="gomb <?= $jog3 === 'OK' ? 'zold' : 'piros' ?>" <?= $jog3 !== 'OK' ? 'disabled' : '' ?> onclick="funkcio2Inditasa(this)">
        <span class="lift">📤</span> <?= $jog3 === 'OK' ? 'ALL tábla betöltő' : 'Nincs hozzáférés' ?>
    </button>
    <button type="submit" name="funkcio" value="ALL_tábla_kezelő" class="gomb <?= $jog4 === 'OK' ? 'zold' : 'piros' ?>" <?= $jog4 !== 'OK' ? 'disabled' : '' ?>>
        <span class="nagyit">🖥️</span> <?= $jog4 === 'OK' ? 'ALL tábla kezelő' : 'Nincs hozzáférés' ?>
    </button>
    <button type="submit" name="funkcio" value="Toborzás" class="gomb <?= $jog5 === 'OK' ? 'zold' : 'piros' ?>" <?= $jog5 !== 'OK' ? 'disabled' : '' ?>>
        <span class="nagyit">👥</span> <?= $jog5 === 'OK' ? 'Toborzás' : 'Nincs hozzáférés' ?>
    </button>
    <button type="submit" name="funkcio" value="Hóvégi_zárás" class="gomb <?= $jog6 === 'OK' ? 'zold' : 'piros' ?>" <?= $jog6 !== 'OK' ? 'disabled' : '' ?>>
        <span class="nagyit">🔒</span> <?= $jog6 === 'OK' ? 'Hóvégi zárás' : 'Nincs hozzáférés' ?>
    </button>
    <button type="submit" name="funkcio" value="Tömeges_de_egyedi_e-mail" class="gomb <?= $jog7 === 'OK' ? 'zold' : 'piros' ?>" <?= $jog7 !== 'OK' ? 'disabled' : '' ?>>
        <span class="suhan">📧</span> <?= $jog7 === 'OK' ? 'Tömeges, de egyedi e-mail' : 'Nincs hozzáférés' ?>
    </button>

    <?php if ($jog8 === 'OK'): ?>
        <div class="gomb zold" onclick="location.href='beallitasok.php'">
            <span class="forgo">⚙️</span> Beállítások
        </div>
    <?php else: ?>
        <div class="gomb piros" disabled>
            <span>⚙️</span> Nincs hozzáférés
        </div>
    <?php endif; ?>

    <input type="file" id="fajl" name="fajl" accept=".txt" style="display: none">
</form>

<form method="POST">
  <button type="submit" name="kijelentkezes">Kijelentkezés</button>
</form>

<script>
function funkcio2Inditasa(gomb) {
  const fileInput = document.getElementById("fajl");
  fileInput.value = "";
  fileInput.onchange = function () {
    const file = fileInput.files[0];
    if (!file) return;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("fajl", file);
    gomb.disabled = true; gomb.textContent = "Feldolgozás... 0%";
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        gomb.textContent = `Feldolgozás... ${percent}%`;
      }
    });
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        gomb.disabled = false;
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.status === "ok") { gomb.textContent = "✔️ Kész"; alert("✅ " + res.uzenet); }
          else { gomb.textContent = "❌ Hiba"; alert("❌ " + res.uzenet); }
        } catch (e) { gomb.textContent = "❌ Hiba"; alert("❌ Hiba a válaszban."); }
        setTimeout(() => { gomb.textContent = "ALL tábla betöltő"; }, 2000);
      }
    };
    xhr.open("POST", "ALL_tabla_betolto/ALL_tabla_betolto.php", true);
    xhr.send(formData);
  };
  fileInput.click();
}
</script>
</body>
</html>






