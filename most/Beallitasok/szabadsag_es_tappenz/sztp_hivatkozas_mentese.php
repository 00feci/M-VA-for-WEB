<?php
header('Content-Type: application/json');
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
try {
    $pdo = csatlakozasSzerver1();
    $data = json_decode(file_get_contents('php://input'), true);
    // Tábla létrehozása ha nem létezik
    $pdo->exec("CREATE TABLE IF NOT EXISTS sztp_hivatkozasok (id INT AUTO_INCREMENT PRIMARY KEY, nev VARCHAR(255), oszlop VARCHAR(255), logika VARCHAR(255))");
    $stmt = $pdo->prepare("INSERT INTO sztp_hivatkozasok (nev, oszlop, logika) VALUES (?, ?, ?)");
    $stmt->execute([$data['nev'], $data['oszlop'], $data['logika']]);
    echo json_encode(['success' => true, 'message' => 'Hivatkozás mentve!']);
} catch (Exception $e) { echo json_encode(['success' => false, 'message' => $e->getMessage()]); }
?>
