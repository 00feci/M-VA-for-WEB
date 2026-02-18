<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();

// ✔ Fájl ellenőrzés
if (!isset($_FILES['fajl']) || $_FILES['fajl']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'uzenet' => 'Fájl feltöltési hiba.']);
    exit;
}

// ✔ Fájl beolvasása
$sorok = file($_FILES['fajl']['tmp_name'], FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if (!$sorok || count($sorok) < 2) {
    echo json_encode(['status' => 'error', 'uzenet' => 'A fájl nem tartalmaz elegendő sort.']);
    exit;
}

$fejlec = explode("\t", trim($sorok[0]));
$adatok = array_slice($sorok, 1);

// 🟢 Fejlécet is első adatsorként betesszük
array_unshift($adatok, implode("\t", $fejlec));

// Lekérdezzük az SQL oszlopokat
$stmt = $pdo->query("DESCRIBE all_tabla");
$letezoOszlopok = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'Field');

// Csak azokat használjuk, amik tényleg léteznek
$oszlopok = array_values(array_intersect($fejlec, $letezoOszlopok));
if (empty($oszlopok)) {
    echo json_encode(['status' => 'error', 'uzenet' => 'Nem található illeszkedő oszlop a táblában.']);
    exit;
}

// Felhasználó teljes nevének lekérdezése
$stmt = $pdo->prepare("SELECT `név` FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt->execute(['nev' => $_SESSION['felhasznalo'] ?? '']);
$felhasznaloNev = $stmt->fetchColumn() ?: 'ismeretlen';

// ✔ Tábla ürítése
$pdo->exec("DELETE FROM all_tabla");

// ✔ Beszúrás
$beszurt = 0;
foreach ($adatok as $sor) {
    $mezok = explode("\t", trim($sor));
    if (count($mezok) !== count($fejlec)) continue;

    // Ha vonalkod = 'vonalkod', akkor nev = felhasznalo
    $vonalkodIndex = array_search('vonalkod', $fejlec);
    $nevIndex = array_search('nev', $fejlec);
    if ($vonalkodIndex !== false && $nevIndex !== false && $mezok[$vonalkodIndex] === 'vonalkod') {
        $mezok[$nevIndex] = $felhasznaloNev;
    }

    $sql = "INSERT INTO all_tabla (" . implode(",", array_map(fn($o) => "`$o`", $oszlopok)) . ")
            VALUES (" . rtrim(str_repeat("?,", count($oszlopok)), ",") . ")";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_slice($mezok, 0, count($oszlopok)));
    $beszurt++;
}
echo json_encode([
    'status' => 'ok',
    'uzenet' => "$beszurt sor sikeresen betöltve."
]);