<?php
// 1. A gomb HTML-je
include __DIR__ . '/popup_sablon_kezelese_gomb.html';

// 2. A gomb saját JavaScriptje
$scriptKezelGomb = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/Sablon kezelése/popup_sablon_kezelese_gomb.js';
echo "<script src='{$scriptKezelGomb}?v=" . time() . "'></script>";
?>

