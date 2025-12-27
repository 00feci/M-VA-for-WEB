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
    // Csak a fix szöveges mezőket listázzuk. Minden más oszlop automatikusan kapcsoló lesz!
    const szovegesMezok = ['id','név', 'email', 'felhasználónév', 'jelszó', 'telefon', 'mac_cím', 'külső_ip_cím', 'cég', 'szerep'];
    
    let html = '<div class="felhasznalo-tabla-wrapper"><table class="f-tabla"><thead><tr>';
    
    // Fejlécek (dátum kihagyva)
    oszlopok.forEach(o => { if(o !== 'dátum') html += `<th>${o}</th>`; });
    html += '</tr></thead><tbody>';

    adatok.forEach(sor => {
        html += '<tr>';
        oszlopok.forEach(o => {
            if (o === 'dátum') return;

            let ertek = sor[o] || '';
            if (szovegesMezok.includes(o)) {
                // ✍️ SZÖVEGMEZŐ (fix szélességgel a CSS-ben)
                html += `<td><input type="text" class="f-input" value="${ertek}" onblur="mentes('${sor.felhasználónév}', '${o}', this.value)"></td>`;
            } else {
                // 🔘 KAPCSOLÓ (Automatikus minden funkcióhoz)
                let checked = ertek === 'OK' ? 'checked' : '';
                html += `<td><label class="switch"><input type="checkbox" ${checked} onchange="mentes('${sor.felhasználónév}', '${o}', this.checked)"><span class="slider"></span></label></td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    
    // Csak a tartalom részt frissítjük, hogy a Vissza gomb ne tűnjön el!
    const tartalomHelye = document.getElementById('modul-tartalom');
    if (tartalomHelye) tartalomHelye.innerHTML = html;
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