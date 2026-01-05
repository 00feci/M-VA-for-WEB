<?php
header('Content-Type: application/json');
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
try {
    $pdo = csatlakozasSzerver1();
    $stmt = $pdo->query("SELECT * FROM sztp_hivatkozasok ORDER BY id DESC");
    echo json_encode(['success' => true, 'lista' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) { echo json_encode(['success' => false, 'lista' => []]); }
?>
