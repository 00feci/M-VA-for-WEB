<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);
$relPath = $data['path'] ?? '';
$baseDir = $_SERVER['DOCUMENT_ROOT'] . "/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/";
$target = realpath($baseDir . $relPath);

// Biztonsági ellenőrzés: csak a Sablonok mappán belül engedünk törölni
if (!$target || strpos($target, $baseDir) !== 0) {
    echo json_encode(['success' => false, 'message' => 'Érvénytelen vagy tiltott útvonal!']);
    exit;
}

function recursiveDelete($dir) {
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                recursiveDelete($dir . "/" . $object);
            }
        }
        return rmdir($dir);
    } else {
        return unlink($dir);
    }
}

if (recursiveDelete($target)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'A törlés nem sikerült!']);
}
?>
