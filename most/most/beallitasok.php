<?php
// beallitasok.php teteje
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

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
