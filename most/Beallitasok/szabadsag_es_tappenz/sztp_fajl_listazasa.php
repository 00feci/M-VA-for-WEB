<?php
// sztp_fajl_listazasa.php - A feltöltött sablonok tényleges listázása a szerverről
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();
header('Content-Type: application/json');

$id = $_GET['id'] ?? null;
$get_megnevezes = $_GET['megnevezes'] ?? null;

// ✨ Előbb megpróbáljuk az adatbázisból kikeresni a pontos neveket
if ($id) {
    $stmt = $pdo->prepare("SELECT megnevezes, sablon_neve FROM szabadsag_es_tappenz_beallitasok WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $adat = $stmt->fetch(PDO::FETCH_ASSOC);
    $mentett_nev = (!empty($adat['sablon_neve'])) ? $adat['sablon_neve'] : ($adat['megnevezes'] ?? $get_megnevezes);
} else {
    $mentett_nev = $get_megnevezes;
}

if (!$mentett_nev) { echo json_encode(['success' => false, 'message' => 'Nincs mappa meghatározva']); exit; }

$fajlok = [];
if ($mentett_nev) {
    $mappa = $_SERVER['DOCUMENT_ROOT'] . '/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/';
    
    // Ha a mentett név egy mappa (tartalmaz per jelet vagy mappaként kezeltük)
    $cel = $mappa . $mentett_nev;
    
    if (is_dir($cel)) {
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($cel));
        foreach ($it as $file) {
            if ($file->isFile()) {
                $fajlok[] = str_replace($mappa, '', $file->getPathname());
            }
        }
    } elseif (is_file($cel)) {
        $fajlok[] = $mentett_nev;
    }
}
echo json_encode(['success' => true, 'fajlok' => $fajlok]);


