<?php
header('Content-Type: application/json');
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

try {
    $pdo = csatlakozasSzerver1();
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['lista'])) throw new Exception("Hiányzó adatok.");

    $stmt = $pdo->prepare("UPDATE szabadsag_es_tappenz_beallitasok SET extra_adatok = ? WHERE megnevezes = 'RENDSZER_HIVATKOZASOK'");
    $stmt->execute([json_encode($data['lista'], JSON_UNESCAPED_UNICODE)]);

    echo json_encode(['success' => true, 'message' => 'Sorrend frissítve!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}