function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 50px; padding: 20px; align-items: flex-start;">
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

                <div style="display: flex; gap: 40px; justify-content: space-between;">
                    <div style="width: 100px;">
                        <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 3px;">Kód:</label>
                        <input type="text" id="sztp_kod" maxlength="10" oninput="frissitSztpElonezet('kod')" 
                               style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;" placeholder="SZ">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 3px;">Szín és Hex kód:</label>
                        <div style="display: flex; gap: 8px;">
                            <input type="color" id="sztp_szin" oninput="frissitSztpElonezet('picker')" 
                                   style="width: 40px; height: 32px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; padding: 2px;" value="#ffffff">
                            <input type="text" id="sztp_hex" oninput="frissitSztpElonezet('hex')" placeholder="#ffffff" maxlength="7"
                                   style="width: 90px; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace; font-size: 0.9em;">
                        </div>
                    </div>
                </div>

                <div style="width: 100%; height: 65px; background: #fff; border: 1px solid #eee; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px;">
                    <span style="font-size: 0.65em; color: #aaa; margin-bottom: 3px; font-weight: bold;">MINTA</span>
                    <div id="szin-elonezet-doboz" 
                         style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; 
                                border: 1px solid #444; background: #ffffff; font-weight: bold; font-size: 13px; border-radius: 4px;">-</div>
                </div>
            </div>
            
         <div style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 8px;">
                        <button id="btn-sztp-feltoltes" onclick="feltoltoModalMegnyitasa()" disabled
                                style="flex: 1; padding: 10px; background: #ccc; color: white; border: none; border-radius: 6px; cursor: not-allowed; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 0.8em;">
                            📁 Sablon feltöltése
                        </button>
                        <button id="btn-sztp-kezeles" onclick="sablonKezeleseOldal()" disabled
                            style="flex: 1; padding: 10px; background: #ccc; color: white; border: none; border-radius: 6px; cursor: not-allowed; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 0.8em;">
                        ✏️ Sablon kezelése
                    </button>
                </div>
            </div>
                <div style="background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                    <ul id="sztp-fajl-lista" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em; color: #555; line-height: 1.6;">
                        <li>📄 Jelenleg nincs fájl</li>
                    </ul>
                </div>
            </div>
        </div>

       <div id="sztp-feltolto-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; align-items: center; justify-content: center;">
            <div style="background: #121212; color: white; padding: 25px; border-radius: 12px; width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #333;">
                <h3 style="margin-top: 0; color: white; display: flex; align-items: center; gap: 10px;">📁 Sablon feltöltése</h3>
                <p style="font-size: 0.85em; color: #bbb;">Válassz ki egy fájlt vagy egy teljes mappát a feltöltéshez.</p>
                <div id="sztp-feltolto-zona" 
                     style="border: 3px dashed #2196F3; background: #1e1e1e; padding: 30px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 15px;">
                        <button onclick="sztpTallozas(false)" style="padding: 8px 16px; cursor: pointer; background: #2196F3; color: white; border: none; border-radius: 4px; font-size: 0.9em;">📄 Fájlok</button>
                        <button onclick="sztpTallozas(true)" style="padding: 8px 16px; cursor: pointer; background: #2196F3; color: white; border: none; border-radius: 4px; font-size: 0.9em;">📂 Mappa</button>
                    </div>
                    <span style="color: #2196F3; font-weight: 500;">Vagy húzd ide a tartalmat</span>
                </div>
               <div id="sztp-modal-statusz" style="margin-bottom: 10px; font-size: 0.85em; color: #81c784; font-weight: bold; text-align: center; min-height: 1.2em;"></div>
                <div id="sztp-modal-fajl-lista-kontener" style="max-height: 150px; overflow-y: auto; background: #1e1e1e; border: 1px solid #333; border-radius: 6px; margin-bottom: 15px; display: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">
                    <ul id="sztp-modal-fajl-lista" style="list-style: none; padding: 10px; margin: 0; font-size: 0.8em; color: #ddd; line-height: 1.4;"></ul>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="feltoltoModalBezaras()" style="padding: 8px 15px; cursor: pointer; border-radius: 4px; background: #424242; color: white; border: 1px solid #555;">Mégse</button>
                    <button onclick="beallitasokMentese(true)" style="padding: 8px 20px; cursor: pointer; border-radius: 4px; background: #4CAF50; color: white; border: none; font-weight: bold;">🚀 Feltöltés és Mentés</button>
                </div>
            </div>
        </div>

    <div id="sztp-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; align-items: center; justify-content: center;">
            <div style="background: white; padding: 25px; border-radius: 8px; width: 450px;">
                <h3 style="margin-top: 0;">Megnevezések kezelése</h3>
                <textarea id="sztp_tomeges_bevitel" placeholder="Példa:&#10;Szabadság&#10;Táppénz" 
                          style="width: 100%; height: 200px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button onclick="modalBezaras()" style="padding: 8px 15px; cursor: pointer; border-radius: 4px; background: #eee; border: 1px solid #ccc;">Mégse</button>
                    <button onclick="megnevezesekMentese()" style="padding: 8px 20px; cursor: pointer; border-radius: 4px; background: #4CAF50; color: white; border: none; font-weight: bold;">Frissítés</button>
                </div>
            </div>
        </div>
    `;
   injektalGombokat();
    setTimeout(() => {
        listaBetoltese();
        inicializalFeltoltot(); // 👈 Aktiváljuk a Drag&Drop zónát
    }, 50);
    console.log("Szabadság modul UI betöltve.");
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

let kivalasztottFajlokBuffer = []; // Átmeneti tároló a mentés előtti fájloknak

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
    if (!idInput) return;

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
           if (data.success && data.adat) {
                document.getElementById('sztp_id').value = data.adat.id;
                document.getElementById('sztp_kod').value = data.adat.kod;
                document.getElementById('sztp_szin').value = data.adat.hex_szin;
          // 🔍 Valódi fájllista lekérése a szerverről összefoglaló helyett
                fetch('Beallitasok/szabadsag_es_tappenz/sztp_fajl_listazasa.php?id=' + data.adat.id)
                    .then(r => r.json())
                    .then(fData => {
                        const lista = document.getElementById('sztp-fajl-lista');
                        if (fData.success && fData.fajlok.length > 0) {
                            lista.innerHTML = fData.fajlok.map(f => `<li>📄 ${f}</li>`).join('');
                        } else {
                            lista.innerHTML = `<li>📄 Jelenleg nincs fájl</li>`;
                        }
                    });
                document.getElementById('sztp_hex').value = data.adat.hex_szin;
                frissitSztpElonezet('picker');
            }
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
        <div style="padding: 20px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;">🔗 Hivatkozások leképezése és számítások</h3>
                <button onclick="ujHivatkozasPopup()" style="padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">+ Új hivatkozás létrehozása</button>
            </div>
            
            <div style="display: flex; gap: 30px;">
                <div style="flex: 1; background: white; padding: 15px; border-radius: 6px; border: 1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h4 style="margin-top: 0; border-bottom: 2px solid #9c27b0; padding-bottom: 5px;">Adatbázis minta (Legfrissebb rekord)</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                        <thead>
                            <tr style="background: #f2f2f2; text-align: left;">
                                <th style="padding: 8px; border: 1px solid #ddd;">SQL oszlop</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">Aktuális adat (Példa)</th>
                            </tr>
                        </thead>
                        <tbody id="sztp-minta-adatok-test">
                            <tr><td colspan="2" style="text-align: center; padding: 20px;">⏳ Adatok betöltése...</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div style="flex: 1; background: white; padding: 15px; border-radius: 6px; border: 1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h4 style="margin-top: 0; border-bottom: 2px solid #2196F3; padding-bottom: 5px;">Aktív hivatkozások és szabályok</h4>
                    <ul id="sztp-aktiv-hivatkozasok" style="list-style: none; padding: 0; margin: 0;">
                        <li style="color: #888; font-style: italic;">Nincs még létrehozott hivatkozás.</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Itt hívjuk majd meg a minta adatok lekérését
    mintaAdatokBetoltese();
}

function mintaAdatokBetoltese() {
    // Ez a függvény tölti majd fel a bal oldali táblázatot az SQL oszlopokkal és adatokkal
    const tbody = document.getElementById('sztp-minta-adatok-test');
    // Példa statikus feltöltés, amíg a PHP nincs kész:
    tbody.innerHTML = `
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Név</td><td style="padding: 8px; border: 1px solid #ddd;">Alma (Minta)</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">születés dátum</td><td style="padding: 8px; border: 1px solid #ddd;">2023.01.10</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">státusz_dátum</td><td style="padding: 8px; border: 1px solid #ddd;">2025.12.30 10:00</td></tr>
    `;
}

function ujHivatkozasPopup() {
    alert("Itt nyílik majd meg a popup a választómezővel és képletépítővel.");
}



