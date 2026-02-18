<?php
// Beallitasok/beallitasok/Felhasznalok/felhasznalok_torlese.php
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] .'/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();

header('Content-Type: application/json');

// 🔐 Jogosultság ellenőrzése
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt_jog = $pdo->prepare("SELECT `Beállítások` FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt_jog->execute(['nev' => $felhasznalo]);
if ($stmt_jog->fetchColumn() !== 'OK') {
    echo json_encode(['status' => 'error', 'uzenet' => 'Nincs jogosultsága!']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$target_user = $data['felhasznalo'] ?? '';

if (empty($target_user)) {
    echo json_encode(['status' => 'error', 'uzenet' => 'Nincs megadva felhasználó!']);
    exit;
}

// Biztonsági szűrő: Az Admin (szerep=0) soha nem törölhető
$stmt_check = $pdo->prepare("SELECT szerep FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt_check->execute(['nev' => $target_user]);
if ($stmt_check->fetchColumn() == 0) {
    echo json_encode(['status' => 'error', 'uzenet' => 'Admin nem törölhető!']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
    $stmt->execute(['nev' => $target_user]);
    echo json_encode(['status' => 'ok', 'uzenet' => 'Felhasználó törölve!']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'uzenet' => $e->getMessage()]);
}