<?php
header('Content-Type: application/json');
// Egységesítjük az útvonalat az upload scripttel (abszolút elérés)
$megnevezes = $_GET['megnevezes'] ?? '';
$root = $_SERVER['DOCUMENT_ROOT'] . "/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/";

// Ha van megnevezés, abban a mappában nézünk szét, egyébként a gyökérben
$baseDir = (!empty($megnevezes)) ? $root . $megnevezes . "/" : $root;

if (!is_dir($baseDir)) { mkdir($baseDir, 0777, true); }

// Lekérjük a védett mappaneveket, hogy elrejthessük őket a listából
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
$pdo_tree = csatlakozasSzerver1();
$vedettek = $pdo_tree->query("SELECT megnevezes FROM szabadsag_es_tappenz_beallitasok")->fetchAll(PDO::FETCH_COLUMN);

function getDirTree($dir, $base, $filter = []) {
    $tree = [];
    if (!is_dir($dir)) return $tree;
    $files = scandir($dir);
    foreach ($files as $file) {
        // Elrejtjük a pontokat ÉS a védett mappákat
        if ($file === '.' || $file === '..' || in_array($file, $filter)) continue;
        
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
echo json_encode(['success' => true, 'tree' => getDirTree($baseDir, $root, $vedettek)]);
?>
