// Beallitasok/beallitasok/Felhasznalok/js/felhasznalok.js

// 🌍 Globális definíció - CSAK ITT KELL MÓDOSÍTANI, ha új szöveges mező lesz!
const SZOVEGES_MEZOK = ['név', 'email', 'felhasználónév', 'jelszó', 'telefon', 'mac_cím', 'külső_ip_cím', 'cég'];
let html = '<div class="felhasznalo-tabla-wrapper"><table class="f-tabla"><thead><tr>';
async function felhasznalokBetoltese() {
    const tartalomHelye = document.getElementById('modul-tartalom');
    if (tartalomHelye) tartalomHelye.innerHTML = '<p style="text-align:center; padding:20px;">Betöltés...</p>';
    try {
        const response = await fetch('Beallitasok/beallitasok/Felhasznalok/felhasznalok_lekerese.php');
        const res = await response.json();
        if (res.status === 'ok') {
            generaljTablazatot(res.adatok, res.oszlopok);
        } else {
            if (tartalomHelye) tartalomHelye.innerHTML = '<p style="color:red">Hiba: ' + (res.error || 'Ismeretlen hiba') + '</p>';
        }
    } catch (e) {
        console.error("Betöltési hiba:", e);
    }
}

function generaljTablazatot(adatok, oszlopok) {
    // 🎨 Fejléc és első oszlop rögzítése + összecsúszás elleni védelem
    let html = `
    <style>
        .felhasznalo-tabla-wrapper { overflow: auto; width: 100%; max-height: 75vh; border: 1px solid #444; position: relative; }
        .f-tabla { border-collapse: separate; border-spacing: 0; min-width: max-content; width: 100%; table-layout: auto; }
        .f-tabla th, .f-tabla td { vertical-align: middle; text-align: center; padding: 8px 12px; height: 50px; border-bottom: 1px solid #444; border-right: 1px solid #444; background: #222; color: #fff; }
        
        /* 📌 Fejléc (oszlopnevek) rögzítése */
        .f-tabla thead th { position: sticky; top: 0; z-index: 100; background: #333; border-bottom: 2px solid #666; }
        
        /* 📌 Első oszlop rögzítése */
        .f-tabla th:first-child, 
        .f-tabla td:first-child { position: sticky; left: 0; z-index: 90; background: #222; border-right: 2px solid #666; }
        
        /* 📌 Sarok cella (Választ fejléc) rögzítése minden irányba */
        .f-tabla thead th:first-child { z-index: 110; background: #333; }

        .new-user-row td { background: #2a2a2a !important; }
        .f-input { width: 100%; min-width: 180px; padding: 6px; box-sizing: border-box; border: 1px solid #555; background: #333; color: #fff; }
        .switch { margin: 0 auto; display: inline-block; }
    </style>
    <div class="felhasznalo-tabla-wrapper"><table class="f-tabla"><thead><tr>`;
    
    html += '<th>Választ</th>';
    
    oszlopok.forEach(o => { 
        if(o !== 'dátum' && o !== 'id' && o !== 'szerep') html += `<th>${o}</th>`; 
    });
    html += '</tr></thead><tbody>';

    // Meglévő felhasználók
    adatok.forEach(sor => {
        html += `<tr>`;
        html += `<td><input type="radio" name="user-select" value="${sor.felhasználónév}"></td>`;
        oszlopok.forEach(o => {
            if (o === 'dátum' || o === 'id' || o === 'szerep') return;
            let ertek = sor[o] || '';
            if (SZOVEGES_MEZOK.includes(o)) {
                html += `<td><input type="text" class="f-input" data-col="${o}" value="${ertek}"></td>`;
            } else {
                let checked = ertek === 'OK' ? 'checked' : '';
                html += `<td><label class="switch"><input type="checkbox" data-col="${o}" ${checked}><span class="slider"></span></label></td>`;
            }
        });
        html += '</tr>';
    });

    // ➕ Új felhasználó sor (utolsó sor)
    html += '<tr class="new-user-row" style="background: #2a2a2a;">';
    html += `<td><button onclick="ujFelhasznaloMentese(this)" style="cursor:pointer; background:none; border:none; font-size:20px;">➕</button></td>`;
   oszlopok.forEach(o => {
        if (o === 'dátum' || o === 'id' || o === 'szerep') return;
        if (SZOVEGES_MEZOK.includes(o)) {
            html += `<td><input type="text" class="f-input" data-col="${o}" placeholder="${o}..."></td>`;
        } else {
            html += `<td><label class="switch"><input type="checkbox" data-col="${o}"><span class="slider"></span></label></td>`;
        }
    });
    html += '</tr></tbody></table></div>';
    document.getElementById('modul-tartalom').innerHTML = html;
}
// Összevont mentés: a kijelölt sor összes adatát egyszerre küldjük el
// ✅ Összevont mentés: a kijelölt sor összes adatát egyszerre küldjük el
async function mentesKivalasztott() {
    const radio = document.querySelector('input[name="user-select"]:checked');
    if (!radio) return alert("Nincs kiválasztva felhasználó!");
    const originalUser = radio.value;
    if (!confirm("Biztosan MENTI a(z) '" + originalUser + "' felhasználót?")) return;
    
    const adatok = {};
    radio.closest('tr').querySelectorAll('input[data-col]').forEach(i => {
        adatok[i.dataset.col] = i.type === 'checkbox' ? (i.checked ? 'OK' : '') : i.value;
    });

    await mentes(originalUser, adatok);
}

// ✅ Törlés javított ellenőrzéssel
async function torlesKivalasztott() {
    const radio = document.querySelector('input[name="user-select"]:checked');
    if (!radio) return alert("Nincs kiválasztva felhasználó!");
    const user = radio.value.trim();
    if (!user) return alert("Hiba: Ennek a sornak nincs felhasználóneve, kézzel kell törölni az adatbázisból!");

    if (!confirm("FIGYELEM! Biztosan TÖRÖLNI szeretné a(z) '" + user + "' felhasználót?")) return;

    try {
        const response = await fetch('Beallitasok/beallitasok/Felhasznalok/felhasznalok_torlese.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ felhasznalo: user })
        });
        const res = await response.json();
        if (res.status === 'ok') { alert("Sikeres törlés!"); felhasznalokBetoltese(); } 
        else { alert("Hiba: " + res.uzenet); }
    } catch (e) { console.error("Hiba:", e); }
}

// ✅ Új felhasználó mentése egyben - MINDEN szöveges mező ellenőrzésével (helyreállítva)
async function ujFelhasznaloMentese(gomb) {
    const tr = gomb.closest('tr');
    const adatok = {};
    
    for (let i of tr.querySelectorAll('input[data-col]')) {
        const col = i.dataset.col;
        const val = i.type === 'checkbox' ? (i.checked ? 'OK' : '') : i.value.trim();
        
        // A globális listát használjuk az ellenőrzéshez
        if (SZOVEGES_MEZOK.includes(col) && !val) {
            return alert("A(z) '" + col + "' mező kitöltése kötelező!");
        }
        adatok[col] = val;
    }
    if (!confirm("Biztosan létrehozza a(z) '" + adatok['felhasználónév'] + "' felhasználót?")) return;
    await mentes(null, adatok);
}

// ✅ Közös mentő funkció (Új és Módosítás is ide fut be)
async function mentes(originalUser, adatok) {
    try {
        const response = await fetch('Beallitasok/beallitasok/Felhasznalok/felhasznalok_mentese.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ originalUser, adatok })
        });
        const res = await response.json();
        if (res.status === 'ok') { 
            alert("Sikeres mentés!"); 
            felhasznalokBetoltese(); 
        } else { 
            alert("Hiba: " + res.uzenet); 
        }
    } catch (e) { console.error("Hiba:", e); }
}






