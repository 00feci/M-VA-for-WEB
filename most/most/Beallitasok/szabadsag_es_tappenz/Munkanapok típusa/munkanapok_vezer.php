<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

// 1. Megjelenítjük a gombot a felületen
include __DIR__ . '/munkanapok_gomb.html';

// 2. Betöltjük a felugró ablak (popup) HTML-jét a memóriába (rejtve)
include __DIR__ . '/munkanap_tipus_popup/munkanapok_popup_vezer.php';
?>
