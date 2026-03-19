function szTpModulBetoltese() {
    // Szigorúan a vezer.php-ban definiált root div-et keressük, 
    // hogy ne írjuk felül a felette lévő PHP-s Vissza gombot!
    const kontener = document.getElementById('sz-tp-modul-root');
    
    if (!kontener) {
        console.warn("Az 'sz-tp-modul-root' nem található, próbálkozás a 'modul-tartalom' elemmel...");
        const tartalmiKontener = document.getElementById('modul-tartalom');
        if (!tartalmiKontener) return;
        // Ha nincs root div, de van tartalmi konténer, létrehozzuk a helyet
        tartalmiKontener.innerHTML = '<div id="sz-tp-modul-root"></div>';
        return szTpModulBetoltese();
    }

    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 40px; padding: 20px; align-items: flex-start;">
            <input type="hidden" id="sztp_id" value=""> 
            
           <div style="width: 360px; display: flex; flex-direction: column; gap: 15px;">
                <div style="background: #1e1e1e; padding: 20px; border-radius: 12px; border: 1px solid #333;">
                    <button onclick="fajtaBeallitasokMegnyitasa()" style="width: 100%; padding: 12px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        Munkanapok típusa ⚙️
                    </button>
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
            </div>
        </div>
        
        <div id="sztp-feltolto-modal-kontener"></div>
        <div id="sztp-nap-modal-kontener"></div>
        
        <div id="sztp-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10002; align-items: center; justify-content: center;">
            <div style="background: white; padding: 25px; border-radius: 8px; width: 450px;">
                <h3 style="margin: 0; color: #333;">Megnevezések hozzáadása</h3>
                <textarea id="sztp_tomeges_bevitel" placeholder="Példa:&#10;Szabadság&#10;Táppénz" style="width: 100%; height: 200px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin: 15px 0; font-family: sans-serif; color: #333;"></textarea>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="modalBezaras()" style="padding: 8px 15px; background: #eee; border: 1px solid #ccc; border-radius: 4px; color: #333; cursor: pointer;">Mégse</button>
                    <button onclick="megnevezesekMentese()" style="padding: 8px 20px; background: #4CAF50; color: white; border: none; font-weight: bold; border-radius: 4px; cursor: pointer;">Frissítés</button>
                </div>
            </div>
        </div>
        ${getHivatkozasModalHtml()}
    `;

   setTimeout(() => {
        // Hibatűrőbb betöltés: ha valamelyik függvény hiányzik, ne álljon meg a többi
        if (typeof listaBetoltese === 'function') try { listaBetoltese(); } catch(e) { console.error(e); }
        if (typeof inicializalFeltoltot === 'function') try { inicializalFeltoltot(); } catch(e) { console.error(e); }
        
        // Fontos: a szóközöket az URL-ben kódolni kell (%20)
        fetch('Beallitasok/szabadsag_es_tappenz/Napok%20típusa/nap_tipusok_kezelese.html')
            .then(v => v.text())
            .then(html => {
                const k = document.getElementById('sztp-nap-modal-kontener');
                if (k) k.innerHTML = html;
            }).catch(err => console.error("Hiba a naptípus HTML betöltésekor:", err));
    }, 150);
}
