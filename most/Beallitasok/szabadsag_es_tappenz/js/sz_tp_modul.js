// sz_tp_modul.js - Szabadság és Táppénz beállítások logikája

function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    // Kétoszlopos elrendezés létrehozása
    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 30px; padding: 20px; align-items: flex-start;">
            
            <div class="sztp-beallitasok-oszlop" style="flex: 1.5; display: flex; flex-direction: column; gap: 20px;">
                
                <div class="sztp-csoport">
                    <label style="display: block; font-weight: bold; margin-bottom: 5px;">Megnevezés:</label>
                    <div style="display: flex; gap: 10px;">
                        <select id="sztp_megnevezes" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                            <option value="">-- Válassz vagy adj hozzá --</option>
                        </select>
                        <button onclick="megnevezesSzerkesztoMegnyitasa()" title="Megnevezések kezelése" 
                                style="background: #2196F3; color: white; border: none; padding: 0 15px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 18px;">
                            +
                        </button>
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

            <div class="sztp-elonezet-oszlop" style="flex: 1; background: #fdfdfd; border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; min-height: 250px;">
                <div>
                    <h3 style="margin-top: 0; color: #666; font-size: 1.1em;">Előnézet</h3>
                    <div style="display: flex; justify-content: center; margin: 20px 0;">
                        <div id="szin-elonezet-doboz" 
                             style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; 
                                    border: 1px solid #333; background: #ffffff; font-weight: bold; font-size: 16px; border-radius: 4px;">
                            -
                        </div>
                    </div>
                </div>
                
                <div style="border-top: 1px solid #eee; pt-15px;">
                    <button onclick="beallitasokMentese()" 
                            style="width: 100%; background: #4CAF50; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        💾 Beállítás Mentése
                    </button>
                </div>
            </div>

        </div>

        <div id="sztp-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; align-items: center; justify-content: center;">
            <div style="background: white; padding: 25px; border-radius: 8px; width: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0;">Megnevezések kezelése</h3>
                <p style="font-size: 0.9em; color: #555; margin-bottom: 10px;">
                    Írd be az értékeket soronként vagy vesszővel elválasztva:
                </p>
                <textarea id="sztp_tomeges_bevitel" placeholder="Példa:&#10;Szabadság&#10;Táppénz&#10;Apasági szabadság" 
                          style="width: 100%; height: 200px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: sans-serif; resize: none;"></textarea>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button onclick="modalBezaras()" style="padding: 8px 15px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #eee;">Mégse</button>
                    <button onclick="megnevezesekMentese()" style="padding: 8px 20px; cursor: pointer; border: none; border-radius: 4px; background: #4CAF50; color: white; font-weight: bold;">Lista Frissítése</button>
                </div>
            </div>
        </div>
    `;
    
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


