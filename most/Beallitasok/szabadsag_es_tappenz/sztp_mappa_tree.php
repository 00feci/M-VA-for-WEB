<?php
header('Content-Type: application/json');
// Egységesítjük az útvonalat az upload scripttel (abszolút elérés)
$baseDir = $_SERVER['DOCUMENT_ROOT'] . "/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/";

if (!is_dir($baseDir)) { mkdir($baseDir, 0777, true); }

// Adatbázisban lévő megnevezések lekérése, hogy elrejthessük a mappáikat
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
$pdo_tree = csatlakozasSzerver1();
$vedett_mappak = $pdo_tree->query("SELECT megnevezes FROM szabadsag_es_tappenz_beallitasok")->fetchAll(PDO::FETCH_COLUMN);

function getDirTree($dir, $base, $vedettek = []) {
    $tree = [];
    if (!is_dir($dir)) return $tree;
    $files = scandir($dir);
    foreach ($files as $file) {
        // Kiszűrjük a pontokat és a megnevezésként már létező mappákat
        if ($file === '.' || $file === '..' || in_array($file, $vedettek)) continue;
        
        $path = $dir . $file;
        if (is_dir($path)) {
            $path .= "/";
            $relPath = str_replace($base, '', $path);
            $item = [
                'name' => $file, 
                'path' => $relPath,
                'type' => 'folder',
                'children' => getDirTree($path, $base)
            ];
        } else {
            $relPath = str_replace($base, '', $path);
            $item = [
                'name' => $file, 
                'path' => $relPath,
                'type' => 'file'
            ];
        }
        $tree[] = $item;
    }
    return $tree;
}

echo json_encode(['success' => true, 'tree' => getDirTree($baseDir, $baseDir, $vedett_mappak)]);
?>
