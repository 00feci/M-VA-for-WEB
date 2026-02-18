<?php
// beallitasok.php
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] .'/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();
// 🔙 Vissza gomb kezelése
if (isset($_POST['melyik']) && $_POST['melyik'] === 'vissza') {
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/m-va.php");
    exit;
}
// 🔐 Jogosultság ellenőrzés (Ablak.php-ból átvéve)
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt = $pdo->prepare("SELECT * FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt->execute(['nev' => $felhasznalo]);
$adat = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$adat || $adat['Beállítások'] !== 'OK') {
    header("Location: /Iroda/belepes.php?hiba=jogosultsag");
    exit;
}
?>

<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <title>M-VA</title> <link rel="icon" type="image/png" href="/Iroda/Marika-min.png"> <link rel="stylesheet" href="Beallitasok/beallitasok/css/beallitasok.css?v=<?php echo filemtime(__DIR__ . '/Beallitasok/beallitasok/css/beallitasok.css'); ?>">
</head>
<body>
   <div class="beallitas-panel">
    <div class="header">
        <h2 id="panel-cim">⚙️ Beállítások</h2>
    </div>
    <?php include 'vezer.php'; ?>
      <div class="utvonal-jelzo" id="breadcrumb">
            Iroda <span>&gt;</span> Beállítások
        </div>

        <div class="menu-kontener" id="menu-kontener">
            <div class="dashboard-gomb" onclick="navigacio('szabadsag')">📅 Szabadság és Táppénz</div>
            <div class="dashboard-gomb" onclick="navigacio('felhasznalok')">👥 Felhasználók</div>
           <!--<div class="dashboard-gomb" onclick="navigacio('rendszer')">⚙️ Rendszer</div>-->
        </div>
    </div>
   <script src="Beallitasok/beallitasok/js/beallitasok.js?v=<?php echo filemtime(__DIR__ . '/Beallitasok/beallitasok/js/beallitasok.js'); ?>"></script>
   
</body>
</html>
