function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 40px; padding: 20px; align-items: flex-start;">
            <input type="hidden" id="sztp_id" value=""> 
            
            <div style="width: 360px; display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <button onclick="fajtaBeallitasokMegnyitasa()" style="width: 100%; padding: 12px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">Munkanapok típusa ⚙️</button>
                    
                    <input type="text" id="sztp_kereso" oninput="szuresSztpMegnevezesre(this.value)" 
                           placeholder="Keresés..." style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-bottom: none; border-radius: 6px 6px 0 0; font-size: 0.85em;">
                    <div style="display: flex; gap: 5px;">
                        <select id="sztp_megnevezes" onchange="adatokBetoltese(this.value)" style="flex: 1; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 0 0 6px 6px; font-size: 0.9em;">
                            <option value="">-- Kiválasztás --</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top: 5px;">
                    <button onclick="napTipusSzerkesztoMegnyitasa()" style="width: 100%; padding: 10px; background: #252525; color: #ffeb3b; border: 1px solid #444; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        Napok típusa ⚙️
                    </button>
                    <select id="sztp_nap_tipusa" style="display: none;"></select>
                    <div id="nap-tipus-minta" style="display: none;">-</div>
                </div>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
                <div style="background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333; color: white;">
                    <h4 style="margin: 0 0 10px 0; color: #ffeb3b; font-size: 0.9em; border-bottom: 1px solid #444; padding-bottom: 5px;">⚙️ Generálási szabályok</h4>
                    <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 3px;">Kész dokumentum neve:</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="sztp_fajlnev_szabaly" placeholder="{név} {dátum}" style="flex: 1; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                        <button onclick="globalisSzabalyokMentese()" style="padding: 0 15px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Mentés</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="sztp-fajta-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: #1e1e1e; color: white; padding: 25px; border-radius: 12px; width: 950px; border: 1px solid #333; display: flex; flex-direction: column; height: 80vh; max-height: 700px; overflow: hidden;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 10px; color: #2196F3;">⚙️ Fajták beállításai</h3>
                
                <div style="display: flex; flex: 1; gap: 20px; margin-top: 20px; overflow: hidden;">
                    <div style="flex: 0 0 320px; display: flex; flex-direction: column; gap: 15px; border-right: 1px solid #333; padding-right: 20px;">
                        <div>
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 4px;">Keresés:</label>
                            <input type="text" id="sztp_edit_kereso" oninput="szuresSztpMegnevezesre(this.value, 'sztp_edit_megnevezes')" 
                                   placeholder="Keresés..." style="width: 100%; padding: 8px; background: #121212; border: 1px solid #333; color: white; border-radius: 4px;">
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 4px;">Munkanap típusa:</label>
                            <div style="display: flex; gap: 5px;">
                                <select id="sztp_edit_megnevezes" onchange="adatokBetoltese(this.value)" style="flex: 1; padding: 8px; background: #121212; border: 1px solid #333; color: white; border-radius: 4px;">
                                    <option value="">-- Kiválasztás --</option>
                                </select>
                                <button onclick="megnevezesSzerkesztoMegnyitasa()" style="padding: 0 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                            </div>
                        </div>

                        <div style="display: flex; gap: 10px; align-items: flex-end;">
                            <div style="width: 80px;">
                                <label style="display: block; font-size: 0.75em; color: #aaa; margin-bottom: 3px;">Kód:</label>
                                <input type="text" id="sztp_kod" maxlength="10" oninput="frissitSztpElonezet('kod')" 
                                       style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;">
                            </div>
                            <div style="flex: 1;">
                                <label style="display: block; font-size: 0.75em; color: #aaa; margin-bottom: 3px;">Szín:</label>
                                <div style="display: flex; gap: 4px;">
                                    <input type="color" id="sztp_szin" oninput="frissitSztpElonezet('picker')" 
                                           style="width: 38px; height: 36px; cursor: pointer; background: none; border: 1px solid #444; border-radius: 4px; padding: 2px;" value="#ffffff">
                                    <input type="text" id="sztp_hex" oninput="frissitSztpElonezet('hex')" placeholder="#ffffff" maxlength="7"
                                           style="width: 80px; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px; font-family: monospace; font-size: 0.85em;">
                                </div>
                            </div>
                            <div style="width: 60px; text-align: center;">
                                <label style="display: block; font-size: 0.7em; color: #aaa; margin-bottom: 3px;">MINTA</label>
                                <div id="szin-elonezet-doboz" style="width: 100%; height: 36px; border: 1px solid #444; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 4px; font-size: 12px; color: #000;">-</div>
                            </div>
                        </div>

                        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 10px;">
                            <button onclick="beallitasokMentese()" style="width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">💾 Mentés</button>
                            <button onclick="beallitasokTorlese()" style="width: 100%; padding: 12px; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">🗑️ Törlés</button>
                            <button onclick="document.getElementById('sztp-fajta-modal').style.display='none'" style="width: 100%; padding: 12px; background: #444; color: white; border: none; border-radius: 8px; cursor: pointer;">Bezárás</button>
                        </div>
                    </div>

                    <div style="flex: 1; display: flex; flex-direction: column; gap: 10px; overflow: hidden;">
                        <label style="display: block; font-size: 0.8em; color: #aaa;">Csatolt sablon fájlok:</label>
                        <div id="sztp-fajl-lista-kontener" style="flex: 1; background: #121212; border: 1px solid #333; border-radius: 8px; padding: 15px; overflow: auto; resize: both; min-height: 200px; max-width: 100%;">
                            <ul id="sztp-fajl-lista" style="list-style: none; padding: 0; margin: 0; font-size: 0.9em; color: #ddd; white-space: nowrap; overflow: visible;">
                                <li>📄 Jelenleg nincs fájl</li>
                            </ul>
                        </div>

                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button id="btn-sztp-feltoltes" onclick="feltoltoModalMegnyitasa()" disabled style="padding: 12px 20px; background: #ccc; color: white; border: none; border-radius: 8px; cursor: not-allowed; font-weight: bold;">📁 Sablon feltöltése</button>
                            <button id="btn-sztp-kezeles" onclick="sablonKezeleseOldal()" disabled style="padding: 12px 20px; background: #ccc; color: white; border: none; border-radius: 8px; cursor: not-allowed; font-weight: bold;">✏️ Sablon kezelése</button>
                        </div>
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
