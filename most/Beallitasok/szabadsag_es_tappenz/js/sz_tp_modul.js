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
                <button onclick="feltoltoModalMegnyitasa()" 
                        style="width: 100%; padding: 10px; background: #2196F3; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    📁 Sablon feltöltése / módosítása
                </button>
                <div style="background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                    <ul id="sztp-fajl-lista" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em; color: #555; line-height: 1.6;">
                        <li>📄 Jelenleg nincs fájl</li>
                    </ul>
                </div>
            </div>
        </div>

        <div id="sztp-feltolto-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; align-items: center; justify-content: center;">
            <div style="background: white; padding: 25px; border-radius: 8px; width: 500px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <h3 style="margin-top: 0; display: flex; align-items: center; gap: 10px;">📁 Sablon feltöltése</h3>
                <p style="font-size: 0.85em; color: #666;">Válassz ki egy fájlt vagy egy teljes mappát a feltöltéshez.</p>
                <div id="sztp-feltolto-zona" 
                     style="border: 3px dashed #2196F3; background: #f0f7ff; padding: 30px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 15px;">
                        <button onclick="sztpTallozas(false)" style="padding: 8px 16px; cursor: pointer; background: #2196F3; color: white; border: none; border-radius: 4px; font-size: 0.9em;">📄 Fájlok</button>
                        <button onclick="sztpTallozas(true)" style="padding: 8px 16px; cursor: pointer; background: #2196F3; color: white; border: none; border-radius: 4px; font-size: 0.9em;">📂 Mappa</button>
                    </div>
                    <span style="color: #2196F3; font-weight: 500;">Vagy húzd ide a tartalmat</span>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="feltoltoModalBezaras()" style="padding: 8px 20px; cursor: pointer; border-radius: 4px; background: #4CAF50; color: white; border: none; font-weight: bold;">Kész</button>
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
    lista.innerHTML = ''; 
    
    fajlok.forEach(f => {
        const relPath = f.relPath || f.webkitRelativePath || f.name;
        lista.innerHTML += `<li>📄 ${relPath} <span style="color: #f39c12; font-size: 0.9em;">(Mentésre vár...)</span></li>`;
    });
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
    kivalasztottFajlokBuffer = []; // Minden váltáskor ürítjük az átmeneti listát
    if (!id) {
        document.getElementById('sztp_id').value = '';
        document.getElementById('sztp_kod').value = '';
        document.getElementById('sztp_szin').value = '#ffffff';
        document.getElementById('sztp_hex').value = '#ffffff';
        const lista = document.getElementById('sztp-fajl-lista');
        if (lista) lista.innerHTML = '<li>📄 Jelenleg nincs fájl</li>';
        frissitSztpElonezet('picker');
        return;
    }
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

 async function beallitasokMentese() {
    const select = document.getElementById('sztp_megnevezes');
    const fajlLista = document.getElementById('sztp-fajl-lista');
    let sablonNeve = null;

    // 1. Ha vannak fájlok a pufferben, először feltöltjük őket a szerverre
    if (kivalasztottFajlokBuffer.length > 0) {
        fajlLista.innerHTML = '<li>⏳ Feltöltés folyamatban...</li>';
        
        for (let fajl of kivalasztottFajlokBuffer) {
            const formData = new FormData();
            formData.append('sablon', fajl);
            const relPath = fajl.relPath || fajl.webkitRelativePath || fajl.name;
            formData.append('relativ_utvonal', relPath);
            
            try {
                const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_feltoltes.php', { method: 'POST', body: formData });
                const d = await r.json();
                if (!d.success) throw new Error(d.message);
            } catch (e) {
                alert("Hiba a feltöltés során: " + e.message);
                fajlLista.innerHTML = '<li>❌ Hiba történt, mentés megszakítva.</li>';
                return;
            }
        }
        
        const elsoFajl = kivalasztottFajlokBuffer[0];
        const relPath = elsoFajl.relPath || elsoFajl.webkitRelativePath || elsoFajl.name;
        sablonNeve = relPath.includes('/') ? relPath.split('/')[0] : relPath;
        kivalasztottFajlokBuffer = []; // Ürítjük a puffert
    } else {
        // Ha nincs új választás, megnézzük a már mentett fájlt
        const elsoSor = fajlLista.querySelector('li');
        if (elsoSor && !elsoSor.innerText.includes('Jelenleg nincs')) {
            const tisztaNev = elsoSor.innerText.replace('📄 ', '').replace(' (Mentésre vár...)', '').trim();
            sablonNeve = tisztaNev.includes('/') ? tisztaNev.split('/')[0] : tisztaNev;
        }
    }

    const adat = {
        id: document.getElementById('sztp_id').value,
        megnevezes: select.options[select.selectedIndex]?.text,
        kod: document.getElementById('sztp_kod').value,
        szin: document.getElementById('sztp_szin').value,
        sablon_neve: sablonNeve,
        extra_adatok: [] 
    };

    if (!adat.megnevezes || select.selectedIndex === 0) return alert("Válassz vagy adj hozzá megnevezést!");

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
            if (adat.id) adatokBetoltese(adat.id);
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


