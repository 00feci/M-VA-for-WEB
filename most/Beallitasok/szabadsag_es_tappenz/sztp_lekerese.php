<?php
// sztp_lekerese.php - Szabadság és Táppénz adatok lekérése

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

$id = isset($_GET['id']) ? intval($_GET['id']) : null;

try {
    if ($id) {
        // Egy konkrét rekord betöltése
        $stmt = $pdo->prepare("SELECT * FROM szabadsag_es_tappenz_beallitasok WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $adat = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'adat' => $adat]);
    } else {
// A teljes lista a legördülőhöz a rögzítés sorrendjében
        $stmt = $pdo->query("SELECT id, megnevezes FROM szabadsag_es_tappenz_beallitasok ORDER BY id ASC");        $lista = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'lista' => $lista]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
