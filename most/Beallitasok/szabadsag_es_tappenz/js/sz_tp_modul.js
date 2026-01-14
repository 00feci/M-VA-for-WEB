function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 40px; padding: 20px; align-items: flex-start;">
            <input type="hidden" id="sztp_id" value=""> 
            
            <div style="width: 360px; display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <button onclick="fajtaBeallitasokMegnyitasa()" style="width: 100%; padding: 10px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">Munkanapok típusa ⚙️</button>
                    
                    <input type="text" id="sztp_kereso" oninput="szuresSztpMegnevezesre(this.value)" 
                           placeholder="Keresés..." style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-bottom: none; border-radius: 6px 6px 0 0; font-size: 0.85em;">
                    <div style="display: flex; gap: 5px;">
                        <select id="sztp_megnevezes" onchange="adatokBetoltese(this.value)" style="flex: 1; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 0 0 6px 6px; font-size: 0.9em;">
                            <option value="">-- Kiválasztás --</option>
                        </select>
                        <button onclick="fajtaBeallitasokMegnyitasa()" style="background: #444; color: #ffeb3b; border: 1px solid #555; padding: 0 12px; cursor: pointer; border-radius: 6px; font-weight: bold;" title="Beállítások">⚙️</button>
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
                            <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 3px;">Kész dokumentum neve:</label>
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

        <div id="sztp-fajta-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: #1e1e1e; color: white; padding: 25px; border-radius: 12px; width: 900px; border: 1px solid #333; display: flex; flex-direction: column; height: 85vh; max-height: 750px; overflow: hidden;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 10px; color: #2196F3;">⚙️ Fajták beállításai</h3>
                
                <div style="display: flex; flex: 1; gap: 30px; margin-top: 20px; overflow: hidden;">
                    <div style="flex: 0 0 350px; display: flex; flex-direction: column; gap: 18px; border-right: 1px solid #333; padding-right: 25px;">
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
                                <button onclick="megnevezesSzerkesztoMegnyitasa()" style="padding: 0 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;" title="Lista bővítése">+</button>
                            </div>
                        </div>

                        <div style="display: flex; gap: 15px; align-items: flex-end;">
                            <div style="width: 90px;">
                                <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Kód:</label>
                                <input type="text" id="sztp_kod" maxlength="10" oninput="frissitSztpElonezet('kod')" 
                                       style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px;" placeholder="SZ">
                            </div>
                            <div style="flex: 1;">
                                <label style="display: block; font-size: 0.8em; color: #aaa; margin-bottom: 5px;">Szín:</label>
                                <div style="display: flex; gap: 5px;">
                                    <input type="color" id="sztp_szin" oninput="frissitSztpElonezet('picker')" 
                                           style="width: 40px; height: 38px; cursor: pointer; background: none; border: 1px solid #444; border-radius: 4px; padding: 2px;" value="#ffffff">
                                    <input type="text" id="sztp_hex" oninput="frissitSztpElonezet('hex')" placeholder="#ffffff" maxlength="7"
                                           style="width: 100%; padding: 8px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px; font-family: monospace;">
                                </div>
                            </div>
                            <div style="width: 70px; text-align: center;">
                                <label style="display: block; font-size: 0.7em; color: #aaa; margin-bottom: 5px;">MINTA</label>
                                <div id="szin-elonezet-doboz" style="width: 100%; height: 38px; border: 1px solid #444; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 6px; font-size: 13px; color: #000;">-</div>
                            </div>
                        </div>

                        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px; padding-bottom: 10px;">
                            <button onclick="beallitasokMentese()" style="width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">💾 Mentés</button>
                            <button onclick="beallitasokTorlese()" style="width: 100%; padding: 12px; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">🗑️ Törlés</button>
                            <button onclick="document.getElementById('sztp-fajta-modal').style.display='none'" style="width: 100%; padding: 12px; background: #444; color: white; border: none; border-radius: 8px; cursor: pointer;">Bezárás</button>
                        </div>
                    </div>

                    <div style="flex: 1; display: flex; flex-direction: column; gap: 15px; overflow: hidden;">
                        <label style="display: block; font-size: 0.85em; color: #aaa;">Csatolt sablon fájlok:</label>
                        <div id="sztp-fajl-lista-kontener" style="flex: 1; background: #121212; border: 1px solid #333; border-radius: 8px; padding: 15px; overflow: auto; resize: both; min-height: 200px; max-width: 100%; scrollbar-width: thin; scrollbar-color: #444 #121212;">
                            <ul id="sztp-fajl-lista" style="list-style: none; padding: 0; margin: 0; font-size: 0.9em; color: #ddd; white-space: nowrap;">
                                <li>📄 Jelenleg nincs fájl</li>
                            </ul>
                        </div>

                        <div style="display: flex; gap: 10px;">
                            <button id="btn-sztp-feltoltes" onclick="feltoltoModalMegnyitasa()" disabled style="flex: 1; padding: 12px; background: #ccc; color: white; border: none; border-radius: 8px; cursor: not-allowed; font-weight: bold;">📁 Sablon feltöltése</button>
                            <button id="btn-sztp-kezeles" onclick="sablonKezeleseOldal()" disabled style="flex: 1; padding: 12px; background: #ccc; color: white; border: none; border-radius: 8px; cursor: not-allowed; font-weight: bold;">✏️ Sablon kezelése</button>
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
