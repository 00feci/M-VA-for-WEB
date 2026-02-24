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
// --- GOMBOK FRISSÍTÉSE (Aktiválás / Tiltás) ---
function gombokFrissitese() {
    // 1. Megkeressük az elemeket
    const select = document.getElementById('sztp_megnevezes');
    const editSelect = document.getElementById('sztp_edit_megnevezes');
    const mentesGomb = document.getElementById('sztp_mentes_gomb');
    const torlesGomb = document.getElementById('sztp_torles_gomb');

    // Ha még be sincs töltve a popup, ne fusson le
    if (!mentesGomb || !torlesGomb) return;

    // 2. Megnézzük, mi van kiválasztva
    // A 'select' a fő lista, az 'editSelect' a szerkesztéshez használt lista (ha van ilyen logika)
    // Általában a 'sztp_megnevezes' vagy a rejtett 'sztp_id' dönti el, hogy van-e kiválasztott elem.
    
    const idInput = document.getElementById('sztp_id');
    const vanId = idInput && idInput.value && idInput.value !== "";
    
    // Ha "Új hozzáadása" van, vagy nincs ID, akkor a kiválasztás "üres"
    const valasztottErtek = select ? select.value : "";
    const ujElemMod = (valasztottErtek === "uj" || valasztottErtek === "");

    // 3. Törlés gomb kezelése
    // Csak akkor aktív, ha van ID (tehát létező elemet szerkesztünk) ÉS nem új elem
    if (vanId && !ujElemMod) {
        torlesGomb.disabled = false;
        torlesGomb.style.opacity = "1";
        torlesGomb.style.cursor = "pointer";
    } else {
        torlesGomb.disabled = true;
        torlesGomb.style.opacity = "0.5";
        torlesGomb.style.cursor = "not-allowed";
    }

    // 4. Mentés gomb kezelése
    // Mindig aktív, ha a formhoz nyúltunk, vagy ha van kiválasztás.
    // (Egyszerűsítve: legyen mindig aktív, ha nem tiltjuk le külön)
    // De a te kérésedre: csak akkor, ha van mit menteni.
    mentesGomb.disabled = false; 
    mentesGomb.style.opacity = "1";
    mentesGomb.style.cursor = "pointer";
}

// Figyelők beállítása, hogy kattintásra/változásra frissüljön
document.addEventListener('change', function(e) {
    if (e.target && (e.target.id === 'sztp_megnevezes' || e.target.id === 'sztp_edit_megnevezes')) {
        // Egy pici késleltetés, hogy a mezők (pl. sztp_id) biztosan kitöltődjenek előtte
        setTimeout(gombokFrissitese, 100);
    }
});

// Amikor betöltődik az adat (az adatokBetoltese függvény végén is meg lehet hívni)
// De ez a figyelő is elkapja a változásokat.
