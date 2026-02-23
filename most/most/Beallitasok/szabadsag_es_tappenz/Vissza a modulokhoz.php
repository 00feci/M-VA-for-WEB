<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
// 1. Biztosítjuk, hogy a Session fusson, mielőtt kiolvassuk a verziót
if (session_status() === PHP_SESSION_NONE) { session_start(); }

// 2. Összerakjuk a dinamikus, "telepítési" útvonalat
$verzio = $_SESSION['verzio'] ?? ''; // Ha valamiért üres lenne, ne dőljön össze
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/eles_verziok/' . $verzio . '/jogosultsag.php';
// 3. Ellenőrzés
ellenorizJogosultsag('Beállítások'); // Csak ezt a szót kell átírni!
?>
<div class="sztp-vissza-kontener" style="margin-bottom: 15px;">
    <button class="sztp-egyedi-vissza" type="button" onclick="window.location.href='beallitasok.php';" 
        style="padding: 10px 20px; background: #444; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold; transition: background 0.2s;">
        🔙 Vissza a modulokhoz
    </button>
</div>
<style>
.sztp-egyedi-vissza:hover { background: #555 !important; }
/* Ha a modul aktív, elrejtjük az eredeti felső vissza gombot a CSS segítségével */
body.sztp-active .vissza-gomb { display: none !important; }
</style>
