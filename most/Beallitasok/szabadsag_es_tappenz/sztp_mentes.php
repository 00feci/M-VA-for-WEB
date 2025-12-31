<?php
// sztp_mentes.php - Szabadság és Táppénz beállítások mentése biztonsági ellenőrzéssel

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

// PDO kapcsolat használata a felhasznalok_mentese mintájára
$pdo = csatlakozasSzerver1();
header('Content-Type: application/json');

// 🔐 JOGOSULTSÁG ELLENŐRZÉSE
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt_jog = $pdo->prepare("SELECT `Beállítások` FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt_jog->execute(['nev' => $felhasznalo]);

if ($stmt_jog->fetchColumn() !== 'OK') {
    echo json_encode(['success' => false, 'message' => 'Nincs jogosultsága a beállítások módosításához!']);
    exit;
}

// Adatok fogadása (most már JSON formátumban, mert a Fetch API-val így küldjük)
$data = json_decode(file_get_contents('php://input'), true);

$id = !empty($data['id']) ? intval($data['id']) : null;
$megnevezes = $data['megnevezes'] ?? '';
$kod = $data['kod'] ?? '';
$szin = $data['szin'] ?? '#ffffff';
$extra_adatok = isset($data['extra_adatok']) ? json_encode($data['extra_adatok']) : '[]';

if (empty($megnevezes)) {
    echo json_encode(['success' => false, 'message' => 'A megnevezés kötelező!']);
    exit;
}

try {
    if ($id) {
        // 📝 MÓDOSÍTÁS
        $sql = "UPDATE szabadsag_es_tappenz_beallitasok SET megnevezes = :m, kod = :k, szin = :s, extra_adatok = :e WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['m' => $megnevezes, 'k' => $kod, 's' => $szin, 'e' => $extra_adatok, 'id' => $id]);
    } else {
        // ✨ ÚJ FELVITEL
        $sql = "INSERT INTO szabadsag_es_tappenz_beallitasok (megnevezes, kod, szin, extra_adatok) VALUES (:m, :k, :s, :e)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['m' => $megnevezes, 'k' => $kod, 's' => $szin, 'e' => $extra_adatok]);
    }

    echo json_encode(['success' => true, 'message' => 'Sikeres mentés!', 'id' => $id ?: $pdo->lastInsertId()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Adatbázis hiba: ' . $e->getMessage()]);
}
