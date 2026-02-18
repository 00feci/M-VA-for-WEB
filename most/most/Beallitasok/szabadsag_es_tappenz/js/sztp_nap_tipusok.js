// xcxxx kód, ezt a blokot cseréld
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
// kod