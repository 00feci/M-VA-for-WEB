function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 40px; padding: 20px; align-items: flex-start;">
            <input type="hidden" id="sztp_id" value=""> 
            
            <div style="width: 360px; display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 3px;">Megnevezés:</label>
                    <input type="text" id="sztp_kereso" oninput="szuresSztpMegnevezesre(this.value)" 
                           placeholder="Keresés..." style="width: 100%; padding: 4px; border: 1px solid #ddd; border-bottom: none; border-radius: 4px 4px 0 0; font-size: 0.8em;">
                    <div style="display: flex; gap: 5px;">
                        <select id="sztp_megnevezes" onchange="adatokBetoltese(this.value)" style="flex: 1; padding: 6px; border: 1px solid #ccc; border-radius: 0 0 4px 4px;">
                            <option value="">-- Kiválasztás --</option>
                        </select>
                        <button onclick="megnevezesSzerkesztoMegnyitasa()" style="background: #2196F3; color: white; border: none; padding: 0 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">+</button>
                    </div>
                </div>

                <div style="display: flex; gap: 15px; justify-content: space-between;">
                    <div style="width: 80px;">
                        <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 3px;">Kód:</label>
                        <input type="text" id="sztp_kod" maxlength="10" oninput="frissitSztpElonezet('kod')" 
                               style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;" placeholder="SZ">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 3px;">Szín:</label>
                        <div style="display: flex; gap: 5px;">
                            <input type="color" id="sztp_szin" oninput="frissitSztpElonezet('picker')" 
                                   style="width: 35px; height: 32px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; padding: 2px;" value="#ffffff">
                            <input type="text" id="sztp_hex" oninput="frissitSztpElonezet('hex')" placeholder="#ffffff" maxlength="7"
                                   style="width: 90px; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace; font-size: 0.9em;">
                        </div>
                    </div>
                    <div style="width: 60px; text-align: center;">
                        <label style="display: block; font-size: 0.85em; color: #aaa; margin-bottom: 3px;">MINTA</label>
                        <div id="szin-elonezet-doboz" style="width: 100%; height: 32px; border: 1px solid #444; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 4px; font-size: 12px;">-</div>
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
                    <h4 style="margin: 0 0 10px 0; color: #ffeb3b; font-size: 0.9em; border-bottom: 1px solid #444; padding-bottom: 5px;">⚙️ Generálási és Export szabályok</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div>
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 3px;">Kész dokumentum neve (pl: {név} {dátum}):</label>
                            <input type="text" id="sztp_fajlnev_szabaly" placeholder="{név} {dátum}" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                        </div>
                        <div style="display: flex; gap: 10px; align-items: flex-end;">
                            <div style="flex: 1;">
                                <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 3px;">Könyvelési export feltétel:</label>
                                <select id="sztp_export_szabaly" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                                    <option value="nev">Csak Név alapján</option>
                                    <option value="ceg_nev">Ha Cég és Név megegyezik -> egy sorba</option>
                                </select>
                            </div>
                            <button onclick="globalisSzabalyokMentese()" style="padding: 9px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">💾 Mentés</button>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 8px;">
                    <button id="btn-sztp-feltoltes" onclick="feltoltoModalMegnyitasa()" disabled style="flex: 1; padding: 10px; background: #ccc; color: white; border: none; border-radius: 6px; cursor: not-allowed; font-weight: bold;">📁 Sablon feltöltése</button>
                    <button id="btn-sztp-kezeles" onclick="sablonKezeleseOldal()" disabled style="flex: 1; padding: 10px; background: #ccc; color: white; border: none; border-radius: 6px; cursor: not-allowed; font-weight: bold;">✏️ Sablon kezelése</button>
                </div>

                <div style="background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                    <ul id="sztp-fajl-lista" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em; color: #555;">
                        <li>📄 Jelenleg nincs fájl</li>
                    </ul>
                </div>
            </div>
        </div>

        <div id="sztp-feltolto-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; align-items: center; justify-content: center;">
            <div style="background: #121212; color: white; padding: 25px; border-radius: 12px; width: 500px; border: 1px solid #333;">
                <h3 style="margin-top: 0;">📁 Sablon feltöltése</h3>
                <div id="sztp-feltolto-zona" style="border: 3px dashed #2196F3; background: #1e1e1e; padding: 30px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 15px;">
                        <button onclick="sztpTallozas(false)" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px;">📄 Fájlok</button>
                        <button onclick="sztpTallozas(true)" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px;">📂 Mappa</button>
                    </div>
                    <span>Vagy húzd ide a tartalmat</span>
                </div>
                <div id="sztp-modal-statusz" style="margin-bottom: 10px; font-size: 0.85em; color: #81c784; text-align: center;"></div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="feltoltoModalBezaras()" style="padding: 8px 15px; background: #424242; color: white; border: none; border-radius: 4px;">Mégse</button>
                    <button onclick="beallitasokMentese(true)" style="padding: 8px 20px; background: #4CAF50; color: white; border: none; font-weight: bold; border-radius: 4px;">🚀 Feltöltés</button>
                </div>
            </div>
        </div>

        <div id="sztp-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; align-items: center; justify-content: center;">
            <div style="background: white; padding: 25px; border-radius: 8px; width: 450px;">
                <h3 style="margin-top: 0;">Megnevezések kezelése</h3>
                <textarea id="sztp_tomeges_bevitel" placeholder="Példa:&#10;Szabadság&#10;Táppénz" style="width: 100%; height: 200px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button onclick="modalBezaras()" style="padding: 8px 15px; background: #eee; border: 1px solid #ccc; border-radius: 4px;">Mégse</button>
                    <button onclick="megnevezesekMentese()" style="padding: 8px 20px; background: #4CAF50; color: white; border: none; font-weight: bold; border-radius: 4px;">Frissítés</button>
                </div>
            </div>
        </div>

       <div id="sztp-nap-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10001; align-items: center; justify-content: center;">
            <div style="background: #1e1e1e; color: white; padding: 25px; border-radius: 12px; width: 500px; border: 1px solid #333; box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
                <h3 style="margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 10px; color: #4CAF50;">🗓️ Nap típusok kezelése</h3>
                
                <div style="background: #121212; padding: 15px; border-radius: 8px; border: 1px solid #333; margin: 15px 0;">
                    <div style="display: flex; gap: 10px; align-items: flex-end;">
                        <div style="flex: 1;">
                            <label style="display: block; font-size: 0.75em; color: #aaa; margin-bottom: 3px;">Megnevezés:</label>
                            <input type="text" id="uj_nap_nev" placeholder="Munkanap" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                        </div>
                        <div style="width: 80px;">
                            <label style="display: block; font-size: 0.75em; color: #aaa; margin-bottom: 3px;">Betűjel:</label>
                            <input type="text" id="uj_nap_jel" placeholder="SZ" maxlength="5" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px; text-transform: uppercase; text-align: center; font-weight: bold;">
                        </div>
                        <button onclick="napTipusMentese()" style="padding: 8px 15px; background: #4CAF50; color: white; border: none; font-weight: bold; border-radius: 4px; cursor: pointer;">Hozzáadás</button>
                    </div>
                </div>

                <div style="max-height: 250px; overflow-y: auto; background: #121212; border-radius: 8px; border: 1px solid #333; padding: 5px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85em;">
                        <thead style="position: sticky; top: 0; background: #252525; color: #aaa;">
                            <tr>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #333;">Típus megnevezése</th>
                                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #333;">Jel</th>
                                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #333;">Művelet</th>
                            </tr>
                        </thead>
                        <tbody id="sztp_nap_lista_test">
                            </tbody>
                    </table>
                </div>

              <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button onclick="document.getElementById('sztp-nap-modal').style.display='none'" style="padding: 8px 15px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer;">Mégse</button>
                    <button onclick="beallitasokMentese(false, true)" style="padding: 8px 20px; background: #2196F3; color: white; border: none; font-weight: bold; border-radius: 4px; cursor: pointer;">💾 Mentés és bezárás</button>
                </div>
            </div>
        </div>

        ${getHivatkozasModalHtml()}
    `;
    injektalGombokat();
    setTimeout(() => {
        listaBetoltese();
        inicializalFeltoltot();
    }, 50);
}

function inicializalFeltoltot() {
    const zona = document.getElementById('sztp-feltolto-zona');
    if (!zona) return;

    zona.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON') sztpTallozas(false);
    };

    zona.ondragover = e => { e.preventDefault(); zona.style.background = '#e1f0ff'; };
    zona.ondragleave = () => { zona.style.background = '#f0f7ff'; };
    zona.ondrop = async e => {
        e.preventDefault();
        zona.style.background = '#f0f7ff';
        const items = e.dataTransfer.items;
        let mindenFajl = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry();
            if (entry) {
                const fajlok = await rekurzivFajlOlvasas(entry);
                mindenFajl = mindenFajl.concat(fajlok);
            }
        }
        sztpFajlokFeltoltese(mindenFajl);
    };
}

function sztpTallozas(mappaMod) {
    const input = document.createElement('input');
    input.type = 'file';
    // Az accept szűrő eltávolítva, hogy minden fájl látható legyen
    input.multiple = true;
    if (mappaMod) input.webkitdirectory = true;
    input.onchange = e => sztpFajlokFeltoltese(Array.from(e.target.files));
    input.click();
}

// 📂 Segédfüggvény a mappák mélyére ásáshoz
async function rekurzivFajlOlvasas(entry, path = "") {
    let fajlok = [];
    if (entry.isFile) {
        const fajl = await new Promise(resolve => entry.file(resolve));
        fajl.relPath = path + fajl.name;
        fajlok.push(fajl);
    } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const bejegyzesek = await new Promise(resolve => reader.readEntries(resolve));
        for (const b of bejegyzesek) {
            fajlok = fajlok.concat(await rekurzivFajlOlvasas(b, path + entry.name + "/"));
        }
    }
    return fajlok;
}

let kivalasztottFajlokBuffer = []; 
let aktualisSqlOszlopok = []; // 👈 Itt tároljuk az elérhető SQL oszlopneveket
let mintaAdatRekord = {}; // 👈 Ebben tároljuk a teljes minta rekordot a számításokhoz

function sztpFajlokFeltoltese(fajlok) {
    if (!fajlok || fajlok.length === 0) return;
    
    kivalasztottFajlokBuffer = fajlok; 
    const lista = document.getElementById('sztp-fajl-lista');
    const modalLista = document.getElementById('sztp-modal-fajl-lista');
    const modalListaKontener = document.getElementById('sztp-modal-fajl-lista-kontener');
    const statusz = document.getElementById('sztp-modal-statusz');
    
    if (lista) lista.innerHTML = ''; 
    if (modalLista) modalLista.innerHTML = '';
    if (modalListaKontener) modalListaKontener.style.display = 'block';
    
    fajlok.forEach(f => {
        const relPath = f.relPath || f.webkitRelativePath || f.name;
        const liHtml = `<li>📄 ${relPath} <span style="color: #f39c12; font-size: 0.8em;">(Mentésre vár...)</span></li>`;
        if (lista) lista.innerHTML += liHtml;
        if (modalLista) modalLista.innerHTML += liHtml;
    });

    if (statusz) {
        statusz.innerHTML = `✅ ${fajlok.length} fájl csatolva.`;
    }
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

function feltoltoModalMegnyitasa() {
    const statusz = document.getElementById('sztp-modal-statusz');
    const modalLista = document.getElementById('sztp-modal-fajl-lista');
    const modalListaKontener = document.getElementById('sztp-modal-fajl-lista-kontener');
    
    if (statusz) statusz.innerHTML = ''; 
    if (modalLista) modalLista.innerHTML = '';
    if (modalListaKontener) modalListaKontener.style.display = 'none';
    
    document.getElementById('sztp-feltolto-modal').style.display = 'flex';
}

function feltoltoModalBezaras() {
    document.getElementById('sztp-feltolto-modal').style.display = 'none';
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
async function sztpElemTorlese(utvonal, kategoria) {
    if (confirm("BIZTOSAN törölni szeretnéd ezt az elemet?\n" + utvonal)) {
        try {
            const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_fajl_torlese.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: utvonal })
            });
            const d = await r.json();
            if (d.success) {
                sablonKezeleseOldal(kategoria); // Megtartjuk az aktuális mappát
            } else {
                alert("Hiba: " + d.message);
            }
        } catch (e) { console.error(e); }
    }
}
async function globalisSzabalyokMentese() {
    const fajlnev = document.getElementById('sztp_fajlnev_szabaly').value;
    if (!fajlnev) return alert("Adj meg egy fájlnév szabályt!");
    alert("Szabályok rögzítve!");
}


