
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
  <?php include __DIR__ . '/munkanapok_popup_kod_szin.php'; ?>
                        </div>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
               <div style="display: flex; gap: 10px;">
                    <?php include __DIR__ . '/munkanapok_popup_mentes.php'; ?>
                    <button id="btn-sztp-feltoltes" onclick="feltoltoModalMegnyitasa()" disabled style="flex: 1; padding: 12px; background: #ccc; color: white; border: none; border-radius: 8px; cursor: not-allowed; font-weight: bold;">📁 Sablon feltöltése</button>
                </div>
               <div style="display: flex; gap: 10px;">
                    <?php include __DIR__ . '/munkanapok_popup_torles.php'; ?>
                    <button id="btn-sztp-kezeles" onclick="sablonKezeleseOldal()" disabled style="flex: 1; padding: 12px; background: #ccc; color: white; border: none; border-radius: 8px; cursor: not-allowed; font-weight: bold;">✏️ Sablon kezelése</button>
                </div>
                 <?php include __DIR__ . '/munkanapok_popup_nagy_rekord.php'; ?>
                    <?php include __DIR__ . '/munkanapok_popup_bezaras.php'; ?>
                </div>
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



