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
// 📂 Megnevezés alapú mappa
$megnevezes = $_POST['megnevezes'] ?? 'Vegyes';
$cel_mappa = $_SERVER['DOCUMENT_ROOT'] . '/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/' . $megnevezes . '/';

if (!file_exists($cel_mappa)) {
    mkdir($cel_mappa, 0777, true);
}

$fajl = $_FILES['sablon'];
$relativ_utvonal = $_POST['relativ_utvonal'] ?? basename($fajl['name']);
$cel_utvonal = $cel_mappa . $relativ_utvonal;
// Szükséges alkönyvtárak létrehozása
$alkonyvtar = dirname($cel_utvonal);
if (!file_exists($alkonyvtar)) {
    mkdir($alkonyvtar, 0777, true);
}

if (move_uploaded_file($fajl['tmp_name'], $cel_utvonal)) {
    echo json_encode([
        'success' => true, 
        'message' => 'Sikeres feltöltés!', 
        'fajl_neve' => $relativ_utvonal,
        'utvonal' => '/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/' . $relativ_utvonal
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Hiba a fájl mentésekor!']);
}
