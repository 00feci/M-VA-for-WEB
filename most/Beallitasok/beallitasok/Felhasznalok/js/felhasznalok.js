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

// Mentés megerősítéssel
async function mentesKivalasztott() {
    const radio = document.querySelector('input[name="user-select"]:checked');
    if (!radio) { alert("Nincs kiválasztva felhasználó!"); return; }
    const user = radio.value;
    if (!confirm("Biztosan MENTENI szeretné '" + user + "' felhasználó adatait?")) return;
    
    const tr = radio.closest('tr');
    const inputs = tr.querySelectorAll('input:not([name="user-select"])');
    for (let input of inputs) {
        let col = input.dataset.col;
        let val = input.type === 'checkbox' ? (input.checked ? 'OK' : '') : input.value;
        await mentes(user, col, val);
    }
    alert("'" + user + "' sikeresen mentve.");
}

async function torlesKivalasztott() {
    const radio = document.querySelector('input[name="user-select"]:checked');
    if (!radio) { alert("Nincs kiválasztva felhasználó!"); return; }
    const user = radio.value;
    
    if (!confirm("FIGYELEM! Biztosan TÖRÖLNI szeretné a(z) '" + user + "' felhasználót?")) return;

    try {
        const response = await fetch('Beallitasok/beallitasok/Felhasznalok/felhasznalok_torlese.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ felhasznalo: user })
        });
        const res = await response.json();
        if (res.status === 'ok') {
            alert("Sikeres törlés!");
            felhasznalokBetoltese(); // Lista frissítése
        } else {
            alert("Hiba: " + res.uzenet);
        }
    } catch (e) {
        console.error("Hálózati hiba törléskor:", e);
    }
}
// Új felhasználó mentése - MINDEN szöveges mező ellenőrzésével
async function ujFelhasznaloMentese(gomb) {
    const tr = gomb.closest('tr');
    const szovegesMezok = ['név', 'email', 'felhasználónév', 'jelszó', 'telefon', 'mac_cím', 'külső_ip_cím', 'cég'];
    
    // Ellenőrzés: végigmegyünk az összes szöveges mezőn
    for (let mezo of szovegesMezok) {
        const input = tr.querySelector(`input[data-col="${mezo}"]`);
        if (input && !input.value.trim()) {
            return alert("A(z) '" + mezo + "' mező kitöltése kötelező!");
        }
    }

    const fnev = tr.querySelector('input[data-col="felhasználónév"]').value.trim();
    if (!confirm("Biztosan létrehozza '" + fnev + "' felhasználót?")) return;
    
    const inputs = tr.querySelectorAll('input');
    for (let input of inputs) {
        let col = input.dataset.col;
        if (!col) continue;
        let val = input.type === 'checkbox' ? (input.checked ? 'OK' : '') : input.value;
        await mentes(fnev, col, val);
    }
    alert("'" + fnev + "' adatai rögzítve.");
    felhasznalokBetoltese();
}

async function mentes(felhasznalo, oszlop, ertek) {
    console.log("🚀 Mentés indítása a szerverre:", felhasznalo, oszlop, ertek);
    // Ha checkbox (Toggle), akkor 'OK' vagy üres string legyen az érték az SQL-hez
    let veglegesErtek = ertek;
    if (typeof ertek === 'boolean') {
        veglegesErtek = ertek ? 'OK' : '';
    }
    try {
        const response = await fetch('Beallitasok/beallitasok/Felhasznalok/felhasznalok_mentese.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                felhasznalo: felhasznalo,
                oszlop: oszlop,
                ertek: veglegesErtek
            })
        });
        const res = await response.json();   
        if (res.status === 'ok') {
            console.log("✅ Adatbázis sikeresen frissítve:", res.uzenet);
        } else {
            alert("Hiba a mentésnél: " + res.uzenet);
            console.error("Szerver hiba:", res.uzenet);
        }
    } catch (e) {
        console.error("Hálózati hiba történt:", e);
    }
}

// TESZT_SZINKRON_MUKODIK


