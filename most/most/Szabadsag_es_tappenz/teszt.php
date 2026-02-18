<?php
// teszt.php – Funkció4 főoldal szimuláció
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] .'/Iroda/sql_config.php';
date_default_timezone_set('Europe/Budapest');
// 🛠️ Szabadság és Táppénz adatbázis struktúra ellenőrzése
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/eles_verziok/' . $_SESSION['verzio'] . '/Beallitasok/szabadsag_es_tappenz/sql_sz_tp.php';
?>
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>Funkció4 teszt főoldal</title>
  <link rel="icon" type="image/png" href="/Iroda/Marika-min.png">

  <!-- Tom Select CSS + JS (embed módban itt töltjük) -->
  <link href="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js"></script>

  <style>
    body { font-family: sans-serif; margin:20px; }
    button { padding:6px 12px; margin:10px 0; }
    .keret { border:2px dashed #aaa; padding:10px; }
  </style>
</head>
<body>

<h1>Funkció4 főoldal (teszt)</h1>

<!-- Gomb, ami az Ablakot önálló módban nyitja -->
<form method="get" action="Ablak_Excel/Ablak.php">
  <button type="submit">➡️ Nyisd meg az Ablak funkciót (külön oldal)</button>
</form>

<hr>

<h2>Beépített Ablak teszt (embed)</h2>
<div class="keret">
<?php
  // Embed mód: NINCS külön <html> keret, az Ablak saját CSS-ét és JS-ét maga teszi ki
  define('MVA_EMBED', true);
  include __DIR__ . '/Ablak_Excel/Ablak.php';
?>
</div>

</body>
</html>
