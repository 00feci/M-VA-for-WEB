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
$originalUser = $data['originalUser'] ?? null;
$adatok = $data['adatok'] ?? [];

if (empty($adatok)) { echo json_encode(['status' => 'error', 'uzenet' => 'Nincs adat!']); exit; }

try {
    // 🔍 Ellenőrizzük, létezik-e az eredeti felhasználó
    $szerep = false;
    if ($originalUser) {
        $st = $pdo->prepare("SELECT szerep FROM m_va_felhasznalok WHERE `felhasználónév` = :n");
        $st->execute(['n' => $originalUser]);
        $szerep = $st->fetchColumn();
    }

    if ($szerep === '0') { echo json_encode(['status' => 'error', 'uzenet' => 'Admin nem módosítható!']); exit; }

    if ($szerep === false) {
        // ✨ ÚJ felhasználó: Dinamikus INSERT
        $cols = array_keys($adatok);
        $fields = "`" . implode("`, `", $cols) . "`, `szerep`";
        $placeholders = ":" . implode(", :", $cols) . ", 1";
        $sql = "INSERT INTO m_va_felhasznalok ($fields) VALUES ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($adatok);
    } else {
        // 📝 MÓDOSÍTÁS: Dinamikus UPDATE
        $set = [];
        foreach ($adatok as $col => $val) { $set[] = "`$col` = :$col"; }
        $sql = "UPDATE m_va_felhasznalok SET " . implode(", ", $set) . " WHERE `felhasználónév` = :originalUser";
        $adatok['originalUser'] = $originalUser;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($adatok);
    }

    echo json_encode(['status' => 'ok', 'uzenet' => 'Sikeres mentés!']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'uzenet' => $e->getMessage()]);
}


