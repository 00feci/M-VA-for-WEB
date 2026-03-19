<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

// 1. Megjelenítjük a gombot a felületen
include __DIR__ . '/hivatkozasok_gomb.html';
?>
<!--<script src="Beallitasok/szabadsag_es_tappenz/Napok típusa/nap_tipusok_kezelese.js?v=<php echo filemtime(__DIR__ . '/nap_tipusok_kezelese.js'); ?>"></script>-->
