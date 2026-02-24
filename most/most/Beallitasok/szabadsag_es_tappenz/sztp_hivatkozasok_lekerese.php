<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------


header('Content-Type: application/json');
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
try {
    $pdo = csatlakozasSzerver1();
    $stmt = $pdo->prepare("SELECT extra_adatok FROM szabadsag_es_tappenz_beallitasok WHERE megnevezes = 'RENDSZER_HIVATKOZASOK'");
    $stmt->execute();
    $sor = $stmt->fetch(PDO::FETCH_ASSOC);
    $lista = $sor ? json_decode($sor['extra_adatok'], true) : [];
    
    echo json_encode(['success' => true, 'lista' => $lista]);
} catch (Exception $e) { 
    echo json_encode(['success' => false, 'lista' => [], 'message' => $e->getMessage()]); 
}
?>
