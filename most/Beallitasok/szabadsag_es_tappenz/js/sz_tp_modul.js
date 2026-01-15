function szTpModulBetoltese() {
    const kontener = document.getElementById('modul-tartalom');
    if (!kontener) return;

    kontener.innerHTML = `
        <div class="sztp-keret" style="display: flex; gap: 40px; padding: 20px; align-items: flex-start;">
            <input type="hidden" id="sztp_id" value=""> 
            
           <div style="width: 360px; display: flex; flex-direction: column; gap: 15px;">
                <div style="background: #1e1e1e; padding: 20px; border-radius: 12px; border: 1px solid #333;">
                    <button onclick="fajtaBeallitasokMegnyitasa()" style="width: 100%; padding: 12px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        Munkanapok típusa ⚙️
                    </button>
                    
                    <div style="border-top: 1px solid #333; padding-top: 15px;">
                        <button onclick="napTipusSzerkesztoMegnyitasa()" style="width: 100%; padding: 10px; background: #252525; color: #ffeb3b; border: 1px solid #444; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Napok típusa ⚙️
                        </button>
                        <select id="sztp_nap_tipusa" style="display: none;"></select>
                        <div id="nap-tipus-minta" style="display: none;">-</div>
                    </div>
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

        <div id="sztp-fajta-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: #1e1e1e; color: white; padding: 25px; border-radius: 12px; border: 1px solid #333; display: flex; gap: 25px; width: 850px; max-height: 90vh;">
                
                <div style="flex: 0 0 400px; display: flex; flex-direction: column; gap: 15px;">
                    <h3 style="margin: 0; color: #2196F3; border-bottom: 1px solid #333; padding-bottom: 10px;">⚙️ Fajták beállításai</h3>
                    
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
                            <button onclick="megnevezesSzerkesztoMegnyitasa()" style="padding: 0 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: flex-end;">
                        <div style="width: 70px;">
                            <label style="display: block; font-size: 0.75em; color: #aaa; margin-bottom: 3px;">Kód:</label>
                            <input type="text" id="sztp_kod" maxlength="10" oninput="frissitSztpElonezet('kod')" 
                                   style="width: 100%; padding: 6px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px; text-align: center;">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; font-size: 0.75em; color: #aaa; margin-bottom: 3px;">Szín:</label>
                            <div style="display: flex; gap: 5px;">
                                <input type="color" id="sztp_szin" oninput="frissitSztpElonezet('picker')" style="width: 35px; height: 32px; cursor: pointer; background: none; border: 1px solid #444; border-radius: 4px; padding: 2px;">
                                <input type="text" id="sztp_hex" oninput="frissitSztpElonezet('hex')" placeholder="#ffffff" maxlength="7" style="width: 90px; padding: 6px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px; font-family: monospace;">
                            </div>
                        </div>
                        <div style="width: 60px; text-align: center;">
                            <label style="display: block; font-size: 0.7em; color: #aaa; margin-bottom: 3px;">MINTA</label>
                            <div id="szin-elonezet-doboz" style="width: 100%; height: 32px; border: 1px solid #444; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 4px; font-size: 12px; color: #000;">-</div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px;">
                        <div style="display: flex; gap: 10px;">
                            <button onclick="beallitasokMentese()" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">💾 Mentés</button>
                            <button id="btn-sztp-feltoltes" onclick="feltoltoModalMegnyitasa()" disabled style="flex: 1; padding: 12px; background: #ccc; color: white; border: none; border-radius: 8px; cursor: not-allowed; font-weight: bold;">📁 Sablon feltöltése</button>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="beallitasokTorlese()" style="flex: 1; padding: 12px; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">🗑️ Törlés</button>
                            <button id="btn-sztp-kezeles" onclick="sablonKezeleseOldal()" disabled style="flex: 1; padding: 12px; background: #ccc; color: white; border: none; border-radius: 8px; cursor: not-allowed; font-weight: bold;">✏️ Sablon kezelése</button>
                        </div>
                        <button onclick="document.getElementById('sztp-fajta-modal').style.display='none'" style="padding: 12px; background: #444; color: white; border: none; border-radius: 8px; cursor: pointer; align-self: flex-start; min-width: 100px;">Bezárás</button>
                    </div>
                </div>

                <div id="sztp-fajl-lista-kontener" style="flex: 1; background: #121212; border: 1px solid #333; border-radius: 8px; padding: 15px; overflow: auto; resize: both; min-height: 400px;">
                    <label style="display: block; font-size: 0.85em; color: #aaa; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">📄 Sablon fájlok listája</label>
                    <ul id="sztp-fajl-lista" style="list-style: none; padding: 0; margin: 0; font-size: 0.9em; color: #ddd; white-space: nowrap;">
                        <li>⏳ Nincs fájl kiválasztva</li>
                    </ul>
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

