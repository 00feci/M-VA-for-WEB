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
    // 1. Megkeressük a GLOBAL_NAP_TIPUSOK kategóriát
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php')
    .then(r => r.json())
    .then(data => {
        if (!data.success) return;
        const napTipusAdat = data.lista.find(i => i.megnevezes === "GLOBAL_NAP_TIPUSOK");
        
        if (napTipusAdat) {
            // ✨ KRITIKUS JAVÍTÁS: Beállítjuk a rejtett ID mezőt! 
            // Enélkül a mentés nem tudja, mit kell frissíteni.
            const idMezo = document.getElementById('sztp_id');
            if (idMezo) idMezo.value = napTipusAdat.id;

            // 2. Lekérjük a konkrét napokat (Munkanap, SZ, stb.)
            fetch('Beallitasok/szabadsag_es_tappenz/sztp_adatok_lekerese.php?id=' + napTipusAdat.id)
            .then(r => r.json())
            .then(res => {
                const select = document.getElementById('sztp_nap_tipusa');
                if (!select) return;
                
                select.innerHTML = '';
                if (res.success && res.adatok && res.adatok.extra_adatok && res.adatok.extra_adatok.napok) {
                    // Feltöltjük a rejtett select-et az elmentett napokkal
                    res.adatok.extra_adatok.napok.forEach(n => {
                        const opt = document.createElement('option');
                        opt.value = n.jel;
                        opt.text = `${n.nev} (${n.jel})`;
                        select.appendChild(opt);
                    });
                }
                
                // 3. Kirajzoljuk a táblázatot (a fekete csíkot)
                if (typeof napTipusListaFrissitese === 'function') {
                    napTipusListaFrissitese();
                }
            });
        }
    });
})();
</script>
