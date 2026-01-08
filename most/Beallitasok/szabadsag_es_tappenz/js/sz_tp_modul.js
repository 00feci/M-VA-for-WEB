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
               <div style="background: #1e1e1e; padding: 12px; border-radius: 8px; border: 1px solid #333; color: white;">
                    <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 5px; color: #aaa;">Napok típusa:</label>
                    <input type="text" id="sztp_nap_kereso" oninput="szuresSztpNapTipusra(this.value)" 
                           placeholder="Keresés a típusok között..." style="width: 100%; padding: 6px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px 4px 0 0; font-size: 0.8em;">
                    <div style="display: flex; gap: 5px;">
                        <select id="sztp_nap_tipusa" onchange="frissitNapTipusElonezet()" style="flex: 1; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 0 0 4px 4px; font-size: 0.9em;">
                            <option value="">-- Kiválasztás --</option>
                        </select>
                        <button onclick="napTipusSzerkesztoMegnyitasa()" style="background: #4CAF50; color: white; border: none; padding: 0 12px; cursor: pointer; border-radius: 4px; font-weight: bold;" title="Típusok kezelése">⚙️</button>
                    </div>
                    <div id="nap-tipus-minta" style="margin-top: 10px; height: 38px; background: #121212; border: 1px solid #444; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: bold; font-size: 13px; color: #ffeb3b; border-left: 4px solid #ffeb3b;">-</div>
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
                            <input type="text" id="uj_nap_nev" placeholder="pl: Fizetett szabadság" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
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
                    <button onclick="document.getElementById('sztp-nap-modal').style.display='none'" style="padding: 8px 20px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer;">Bezárás</button>
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
    // 🛡️ A ?v= kiegészítés megelőzi, hogy a böngésző a régi listát mutassa
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?v=' + new Date().getTime())
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const select = document.getElementById('sztp_megnevezes');
            if (!select) return; // 🛡️ Ha még nem létezik, nem futunk hibára
            const mentettId = select.value;
            select.innerHTML = '<option value="">-- Kiválasztás --</option>';
            data.lista.forEach(i => {
                const opt = document.createElement('option');
                opt.value = i.id;
                opt.textContent = i.megnevezes;
             select.appendChild(opt);
            });
            if (mentettId) select.value = mentettId;
        });
}

function adatokBetoltese(id) {
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
            if (!idElem || !data.success || !data.adat) return; // 🛡️ Biztonsági ellenőrzés

            idElem.value = data.adat.id;
            document.getElementById('sztp_kod').value = data.adat.kod;
            document.getElementById('sztp_szin').value = data.adat.hex_szin;
            document.getElementById('sztp_hex').value = data.adat.hex_szin;

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
            frissitSztpElonezet('picker');
        });
}

function megnevezesSzerkesztoMegnyitasa() {
    document.getElementById('sztp-modal').style.display = 'flex';
    document.getElementById('sztp_tomeges_bevitel').focus();
}

function modalBezaras() {
    document.getElementById('sztp-modal').style.display = 'none';
    // 🧹 Kiürítjük a textareát, hogy legközelebb tiszta legyen
    document.getElementById('sztp_tomeges_bevitel').value = ''; 
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

function megnevezesekMentese() {
    const szoveg = document.getElementById('sztp_tomeges_bevitel').value;
    const elemek = szoveg.split(/[\n,]/).map(item => item.trim()).filter(item => item !== "");
    if (elemek.length === 0) return modalBezaras();
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_tomeges_mentes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nevek: elemek })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            document.getElementById('sztp_tomeges_bevitel').value = ''; // 🧹 Sikeres mentés után is ürítünk
            listaBetoltese(); 
        } else {
            alert("Hiba: " + data.message);
        }
        modalBezaras();
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

async function beallitasokMentese(modalbol = false) {
    const select = document.getElementById('sztp_megnevezes');
    const fajlLista = document.getElementById('sztp-fajl-lista');
    
    const adat = {
        id: document.getElementById('sztp_id').value,
        megnevezes: select.options[select.selectedIndex]?.text,
        kod: document.getElementById('sztp_kod').value,
        szin: document.getElementById('sztp_szin').value,
        sablon_neve: null,
        extra_adatok: [] 
    };

    if (!adat.megnevezes || select.selectedIndex === 0) return alert("Válassz vagy adj hozzá megnevezést!");

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
        alert(data.message);
        if (data.success) {
            listaBetoltese();
            if (adat.id) (adat.id);
            if (modalbol) feltoltoModalBezaras();
        }
    });
}
     
function beallitasokTorlese() {
    const id = document.getElementById('sztp_id').value;
    if (!id) return alert("Nincs kiválasztva mentett beállítás!");
    if (confirm("Biztosan törölni szeretnéd ezt a beállítást?")) {
        fetch('Beallitasok/szabadsag_es_tappenz/sztp_torlese.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(r => r.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                adatokBetoltese(''); 
                listaBetoltese();   
            }
        });
    }
}

function szuresSztpMegnevezesre(szo) {
    const select = document.getElementById('sztp_megnevezes');
    const options = select.options;
    const keresendo = szo.toLowerCase();
    for (let i = 1; i < options.length; i++) {
        const szoveg = options[i].text.toLowerCase();
        options[i].style.display = szoveg.includes(keresendo) ? "" : "none";
    }
}

async function sablonKezeleseOldal(frissitendoMappa = null) {
    const kontener = document.getElementById('modul-tartalom');
    const sel = document.getElementById('sztp_megnevezes');
    
    // Szigorúbb ellenőrzés a szöveges "undefined" érték ellen a fejlécben
    let megnevezesValue = "";
    const isMappaValid = frissitendoMappa && String(frissitendoMappa) !== "undefined" && String(frissitendoMappa) !== "null";

    if (isMappaValid) {
        megnevezesValue = frissitendoMappa;
    } else if (sel && sel.selectedIndex > 0) {
        megnevezesValue = sel.options[sel.selectedIndex].text;
    }
    const megjelenitettCim = megnevezesValue || "Sablonok";

    const gombSor = document.getElementById('modul-gomb-sor');
    if (gombSor) {
        gombSor.innerHTML = `
            <div class="dashboard-gomb" style="flex: 1; background: #607d8b; color: white;" onclick="szTpModulBetoltese()">🔙 Vissza a beállításokhoz</div>
        `;
    }

    kontener.innerHTML = `
        <div style="padding: 10px; background: #121212; min-height: 500px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: white; font-size: 1.1em;">📁 ${megjelenitettCim} mappaszerkezete</h3>
          <div id="sztp-fajl-fa-kontener" style="background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333; resize: both; overflow: auto; min-height: 300px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                <div id="sztp-fajl-fa" style="font-family: monospace;">⏳ Betöltés...</div>
            </div>
            <p style="color: #666; font-size: 0.8em; margin-top: 15px; font-style: italic;">A jövöben a webes szerkeztés a cél</p>
        </div>
    `;

    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_mappa_tree.php?megnevezes=' + encodeURIComponent(megnevezesValue));
        const d = await r.json();
        if (d.success) {
            const faKontener = document.getElementById('sztp-fajl-fa');
            faKontener.innerHTML = renderelFa(d.tree, megnevezesValue);
        }
    } catch (e) { console.error(e); }
}

function renderelFa(elemek, aktualisKategoria = "") {
    if (!elemek || elemek.length === 0) return '<p style="color: #666;">A mappa üres.</p>';
    let html = '<ul style="list-style: none; padding-left: 20px; line-height: 2.2;">';
    elemek.forEach(i => {
        const ikon = i.type === 'folder' ? '📂' : '📄';
        const tisztaUtvonal = i.path.replace(/\\/g, '/');
        // Itt definiáljuk a változót, ami hiányzott:
        const kodoltUtvonal = encodeURI(tisztaUtvonal);
        const datumHtml = i.date ? `<span style="color: #777; font-size: 0.8em; margin-left: 15px; font-family: monospace;">🕒 ${i.date}</span>` : '';
        
        html += `<li style="color: #2196F3; border-bottom: 1px solid #222; padding: 2px 0;">
            <span style="cursor: default; font-weight: bold; min-width: 250px; display: inline-block;">${ikon} ${i.name}</span>
            
         <span style="display: inline-flex; gap: 12px; align-items: center; margin-left: 10px; vertical-align: middle;">
                ${i.type === 'file' ? `<a href="/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/${kodoltUtvonal}" download style="text-decoration: none; font-size: 1.25em;" title="Letöltés">📥</a>` : ''}
                <button onclick="sztpGyorsFeltoltesInditasa('${tisztaUtvonal}', ${i.type === 'folder'}, '${aktualisKategoria}')" style="border: none; background: none; cursor: pointer; color: #4CAF50; font-size: 1.25em; padding: 0;" title="Feltöltés / Felülírás">📤</button>
                <button onclick="sztpElemTorlese('${tisztaUtvonal}', '${aktualisKategoria}')" style="border: none; background: none; cursor: pointer; color: #f44336; font-size: 1.2em; padding: 0;" title="Törlés">🗑️</button>
            </span>
            ${datumHtml}
            ${i.children ? renderelFa(i.children, aktualisKategoria) : ''}
        </li>`;
    });
    html += '</ul>';
    return html;
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

function sztpGyorsFeltoltesInditasa(utvonal, mappaE, kategoria) {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async e => {
        const fajl = e.target.files[0];
        if (!fajl) return;

        const formData = new FormData();
        formData.append('sablon', fajl);
        
        const reszek = utvonal.split('/').filter(p => p !== "");
        let megnevezes = kategoria || reszek[0] || "Vegyes";
        
        // Ha mappára kattintottunk, beleillesztjük a fájlt, ha fájlra, akkor felülírjuk
        let relPath = "";
        if (mappaE) {
            relPath = utvonal.replace(megnevezes + "/", "") + fajl.name;
        } else {
            relPath = utvonal.replace(megnevezes + "/", "");
        }

        formData.append('megnevezes', megnevezes);
        formData.append('relativ_utvonal', relPath);

       try {
            const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_feltoltes.php', { method: 'POST', body: formData });
            const d = await r.json();
            alert(d.message);
            if (d.success) sablonKezeleseOldal(megnevezes);
        } catch (err) { alert("Hiba a feltöltés során!"); }
    };
    input.click();
}

async function hivatkozasokOldalMegnyitasa() {
    const kontener = document.getElementById('modul-tartalom');
    const gombSor = document.getElementById('modul-gomb-sor');
    
    if (gombSor) {
        gombSor.innerHTML = `<div class="dashboard-gomb" style="flex: 1; background: #607d8b; color: white;" onclick="szTpModulBetoltese()">🔙 Vissza a beállításokhoz</div>`;
    }

    kontener.innerHTML = `
        <div style="padding: 15px; background: #121212; max-height: 70vh; overflow-y: auto; border-radius: 8px; scrollbar-width: thin; scrollbar-color: #444 #121212;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; position: sticky; top: 0; background: #121212; z-index: 10;">
                <h3 style="margin: 0; color: white; font-size: 1.1em;">🔗 Hivatkozások leképezése és számítások</h3>
                <button onclick="ujHivatkozasPopup()" style="padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.85em;">+ Új hivatkozás létrehozása</button>
            </div>
            
           <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 20px; background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333;">
                <h4 style="margin: 0; color: #ffeb3b; font-size: 0.9em; border-bottom: 1px solid #444; padding-bottom: 5px;">⚙️ Generálási és Export szabályok</h4>
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Dokumentum fájlnév (pl: {név} {dátum}):</label>
                        <input type="text" id="sztp_fajlnev_szabaly" placeholder="{név} {dátum}" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Export csoportosítás (Könyvelés):</label>
                        <select id="sztp_export_szabaly" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                            <option value="nev">Csak Név alapján</option>
                            <option value="ceg_nev">Cég + Név alapján</option>
                        </select>
                    </div>
                    <button onclick="globalisSzabalyokMentese()" style="padding: 0 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Mentés</button>
                </div>
            </div>

            <div style="display: flex; gap: 20px;">
                <div style="flex: 1; background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                    <h4 style="margin-top: 0; color: #9c27b0; font-size: 0.9em; border-bottom: 1px solid #444; padding-bottom: 5px;">Adatbázis minta (Legfrissebb rekord)</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85em; color: #ddd; font-family: monospace;">
                        <thead>
                            <tr style="background: #252525; text-align: left;">
                                <th style="padding: 10px; border-bottom: 2px solid #333;">SQL oszlop</th>
                                <th style="padding: 10px; border-bottom: 2px solid #333;">Aktuális adat (Példa)</th>
                            </tr>
                        </thead>
                        <tbody id="sztp-minta-adatok-test">
                            <tr><td colspan="2" style="text-align: center; padding: 20px; color: #666;">⏳ Adatok betöltése...</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div style="flex: 1; background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                    <h4 style="margin-top: 0; color: #2196F3; font-size: 0.9em; border-bottom: 1px solid #444; padding-bottom: 5px;">Aktív hivatkozások és szabályok</h4>
                    <ul id="sztp-aktiv-hivatkozasok" style="list-style: none; padding: 0; margin: 0; color: #ddd; font-size: 0.85em;">
                        <li style="color: #666; font-style: italic; padding: 10px;">⏳ Hivatkozások betöltése...</li>
                    </ul>
                </div>
            </div>
        </div>

        ${getHivatkozasModalHtml()}
    `;

    mintaAdatokBetoltese();
    hivatkozasokListazasa(); // 👈 Azonnal lekérjük a hivatkozásokat a megnyitáskor
}
async function mintaAdatokBetoltese() {
    const tbody = document.getElementById('sztp-minta-adatok-test');
    if (!tbody) return;
    
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_minta_adatok.php');
        const d = await r.json();
        
       if (d.success && d.adat) {
            mintaAdatRekord = d.adat; // 👈 Mentés a számításokhoz
            aktualisSqlOszlopok = Object.keys(d.adat);
            let html = '';
            for (const [kulcs, ertek] of Object.entries(d.adat)) {
                html += `<tr>
                    <td style="padding: 8px; border-bottom: 1px solid #333; font-weight: bold; color: #9c27b0;">${kulcs}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #333; color: #ddd;">${ertek || '-'}</td>
                </tr>`;
            }
            tbody.innerHTML = html;
        } else {
            tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 20px; color: #f44336;">${d.message || 'Hiba az adatok betöltésekor'}</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 20px; color: #f44336;">Hálózati hiba történt.</td></tr>`;
    }
}

function ujHivatkozasPopup() {
    const modal = document.getElementById('sztp-hivatkozas-modal');
    const select = document.getElementById('hiv_sql_oszlop');
    
    if (modal && select) {
        // Dropdown feltöltése az SQL oszlopokkal
        select.innerHTML = aktualisSqlOszlopok.map(o => `<option value="${o}">${o}</option>`).join('');
        modal.style.display = 'flex';
        hivatkozasokListazasa(); // Frissítjük a modalban lévő listát is
    }
}

async function hivatkozasMentese() {
    const nev = document.getElementById('hiv_nev').value;
    const oszlop = document.getElementById('hiv_sql_oszlop').value;
    const tipus = document.getElementById('hiv_muvelet_tipus').value;
    const logika = document.getElementById('hiv_logika').value;
    const formatum = document.getElementById('hiv_formatum').value;

    if (!nev) return alert("Adj meg egy hivatkozás nevet!");

    const adat = { nev, oszlop, tipus, logika, formatum };

    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozas_mentese.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adat)
        });
        const d = await r.json();
        if (d.success) {
            document.getElementById('hiv_nev').value = '';
            document.getElementById('hiv_logika').value = '';
            hivatkozasokListazasa(); // Popup lista frissítése
            // A főoldali "Aktív hivatkozások" listát is frissíteni kell majd itt
        }
        alert(d.message);
    } catch (e) { alert("Hiba a mentés során!"); }
}

async function hivatkozasokListazasa() {
    const tbody = document.getElementById('hiv_lista_test');
    const foLista = document.getElementById('sztp-aktiv-hivatkozasok');
    if (!tbody) return;

    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozasok_lekerese.php');
        const d = await r.json();
       if (d.success) {
            const ikonok = { add: '➕', sub: '➖', mul: '✖️', div: '➗', txt: '🔤' };
            const html = d.lista.map(i => {
                const eredmeny = szamolHivatkozasErteket(i.oszlop, i.tipus, i.logika, i.formatum); 
                return `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 8px; color: #2196F3; font-weight: bold;">${i.nev}</td>
                    <td style="padding: 8px; color: #aaa;">${i.oszlop} <span style="color: #4CAF50;">${ikonok[i.tipus] || ''}</span> ${i.logika}</td>
                    <td style="padding: 8px; color: #ffeb3b; font-family: monospace; font-weight: bold; text-align: right;">=> ${eredmeny}</td>
                    <td style="padding: 8px; text-align: right; white-space: nowrap;">
                        <button onclick="hivatkozasSorrend(${i.id}, -1)" style="background: none; border: none; cursor: pointer; color: #2196F3; font-size: 1.1em; padding: 0 5px;" title="Felfelé">▲</button>
                        <button onclick="hivatkozasSorrend(${i.id}, 1)" style="background: none; border: none; cursor: pointer; color: #2196F3; font-size: 1.1em; padding: 0 5px;" title="Lefelé">▼</button>
                        <button onclick="hivatkozasTorlese(${i.id})" style="background: none; border: none; cursor: pointer; color: #f44336; margin-left: 10px;">🗑️</button>
                    </td>
                </tr>`;
            }).join('');
            tbody.innerHTML = html;
            
            if (foLista) {
                foLista.innerHTML = d.lista.length > 0 
                    ? d.lista.map(i => {
                        const eredmeny = szamolHivatkozasErteket(i.oszlop, i.tipus, i.logika, i.formatum);
                        return `<li style="padding: 5px 10px; border-bottom: 1px solid #333;">
                            <b style="color: #2196F3;">${i.nev}</b>: <span style="color: #ffeb3b;">${eredmeny}</span>
                            <div style="font-size: 0.75em; color: #777;">(${i.oszlop} ${ikonok[i.tipus] || ''} ${i.logika})</div>
                        </li>`;
                    }).join('')
                    : '<li style="color: #666; font-style: italic; padding: 10px;">Nincs még létrehozott hivatkozás.</li>';
            }
        }
    } catch (e) { console.error("Hiba a listázásnál:", e); }
}
async function hivatkozasTorlese(id) {
    if (!confirm("Biztosan törlöd ezt a hivatkozást?")) return;
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozas_torlese.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const d = await r.json();
        if (d.success) hivatkozasokListazasa();
       alert(d.message);
    } catch (e) { alert("Hiba a törlés során!"); }
}

function szamolHivatkozasErteket(oszlop, tipus, logika, formatum = "") {
    const alapErtek = mintaAdatRekord[oszlop];
    if (alapErtek === undefined || alapErtek === null) return "Nincs adat";
    
    let ertek = String(alapErtek).trim();
    let vegEredmeny = "";
    let log = String(logika).toLowerCase().trim();

    if (tipus === 'txt') {
        vegEredmeny = ertek + logika;
    } else {
        const isDate = /^\d{4}[-.]\d{2}[-.]\d{2}/.test(ertek);
        const isDateLogic = log.includes('év') || log.includes('hónap') || log.includes('nap');

        if (isDate) {
            if (isDateLogic) {
                let normalizedDate = ertek.replace(/\./g, '-');
                let d = new Date(normalizedDate);
                if (!isNaN(d.getTime())) {
                    let szam = parseInt(log.replace(/[^0-9]/g, '')) || 0;
                    let szorzo = (tipus === 'sub') ? -1 : 1;
                    if (log.includes('év')) d.setFullYear(d.getFullYear() + (szam * szorzo));
                    else if (log.includes('hónap')) d.setMonth(d.getMonth() + (szam * szorzo));
                    else if (log.includes('nap')) d.setDate(d.getDate() + (szam * szorzo));
                    
                    let ev = d.getFullYear();
                    let ho = String(d.getMonth() + 1).padStart(2, '0');
                    let nap = String(d.getDate()).padStart(2, '0');
                    vegEredmeny = `${ev}.${ho}.${nap}`;
                } else { vegEredmeny = "Hibás dátum"; }
            } else {
                vegEredmeny = ertek.replace(/-/g, '.');
            }
        } else {
            let n1 = parseFloat(ertek.replace(',', '.'));
            let n2 = parseFloat(log.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
            if (isNaN(n1)) vegEredmeny = ertek;
            else {
                switch(tipus) {
                    case 'add': vegEredmeny = (n1 + n2).toFixed(2); break;
                    case 'sub': vegEredmeny = (n1 - n2).toFixed(2); break;
                    case 'mul': vegEredmeny = (n1 * n2).toFixed(2); break;
                    case 'div': vegEredmeny = n2 !== 0 ? (n1 / n2).toFixed(2) : "Hiba"; break;
                    default: vegEredmeny = ertek;
                }
            }
        }
    }

    vegEredmeny = vegEredmeny.toString().replace(/\.00$/, ''); 
    const f = formatum.toUpperCase().trim();

    if (f !== "") {
        if (vegEredmeny.includes('.') && vegEredmeny.split('.').length === 3) {
            const p = vegEredmeny.split('.');
            if (f === 'ÉÉÉÉ') return p[0];
            if (f === 'HH') return p[1];
            if (f === 'NN') return p[2];
            if (f === 'ÉÉÉÉ.HH') return p[0] + "." + p[1];
        }
        if (f === 'TIZEDES0' && !isNaN(parseFloat(vegEredmeny))) return Math.round(parseFloat(vegEredmeny)).toString();
        if (f === 'TIZEDES1' && !isNaN(parseFloat(vegEredmeny))) return parseFloat(vegEredmeny).toFixed(1).replace('.', ',');
    }

    // Ha a végeredmény dátum (3 részből áll), ne cseréljük vesszőre a pontokat
    if (vegEredmeny.split('.').length === 3) return vegEredmeny;

    return vegEredmeny.replace('.', ',');
}

function frissitHivatkozasElonezet() {
    const oszlop = document.getElementById('hiv_sql_oszlop').value;
    const tipus = document.getElementById('hiv_muvelet_tipus').value;
    const logika = document.getElementById('hiv_logika').value;
    const formatum = document.getElementById('hiv_formatum').value;
    const kijelzo = document.getElementById('hiv_live_eredmeny');
    if (kijelzo) {
       const res = szamolHivatkozasErteket(oszlop, tipus, logika, formatum);
       kijelzo.innerText = "Élő eredmény: " + res;
    }
}

async function hivatkozasSorrend(id, irany) {
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozasok_lekerese.php');
        const d = await r.json();
        if (!d.success) return;
        let lista = d.lista;
        const index = lista.findIndex(i => i.id == id);
        if (index === -1) return;
        const ujIndex = index + irany;
        if (ujIndex < 0 || ujIndex >= lista.length) return;
        [lista[index], lista[ujIndex]] = [lista[ujIndex], lista[index]];
        const sr = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozasok_sorrendje.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lista: lista })
        });
        const sd = await sr.json();
        if (sd.success) hivatkozasokListazasa();
    } catch (e) { console.error("Hiba a sorrendnél:", e); }
}

function getHivatkozasModalHtml() {
    return `
        <div id="sztp-hivatkozas-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: #1e1e1e; color: white; padding: 25px; border-radius: 12px; width: 600px; border: 1px solid #333; box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
                <h3 style="margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 10px;">🔗 Hivatkozás és szabály létrehozása</h3>
                <div style="display: flex; flex-direction: column; gap: 15px; margin: 20px 0;">
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Hivatkozás neve:</label>
                            <input type="text" id="hiv_nev" placeholder="pl: <Öregség>" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">SQL forrás oszlop:</label>
                            <select id="hiv_sql_oszlop" onchange="frissitHivatkozasElonezet()" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;"></select>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <div style="width: 140px;">
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Művelet:</label>
                            <select id="hiv_muvelet_tipus" onchange="frissitHivatkozasElonezet()" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                                <option value="add">➕ Összeadás (+)</option>
                                <option value="sub">➖ Kivonás (-)</option>
                                <option value="mul">✖️ Szorzás (*)</option>
                                <option value="div">➗ Osztás (/)</option>
                                <option value="txt">🔤 Szöveg hozzáadása</option>
                            </select>
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Érték / Logika:</label>
                            <input type="text" id="hiv_logika" oninput="frissitHivatkozasElonezet()" placeholder="pl: 60 év vagy 2 nap" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                        </div>
                        <div style="width: 120px;">
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Formátum: <span title="Elérhető formátumok:&#10;ÉÉÉÉ - Csak az évszám&#10;HH - Csak a hónap&#10;NN - Csak a nap&#10;TIZEDES0 - Egész szám (kerekítve)" style="cursor: help; color: #2196F3; font-weight: bold;">ⓘ</span></label>
                            <input type="text" id="hiv_formatum" oninput="frissitHivatkozasElonezet()" placeholder="pl: ÉÉÉÉ" style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                        </div>
                    </div>
                    <div id="hiv_live_eredmeny" style="padding: 10px; background: #121212; border-radius: 6px; border: 1px solid #333; text-align: center; color: #ffeb3b; font-weight: bold; font-family: monospace; border-left: 4px solid #ffeb3b; margin-bottom: 10px;">Élő eredmény: -</div>
                    <button onclick="hivatkozasMentese()" style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Hozzáadás a listához</button>
                </div>
                <div style="max-height: 200px; overflow-y: auto; background: #121212; border-radius: 8px; border: 1px solid #333; padding: 10px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85em;">
                        <tbody id="hiv_lista_test"></tbody>
                    </table>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button onclick="document.getElementById('sztp-hivatkozas-modal').style.display='none'" style="padding: 8px 20px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer;">Bezárás</button>
                </div>
            </div>
        </div>`;
}

function szuresSztpNapTipusra(szo) {
    const select = document.getElementById('sztp_nap_tipusa');
    if (!select) return;
    const options = select.options;
    const keresendo = szo.toLowerCase();
    for (let i = 1; i < options.length; i++) {
        const szoveg = options[i].text.toLowerCase();
        options[i].style.display = szoveg.includes(keresendo) ? "" : "none";
    }
}

function napTipusSzerkesztoMegnyitasa() {
    document.getElementById('sztp-nap-modal').style.display = 'flex';
    napTipusListaFrissitese();
    document.getElementById('uj_nap_nev').focus();
}

let napTipusSzerkesztesAlatt = null;

function napTipusSzerkesztese(nev, jel) {
    napTipusSzerkesztesAlatt = jel;
    document.getElementById('uj_nap_nev').value = nev;
    document.getElementById('uj_nap_jel').value = jel;
    // A gomb feliratát átmenetileg megváltoztathatjuk, ha szükséges
    const modal = document.getElementById('sztp-nap-modal');
    if (modal) modal.style.display = 'flex';
}

function napTipusMentese() {
    const nevInput = document.getElementById('uj_nap_nev');
    const jelInput = document.getElementById('uj_nap_jel');
    const nev = nevInput.value.trim();
    const jel = jelInput.value.trim().toUpperCase();
    
    if (!nev || !jel) return alert("Kérlek töltsd ki mindkét mezőt!");

    const sel = document.getElementById('sztp_nap_tipusa');
    if (!sel) return;

    if (napTipusSzerkesztesAlatt) {
        // SZERKESZTÉS: Megkeressük a régi opciót és frissítjük
        for (let i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === napTipusSzerkesztesAlatt) {
                sel.options[i].value = jel;
                sel.options[i].text = `${nev} (${jel})`;
                break;
            }
        }
        napTipusSzerkesztesAlatt = null;
        alert("Típus frissítve!");
    } else {
        // ÚJ HOZZÁADÁS
        let letezik = false;
        for (let i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === jel) { letezik = true; break; }
        }

        if (letezik) return alert("Ez a betűjel már használatban van!");

        const opt = document.createElement('option');
        opt.value = jel;
        opt.text = `${nev} (${jel})`;
        sel.appendChild(opt);
        alert("Típus rögzítve!");
    }
    
    nevInput.value = '';
    jelInput.value = '';
    napTipusListaFrissitese();
    frissitNapTipusElonezet();
    document.getElementById('sztp-nap-modal').style.display = 'none';
}
function napTipusListaFrissitese() {
    const select = document.getElementById('sztp_nap_tipusa');
    const tbody = document.getElementById('sztp_nap_lista_test');
    if (!select || !tbody) return;

    tbody.innerHTML = '';
    for (let i = 1; i < select.options.length; i++) {
        const opt = select.options[i];
        const reszek = opt.text.match(/(.*) \((.*)\)/);
        const nev = reszek ? reszek[1] : opt.text;
        const jel = opt.value;

        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 8px; color: #ddd;">${nev}</td>
                <td style="padding: 8px; text-align: center;"><b style="color: #ffeb3b;">${jel}</b></td>
                <td style="padding: 8px; text-align: right; white-space: nowrap;">
                    <button onclick="napTipusSzerkesztese('${nev.replace(/'/g, "\\'")}', '${jel}')" style="background: none; border: none; color: #2196F3; cursor: pointer; font-size: 1.1em; margin-right: 8px;" title="Szerkesztés">✏️</button>
                    <button onclick="napTipusTorlese('${jel}')" style="background: none; border: none; color: #f44336; cursor: pointer; font-size: 1.1em;" title="Törlés">🗑️</button>
                </td>
            </tr>`;
    }
    if (select.options.length <= 1) {
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
        m.innerText = (s.selectedIndex > 0) ? s.options[s.selectedIndex].text : "-";
    }
}

async function globalisSzabalyokMentese() {
    const fajlnev = document.getElementById('sztp_fajlnev_szabaly').value;
    if (!fajlnev) return alert("Adj meg egy fájlnév szabályt!");
    alert("Szabályok rögzítve!");
}

