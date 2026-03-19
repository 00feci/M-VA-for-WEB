function szuresSztpNapTipusra(szo) {
    const select = document.getElementById('sztp_nap_tipusa');
    if (!select) return;
    const keresendo = szo.toLowerCase();
    for (let i = 0; i < select.options.length; i++) {
        select.options[i].style.display = select.options[i].text.toLowerCase().includes(keresendo) ? "" : "none";
    }
}

function napTipusSzerkesztoMegnyitasa() {
    const modal = document.getElementById('sztp-nap-modal');
    if (modal) {
        modal.style.display = 'flex';
        napTipusListaFrissitese();
        const input = document.getElementById('uj_nap_nev');
        if (input) input.focus();
    }
}

let napTipusSzerkesztesAlatt = null;

function napTipusSzerkesztese(nev, jel) {
    napTipusSzerkesztesAlatt = jel;
    const nevInp = document.getElementById('uj_nap_nev');
    const jelInp = document.getElementById('uj_nap_jel');
    if (nevInp) nevInp.value = nev;
    if (jelInp) jelInp.value = jel;
    const modal = document.getElementById('sztp-nap-modal');
    if (modal) modal.style.display = 'flex';
}

function napTipusMentese() {
    const nevInput = document.getElementById('uj_nap_nev');
    const jelInput = document.getElementById('uj_nap_jel');
    if (!nevInput || !jelInput) return;

    const nev = nevInput.value.trim();
    const jel = jelInput.value.trim().toUpperCase();
    
    if (!nev || !jel) return alert("Kérlek töltsd ki mindkét mezőt!");

    const sel = document.getElementById('sztp_nap_tipusa');
    if (!sel) return;

    if (napTipusSzerkesztesAlatt) {
        for (let i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === napTipusSzerkesztesAlatt) {
                sel.options[i].value = jel;
                sel.options[i].text = `${nev} (${jel})`;
                break;
            }
        }
        napTipusSzerkesztesAlatt = null;
    } else {
        let letezik = false;
        for (let i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === jel) { letezik = true; break; }
        }
        if (letezik) return alert("Ez a betűjel már használatban van!");

        const opt = document.createElement('option');
        opt.value = jel;
        opt.text = `${nev} (${jel})`;
        sel.appendChild(opt);
    }
    
    nevInput.value = '';
    jelInput.value = '';
    napTipusListaFrissitese();
    frissitNapTipusElonezet();
}

function napTipusListaFrissitese() {
    const select = document.getElementById('sztp_nap_tipusa');
    const tbody = document.getElementById('sztp_nap_lista_test');
    if (!select || !tbody) return;

    tbody.innerHTML = '';
    for (let i = 0; i < select.options.length; i++) {
        const opt = select.options[i];
        if (!opt.value) continue;
        const reszek = opt.text.match(/(.*) \((.*)\)/);
        const nev = reszek ? reszek[1] : opt.text;
        const jel = opt.value;

        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 8px; color: #ddd;">${nev}</td>
                <td style="padding: 8px; text-align: center;"><b style="color: #ffeb3b;">${jel}</b></td>
                <td style="padding: 8px; text-align: right; white-space: nowrap;">
                    <button onclick="napTipusSzerkesztese('${nev.replace(/'/g, "\\'")}', '${jel}')" style="background: none; border: none; color: #2196F3; cursor: pointer; font-size: 1.1em; margin-right: 8px;">✏️</button>
                    <button onclick="napTipusTorlese('${jel}')" style="background: none; border: none; color: #f44336; cursor: pointer; font-size: 1.1em;">🗑️</button>
                </td>
            </tr>`;
    }
    if (select.options.length <= 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #666;">Nincs rögzített típus.</td></tr>';
    }
}

function napTipusTorlese(jel) {
    if (!confirm(`Biztosan törlöd a(z) ${jel} típust?`)) return;
    const select = document.getElementById('sztp_nap_tipusa');
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === jel) {
            select.remove(i);
            break;
        }
    }
    napTipusListaFrissitese();
    frissitNapTipusElonezet();
}

function frissitNapTipusElonezet() {
    const s = document.getElementById('sztp_nap_tipusa');
    const m = document.getElementById('nap-tipus-minta');
    if(s && m) {
        m.innerText = (s.selectedIndex >= 0) ? s.options[s.selectedIndex].text : "-";
    }
}
// xcxxx kód, ezt a blokot cseréld

/**
 * JAVÍTOTT MENTÉSI MECHANIKA
 */
async function beallitasokMentese() {
    let napok = [];
    const select = document.getElementById('sztp_nap_tipusa');
    
    // Elsődleges adatgyűjtés a select elemből
    if (select && select.options.length > 0) {
        napok = Array.from(select.options).map(opt => {
            const reszek = opt.text.match(/(.*) \((.*)\)/);
            return { nev: reszek ? reszek[1] : opt.text, jel: opt.value };
        });
    } else {
        // Fallback: Ha a select nem elérhető, közvetlenül a táblázatból olvassuk ki az adatokat
        const rows = document.querySelectorAll('#sztp_nap_lista_test tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const nev = cells[0].innerText.trim();
                const jelElem = cells[1].querySelector('b');
                const jel = jelElem ? jelElem.innerText.trim() : cells[1].innerText.trim();
                if (nev && jel) napok.push({ nev, jel });
            }
        });
    }

    if (napok.length === 0 && !confirm("Nincs rögzített naptípus. Biztosan üres listát akarsz menteni?")) return;

    try {
        // Mentés küldése: A PHP oldal (sztp_mentes.php) a megnevezés alapján automatikusan
        // kikeresi vagy létrehozza a rekordot, nem kell külön ID-vel bajlódni.
        const response = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_mentes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                megnevezes: "GLOBAL_NAP_TIPUSOK",
                extra_adatok: { napok: napok, nagy_rekord: "nem" }
            })
        });

        const result = await response.json();
        if (result.success) {
            alert("Sikeres mentés!");
            const modal = document.getElementById('sztp-nap-modal');
            if (modal) modal.style.display = 'none';
            // A globális lista frissítése a vezérlőben
            if (typeof listaBetoltese === 'function') listaBetoltese();
        } else {
            alert("Hiba a mentés során: " + result.message);
        }
    } catch (e) {
        console.error("Mentési hiba:", e);
        alert("Hálózati hiba történt!");
    }
}

/**
 * JAVÍTOTT BETÖLTÉSI MECHANIKA
 */
async function adatokBetoltese(id) {
    if (!id) return;
    try {
        const response = await fetch(`Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=${id}&v=${new Date().getTime()}`);
        const data = await response.json();
        
        if (!data.success || !data.adat) return;

        // Az extra_adatok JSON-ból való kibontása (stringként vagy objektumként is kezeljük)
        const extra = typeof data.adat.extra_adatok === 'string' ? JSON.parse(data.adat.extra_adatok) : data.adat.extra_adatok;
        const select = document.getElementById('sztp_nap_tipusa');
        
        if (select && extra && extra.napok) {
            select.innerHTML = '';
            extra.napok.forEach(n => {
                const opt = document.createElement('option');
                opt.value = n.jel;
                opt.text = `${n.nev} (${n.jel})`;
                select.appendChild(opt);
            });
            // A látható lista frissítése a betöltött adatok alapján
            if (typeof napTipusListaFrissitese === 'function') napTipusListaFrissitese();
        }
    } catch (e) {
        console.error("Betöltési hiba:", e);
    }
}
// kod
