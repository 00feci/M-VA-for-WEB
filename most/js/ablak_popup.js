// =========================================================
// 🏥 MODERN POPUP - KÖZVETLEN SZERKESZTŐ (DIRECT EDIT) ✏️
// =========================================================

let kivalasztottTipus = '';

document.addEventListener('click', function(e) {
    if (!szerkesztoModAktiv) return;
    const td = e.target.closest('td');
    if (!td || !td.dataset.nap || !td.dataset.op) return;
    if (td.classList.contains('inaktiv-nap')) return;
    nyisdMegAPopupot(td);
});


function nyisdMegAPopupot(cella) {
    const opKod = cella.dataset.op;
    const nap = parseInt(cella.dataset.nap);
    const napokSzama = window.AblakCfg ? (window.AblakCfg.napokValos || 31) : 31;

    // 3. PONT: "A" korlát elengedése
    let startLimit = 1;
    let endLimit = napokSzama;

    let nev = opKod;
    if (window.FelhasznaloLista) {
        const user = window.FelhasznaloLista.find(u => u.op_szam == opKod);
        if (user) nev = `${user.nev} (${opKod})`;
    }

    let overlay = document.getElementById('szerkesztoPopup');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'szerkesztoPopup';
        overlay.className = 'popup-overlay';
        overlay.innerHTML = `
            <div class="popup-doboz">
                <div class="popup-fejlec">
                    <div class="popup-cim" id="popupCim"></div>
                    <div class="popup-bezars" onclick="bezardAPopupot()">×</div>
                </div>
                <div style="background: #fff3e0; border-left: 5px solid #ff9800; padding: 10px; margin-bottom: 15px; font-weight: bold; color: #e65100;">
                    ⚠️ Egy popup = 1 dokumentum ⚠️
                </div>
                <div id="popupEredetiAdatok" style="margin-bottom:10px; color:#666; font-size:14px;"></div>
                <div style="font-weight:bold; margin-top:10px;">📅 Időszak kijelölése:</div>
                <div class="mini-naptar-kontener" id="popupMiniNaptar"></div>
                <div class="tipus-valaszto-kontener" style="margin-top:15px; display:flex; align-items:center; gap:10px;">
                    <span id="popupTipusPreview" class="kod-preview">🖱</span>
                    <select id="popupTipusSelect" onchange="updatePopupPreview(this)" style="flex:1; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
                        <option value="">-- Válassz típust --</option>
                        <option value="rendszer-adat" data-kod="A">rendszerből Adat</option>
                        <option value="rendes-szabadsag" data-kod="SZ">Rendes szabadság</option>
                        <option value="tanulmanyi-szabadsag" data-kod="SZ">Tanulmányi szabadság</option>
                        <option value="kozeli-hozzatartozo-halala-miatt" data-kod="SZ">Közeli hozzátartozó halála miatt</option>
                        <option value="tappenz" data-kod="TP">Táppénz</option>
                        <option value="tappenz-gyap" data-kod="TP">Táppénz (GYÁP)</option>
                        <option value="fizetes-nelkuli-szabadsag" data-kod="fn">Fizetés nélküli szabadság</option>
                    </select>
                </div>
                <div class="popup-footer">
                    <button class="btn-reset" onclick="popupTorles()" style="background:#d32f2f; color:white;">🗑️ TÖRLÉS</button>
                    <button class="btn-save" onclick="popupMentese()">💾 MENTÉS</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('popupCim').innerText = `Szerkesztés: ${nev}`;
    

    const select = document.getElementById('popupTipusSelect');
    
    // Hiba 4: Megkeressük a típus nevét (pl. "Táppénz" az "SZ" helyett)
    let megjelenitendoNev = cella.innerText.replace(/[0-9]/g, '').trim(); 
    if (select && cella.dataset.tipus) {
        const option = Array.from(select.options).find(opt => opt.value === cella.dataset.tipus);
        if (option) megjelenitendoNev = option.text;
    }
    

    const badge = cella.querySelector('.nap-szamlalo-badge');
    const napokBadgeVal = badge ? badge.innerText : '1'; // Egyedi változónév az ütközés elkerülésére
    const kezdet = cella.dataset.kezdet ? cella.dataset.kezdet.replaceAll('-', '.') : '';
    const vegzet = cella.dataset.vegzet ? cella.dataset.vegzet.replaceAll('-', '.') : '';
    const datumKiiras = kezdet ? ` (${kezdet} - ${vegzet})` : '';

    document.getElementById('popupEredetiAdatok').innerHTML = 'Jelenleg: ' + (megjelenitendoNev && megjelenitendoNev !== '🖱' ? `<b>${megjelenitendoNev} (${napokBadgeVal} nap)${datumKiiras}</b>` : '<i>(Üres)</i>');
    generaldMiniNaptarat(nap, startLimit, endLimit, opKod);

    // Hiba 2: Alaphelyzetbe állításnál a választót és az ikont is reseteljük
    kivalasztottTipus = '';
    if(select) {
        select.value = '';
        updatePopupPreview(select); 
    }



    overlay.style.display = 'flex';
    overlay.querySelector('.btn-save').dataset.op = opKod;
}

function bezardAPopupot() {
    const popup = document.getElementById('szerkesztoPopup');
    if (popup) popup.style.display = 'none';
}

function generaldMiniNaptarat(fokuszNap, startLimit, endLimit, opKod) {
    const kontener = document.getElementById('popupMiniNaptar');
    if (!kontener) return;
    kontener.innerHTML = '';
    const fejlecRow = document.querySelector('tr.fejlec-napok-tipusa');
    const getCellContent = (n) => {
        let c = document.querySelector(`td[data-op="${opKod}"][data-nap="${n}"]`);
        if (!c) c = document.querySelector(`td[data-op="${opKod}"][data-nap="${String(n).padStart(2, '0')}"]`);
        return c ? c.textContent.trim() : '';
    };

    for (let i = startLimit; i <= endLimit; i++) {
        const div = document.createElement('div');
        div.className = 'nap-box';
        div.dataset.nap = i;
        const aktualisTartalom = getCellContent(i);
        let napTipus = ''; 
        if(fejlecRow && fejlecRow.cells[i+1]) {
            const txt = fejlecRow.cells[i+1].innerText.trim();
            if(txt === 'Ü') { div.classList.add('unnep'); napTipus='Ü'; }
            if(txt === '-') { div.classList.add('hetvege'); napTipus='-'; }
        }
        div.innerHTML = `<div class="nap-szam">${i}</div><div class="nap-jelenlegi-kod" style="font-size: 18px; font-weight: bold; color: #333;">${aktualisTartalom}</div><div class="nap-tipus">${napTipus}</div>`;
        if (i === fokuszNap) div.classList.add('kivalasztva');
        div.onclick = function() { div.classList.toggle('kivalasztva'); };
        kontener.appendChild(div);
    }
}
function frissitGombStilusok() {
    document.querySelectorAll('.tipus-btn').forEach(btn => btn.classList.remove('aktiv'));
    if (kivalasztottTipus === 'SZ') document.querySelector('.btn-sz').classList.add('aktiv');
    if (kivalasztottTipus === 'TP') document.querySelector('.btn-tp').classList.add('aktiv');
    if (kivalasztottTipus === 'fn') document.querySelector('.btn-fn').classList.add('aktiv');
    if (kivalasztottTipus === 'A')  document.querySelector('.btn-a').classList.add('aktiv');
}

function popupMentese() {
    const select = document.getElementById('popupTipusSelect');
    const opt = select ? select.selectedOptions[0] : null;
    if (!opt || !opt.value) { alert("Válassz típust!"); return; }

    const kivalasztottTipus = opt.dataset.kod;
    const kivalasztottOsztaly = opt.value;
    const opKod = document.querySelector('#szerkesztoPopup .btn-save').dataset.op;
    const kijeloltNapok = Array.from(document.querySelectorAll('#popupMiniNaptar .nap-box.kivalasztva'))
                       .map(box => parseInt(box.dataset.nap)).sort((a, b) => a - b);

    if (kijeloltNapok.length === 0) { alert("Jelölj ki napokat!"); return; }

    const ev = window.AblakCfg.ev;
    const honap = String(window.AblakCfg.honap).padStart(2, '0');
    const napokValos = window.AblakCfg.napokValos || 31;

    let blokkok = [];
    let aktualisBlokk = [kijeloltNapok[0]];
    for (let i = 1; i < kijeloltNapok.length; i++) {
        if (kijeloltNapok[i] === kijeloltNapok[i-1] + 1) aktualisBlokk.push(kijeloltNapok[i]); 
        else { blokkok.push(aktualisBlokk); aktualisBlokk = [kijeloltNapok[i]]; }
    }
    blokkok.push(aktualisBlokk);

    const igeretek = blokkok.map(blokk => {
        const start = blokk[0];
        const veg = blokk[blokk.length - 1];
        let visszateres = "";
        for (let j = veg + 1; j <= napokValos; j++) {
            let c = document.querySelector(`td[data-op="${opKod}"][data-nap="${j}"]`);
            if (!c) c = document.querySelector(`td[data-op="${opKod}"][data-nap="${String(j).padStart(2, '0')}"]`);
            let txt = c ? c.textContent.trim() : "";
            if (txt !== '-' && txt !== 'Ü') {
                visszateres = `${ev}-${honap}-${String(j).padStart(2, '0')}`;
                break;
            }
        }

     return fetch(`${window.AblakCfg.apiBase}munkaido_mentes.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                op_szam: opKod,
                datum: `${ev}-${honap}-${String(start).padStart(2, '0')}`,
                datum_veg: `${ev}-${honap}-${String(veg).padStart(2, '0')}`,
                visszateres_napja: visszateres,
                ertek: kivalasztottTipus,
                tipus: kivalasztottOsztaly === 'rendszer-adat' ? '' : kivalasztottOsztaly,
                nap_tipus: 'M'
            })
        }).then(r => r.json());
    });

    Promise.all(igeretek).then(() => {
        bezardAPopupot();
        // Reload helyett csak az adott embert frissítjük, így nem ugrik el a görgetés!
        adatokBetolteseANaptarba(opKod); 
    });
}

function popupTorles() {
    const kijeloltNapok = document.querySelectorAll('#popupMiniNaptar .nap-box.kivalasztva');
    if(kijeloltNapok.length === 0) { alert("Jelölj ki legalább egy napot a törléshez!"); return; }
    if(!confirm("Biztosan törlöd a kijelölt napok bejegyzéseit?")) return;
    const opKod = document.querySelector('#szerkesztoPopup .btn-save').dataset.op;
    const ev = window.AblakCfg.ev;
    const honap = String(window.AblakCfg.honap).padStart(2, '0');

    const igéretek = Array.from(kijeloltNapok).map(box => {
        const nap = box.dataset.nap;
        return fetch(`${window.AblakCfg.apiBase}munkaido_mentes.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                op_szam: opKod,
                datum: `${ev}-${honap}-${String(nap).padStart(2, '0')}`,
                ertek: 'A',
                tipus: '',
                nap_tipus: 'M'
            })
        }).then(r => r.json());
    });

   Promise.all(igéretek).then(() => {
        bezardAPopupot();
        // Törlés után is csak az adott embert frissítjük
       adatokBetolteseANaptarba(opKod);
    });
}
function updatePopupPreview(select) {
    const preview = document.getElementById('popupTipusPreview');
    if (!preview) return;
    
    const opt = select.selectedOptions[0];
    if (!opt || !opt.value) {
        preview.textContent = '🖱';
        preview.className = 'kod-preview';
        return;
    }
    
    const kod = opt.dataset.kod || '';
    const cssClass = opt.value;
    
    preview.textContent = kod;
    // A css/ablak.css fájlban lévő osztályok használata (pl. .tappenz, .rendes-szabadsag)
    preview.className = 'kod-preview ' + cssClass;
}

