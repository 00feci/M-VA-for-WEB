function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 50px; padding: 20px; align-items: flex-start;">
            <input type="hidden" id="sztp_id" value=""> 
            
            <div style="width: 360px; display: flex; flex-direction: column; gap: 15px;">
                
                <div>
                    <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 3px;">Megnevezés:</label>
                    <div style="display: flex; gap: 5px;">
                        <select id="sztp_megnevezes" onchange="adatokBetoltese(this.value)" style="flex: 1; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
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
                        <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 3px;">Szín és Hex:</label>
                        <div style="display: flex; gap: 8px;">
                            <input type="color" id="sztp_szin" oninput="frissitSztpElonezet('picker')" 
                                   style="width: 40px; height: 32px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; padding: 2px;" value="#ffffff">
                            <input type="text" id="sztp_hex" oninput="frissitSztpElonezet('hex')" placeholder="#ffffff" maxlength="7"
                                   style="width: 85px; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace; font-size: 0.9em;">
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
                <label style="font-weight: bold; font-size: 0.9em;">📄 Sablon feltöltése:</label>
                <div id="sztp-feltolto-zona" 
                     style="border: 2px dashed #2196F3; background: #f0f7ff; padding: 20px; text-align: center; border-radius: 8px; cursor: pointer;">
                    <span style="color: #2196F3; font-size: 0.9em;">Húzd ide a fájlt vagy kattints</span>
                </div>
                <div style="background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                    <ul id="sztp-fajl-lista" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em; color: #555; line-height: 1.6;">
                        <li>📄 Jelenleg nincs fájl</li>
                    </ul>
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
    setTimeout(listaBetoltese, 50); // 🛡️ Időzített betöltés a DOM szinkronizációhoz
    console.log("Szabadság modul UI betöltve.");
}

function listaBetoltese() {
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php')
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
    if (!id) {
        document.getElementById('sztp_id').value = '';
        document.getElementById('sztp_kod').value = '';
        document.getElementById('sztp_szin').value = '#ffffff';
        document.getElementById('sztp_hex').value = '#ffffff';
        frissitSztpElonezet('picker');
        return;
    }
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id)
        .then(r => r.json())
        .then(data => {
            if (data.success && data.adat) {
                document.getElementById('sztp_id').value = data.adat.id;
                document.getElementById('sztp_kod').value = data.adat.kod;
                document.getElementById('sztp_szin').value = data.adat.szin;
                document.getElementById('sztp_hex').value = data.adat.szin;
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
}

function megnevezesekMentese() {
    const szoveg = document.getElementById('sztp_tomeges_bevitel').value;
    const elemek = szoveg.split(/[\n,]/).map(item => item.trim()).filter(item => item !== "");
    const select = document.getElementById('sztp_megnevezes');
    
    select.innerHTML = '<option value="">-- Válassz a listából --</option>';
    elemek.forEach(ertek => {
        const opcio = document.createElement('option');
        opcio.value = ertek; // Ideiglenes érték, mentéskor válik ID-vá
        opcio.textContent = ertek;
        select.appendChild(opcio);
    });
    modalBezaras();
}

function injektalGombokat() {
    const sor = document.getElementById('modul-gomb-sor');
    if (!sor) return;
    sor.innerHTML = ''; // Előző gombok törlése

    const gombok = [
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

function beallitasokMentese() {
    const select = document.getElementById('sztp_megnevezes');
    const adat = {
        id: document.getElementById('sztp_id').value,
        megnevezes: select.options[select.selectedIndex]?.text,
        kod: document.getElementById('sztp_kod').value,
        szin: document.getElementById('sztp_szin').value,
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
        if (data.success) listaBetoltese();
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
