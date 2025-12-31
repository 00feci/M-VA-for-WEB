<?php
// sztp_mentes.php - Szabadság és Táppénz beállítások mentése
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

header('Content-Type: application/json');

// Csak POST kérést fogadunk
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Érvénytelen kérés.']);
    exit;
}

// Adatok beolvasása a JavaScripttől
$id = !empty($_POST['id']) ? intval($_POST['id']) : null;
$megnevezes = $_POST['megnevezes'] ?? '';
$kod = $_POST['kod'] ?? '';
$szin = $_POST['szin'] ?? '#ffffff';
$extra_adatok = $_POST['extra_adatok'] ?? '[]'; // Itt tároljuk a fájlokat és a PDF kapcsolót

if (empty($megnevezes)) {
    echo json_encode(['success' => false, 'message' => 'A megnevezés kötelező!']);
    exit;
}

try {
    if ($id) {
        // Módosítás (Update)
        $stmt = $conn->prepare("UPDATE szabadsag_es_tappenz_beallitasok SET megnevezes = ?, kod = ?, szin = ?, extra_adatok = ? WHERE id = ?");
        $stmt->bind_param("ssssi", $megnevezes, $kod, $szin, $extra_adatok, $id);
    } else {
        // Új felvitel (Insert)
        $stmt = $conn->prepare("INSERT INTO szabadsag_es_tappenz_beallitasok (megnevezes, kod, szin, extra_adatok) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $megnevezes, $kod, $szin, $extra_adatok);
    }

    if ($stmt->execute()) {
        $uj_id = $id ?: $stmt->insert_id;
        echo json_encode(['success' => true, 'message' => 'Sikeres mentés!', 'id' => $uj_id]);
    } else {
        throw new Exception($stmt->error);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Hiba történt: ' . $e->getMessage()]);
}
