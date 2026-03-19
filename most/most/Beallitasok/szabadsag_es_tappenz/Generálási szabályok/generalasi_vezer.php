<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

// 1. Megjelenítjük a gombot a felületen
include __DIR__ . '/napok_típusa.html';

// 2. Betöltjük a felugró ablak HTML-jét (EZ HIÁNYZOTT!)
include __DIR__ . '/nap_tipusok_kezelese.html';
?>
<script src="Beallitasok/szabadsag_es_tappenz/Napok típusa/nap_tipusok_kezelese.js?v=<?php echo filemtime(__DIR__ . '/nap_tipusok_kezelese.js'); ?>"></script>
<script src="Beallitasok/szabadsag_es_tappenz/Napok típusa/napok_típusa.js?v=<?php echo filemtime(__DIR__ . '/napok_típusa.js'); ?>"></script>