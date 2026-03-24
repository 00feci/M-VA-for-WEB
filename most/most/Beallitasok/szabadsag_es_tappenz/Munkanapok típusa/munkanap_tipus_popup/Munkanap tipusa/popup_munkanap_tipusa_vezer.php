 <?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../../../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------


  include __DIR__ . '/popup_munkanap_tipusa.html'; 
 include __DIR__ . '/popup_munkanap_tipusa_plusz_popup.html';
 ?>
 <script src="Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/Munkanap tipusa/popup_munkanap_tipusa.js?v=<?php echo filemtime(__DIR__ . '/popup_munkanap_tipusa.js'); ?>"></script>
