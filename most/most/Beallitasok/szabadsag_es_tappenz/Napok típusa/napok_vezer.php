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
<script src="Beallitasok/szabadsag_es_tappenz/Napok%20típusa/nap_tipusok_kezelese.js?v=<?php echo filemtime(__DIR__ . '/nap_tipusok_kezelese.js'); ?>"></script>
<script>
// Átneveztük a függvényt, hogy ne akadjon össze a sztp_fajtak.js-ben lévővel
function napTipusListaBetoltese() {
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?v=' + new Date().getTime())
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.lista) return;

            // Csak a Globális naptípusokat keressük
            const globalRecord = data.lista.find(i => i.megnevezes === "GLOBAL_NAP_TIPUSOK");
            if (globalRecord && typeof adatokBetoltese === 'function') {
                adatokBetoltese(globalRecord.id);
            }
        });
}

// Opcionális: Ha rögtön az oldal betöltésekor be akarod tölteni az adatokat a háttérben:
document.addEventListener('DOMContentLoaded', function() {
    napTipusListaBetoltese();
});
</script>
