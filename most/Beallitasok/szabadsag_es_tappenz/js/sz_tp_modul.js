// sz_tp_modul.js - Szabadság és Táppénz beállítások logikája

function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    // Kétoszlopos elrendezés létrehozása
    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 30px; padding: 20px; align-items: flex-start;">
            <input type="hidden" id="sztp_id" value=""> <div class="sztp-beallitasok-oszlop" style="flex: 2; display: flex; flex-direction: column; gap: 20px;">
                <div class="sztp-csoport">
                    <label style="display: block; font-weight: bold; margin-bottom: 5px;">Megnevezés:</label>
                    <div style="display: flex; gap: 10px;">
                        <select id="sztp_megnevezes" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                            <option value="">-- Válassz vagy adj hozzá --</option>
                        </select>
                        <button onclick="megnevezesSzerkesztoMegnyitasa()" title="Megnevezések kezelése" 
                                style="background: #2196F3; color: white; border: none; padding: 0 15px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 18px;">+</button>
                    </div>
                </div>

                <div class="sztp-csoport">
                    <label style="display: block; font-weight: bold; margin-bottom: 5px;">Kód (Pl. SZ, TP, A):</label>
                    <input type="text" id="sztp_kod" maxlength="10" oninput="frissitSztpElonezet()" 
                           style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="SZ">
                </div>

                <div class="sztp-csoport">
                    <label style="display: block; font-weight: bold; margin-bottom: 5px;">Megjelenési szín:</label>
                    <input type="color" id="sztp_szin" oninput="frissitSztpElonezet()" 
                           style="width: 100%; height: 40px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; padding: 2px;" value="#ffffff">
                </div>
            </div>

            <div class="sztp-elonezet-oszlop" style="flex: 1; background: #fafafa; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center;">
                <h3 style="margin-top: 0; color: #666; font-size: 1em;">Előnézet</h3>
                <div style="display: flex; justify-content: center; margin: 15px 0;">
                    <div id="szin-elonezet-doboz" 
                         style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; 
                                border: 1px solid #333; background: #ffffff; font-weight: bold; font-size: 14px; border-radius: 4px;">-</div>
                </div>
            </div>
        </div>
        `;
    
    injektalGombokat(); // Injektáljuk a Mentés és Törlés gombokat a felső sorba
    console.log("Szabadság modul UI betöltve.");
}

// Új függvény a felső gombokhoz
function injektalGombokat() {
    const sor = document.getElementById('modul-gomb-sor');
    if (!sor) return;

    // Mentés gomb
    const mentes = document.createElement('div');
    mentes.className = 'dashboard-gomb';
    mentes.style.background = '#4CAF50';
    mentes.style.color = 'white';
    mentes.innerHTML = '💾 Mentés';
    mentes.onclick = beallitasokMentese;
    
    // Törlés gomb
    const torles = document.createElement('div');
    torles.className = 'dashboard-gomb';
    torles.style.background = '#f44336';
    torles.style.color = 'white';
    torles.innerHTML = '🗑️ Törlés';
    torles.onclick = beallitasokTorlese;

    sor.appendChild(mentes);
    sor.appendChild(torles);
}

function beallitasokMentese() { console.log("Mentés..."); }
function beallitasokTorlese() { 
    const nev = document.getElementById('sztp_megnevezes').value;
    if(!nev) return alert("Nincs kiválasztva semmi a törléshez!");
    if(confirm("Biztosan törölni szeretnéd a(z) " + nev + " beállítást?")) {
        console.log("Törlés folyamatban..."); 
    }
}
    
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

// Élő előnézet frissítése
function frissitSztpElonezet() {
    const kod = document.getElementById('sztp_kod').value || '-';
    const szin = document.getElementById('sztp_szin').value;
    const doboz = document.getElementById('szin-elonezet-doboz');

    if (doboz) {
        doboz.style.backgroundColor = szin;
        doboz.textContent = kod;
        
        // Kontraszt figyelés (ha sötét a szín, fehér legyen a szöveg)
        const r = parseInt(szin.substr(1,2), 16);
        const g = parseInt(szin.substr(3,2), 16);
        const b = parseInt(szin.substr(5,2), 16);
        const yiq = ((r*299)+(g*587)+(b*114))/1000;
        doboz.style.color = (yiq >= 128) ? 'black' : 'white';
    }
}



