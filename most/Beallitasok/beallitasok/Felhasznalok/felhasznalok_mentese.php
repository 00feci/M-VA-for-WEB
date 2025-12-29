<?php

// Beallitasok/beallitasok/Felhasznalok/felhasznalok_mentese.php

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
$oszlop = $data['oszlop'] ?? '';
$ertek = $data['ertek'] ?? '';

// Szigorú ellenőrzés: Csak akkor tiltunk, ha a felhasználó létezik ÉS a szerepe pontosan 0 (Admin)
$stmt_check = $pdo->prepare("SELECT szerep FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt_check->execute(['nev' => $target_user]);
$szerep = $stmt_check->fetchColumn();

if ($szerep !== false && $szerep == 0) {
    echo json_encode(['status' => 'error', 'uzenet' => 'Admin nem módosítható!']);
    exit;
}

try {
    if ($szerep === false) {
        // ✨ 1. Lépés: Létrehozzuk az üres rekordot az alapértékekkel (NOT NULL hibák ellen)
        $sqlInsert = "INSERT INTO m_va_felhasznalok 
                (`felhasználónév`, `név`, `email`, `jelszó`, `telefon`, `mac_cím`, `külső_ip_cím`, `cég`, `szerep`) 
                VALUES (:nev, '', '', '', '', '', '', '', 1)";
        $stmtInsert = $pdo->prepare($sqlInsert);
        $stmtInsert->execute(['nev' => $target_user]);
    }

    // 📝 2. Lépés: Most már biztosan létezik a rekord, jöhet a konkrét mező mentése (UPDATE)
    // Ezzel elkerüljük a "specified twice" SQL hibát.
    $sqlUpdate = "UPDATE m_va_felhasznalok SET `$oszlop` = :ertek WHERE `felhasználónév` = :nev";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute(['ertek' => $ertek, 'nev' => $target_user]);

    echo json_encode(['status' => 'ok', 'uzenet' => 'Sikeres művelet: ' . $oszlop]);

} catch (Exception $e) {

    echo json_encode(['status' => 'error', 'uzenet' => $e->getMessage()]);
}


