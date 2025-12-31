<?php
// sztp_torlese.php - Szabadság és Táppénz beállítás törlése

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

$pdo = csatlakozasSzerver1();
header('Content-Type: application/json');

// 🔐 JOGOSULTSÁG ELLENŐRZÉSE
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt_jog = $pdo->prepare("SELECT `Beállítások` FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt_jog->execute(['nev' => $felhasznalo]);

if ($stmt_jog->fetchColumn() !== 'OK') {
    echo json_encode(['success' => false, 'message' => 'Nincs jogosultsága!']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? intval($data['id']) : null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Nincs megadva azonosító!']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM szabadsag_es_tappenz_beallitasok WHERE id = :id");
    $stmt->execute(['id' => $id]);
    echo json_encode(['success' => true, 'message' => 'Sikeresen törölve!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
