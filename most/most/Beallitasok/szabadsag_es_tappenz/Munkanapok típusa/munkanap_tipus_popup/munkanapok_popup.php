
<div id="sztp-fajta-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center;">
    <div style="background: #1e1e1e; color: white; padding: 25px; border-radius: 12px; border: 1px solid #333; display: flex; gap: 25px; width: 850px; max-height: 90vh;">
        
        <div style="flex: 0 0 400px; display: flex; flex-direction: column; gap: 15px;">
            <h3 style="margin: 0; color: #2196F3; border-bottom: 1px solid #333; padding-bottom: 10px;">⚙️ Fajták beállításai</h3>
            
      <?php include __DIR__ . '/Munkanap tipusa/popup_munkanap_tipusa_vezer.php'; ?>
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
      <?php include __DIR__ . '/munkanapok_popup_sablon_fajlok_listaja.php'; ?>
        </div>
    </div>
</div>





