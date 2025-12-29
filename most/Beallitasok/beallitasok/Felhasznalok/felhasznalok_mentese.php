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
        // 🔍 1. Oszlopok lekérése az adatbázisból
        $q = $pdo->query("DESCRIBE m_va_felhasznalok");
        $oszlopLista = $q->fetchAll(PDO::FETCH_COLUMN);
        
        // 📋 Szöveges mezők listája (JS-sel szinkronban)
        $szovegesek = ['név', 'email', 'felhasználónév', 'jelszó', 'telefon', 'mac_cím', 'külső_ip_cím', 'cég'];
        
        $cols = []; $vals = [];
        foreach ($oszlopLista as $o) {
            if ($o === 'id' || $o === 'dátum') continue; // Automatikus mezők kihagyása
            
            $cols[] = "`$o`";
            if ($o === 'felhasználónév') {
                $vals[] = ":nev";
            } elseif ($o === 'szerep') {
                $vals[] = "1";
            } elseif (in_array($o, $szovegesek)) {
                $vals[] = "'Új felhasználó'"; // Szöveges mezők alapértéke
            } else {
                $vals[] = "''"; // Minden más (Toggle/Checkbox, pl. m-va, Beállítások) üres marad
            }
        }
        
        $stmtInsert = $pdo->prepare("INSERT INTO m_va_felhasznalok (" . implode(", ", $cols) . ") VALUES (" . implode(", ", $vals) . ")");
        $stmtInsert->execute(['nev' => $target_user]);
    }

    // 📝 2. A konkrét mező tényleges mentése
    $stmtUpdate = $pdo->prepare("UPDATE m_va_felhasznalok SET `$oszlop` = :ertek WHERE `felhasználónév` = :nev");
    $stmtUpdate->execute(['ertek' => $ertek, 'nev' => $target_user]);

    echo json_encode(['status' => 'ok', 'uzenet' => 'Sikeres művelet: ' . $oszlop]);

} catch (Exception $e) {

    echo json_encode(['status' => 'error', 'uzenet' => $e->getMessage()]);
}



