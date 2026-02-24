let kivalasztottFajlokBuffer = []; // ✨ EZ HIÁNYZOTT! Létrehozzuk a globális változót.
function megnevezesSzerkesztoMegnyitasa() {
    const modal = document.getElementById('sztp-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('sztp_tomeges_bevitel').focus();
    }
}
function modalBezaras() {
    const modal = document.getElementById('sztp-modal');
    if (modal) modal.style.display = 'none';
    document.getElementById('sztp_tomeges_bevitel').value = ''; 
}
function megnevezesekMentese() {
    const szoveg = document.getElementById('sztp_tomeges_bevitel').value;
    const elemek = szoveg.split(/[\n,]/).map(item => item.trim()).filter(item => item !== "");
    if (elemek.length === 0) return modalBezaras();
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_tomeges_mentes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nevek: elemek })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            document.getElementById('sztp_tomeges_bevitel').value = '';
            listaBetoltese(); 
        } else {
            alert("Hiba: " + data.message);
        }
        modalBezaras();
   });
}
function szuresSztpMegnevezesre(szo, targetId = 'sztp_megnevezes') {
    const select = document.getElementById(targetId);
    if (!select) return;
    const keresendo = szo.toLowerCase();
    for (let i = 1; i < select.options.length; i++) {
        select.options[i].style.display = select.options[i].text.toLowerCase().includes(keresendo) ? "" : "none";
    }
}
function fajtaBeallitasokMegnyitasa() {
    const select = document.getElementById('sztp_megnevezes');
    const editSelect = document.getElementById('sztp_edit_megnevezes');
    if (select && editSelect) {
        editSelect.value = select.value; // Szinkronizáljuk a választást
    }
    document.getElementById('sztp-fajta-modal').style.display = 'flex';
    frissitSztpElonezet('picker');
}
function listaBetoltese() {
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?v=' + new Date().getTime())
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const selects = [document.getElementById('sztp_megnevezes'), document.getElementById('sztp_edit_megnevezes')];
            
            selects.forEach(select => {
                if (!select) return;
                const mentettId = select.value;
                select.innerHTML = '<option value="">-- Kiválasztás --</option>';
                data.lista.forEach(i => {
                    if (i.megnevezes === "GLOBAL_NAP_TIPUSOK") {
                        if (select.id === 'sztp_megnevezes') adatokBetoltese(i.id, true);
                        return; 
                    }
                    const opt = document.createElement('option');
                    opt.value = i.id;
                    opt.textContent = i.megnevezes;
                    select.appendChild(opt);
                });
                if (mentettId) select.value = mentettId;
            });
        });
}
// --- VEZÉRLÉS BEKÖTÉSE (Ez hiányzott!) ---

// 1. Ha váltasz a listában, azonnal frissítjük a gombokat
document.addEventListener('change', function(e) {
    // Ha a fő választót vagy a szerkesztő választót állítják
    if (e.target && (e.target.id === 'sztp_megnevezes' || e.target.id === 'sztp_edit_megnevezes')) {
        
        const val = e.target.value;
        // Akkor aktív a gomb, ha VAN érték (tehát nem üres)
        // (Mindegy, hogy "uj" vagy "létező ID", a lényeg, hogy nem az "-- Válassz --")
        const legyenAktiv = (val && val !== "");

        // Meghívjuk a Te függvényedet!
        if (typeof mentesGombAllapot === "function") {
            mentesGombAllapot(legyenAktiv);
        }
        
        // Ha a törlés gombnak is van saját függvénye, azt is hívhatjuk:
        if (typeof torlesGombAllapot === "function") {
            // Törlés csak akkor aktív, ha NEM "uj" és NEM üres
            torlesGombAllapot(val && val !== "" && val !== "uj");
        }
    }
});
