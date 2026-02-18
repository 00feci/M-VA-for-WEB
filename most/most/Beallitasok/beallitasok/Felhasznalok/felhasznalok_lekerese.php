<?php
// Beallitasok/beallitasok/Felhasznalok/felhasznalok_lekerese.php
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] .'/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();

// 🔐 Szigorú ellenőrzés: Csak az férhet hozzá, akinek van 'Beállítások' joga
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt_jog = $pdo->prepare("SELECT `Beállítások` FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt_jog->execute(['nev' => $felhasznalo]);
$jog = $stmt_jog->fetchColumn();

if ($jog !== 'OK') {
    echo json_encode(['error' => 'Nincs jogosultsága!']);
    exit;
}

// 🕵️ Lekérés: Mindenki, aki nem Admin (szerep > 0)
try {
    $stmt = $pdo->query("SELECT * FROM m_va_felhasznalok WHERE szerep > 0 ORDER BY név ASC");
    $felhasznalok = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Oszlopnevek lekérése a dinamikus generáláshoz
    $oszlopok = [];
    if (!empty($felhasznalok)) {
        $oszlopok = array_keys($felhasznalok[0]);
    }

    echo json_encode(['status' => 'ok', 'adatok' => $felhasznalok, 'oszlopok' => $oszlopok]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}