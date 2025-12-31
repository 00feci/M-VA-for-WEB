<?php
// sztp_feltoltes.php - Word sablonok feltöltése a helyes mappába

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

if (!isset($_FILES['sablon'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs fájl kiválasztva!']);
    exit;
}

// 📂 A kért új elérési út
$cel_mappa = $_SERVER['DOCUMENT_ROOT'] . '/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/';

// Mappa létrehozása, ha még nem létezne
if (!file_exists($cel_mappa)) {
    mkdir($cel_mappa, 0777, true);
}

$fajl = $_FILES['sablon'];
$fajl_nev = basename($fajl['name']);
$cel_utvonal = $cel_mappa . $fajl_nev;

if (move_uploaded_file($fajl['tmp_name'], $cel_utvonal)) {
    echo json_encode([
        'success' => true, 
        'message' => 'Sikeres feltöltés!', 
        'fajl_neve' => $fajl_nev,
        'utvonal' => '/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/' . $fajl_nev
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Hiba a fájl mentésekor!']);
}
