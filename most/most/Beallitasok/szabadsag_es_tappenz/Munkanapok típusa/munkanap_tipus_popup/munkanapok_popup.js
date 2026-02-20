// A fő betöltő - munkanapok_popup.js
function adatokBetoltese(id, globalisBetoltes = false) {
    const idInput = document.getElementById('sztp_id');
    const editSelect = document.getElementById('sztp_edit_megnevezes');
    if (!idInput) return;

    if (!id && !globalisBetoltes) {
        // HA ÜRESRE ÁLLÍTJUK:
        idInput.value = '';
        if (editSelect) editSelect.value = '';
        
        sablonGombokAllapota(false); // Gombok letiltása
        kodSzinBetoltese('', '#ffffff');
        sablonFajlokBetoltese(null, null);
        nagyRekordBetoltese(null);
        return;
    }

    if (!globalisBetoltes) {
        sablonGombokAllapota(true); // Gombok engedélyezése
    }
    
    // LETÖLTÉS
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id)
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.adat) return;
            if (!globalisBetoltes) {
                // Alap adatok beállítása a fő popupban
                idInput.value = data.adat.id;
                if (editSelect) editSelect.value = data.adat.id;
                
                // Feladatok leosztása a kiszervezett moduloknak
                kodSzinBetoltese(data.adat.kod, data.adat.hex_szin);
                sablonFajlokBetoltese(data.adat.id, data.adat.extra_adatok);
                nagyRekordBetoltese(data.adat.extra_adatok);
            } else {
                frissitSztpElonezet('picker');
            }
        });
}
