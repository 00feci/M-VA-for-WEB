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

// sztp_torlese.php - Szabadság és Táppénz beállítás törlése

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

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? intval($data['id']) : null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Nincs megadva azonosító!']);
    exit;
}

try {
    // 1. Mappanév lekérése törlés előtt
    $stmt_f = $pdo->prepare("SELECT megnevezes FROM szabadsag_es_tappenz_beallitasok WHERE id = :id");
    $stmt_f->execute(['id' => $id]);
    $mappa_nev = $stmt_f->fetchColumn();

    // 2. Adatbázis rekord törlése
    $stmt = $pdo->prepare("DELETE FROM szabadsag_es_tappenz_beallitasok WHERE id = :id");
    $stmt->execute(['id' => $id]);

    // 3. Mappa és tartalmának fizikai törlése a szerverről
    if ($mappa_nev) {
        $cel = $_SERVER['DOCUMENT_ROOT'] . '/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/' . $mappa_nev;
        if (is_dir($cel)) {
            $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($cel, RecursiveDirectoryIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
            foreach ($files as $fileinfo) {
                $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
                $todo($fileinfo->getRealPath());
            }
            rmdir($cel);
        }
    }
    echo json_encode(['success' => true, 'message' => 'Sikeresen törölve a beállítás és a mappája is!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);

}
