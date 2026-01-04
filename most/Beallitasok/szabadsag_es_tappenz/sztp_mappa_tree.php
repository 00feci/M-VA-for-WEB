<?php
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
            $vedettek = $pdo_tree->query("SELECT megnevezes FROM szabadsag_es_tappenz_beallitasok")->fetchAll(PDO::FETCH_COLUMN);
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
            $mtime = file_exists($path) ? date("Y.m.d H:i:s", filemtime($path)) : '-';
            
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
?>
