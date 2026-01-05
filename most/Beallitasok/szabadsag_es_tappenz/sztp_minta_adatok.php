<?php
header('Content-Type: application/json');
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

try {
    try {
    $pdo = csatlakozasSzerver2(); // 👈 csatlakozasSzerver2 használata
    // Szűrés a 'Szabadság és Táppénz' státuszra a legfrissebb dátum szerint
    $stmt = $pdo->query("SELECT * FROM m_va_adatbazis WHERE státusz = 'Szabadság és Táppénz' ORDER BY státusz_dátum DESC LIMIT 1");
    $adat = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($adat) {
        echo json_encode(['success' => true, 'adat' => $adat]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nem található rekord az adatbázisban.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
