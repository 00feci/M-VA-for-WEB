// A fő betöltő, ami lehúzza az adatot, és szól a többieknek (Szín, Lista, Nagy rekord), hogy frissüljenek
function adatokBetoltese(id, globalisBetoltes = false) {
    const idInput = document.getElementById('sztp_id');
    const editSelect = document.getElementById('sztp_edit_megnevezes');
    const btnFeltolt = document.getElementById('btn-sztp-feltoltes');
    const btnKezel = document.getElementById('btn-sztp-kezeles');
    
    if (!idInput) return;

    if (!id && !globalisBetoltes) {
        // HA NINCS KIVÁLASZTVA SEMMI: Ürítés!
        idInput.value = '';
        if (editSelect) editSelect.value = '';
        [btnFeltolt, btnKezel].forEach(b => { if(b) { b.disabled = true; b.style.background = '#ccc'; }});
        
        // 🚀 KISZERVEZETT MODULOK ÜRÍTÉSE
        kodSzinBetoltese('', '#ffffff');
        sablonFajlokBetoltese(null, null);
        nagyRekordBetoltese(null); // <-- Az új modul hívása
        return;
    }

    if (!globalisBetoltes) {
        [btnFeltolt, btnKezel].forEach(b => { if(b) { b.disabled = false; b.style.cursor = 'pointer'; }});
        if (btnFeltolt) btnFeltolt.style.background = '#2196F3';
        if (btnKezel) btnKezel.style.background = '#607d8b';
    }
    
    // ADATOK LETÖLTÉSE AZ ADATBÁZISBÓL
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id)
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.adat) return;
            if (!globalisBetoltes) {
                idInput.value = data.adat.id;
                if (editSelect) editSelect.value = data.adat.id;
                
                // 🚀 KISZERVEZETT MODULOK FELTÖLTÉSE ADATTAL
                kodSzinBetoltese(data.adat.kod, data.adat.hex_szin);
                sablonFajlokBetoltese(data.adat.id, data.adat.extra_adatok);
                nagyRekordBetoltese(data.adat.extra_adatok); // <-- Az új modul hívása
            } else {
                frissitSztpElonezet('picker'); // Ezt a kod_szin.js végzi
            }
        });
}
