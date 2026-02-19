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
