<?php
header('Content-Type: application/json');
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
try {
    $pdo = csatlakozasSzerver1();
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM sztp_hivatkozasok WHERE id = ?");
    $stmt->execute([$data['id']]);
    echo json_encode(['success' => true, 'message' => 'Hivatkozás törölve!']);
} catch (Exception $e) { echo json_encode(['success' => false, 'message' => $e->getMessage()]); }
?>
