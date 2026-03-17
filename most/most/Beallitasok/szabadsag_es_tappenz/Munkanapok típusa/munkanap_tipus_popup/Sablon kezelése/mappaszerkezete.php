<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../../../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

// Fa struktúra lekérése (sztp_mappa_tree.php logikája átemelve)
if (isset($_GET['get_tree'])) {
    header('Content-Type: application/json');
    date_default_timezone_set('Europe/Budapest'); // 🕒 Időzóna beállítása a magyar időhöz
    
    try {
        $megnevezes = $_GET['megnevezes'] ?? '';
        $root = $_SERVER['DOCUMENT_ROOT'] . "/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/";
        $baseDir = (!empty($megnevezes)) ? $root . $megnevezes . "/" : $root;

        if (!is_dir($baseDir)) { @mkdir($baseDir, 0777, true); }

        // Ellenőrizzük, hogy létezik-e a konfigurációs fájl
        $configPath = $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
        $vedettek = [];
        if (file_exists($configPath)) {
            require_once $configPath;
            $pdo_tree = csatlakozasSzerver1();
            if ($pdo_tree) {
                $sql = "SELECT megnevezes FROM szabadsag_es_tappenz_beallitasok";
                if (!empty($megnevezes)) {
                    $sql .= " WHERE megnevezes != " . $pdo_tree->quote($megnevezes);
                }
                $vedettek = $pdo_tree->query($sql)->fetchAll(PDO::FETCH_COLUMN);
            }
        }

        function getDirTree($dir, $base, $filter = []) {
            $tree = [];
            if (!is_dir($dir)) return $tree;
            $files = @scandir($dir);
            if (!$files) return $tree;
            
            foreach ($files as $file) {
                if ($file === '.' || $file === '..' || in_array($file, $filter)) continue;
                
                $path = $dir . $file;
                $mtime = '-';
                if (file_exists($path)) {
                    $dt = new DateTime();
                    $dt->setTimestamp(filemtime($path));
                    $dt->setTimezone(new DateTimeZone('Europe/Budapest'));
                    $mtime = $dt->format('Y.m.d H:i:s');
                }
                
                if (is_dir($path)) {
                    $path .= "/";
                    $relPath = str_replace($base, '', $path);
                    $tree[] = [
                        'name' => $file, 
                        'path' => $relPath,
                        'type' => 'folder',
                        'date' => $mtime,
                        'children' => getDirTree($path, $base, $filter)
                    ];
                } else {
                    $relPath = str_replace($base, '', $path);
                    $tree[] = [
                        'name' => $file, 
                        'path' => $relPath,
                        'type' => 'file',
                        'date' => $mtime
                    ];
                }
            }
            return $tree;
        }

        echo json_encode(['success' => true, 'tree' => getDirTree($baseDir, $root, $vedettek)]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit; // KILÉPÉS: Ne fűzzük hozzá a HTML felületet a JSON válaszhoz!
}

// Eredeti mappaszerkezete.php megjelenítési logika
$megjelenitettCim = isset($_GET['cim']) ? htmlspecialchars($_GET['cim']) : 'Sablonok';
$kategoriaId = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';
?>
<input type="hidden" id="sztp_id" value="<?php echo $kategoriaId; ?>">

<div style="padding: 10px; background: #121212; min-height: 500px; border-radius: 8px;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <h3 style="margin: 0; color: white; font-size: 1.1em;">📁 <?php echo $megjelenitettCim; ?> mappaszerkezete</h3>
<?php
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
