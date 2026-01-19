<?php
// sztp_fajl_listazasa.php - A feltöltött sablonok tényleges listázása a szerverről
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();
header('Content-Type: application/json');

$megnevezes = $_GET['megnevezes'] ?? null;
$id = $_GET['id'] ?? null;

// ✨ Ha van megnevezés, azt használjuk mappaként, ha nincs, akkor az ID alapján keressük a sablon_neve-t
$mentett_nev = $megnevezes; 

if (!$mentett_nev && $id) {
    $stmt = $pdo->prepare("SELECT sablon_neve FROM szabadsag_es_tappenz_beallitasok WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $mentett_nev = $stmt->fetchColumn();
}

if (!$mentett_nev) { echo json_encode(['success' => false, 'message' => 'Nincs mappa megadva']); exit; }

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
