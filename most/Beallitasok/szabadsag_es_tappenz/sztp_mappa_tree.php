<?php
header('Content-Type: application/json');
$baseDir = "../../../Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/";

function getDirTree($dir, $base) {
    $tree = [];
    if (!is_dir($dir)) return $tree;
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $path = $dir . DIRECTORY_SEPARATOR . $file;
        $relPath = str_replace($base, '', $path);
        $item = ['name' => $file, 'path' => $relPath];
        if (is_dir($path)) {
            $item['type'] = 'folder';
            $item['children'] = getDirTree($path, $base);
        } else {
            $item['type'] = 'file';
        }
        $tree[] = $item;
    }
    return $tree;
}

echo json_encode(['success' => true, 'tree' => getDirTree($baseDir, $baseDir)]);
?>
