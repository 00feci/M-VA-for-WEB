function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 40px; padding: 20px; align-items: flex-start;">
            <input type="hidden" id="sztp_id" value=""> 
            
            <div style="width: 360px; display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 3px; color: #aaa;">Megnevezés:</label>
                    <input type="text" id="sztp_kereso" oninput="szuresSztpMegnevezesre(this.value)" 
                           placeholder="Keresés..." style="width: 100%; padding: 6px; background: #252525; border: 1px solid #444; color: white; border-bottom: none; border-radius: 6px 6px 0 0; font-size: 0.85em;">
                    <div style="display: flex; gap: 5px;">
                        <select id="sztp_megnevezes" onchange="adatokBetoltese(this.value)" style="flex: 1; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 0 0 6px 6px; font-size: 0.9em;">
                            <option value="">-- Kiválasztás --</option>
                        </select>
                        <button onclick="fajtaBeallitasokMegnyitasa()" style="background: #444; color: #ffeb3b; border: 1px solid #555; padding: 0 12px; cursor: pointer; border-radius: 6px; font-weight: bold;" title="Beállítások">⚙️</button>
                    </div>
                </div>

                <div style="margin-top: 5px;">
                    <button onclick="napTipusSzerkesztoMegnyitasa()" style="width: 100%; padding: 10px; background: #252525; color: #ffeb3b; border: 1px solid #444; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                        Napok típusa ⚙️
                    </button>
                    <select id="sztp_nap_tipusa" style="display: none;"></select>
                    <div id="nap-tipus-minta" style="display: none;">-</div>
                </div>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
                <div style="background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; padding-bottom: 8px; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #ffeb3b; font-size: 0.9em;">⚙️ Generálási szabályok</h4>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="hivatkozasokOldalMegnyitasa()" style="padding: 4px 12px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8em; font-weight: bold;">🔗 Hivatkozások</button>
                            <button onclick="globalisSzabalyokMentese()" style="padding: 4px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8em; font-weight: bold;">Mentés</button>
                        </div>
                    </div>
                    <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 3px;">Kész dokumentum neve:</label>
                    <input type="text" id="sztp_fajlnev_szabaly" placeholder="{név} {dátum}" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                </div>

                <div style="display: flex; gap: 8px;">
                    <button id="btn-sztp-feltoltes" onclick="feltoltoModalMegnyitasa()" disabled style="flex: 1; padding: 10px; background: #ccc; color: white; border: none; border-radius: 6px; cursor: not-allowed; font-weight: bold;">📁 Sablon feltöltése</button>
                    <button id="btn-sztp-kezeles" onclick="sablonKezeleseOldal()" disabled style="flex: 1; padding: 10px; background: #ccc; color: white; border: none; border-radius: 6px; cursor: not-allowed; font-weight: bold;">✏️ Sablon kezelése</button>
                </div>

                <div style="background: #121212; border: 1px solid #333; padding: 10px; border-radius: 6px;">
                    <ul id="sztp-fajl-lista" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em; color: #aaa;">
                        <li>📄 Jelenleg nincs fájl</li>
                    </ul>
                </div>
            </div>
        </div>

        <div id="sztp-fajta-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: #1e1e1e; color: white; padding: 25px; border-radius: 12px; width: 450px; border: 1px solid #333;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 10px; color: #2196F3;">⚙️ Fajták beállításai</h3>
                
                <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                    <div>
                        <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Megnevezés kiválasztása / Módosítása:</label>
                        <div style="display: flex; gap: 5px;">
                            <input type="text" id="sztp_edit_megnevezes" readonly style="flex: 1; padding: 8px; background: #121212; border: 1px solid #333; color: #888; border-radius: 4px;" placeholder="Válassz a főoldalon...">
                            <button onclick="megnevezesSzerkesztoMegnyitasa()" style="padding: 0 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Új nevek hozzáadása">+</button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 15px;">
                        <div style="width: 100px;">
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Kód:</label>
                            <input type="text" id="sztp_kod" maxlength="10" oninput="frissitSztpElonezet('kod')" 
                                   style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;" placeholder="SZ">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Szín:</label>
                            <div style="display: flex; gap: 5px;">
                                <input type="color" id="sztp_szin" oninput="frissitSztpElonezet('picker')" 
                                       style="width: 40px; height: 36px; cursor: pointer; background: none; border: 1px solid #444; border-radius: 4px; padding: 2px;" value="#ffffff">
                                <input type="text" id="sztp_hex" oninput="frissitSztpElonezet('hex')" placeholder="#ffffff" maxlength="7"
                                       style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px; font-family: monospace;">
                            </div>
                        </div>
                        <div style="width: 70px; text-align: center;">
                            <label style="display: block; font-size: 0.7em; color: #aaa; margin-bottom: 5px;">MINTA</label>
                            <div id="szin-elonezet-doboz" style="width: 100%; height: 36px; border: 1px solid #444; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 4px; font-size: 13px;">-</div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
                    <button onclick="beallitasokTorlese()" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">🗑️ Törlés</button>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="document.getElementById('sztp-fajta-modal').style.display='none'" style="padding: 10px 15px; background: #444; color: white; border: none; border-radius: 6px; cursor: pointer;">Bezárás</button>
                        <button onclick="beallitasokMentese()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">💾 Mentés</button>
                    </div>
                </div>
            </div>
        </div>

        ${getHivatkozasModalHtml()}
    `;

    setTimeout(() => {
        listaBetoltese();
        inicializalFeltoltot();
    }, 50);
}

function listaBetoltese() {
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?v=' + new Date().getTime())
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const select = document.getElementById('sztp_megnevezes');
            if (!select) return;
            const mentettId = select.value;
            select.innerHTML = '<option value="">-- Kiválasztás --</option>';
            
            data.lista.forEach(i => {
                if (i.megnevezes === "GLOBAL_NAP_TIPUSOK") {
                    adatokBetoltese(i.id, true); // Globális betöltés
                    return; 
                }
                const opt = document.createElement('option');
                opt.value = i.id;
                opt.textContent = i.megnevezes;
                select.appendChild(opt);
            });
            if (mentettId) select.value = mentettId;
        });
}

function adatokBetoltese(id, globalisBetoltes = false) {
    kivalasztottFajlokBuffer = []; 
    const idInput = document.getElementById('sztp_id');
    if (!idInput) return; // 🛡️ Fix Point 4 hiba megelőzése

    const btnFeltolt = document.getElementById('btn-sztp-feltoltes');
    const btnKezel = document.getElementById('btn-sztp-kezeles');
    
    if (!id) {
        idInput.value = '';
        if (document.getElementById('sztp_kod')) document.getElementById('sztp_kod').value = '';
        if (document.getElementById('sztp_szin')) document.getElementById('sztp_szin').value = '#ffffff';
        if (document.getElementById('sztp_hex')) document.getElementById('sztp_hex').value = '#ffffff';
        const lista = document.getElementById('sztp-fajl-lista');
        if (lista) lista.innerHTML = '<li>📄 Jelenleg nincs fájl</li>';
        [btnFeltolt, btnKezel].forEach(b => { if(b) { b.disabled = true; b.style.background = '#ccc'; b.style.cursor = 'not-allowed'; }});
        frissitSztpElonezet('picker');
        return;
    }

    if (btnFeltolt) { btnFeltolt.disabled = false; btnFeltolt.style.background = '#2196F3'; btnFeltolt.style.cursor = 'pointer'; }
    if (btnKezel) { btnKezel.disabled = false; btnKezel.style.background = '#607d8b'; btnKezel.style.cursor = 'pointer'; }
    
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id)
        .then(r => r.json())
        .then(data => {
            const idElem = document.getElementById('sztp_id');
            if (!idElem || !data.success || !data.adat) return;

            if (!globalisBetoltes) {
                idElem.value = data.adat.id;
                document.getElementById('sztp_kod').value = data.adat.kod;
                document.getElementById('sztp_szin').value = data.adat.hex_szin;
                document.getElementById('sztp_hex').value = data.adat.hex_szin;
            }

            fetch('Beallitasok/szabadsag_es_tappenz/sztp_fajl_listazasa.php?id=' + data.adat.id)
                .then(r => r.json())
                .then(fData => {
                    const lista = document.getElementById('sztp-fajl-lista');
                    if (lista) {
                        lista.innerHTML = (fData.success && fData.fajlok.length > 0)
                            ? fData.fajlok.map(f => `<li>📄 ${f}</li>`).join('')
                            : `<li>📄 Jelenleg nincs fájl</li>`;
                    }
                });

            // ✨ Nap típusok visszatöltése az extra_adatok JSON mezőből
            const napTipusSelect = document.getElementById('sztp_nap_tipusa');
            if (napTipusSelect) {
                napTipusSelect.innerHTML = '<option value="">-- Kiválasztás --</option>';
                try {
                    const extra = typeof data.adat.extra_adatok === 'string' 
                        ? JSON.parse(data.adat.extra_adatok) 
                        : data.adat.extra_adatok;
                    
                    if (Array.isArray(extra)) {
                        extra.forEach(tipus => {
                            const opt = document.createElement('option');
                            opt.value = tipus.jel;
                            opt.text = `${tipus.nev} (${tipus.jel})`;
                            napTipusSelect.appendChild(opt);
                        });
                    }
                } catch (e) { console.error("Hiba a típusok betöltésekor:", e); }
                frissitNapTipusElonezet();
            }

            frissitSztpElonezet('picker');
        });
}
function injektalGombokat() {
    const sor = document.getElementById('modul-gomb-sor');
    if (!sor) return;
    sor.innerHTML = ''; // Előző gombok törlése
  const gombok = [
        { felirat: '🔙 Vissza', szin: '#607d8b', akcio: () => navigacio('fomenu') },
        { felirat: '🔗 Hivatkozások', szin: '#9c27b0', akcio: hivatkozasokOldalMegnyitasa },
        { felirat: '💾 Mentés', szin: '#4CAF50', akcio: beallitasokMentese },
        { felirat: '🗑️ Törlés', szin: '#f44336', akcio: beallitasokTorlese }
    ];
    gombok.forEach(g => {
        const btn = document.createElement('div');
        btn.className = 'dashboard-gomb';
        btn.style.flex = '1';
        btn.style.background = g.szin;
        btn.style.color = 'white';
        btn.innerText = g.felirat;
        btn.onclick = g.akcio;
        sor.appendChild(btn);
    });
}

function frissitSztpElonezet(tipus) {
    const kodInput = document.getElementById('sztp_kod');
    const picker = document.getElementById('sztp_szin');
    const hexInput = document.getElementById('sztp_hex');
    const doboz = document.getElementById('szin-elonezet-doboz');
    
    // Ha nem léteznek az elemek, nem csinálunk semmit
    if (!kodInput || !picker || !hexInput) return;

    if (tipus === 'picker') hexInput.value = picker.value;
    if (tipus === 'hex' && hexInput.value.length === 7) picker.value = hexInput.value;
    const kod = kodInput.value || '-';
    const szin = picker.value;
    if (doboz) {
        doboz.style.backgroundColor = szin;
        doboz.textContent = kod;
        const r = parseInt(szin.substr(1,2), 16), g = parseInt(szin.substr(3,2), 16), b = parseInt(szin.substr(5,2), 16);
        doboz.style.color = (((r*299)+(g*587)+(b*114))/1000 >= 128) ? 'black' : 'white';
    }
}

async function beallitasokMentese(modalbol = false, napModalbol = false) {
    const select = document.getElementById('sztp_megnevezes');
    const fajlLista = document.getElementById('sztp-fajl-lista');
    const napTipusSelect = document.getElementById('sztp_nap_tipusa');
    
    const adat = {
        id: document.getElementById('sztp_id').value,
        megnevezes: (select && select.selectedIndex > 0) ? select.options[select.selectedIndex].text : null,
        kod: document.getElementById('sztp_kod')?.value || '',
        szin: document.getElementById('sztp_szin')?.value || '#ffffff',
        sablon_neve: null,
        extra_adatok: [] 
    };

    // ✨ Ha globális mentés van, és nincs kiválasztott név, adunk neki egy fix nevet
    if (napModalbol && !adat.megnevezes) {
        adat.megnevezes = "GLOBAL_NAP_TIPUSOK";
    }

    if (!adat.megnevezes && !napModalbol) return alert("Válassz vagy adj hozzá megnevezést!");

    // ✨ Nap típusok összegyűjtése a JSON mentéshez
    if (napTipusSelect) {
        for (let i = 1; i < napTipusSelect.options.length; i++) {
            const opt = napTipusSelect.options[i];
            const reszek = opt.text.match(/(.*) \((.*)\)/);
            adat.extra_adatok.push({
                nev: reszek ? reszek[1] : opt.text,
                jel: opt.value
            });
        }
    }

    let sablonNeve = null;

    if (kivalasztottFajlokBuffer.length > 0) {
        fajlLista.innerHTML = '<li>⏳ Feltöltés folyamatban...</li>';
        for (let fajl of kivalasztottFajlokBuffer) {
            const formData = new FormData();
            formData.append('sablon', fajl);
            formData.append('megnevezes', adat.megnevezes); 
            const relPath = fajl.relPath || fajl.webkitRelativePath || fajl.name;
            formData.append('relativ_utvonal', relPath);
            try {
                const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_feltoltes.php', { method: 'POST', body: formData });
                const d = await r.json();
                if (!d.success) throw new Error(d.message);
            } catch (e) {
                alert("Hiba: " + e.message);
                fajlLista.innerHTML = '<li>❌ Hiba történt.</li>';
                return;
            }
        }
        sablonNeve = adat.megnevezes; // A mappa neve lesz a sablon neve
        kivalasztottFajlokBuffer = [];
    } else {
        const elsoSor = fajlLista.querySelector('li');
        if (elsoSor && !elsoSor.innerText.includes('Jelenleg nincs')) {
            sablonNeve = adat.megnevezes;
        }
    }

    adat.sablon_neve = sablonNeve;

    fetch('Beallitasok/szabadsag_es_tappenz/sztp_mentes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adat)
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            listaBetoltese();
            if (adat.id && !napModalbol) adatokBetoltese(adat.id); 
            if (modalbol) feltoltoModalBezaras();
            if (napModalbol) {
                document.getElementById('sztp-nap-modal').style.display = 'none';
                alert("Nap típusok mentve!");
            } else {
                alert(data.message);
            }
        } else {
            alert("Hiba: " + data.message);
        }
    });
}

