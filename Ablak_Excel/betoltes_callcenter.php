<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    if (empty($_FILES['betoltes_file']) || $_FILES['betoltes_file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode([
            'sikeres' => false,
            'uzenet'  => 'Nincs kiválasztott fájl vagy feltöltési hiba történt.'
        ]);
        exit;
    }

    $tmpFile = $_FILES['betoltes_file']['tmp_name'];
    $handle  = fopen($tmpFile, 'r');
    if ($handle === false) {
        echo json_encode([
            'sikeres' => false,
            'uzenet'  => 'A fájl nem olvasható.'
        ]);
        exit;
    }

    $pdo = csatlakozasSzerver1();
    $pdo->beginTransaction();

    // Teljes tábla törlése BETÖLTÉS előtt
    $pdo->exec("DELETE FROM call_center_hasznalat");

    $beszurtSorok = 0;
    $delimiter = "\t"; // TAB az elválasztó (Excelből mentett txt)

    // ---------- Fejléc beolvasása ----------
    $indexOp   = null; // "Operátor név"
    $indexDat  = null; // "Dátum"
    $indexHasz = null; // "Hasznos munkavégzés"

    $headerRead  = false;
    $headerParts = null;

    while (($line = fgets($handle)) !== false) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }

        $parts = explode($delimiter, $line);
        $headerParts = $parts;

        foreach ($parts as $idx => $name) {
            $name  = trim($name, " \t\n\r\0\x0B\""); // szóköz + idézőjel levágása
            $lname = mb_strtolower($name, 'UTF-8');

            if ($lname === 'operátor név') {
                $indexOp = $idx;
            } elseif ($lname === 'dátum') {
                $indexDat = $idx;
            } elseif ($lname === 'hasznos munkavégzés') {
                $indexHasz = $idx;
            }
        }

        $headerRead = true;
        break; // csak az első nem üres sort használjuk fejlécnek
    }

    if (!$headerRead) {
        fclose($handle);
        $pdo->rollBack();
        echo json_encode([
            'sikeres' => false,
            'uzenet'  => 'Nincs olvasható fejléc sor a fájlban.'
        ]);
        exit;
    }

    // Ha név szerint nem sikerült, pozíció alapján feltételezzük a sorrendet:
    if ($indexOp === null || $indexDat === null) {
        if (is_array($headerParts) && count($headerParts) >= 2) {
            $indexOp  = 0; // 1. oszlop: Operátor név
            $indexDat = 1; // 2. oszlop: Dátum
            if (count($headerParts) >= 3) {
                $indexHasz = 2; // 3. oszlop: Hasznos munkavégzés (ha van)
            }
        } else {
            fclose($handle);
            $pdo->rollBack();
            echo json_encode([
                'sikeres' => false,
                'uzenet'  => 'Hiányos vagy érvénytelen fejléc. Szükséges oszlopok: Operátor név, Dátum, Hasznos munkavégzés.'
            ]);
            exit;
        }
    }

    // ---------- INSERT előkészítés ----------
    $stmt = $pdo->prepare("
        INSERT INTO call_center_hasznalat (`Operátor név`, `Dátum`, `Hasznos munkavégzés`, `betöltés_dátum`)
        VALUES (:opnev, :datum, :hasznos, NOW())
    ");

    // ---------- Adatsorok feldolgozása ----------
    while (($line = fgets($handle)) !== false) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }

        $parts = explode($delimiter, $line);

        if (!isset($parts[$indexOp]) || !isset($parts[$indexDat])) {
            continue;
        }

        $opNev  = trim($parts[$indexOp] ?? '');
        $datum  = trim($parts[$indexDat] ?? '');
        $hasz   = ($indexHasz !== null && isset($parts[$indexHasz]))
            ? trim($parts[$indexHasz])
            : '';

        if ($opNev === '' || $datum === '') {
            continue;
        }

        $stmt->execute([
            ':opnev'   => $opNev,
            ':datum'   => $datum,
            ':hasznos' => $hasz
        ]);
        $beszurtSorok++;
    }

    fclose($handle);
    $pdo->commit();

    echo json_encode([
        'sikeres' => true,
        'uzenet'  => "Betöltés kész, {$beszurtSorok} sor beszúrva."
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        'sikeres' => false,
        'uzenet'  => 'Hiba történt: ' . $e->getMessage()
    ]);
}
