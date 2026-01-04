<?php
header('Content-Type: application/json');
// Egységesítjük az útvonalat az upload scripttel (abszolút elérés)
$megnevezes = $_GET['megnevezes'] ?? '';
$root = $_SERVER['DOCUMENT_ROOT'] . "/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/";
$baseDir = $root . $megnevezes . "/";

if (!is_dir($baseDir)) { mkdir($baseDir, 0777, true); }

function getDirTree($dir, $base) {
    $tree = [];
    if (!is_dir($dir)) return $tree;
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
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

// A relPath továbbra is a /Sablonok/ mappához képest generálódik a helyes törléshez
echo json_encode(['success' => true, 'tree' => getDirTree($baseDir, $root)]);
?>
