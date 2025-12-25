
let kivalasztottTipus = '';

document.addEventListener('click', function(e) {
    if (!szerkesztoModAktiv) return;
    const td = e.target.closest('td');
    if (!td || !td.dataset.nap || !td.dataset.op) return;
    if (td.classList.contains('inaktiv-nap')) return;
    nyisdMegAPopupot(td);
});

// =========================================================
// 🏥 MODERN POPUP - KÖZVETLEN SZERKESZTŐ (DIRECT EDIT) ✏️
// =========================================================

window.nyisdMegAPopupot = function(cella) {
    const opKod = cella.dataset.op;
    const nap = parseInt(cella.dataset.nap);
    const napokSzamaValos = window.AblakCfg ? (window.AblakCfg.napokValos || 31) : 31;

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
            <style>
                /* 🟢 Egységes zöld kijelölés a naptárban */
                #szerkesztoPopup .nap-box.kivalasztva { background-color: #4CAF50 !important; color: white !important; }
                #szerkesztoPopup .nap-box.kivalasztva .nap-szam, 
                #szerkesztoPopup .nap-box.kivalasztva .nap-jelenlegi-kod { color: white !important; }
            </style>
            <div class="popup-doboz">
                <div class="popup-fejlec">
                    <div class="popup-cim" id="popupCim"></div>
                    <div class="popup-bezars" onclick="window.bezardAPopupot()">×</div>
                </div>
                <div style="background: #fff3e0; border-left: 5px solid #ff9800; border-right: 5px solid #ff9800; padding: 10px; margin-bottom: 15px; font-weight: bold; color: #e65100; text-align: center;">
                    ⚠️ Egy popup = 1 dokumentum ⚠️
                </div>
                <div id="popupEredetiAdatok" style="margin-bottom:10px; color:#666; font-size:14px; text-align: center;"></div>
                
                <div style="font-weight:bold; margin-top:10px; text-align: center; width: 100%;">📅 Időszak kijelölése:</div>
                <div class="mini-naptar-kontener" id="popupMiniNaptar"></div>
                
                <div class="tipus-valaszto-kontener" style="margin-top:15px; display:flex; align-items:center; justify-content:center; gap:10px;">
                    <span id="popupTipusPreview" class="kod-preview" style="width:40px; height:40px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:black; font-weight:bold; border:1px solid #ccc; border-radius:4px;">🖱</span>
                    
                    <select id="popupTipusSelect" onchange="window.updatePopupPreview(this)" style="flex:1; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px; max-width: 250px;">
                        <option value="">-- Válassz típust --</option>
                        <option value="rendszer-adat" data-kod="A">rendszerből Adat</option>
                        <option value="rendes-szabadsag" data-kod="SZ">Rendes szabadság</option>
                        <option value="tanulmanyi-szabadsag" data-kod="SZ">Tanulmányi szabadság</option>
                        <option value="kozeli-hozzatartozo-halala-miatt" data-kod="SZ">Közeli hozzátartozó halála miatt</option>
                        <option value="tappenz" data-kod="TP">Táppénz</option>
                        <option value="tappenz-gyap" data-kod="TP">Táppénz (GYÁP)</option>
                        <option value="fizetes-nelkuli-szabadsag" data-kod="fn">Fizetés nélküli szabadság</option>
                    </select>

                    <div style="display:flex; align-items:center; gap:5px; background:#f9f9f9; padding:5px 10px; border-radius:6px; border:1px solid #ccc; flex-shrink: 0;">
                        <label style="font-weight:bold; font-size:14px;">NAP:</label>
                        <input type="number" id="popupNapokSzama" style="width:50px; padding:5px; border:1px solid #bbb; border-radius:4px; font-weight:bold; text-align:center;" value="1">
                    </div>
                </div>
                <div class="popup-footer" style="display: flex; justify-content: space-between; margin-top: 20px; width: 100%;">
                    <button class="btn-reset" onclick="window.popupTorles()" style="background:#d32f2f; color:white; padding: 10px 20px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold;">🗑️ TÖRLÉS</button>
                    <button class="btn-save" onclick="window.popupMentese()" style="padding: 10px 40px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold;">💾 MENTÉS</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('popupCim').innerText = `Szerkesztés: ${nev}`;
    
    // --- "Jelenleg" adatok kiírása ---
    let tisztaTartalom = cella.textContent.replace(/[0-9]/g, '').trim(); 
    let reszek = tisztaTartalom.split('|').map(s => s.trim()).filter(s => s !== '');
    let felsorolas = [];
    reszek.forEach(resz => {
        let nevStr = (resz === 'A') ? 'rendszerből Adat' : resz;
        let n = (resz === 'A') ? 1 : (cella.dataset.napok || 1);
        felsorolas.push(`<b>${nevStr} (${n} nap)</b>`);
    });
    document.getElementById('popupEredetiAdatok').innerHTML = 'Jelenleg: ' + (felsorolas.length > 0 ? felsorolas.join(' | ') : '<i>(Üres)</i>');

    // Naptár generálása a nap nevével
    window.generaldMiniNaptarat(nap, 1, napokSzamaValos, opKod);
    
    // Kezdő érték a NAP mezőbe (kijelöltek száma)
    window.frissitPopupNapokSzama();

    overlay.style.display = 'flex';
    overlay.querySelector('.btn-save').dataset.op = opKod;
};

window.frissitPopupNapokSzama = function() {
    const kijeloltCount = document.querySelectorAll('#popupMiniNaptar .nap-box.kivalasztva').length;
    const input = document.getElementById('popupNapokSzama');
    if (input) input.value = kijeloltCount > 0 ? kijeloltCount : 1;
};

window.generaldMiniNaptarat = function(fokuszNap, startLimit, endLimit, opKod) {
    const kontener = document.getElementById('popupMiniNaptar');
    if (!kontener) return;
    kontener.innerHTML = '';
    const napNevek = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
    const ev = window.AblakCfg.ev;
    const honap = window.AblakCfg.honap;

    for (let i = startLimit; i <= endLimit; i++) {
        const div = document.createElement('div');
        div.className = 'nap-box';
        div.dataset.nap = i;
        const d = new Date(ev, honap - 1, i);
        const napNev = napNevek[d.getDay()];
        
        let c = document.querySelector(`td[data-op="${opKod}"][data-nap="${i}"]`);
        if (!c) c = document.querySelector(`td[data-op="${opKod}"][data-nap="${String(i).padStart(2, '0')}"]`);
        const tartalom = c ? c.textContent.replace(/[0-9]/g, '').trim() : '';

        div.innerHTML = `<div class="nap-szam" style="font-size:10px;">${String(i).padStart(2,'0')} ${napNev}</div><div class="nap-jelenlegi-kod">${tartalom}</div>`;
        if (i === fokuszNap) div.classList.add('kivalasztva');
        
        div.onclick = function() { 
            div.classList.toggle('kivalasztva'); 
            window.frissitPopupNapokSzama(); 
        };
        kontener.appendChild(div);
    }
};
window.popupMentese = function() {
    const select = document.getElementById('popupTipusSelect');
    const opt = select ? select.selectedOptions[0] : null;
    const napokMezo = document.getElementById('popupNapokSzama');
    
    if (!opt || !opt.value) { alert("Válassz típust!"); return; }

    const kivalasztottTipus = opt.dataset.kod;
    const kivalasztottOsztaly = opt.value;
    const opKod = document.querySelector('#szerkesztoPopup .btn-save').dataset.op;
    const manuálisNapok = napokMezo ? napokMezo.value : 1; // 👈 A NAP mező értéke
    
    const kijeloltNapok = Array.from(document.querySelectorAll('#popupMiniNaptar .nap-box.kivalasztva'))
                       .map(box => parseInt(box.dataset.nap)).sort((a, b) => a - b);

    if (kijeloltNapok.length === 0) { alert("Jelölj ki napokat!"); return; }

    const ev = window.AblakCfg.ev;
    const honap = String(window.AblakCfg.honap).padStart(2, '0');

    // Csak a folytonos kijelölés első és utolsó napját küldjük
    const start = kijeloltNapok[0];
    const veg = kijeloltNapok[kijeloltNapok.length - 1];

    fetch(`${window.AblakCfg.apiBase}munkaido_mentes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            op_szam: opKod,
            datum: `${ev}-${honap}-${String(start).padStart(2, '0')}`,
            datum_veg: `${ev}-${honap}-${String(veg).padStart(2, '0')}`,
            ertek: kivalasztottTipus,
            tipus: kivalasztottOsztaly === 'rendszer-adat' ? '' : kivalasztottOsztaly,
            napok: manuálisNapok, // 👈 Ezt küldjük el az adatbázisnak
            nap_tipus: 'M'
        })
    })
    .then(r => r.json())
    .then(res => {
        if (res.status === 'ok') {
            window.bezardAPopupot();
            if (typeof adatokBetolteseANaptarba === 'function') adatokBetolteseANaptarba(opKod);
        } else {
            alert("Hiba a mentés során: " + res.uzenet);
        }
    })
    .catch(err => console.error("Mentési hiba:", err));
};

window.popupTorles = function() {
    const kijeloltNapok = document.querySelectorAll('#popupMiniNaptar .nap-box.kivalasztva');
    if(kijeloltNapok.length === 0) { alert("Jelölj ki napokat a törléshez!"); return; }
    
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
                ertek: 'A', // Törléskor visszaállítjuk alaphelyzetbe
                tipus: '',
                nap_tipus: 'M'
            })
        }).then(r => r.json());
    });

    Promise.all(igéretek).then(() => {
        window.bezardAPopupot();
        if (typeof adatokBetolteseANaptarba === 'function') adatokBetolteseANaptarba(opKod);
    });
};

window.updatePopupPreview = function(select) {
    const preview = document.getElementById('popupTipusPreview');
    if (!preview) return;
    const opt = select.selectedOptions[0];
    preview.innerHTML = opt.dataset.kod || '🖱';
    preview.className = 'kod-preview ' + (opt.value || '');
    Object.assign(preview.style, { display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' });
};

// =========================================================
// 🌐 GLOBÁLIS POPUP - NAPOK TÍPUSA SZERKESZTŐ
// =========================================================
window.nyisdMegAGlobalisPopupot = function(cella) {
    const ev = window.AblakCfg.ev;
    const honap = String(window.AblakCfg.honap).padStart(2, '0');
    const napokValos = window.AblakCfg ? (window.AblakCfg.napokValos || 31) : 31;
    const aktivNap = cella.cellIndex - 1;

    let overlay = document.getElementById('globalisPopup');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'globalisPopup';
        overlay.className = 'popup-overlay';
        overlay.innerHTML = `
            <style>
                #globalisPopup .nap-box.kivalasztva { background-color: #4CAF50 !important; color: white !important; }
                #globalisPopup .nap-box.kivalasztva .nap-szam, 
                #globalisPopup .nap-box.kivalasztva .nap-jelenlegi-kod { color: white !important; }
            </style>
            <div class="popup-doboz">
                <div class="popup-fejlec">
                    <div class="popup-cim" id="globalisPopupCim"></div>
                    <div class="popup-bezars" onclick="window.bezardAGlobalisPopupot()">×</div>
                </div>
                <div style="background: #fff3e0; border-left: 5px solid #ff9800; border-right: 5px solid #ff9800; padding: 10px; margin-bottom: 15px; font-weight: bold; color: #e65100; text-align: center;">
                    ⚠️ A Napok típusa ⚠️
                </div>
                
                <div style="font-weight:bold; margin-top:10px; text-align: center; width: 100%;">📅 Időszak kijelölése:</div>
                <div class="mini-naptar-kontener" id="globalisPopupMiniNaptar"></div>
                
                <div class="tipus-valaszto-kontener" style="margin-top:15px; display:flex; align-items:center; justify-content:center; gap:15px;">
                    <span id="globalisTipusPreview" class="kod-preview munkanap" style="width: 40px !important; height: 40px !important; display: flex !important; align-items: center; justify-content: center; flex-shrink: 0 !important; color: black !important; font-weight: bold; font-size: 18px; border: 1px solid #ccc; border-radius: 4px;">M</span>
                    <select id="globalisTipusSelect" onchange="window.updateGlobalPopupPreview(this)" style="padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px; min-width: 150px;">
                        <option value="munkanap" data-kod="M">Munkanap</option>
                        <option value="unnep" data-kod="Ü">Ünnepnap</option>
                        <option value="hetvege" data-kod="-">Hétvége</option>
                    </select>
                </div>
                
                <div class="popup-footer" style="display: flex; justify-content: center; margin-top: 20px; width: 100%;">
                    <button class="btn-save" onclick="window.globalisPopupMentese()" style="width: 100%; max-width: 300px; padding: 12px; font-size: 16px; cursor: pointer;">💾 MENTÉS</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    }

    document.getElementById('globalisPopupCim').innerText = `Szerkesztés: ${ev}.${honap}`;
    overlay.style.display = 'flex';
    window.generaldMiniNaptarat_Global(aktivNap, 1, napokValos);
};

window.bezardAGlobalisPopupot = function() {
    const popup = document.getElementById('globalisPopup');
    if (popup) popup.style.display = 'none';
};

window.updateGlobalPopupPreview = function(select) {
    const preview = document.getElementById('globalisTipusPreview');
    if (!preview) return;
    const opt = select.selectedOptions[0];
    preview.innerHTML = opt.dataset.kod || 'M';
    preview.className = 'kod-preview ' + opt.value;
    
    // Fix stílusok kényszerítése
    Object.assign(preview.style, {
        width: '40px', height: '40px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: '0', color: 'black', fontWeight: 'bold'
    });
};

window.generaldMiniNaptarat_Global = function(fokuszNap, startLimit, endLimit) {
    const kontener = document.getElementById('globalisPopupMiniNaptar');
    if (!kontener) return;
    kontener.innerHTML = '';
    
    const napNevek = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
    const ev = window.AblakCfg.ev;
    const honap = window.AblakCfg.honap;
    const fejlecRow = document.querySelector('tr.fejlec-napok-tipusa');

    for (let i = startLimit; i <= endLimit; i++) {
        const div = document.createElement('div');
        div.className = 'nap-box';
        div.dataset.nap = i;
        
        const d = new Date(ev, honap - 1, i);
        const napNev = napNevek[d.getDay()];
        const fejlecCella = fejlecRow ? fejlecRow.cells[i + 1] : null;
        const aktualisKod = fejlecCella ? fejlecCella.innerText.trim() : '';
        
        if (aktualisKod === 'Ü') div.classList.add('unnep');
        if (aktualisKod === '-') div.classList.add('hetvege');

        div.innerHTML = `
            <div class="nap-szam" style="font-size: 11px; color: #666;">${String(i).padStart(2, '0')} ${napNev}</div>
            <div class="nap-jelenlegi-kod" style="font-size: 18px; font-weight: bold; color: #333;">${aktualisKod}</div>
        `;
        
        if (i === fokuszNap) div.classList.add('kivalasztva');
        div.onclick = function() { div.classList.toggle('kivalasztva'); };
        kontener.appendChild(div);
    }
};

window.globalisPopupMentese = function() {
    const select = document.getElementById('globalisTipusSelect');
    const ujTipus = select.selectedOptions[0].dataset.kod;
    const kijeloltNapok = Array.from(document.querySelectorAll('#globalisPopupMiniNaptar .nap-box.kivalasztva'))
                       .map(box => parseInt(box.dataset.nap));

    if (kijeloltNapok.length === 0) { alert("Jelölj ki napokat!"); return; }

    const ev = window.AblakCfg.ev;
    const honap = String(window.AblakCfg.honap).padStart(2, '0');
    const datums = kijeloltNapok.map(n => `${ev}-${honap}-${String(n).padStart(2, '0')}`);

    fetch(`${window.AblakCfg.apiBase}munkaido_naptar_kezelo.php?action=save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datums: datums, tipus: ujTipus })
    })
    .then(r => r.json())
    .then(res => {
        if (res.status === 'ok') {
            const fejlecSor = document.querySelector('tr.fejlec-napok-tipusa');
            kijeloltNapok.forEach(nap => {
                const cellIndex = nap + 1;
                const cella = fejlecSor.cells[cellIndex];
                if (cella) {
                    cella.innerText = ujTipus;
                    if (typeof vetitOszlopra === 'function') vetitOszlopra(cellIndex, ujTipus);
                }
            });
            window.bezardAGlobalisPopupot();
        }
    });
};