// sz_tp_modul.js - Szabadság és Táppénz beállítások logikája

function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    // Kétoszlopos elrendezés létrehozása
   // Kétoszlopos elrendezés létrehozása
    kontener.innerHTML = `
   <div class="sztp-keret" style="display: flex; gap: 50px; padding: 20px; align-items: flex-start;">
            <input type="hidden" id="sztp_id" value=""> 
            
            <div style="width: 360px; display: flex; flex-direction: column; gap: 15px;">
                
                <div>
                    <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 3px;">Megnevezés:</label>
                    <div style="display: flex; gap: 5px;">
                        <select id="sztp_megnevezes" style="flex: 1; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
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
                <label style="font-weight: bold; font-size: 0.9em;">📄 Sablon feltöltése:</label>
                
                <div id="sztp-feltolto-zona" 
                     style="border: 2px dashed #2196F3; background: #f0f7ff; padding: 20px; text-align: center; border-radius: 8px; cursor: pointer;">
                    <span style="color: #2196F3; font-size: 0.9em;">Húzd ide a fájlt vagy kattints</span>
                </div>

                <div style="background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85em; color: #555; line-height: 1.6;">
                        <li>📄 a.ccv</li>
                        <li>📄 sdas.fdsfed</li>
                        <li>📄 gegge.vfdbdf</li>
                    </ul>
                </div>
            </div>
        </div>
        `;
    
    injektalGombokat(); // Injektáljuk a Mentés és Törlés gombokat a felső sorba
    console.log("Szabadság modul UI betöltve.");
}   

// Popup megnyitása
function megnevezesSzerkesztoMegnyitasa() {
    const modal = document.getElementById('sztp-modal');
    modal.style.display = 'flex';
    document.getElementById('sztp_tomeges_bevitel').focus();
}

// Popup bezárása
function modalBezaras() {
    document.getElementById('sztp-modal').style.display = 'none';
}

// Tömeges megnevezés feldolgozás
function megnevezesekMentese() {
    const szoveg = document.getElementById('sztp_tomeges_bevitel').value;
    
    // Szétdarabolás vessző vagy Új sor mentén
    // A trim() csak az elemek széléről veszi le a szóközöket, a közepét nem bántja!
    const elemek = szoveg.split(/[\n,]/)
                         .map(item => item.trim())
                         .filter(item => item !== ""); // Üres sorok kiszűrése

    const select = document.getElementById('sztp_megnevezes');
    
    // Alaphelyzetbe állítás
    select.innerHTML = '<option value="">-- Válassz a listából --</option>';
    
    // Új opciók hozzáadása
    elemek.forEach(ertek => {
        const opcio = document.createElement('option');
        opcio.value = ertek;
        opcio.textContent = ertek;
        select.appendChild(opcio);
    });

    modalBezaras();
    console.log("Megnevezések frissítve:", elemek);
}

function injektalGombokat() {
    const sor = document.getElementById('modul-gomb-sor');
    if (!sor) return;

    // Minden gombnak flex: 1-et adunk, hogy egyforma méretűek legyenek
    const gombok = [
        { id: 'btn_mentes', felirat: '💾 Mentés', szin: '#4CAF50', akcio: beallitasokMentese },
        { id: 'btn_torles', felirat: '🗑️ Törlés', szin: '#f44336', akcio: beallitasokTorlese }
    ];

    gombok.forEach(g => {
        const btn = document.createElement('div');
        btn.className = 'dashboard-gomb';
        btn.style.flex = '1'; // 👈 Itt biztosítjuk az egyforma méretet
        btn.style.background = g.szin;
        btn.style.color = 'white';
        btn.innerHTML = g.felirat;
        btn.onclick = g.akcio;
        sor.appendChild(btn);
    });
}

function frissitSztpElonezet(tipus) {
    const kodInput = document.getElementById('sztp_kod');
    const picker = document.getElementById('sztp_szin');
    const hexInput = document.getElementById('sztp_hex');
    const doboz = document.getElementById('szin-elonezet-doboz');

    // Szinkronizáció a picker és a text mező között
    if (tipus === 'picker') hexInput.value = picker.value;
    if (tipus === 'hex' && hexInput.value.length === 7) picker.value = hexInput.value;

    const kod = kodInput.value || '-';
    const szin = picker.value;

    if (doboz) {
        doboz.style.backgroundColor = szin;
        doboz.textContent = kod;
        
        // Kontraszt logika
        const r = parseInt(szin.substr(1,2), 16), g = parseInt(szin.substr(3,2), 16), b = parseInt(szin.substr(5,2), 16);
        doboz.style.color = (((r*299)+(g*587)+(b*114))/1000 >= 128) ? 'black' : 'white';
    }
}

function beallitasokMentese() { console.log("Mentés..."); }
function beallitasokTorlese() { 
    const nev = document.getElementById('sztp_megnevezes').value;
    if(!nev) return alert("Nincs kiválasztva semmi a törléshez!");
    if(confirm("Biztosan törölni szeretnéd a(z) " + nev + " beállítást?")) {
        console.log("Törlés folyamatban..."); 
    }
}
