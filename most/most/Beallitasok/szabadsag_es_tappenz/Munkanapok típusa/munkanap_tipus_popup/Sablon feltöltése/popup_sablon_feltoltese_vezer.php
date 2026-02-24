<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../../../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

// 1. A gomb HTML-je
include __DIR__ . '/popup_sablon_feltoltese_gomb.html';

// 2. A gomb saját JavaScriptje
$scriptFeltoltGomb = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/Sablon feltöltése/popup_sablon_feltoltese_gomb.js';
echo "<script src='{$scriptFeltoltGomb}?v=" . time() . "'></script>";
?>


