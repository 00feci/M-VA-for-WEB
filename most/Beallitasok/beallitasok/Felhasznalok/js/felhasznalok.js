// Beallitasok/beallitasok/Felhasznalok/js/felhasznalok.js
async function felhasznalokBetoltese() {
    // JAVÍTÁS: A modul-tartalom dobozba írunk, így a Vissza gomb megmarad felül!
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
    // Szöveges mezők (id és szerep nélkül)
    const szovegesMezok = ['név', 'email', 'felhasználónév', 'jelszó', 'telefon', 'mac_cím', 'külső_ip_cím', 'cég'];
    
    let html = '<div class="felhasznalo-tabla-wrapper"><table class="f-tabla"><thead><tr>';
    html += '<th>Választ</th>'; // Kiválasztó oszlop
    
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
            if (szovegesMezok.includes(o)) {
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
        if (szovegesMezok.includes(o)) {
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
    const szovegesMezok = ['név', 'email', 'felhasználónév', 'jelszó', 'telefon', 'mac_cím', 'külső_ip_cím', 'cég'];
    const adatok = {};
    
    // Adatok begyűjtése és minden szöveges mező kötelező ellenőrzése
    for (let i of tr.querySelectorAll('input[data-col]')) {
        const col = i.dataset.col;
        const val = i.type === 'checkbox' ? (i.checked ? 'OK' : '') : i.value.trim();
        
        if (szovegesMezok.includes(col) && !val) {
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

