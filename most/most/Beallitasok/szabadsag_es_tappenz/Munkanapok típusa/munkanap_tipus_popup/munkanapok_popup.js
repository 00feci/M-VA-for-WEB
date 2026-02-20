// munkanapok_popup.js 
function adatokBetoltese(id, globalisBetoltes = false) {
    const idInput = document.getElementById('sztp_id');
    const editSelect = document.getElementById('sztp_edit_megnevezes');
    if (!idInput) return;

    if (!id && !globalisBetoltes) {
        idInput.value = '';
        if (editSelect) editSelect.value = '';
        
        // Két külön hívás az inaktív állapothoz
        feltoltesGombAllapot(false);
        kezelesGombAllapot(false);
        
        kodSzinBetoltese('', '#ffffff');
        sablonFajlokBetoltese(null, null);
        nagyRekordBetoltese(null);
        return;
    }

    if (!globalisBetoltes) {
        // Két külön hívás az aktív állapothoz
        feltoltesGombAllapot(true);
        kezelesGombAllapot(true);
    }
    
    // ... (A fetch lekérdezés része ugyanaz marad, amit korábban megbeszéltünk) ...
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id)
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.adat) return;
            if (!globalisBetoltes) {
                idInput.value = data.adat.id;
                if (editSelect) editSelect.value = data.adat.id;
                kodSzinBetoltese(data.adat.kod, data.adat.hex_szin);
                sablonFajlokBetoltese(data.adat.id, data.adat.extra_adatok);
                nagyRekordBetoltese(data.adat.extra_adatok);
            } else {
                frissitSztpElonezet('picker');
            }
        });
}
