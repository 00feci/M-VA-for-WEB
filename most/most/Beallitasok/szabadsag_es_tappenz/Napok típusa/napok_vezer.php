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
(function() {
    // 1. Megkeressük a GLOBAL_NAP_TIPUSOK kategória ID-ját
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php')
    .then(r => r.json())
    .then(data => {
        if (!data.success) return;
        const kategoria = data.lista.find(i => i.megnevezes === "GLOBAL_NAP_TIPUSOK");
        
        if (kategoria) {
            // 2. Lekérjük a konkrét típusokat (Munkanap, Szabadság stb.) az adatbázisból
            fetch('Beallitasok/szabadsag_es_tappenz/sztp_adatok_lekerese.php?id=' + kategoria.id)
            .then(r => r.json())
            .then(tipusok => {
                const select = document.getElementById('sztp_nap_tipusa');
                if (!select) return;
                
                select.innerHTML = ''; // Ürítjük a rejtett listát
                
                if (tipusok.success && tipusok.adatok) {
                    tipusok.adatok.forEach(t => {
                        const opt = document.createElement('option');
                        opt.value = t.betujel;
                        opt.text = t.nev + ' (' + t.betujel + ')';
                        select.appendChild(opt);
                    });
                }
                
                // 3. Most, hogy a rejtett select feltöltődött, meghívjuk a JS fájlodban lévő frissítőt
                if (typeof napTipusListaFrissitese === 'function') {
                    napTipusListaFrissitese();
                }
            });
        }
    });
})();
</script>
