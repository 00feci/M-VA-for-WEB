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

   $params = [];
    if ($szerep === false) {
        // ✨ ÚJ felhasználó: Dinamikus INSERT biztonságos helyőrzőkkel
        $cols = []; $placeholders = [];
        foreach ($adatok as $col => $val) {
            $p = str_replace('-', '_', $col); // Kötőjel javítása helyőrzőben
            $cols[] = "`$col`";
            $placeholders[] = ":$p";
            $params[$p] = $val;
        }
        $sql = "INSERT INTO m_va_felhasznalok (" . implode(", ", $cols) . ", `szerep`) VALUES (" . implode(", ", $placeholders) . ", 1)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    } else {
        // 📝 MÓDOSÍTÁS: Dinamikus UPDATE biztonságos helyőrzőkkel
        $set = [];
        $params['origUser'] = $originalUser;
        foreach ($adatok as $col => $val) {
            $p = str_replace('-', '_', $col); // Kötőjel javítása helyőrzőben
            $set[] = "`$col` = :$p";
            $params[$p] = $val;
        }
        $sql = "UPDATE m_va_felhasznalok SET " . implode(", ", $set) . " WHERE `felhasználónév` = :origUser";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    echo json_encode(['status' => 'ok', 'uzenet' => 'Sikeres mentés!']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'uzenet' => $e->getMessage()]);
}
