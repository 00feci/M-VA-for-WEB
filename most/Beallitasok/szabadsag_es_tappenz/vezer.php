<?php
// A vissza gomb behívása
include 'Vissza a modulokhoz.php';

// Modulspecifikus JS fájlok behívása (hogy ne a főoldalt terheljék)
?>
<script src="Beallitasok/szabadsag_es_tappenz/js/sztp_nap_tipusok.js?v=<?php echo filemtime(__DIR__ . '/js/sztp_nap_tipusok.js'); ?>"></script>
<script src="Beallitasok/szabadsag_es_tappenz/js/sztp_fajtak.js?v=<?php echo filemtime(__DIR__ . '/js/sztp_fajtak.js'); ?>"></script>
<script src="Beallitasok/szabadsag_es_tappenz/js/sztp_generalas.js?v=<?php echo filemtime(__DIR__ . '/js/sztp_generalas.js'); ?>"></script>
<script src="Beallitasok/szabadsag_es_tappenz/js/sztp_export.js?v=<?php echo filemtime(__DIR__ . '/js/sztp_export.js'); ?>"></script>
<script src="Beallitasok/szabadsag_es_tappenz/js/sz_tp_modul.js?v=<?php echo filemtime(__DIR__ . '/js/sz_tp_modul.js'); ?>"></script>

<div id="sz-tp-modul-root"></div>
