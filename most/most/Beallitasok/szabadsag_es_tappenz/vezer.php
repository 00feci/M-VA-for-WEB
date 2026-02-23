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


// 1. A vissza gomb behívása (Abszolút útvonallal, hogy ne tévedjen el)
include __DIR__ . '/Vissza a modulokhoz.php';
// ✨ ÚJ: Behúzzuk a Munkanapok típusa vezérlőjét (ami megjeleníti a gombot)
include __DIR__ . '/Munkanapok típusa/munkanapok_vezer.php';




// 2. A JS fájlok behívása a megfelelő sorrendben
// A src marad relatív a beallitasok.php-hoz képest, de a filemtime abszolút!
?>
 <script src="Beallitasok/szabadsag_es_tappenz/js/sztp_nap_tipusok.js?v=<?php echo filemtime(__DIR__ . '/js/sztp_nap_tipusok.js'); ?>"></script>
<script src="Beallitasok/szabadsag_es_tappenz/js/sztp_fajtak.js?v=<?php echo filemtime(__DIR__ . '/js/sztp_fajtak.js'); ?>"></script>
<script src="Beallitasok/szabadsag_es_tappenz/js/sztp_generalas.js?v=<?php echo filemtime(__DIR__ . '/js/sztp_generalas.js'); ?>"></script>
<script src="Beallitasok/szabadsag_es_tappenz/js/sztp_export.js?v=<?php echo filemtime(__DIR__ . '/js/sztp_export.js'); ?>"></script>
<script src="Beallitasok/szabadsag_es_tappenz/js/sz_tp_modul.js?v=<?php echo filemtime(__DIR__ . '/js/sz_tp_modul.js'); ?>"></script>
<div id="sz-tp-modul-root"></div>
