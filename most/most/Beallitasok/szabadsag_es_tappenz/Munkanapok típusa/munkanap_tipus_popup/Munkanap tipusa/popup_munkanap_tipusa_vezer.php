 <?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../../../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

  include __DIR__ . '/popup_munkanap_tipusa.html'; 
 include __DIR__ . '/popup_munkanap_tipusa_plusz_popup.html';
 
 ?>

