<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

// 1. Megjelenítjük a gombot a felületen
include __DIR__ . '/napok_típusa.html';
include __DIR__ . '/nap_tipusok_kezelese.html';
?>
<script src="Beallitasok/szabadsag_es_tappenz/Napok típusa/nap_tipusok_kezelese.js?v=<?php echo filemtime(__DIR__ . '/nap_tipusok_kezelese.js'); ?>"></script>
<script>
// Amint betöltődött a modul, azonnal lekérjük az adatokat
(function() {
    // Itt meg kell hívnunk azt a funkciót, ami feltölti a listát.
    // Mivel a "Napok típusa" a globális listából jön, megkeressük az azonosítóját.
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                // Megkeressük a GLOBAL_NAP_TIPUSOK bejegyzést
                const napTipusAdat = data.lista.find(i => i.megnevezes === "GLOBAL_NAP_TIPUSOK");
                if (napTipusAdat && typeof adatokBetoltese === 'function') {
                    // Betöltjük a konkrét típusokat a rejtett select-be
                    adatokBetoltese(napTipusAdat.id, true);
                    
                    // Kis várakozás után (hogy a fetch lefusson) frissítjük a látható listát
                    setTimeout(() => {
                        if (typeof napTipusListaFrissitese === 'function') {
                            napTipusListaFrissitese();
                        }
                    }, 200);
                }
            }
        });
})();
</script>
