<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
// 1. Biztosítjuk, hogy a Session fusson, mielőtt kiolvassuk a verziót
if (session_status() === PHP_SESSION_NONE) { session_start(); }

// 2. Összerakjuk a dinamikus, "telepítési" útvonalat
$verzio = $_SESSION['verzio'] ?? ''; // Ha valamiért üres lenne, ne dőljön össze
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/eles_verziok/' . $verzio . '/jogosultsag.php';

// 3. Ellenőrzés
ellenorizJogosultsag('m-va'); // Csak ezt a szót kell átírni!
// -------------------------------
// Ellenőrzés, hogy a 'funkcio' POST változó be van-e állítva
if (isset($_POST['funkcio'])) {

if ($_POST['funkcio'] === 'Szerződés') {
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/Szerzodes/szerzodes.php");

}elseif ($_POST['funkcio'] === 'Szabadság_és_Táppénz_kezelő') { //szabadsag_es_tappenz.php
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/Szabadsag_es_tappenz/teszt.php");

} elseif ($_POST['funkcio'] === 'ALL_tábla_betöltő') {
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/ALL_tabla_betolto/aLL_tabla_betolto.php");
    
}elseif ($_POST['funkcio'] === 'ALL_tábla_kezelő') {
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/ALL_tabla_kezelo/all_tabla_kezelo.php"); 

}elseif ($_POST['funkcio'] === 'Toborzás') {
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/Toborzas/toborzas.php");

}elseif ($_POST['funkcio'] === 'Hóvégi_zárás') {
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/Hovegi_zaras/jovegi_zaras.php");

}elseif ($_POST['funkcio'] === 'Tömeges_de_egyedi_e-mail') {
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/Tomeges_de_egyedi_e-mail/tomeges_de_egyedi_e-mail.php");
    
}elseif ($_POST['funkcio'] === 'Beállítások') {
    header("Location: /Iroda/eles_verziok/" . $_SESSION['verzio'] . "/beallitasok.php");}
    
// ...stb.
}

?>
