<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

// 1. Megjelenítjük a gombot a felületen
include __DIR__ . '/napok_típusa.html';
?>
<script src="Beallitasok/szabadsag_es_tappenz/Napok%20típusa/nap_tipusok_kezelese.js?v=<?php echo filemtime(__DIR__ . '/nap_tipusok_kezelese.js'); ?>"></script>
<script>
function listaBetoltese() {
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?v=' + new Date().getTime())
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.lista) return;

            // 1. Globális naptípusok kérése (függetlenül a dropdownoktól)
            const globalRecord = data.lista.find(i => i.megnevezes === "GLOBAL_NAP_TIPUSOK");
            if (globalRecord && typeof adatokBetoltese === 'function') {
                adatokBetoltese(globalRecord.id);
            }

            // 2. A többi választólista frissítése
            const selects = [document.getElementById('sztp_megnevezes'), document.getElementById('sztp_edit_megnevezes')];
            selects.forEach(select => {
                if (!select) return;
                const mentettId = select.value;
                select.innerHTML = '<option value="">-- Kiválasztás --</option>';
                data.lista.forEach(i => {
                    if (i.megnevezes === "GLOBAL_NAP_TIPUSOK") return;
                    const opt = document.createElement('option');
                    opt.value = i.id;
                    opt.textContent = i.megnevezes;
                    select.appendChild(opt);
                });
                if (mentettId) select.value = mentettId;
            });
        });
}
</script>
