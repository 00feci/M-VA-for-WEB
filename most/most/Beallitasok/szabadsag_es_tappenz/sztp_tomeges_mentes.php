<?php

// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
// 1. Biztosítjuk, hogy a Session fusson, mielőtt kiolvassuk a verziót
if (session_status() === PHP_SESSION_NONE) { session_start(); }

// 2. Összerakjuk a dinamikus, "telepítési" útvonalat
$verzio = $_SESSION['verzio'] ?? ''; // Ha valamiért üres lenne, ne dőljön össze
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/eles_verziok/' . $verzio . '/jogosultsag.php';
// 3. Ellenőrzés
ellenorizJogosultsag('Beállítások'); // Csak ezt a szót kell átírni!

// Beallitasok/szabadsag_es_tappenz/sztp_tomeges_mentes.php
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();
header('Content-Type: application/json');

// 🔐 Jogosultság ellenőrzése
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt_jog = $pdo->prepare("SELECT `Beállítások` FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt_jog->execute(['nev' => $felhasznalo]);
if ($stmt_jog->fetchColumn() !== 'OK') {
    echo json_encode(['success' => false, 'message' => 'Nincs jogosultsága!']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$nevek = $data['nevek'] ?? [];

if (empty($nevek)) { echo json_encode(['success' => false, 'message' => 'Nincs menthető adat!']); exit; }

try {
    // A kód alapértelmezetten üres lesz, nem generálunk rövidített nevet
    $stmt = $pdo->prepare("INSERT IGNORE INTO szabadsag_es_tappenz_beallitasok (megnevezes, kod, hex_szin) VALUES (:nev, '', '#ffffff')");
    $hozzaadva = 0;
    foreach ($nevek as $nev) {
        $stmt->execute(['nev' => $nev]);
        if ($stmt->rowCount() > 0) $hozzaadva++;
    }
    echo json_encode(['success' => true, 'message' => "Sikeresen rögzítve: $hozzaadva új elem."]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
