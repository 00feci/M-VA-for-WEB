<div style="display: flex; gap: 12px; align-items: flex-end;">
                <div style="width: 70px;">
                    <label style="display: block; font-size: 0.75em; color: #aaa; margin-bottom: 3px;">Kód:</label>
                    <input type="text" id="sztp_kod" maxlength="10" oninput="frissitSztpElonezet('kod')" 
                            style="width: 100%; padding: 6px; background: #252525; border: 1px solid #444; color: white; border-radius: 4px; text-align: center;">
                </div>
                <div style="width: 38px;">
                    <label style="display: block; font-size: 0.75em; color: #aaa; margin-bottom: 3px;">Szín:</label>
                    <input type="color" id="sztp_szin" oninput="frissitSztpElonezet('picker')" style="width: 38px; height: 36px; cursor: pointer; background: none; border: 1px solid #444; border-radius: 4px; padding: 2px;">
                </div>
                <div style="flex: 1;">
                    <label style="display: block; font-size: 0.75em; color: #aaa; margin-bottom: 3px;">HEX kód:</label>
                    <input type="text" id="sztp_hex" oninput="frissitSztpElonezet('hex')" placeholder="#ffffff" maxlength="7" style="width: 80px; padding: 6px; background: #121212; border: 1px solid #444; color: white; border-radius: 4px; font-family: monospace; font-size: 0.85em;">
                </div>
                <div style="width: 60px; text-align: center;">
                    <label style="display: block; font-size: 0.7em; color: #aaa; margin-bottom: 3px;">MINTA</label>
                    <div id="szin-elonezet-doboz" style="width: 100%; height: 32px; border: 1px solid #444; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 4px; font-size: 12px; color: #000;">-</div>
                </div>
