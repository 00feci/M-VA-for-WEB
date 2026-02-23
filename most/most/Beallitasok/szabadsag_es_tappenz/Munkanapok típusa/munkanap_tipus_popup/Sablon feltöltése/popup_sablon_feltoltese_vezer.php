<?php
// 1. A gomb HTML-je
include __DIR__ . '/popup_sablon_feltoltese_gomb.html';

// 2. A gomb saját JavaScriptje
$scriptFeltoltGomb = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/Sablon feltöltése/popup_sablon_feltoltese_gomb.js';
echo "<script src='{$scriptFeltoltGomb}?v=" . time() . "'></script>";
?>

