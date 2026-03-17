<?php
// mappaszerkezete.php – csak a felület (HTML), a logika marad JS-ben

$megjelenitettCim = isset($_GET['cim']) ? htmlspecialchars($_GET['cim']) : 'Sablonok';
$kategoriaId = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';
?>
<input type="hidden" id="sztp_id" value="<?php echo $kategoriaId; ?>">

<div style="padding: 10px; background: #121212; min-height: 500px; border-radius: 8px;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <h3 style="margin: 0; color: white; font-size: 1.1em;">📁 <?php echo $megjelenitettCim; ?> mappaszerkezete</h3>

    <div style="display: flex; align-items: center; gap: 15px;">
      <div style="display: flex; align-items: center; gap: 10px; background: #252525; padding: 5px 12px; border-radius: 6px; border: 1px solid #444;">
        <span style="font-size: 0.8em; color: #aaa;">PDF generálás (doc/docx):</span>
        <label class="sztp-switch">
          <input type="checkbox" id="pdf-all-toggle" onclick="sztpGlobalPdfToggle(this.checked)">
          <span class="sztp-slider"></span>
        </label>
      </div>

      <button onclick="sztpPdfMentese()"
        style="padding: 6px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.85em;">
        💾 PDF mentése
      </button>
    </div>
  </div>

  <div id="sztp-fajl-fa-kontener"
    style="background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333; overflow: auto; min-height: 300px;">
    <div id="sztp-fajl-fa" style="font-family: monospace;">⏳ Betöltés...</div>
  </div>
</div>
