<?php
// Ez a fájl felel a Szabadság és Táppénz beállítások táblájáért
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();

$sql = "CREATE TABLE IF NOT EXISTS `szabadsag_es_tappenz_beallitasok` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `megnevezes` VARCHAR(100) NOT NULL UNIQUE,   -- A névnek egyedinek kell lennie
    `kod` VARCHAR(10) DEFAULT '',                -- A kód már nem egyedi, lehet több "SZ" is
    `hex_szin` VARCHAR(7) DEFAULT '#ffffff',    -- Háttérszín (HEX)
    `generalljon_e` TINYINT(1) DEFAULT 0,       -- 0: Nem, 1: Igen (Word generálás)
    `sablon_neve` VARCHAR(255) DEFAULT NULL,    -- A Word sablon fájlneve
    `fajl_struktura` VARCHAR(255) DEFAULT NULL, -- Menti útvonal
    `egy_vagy_tobb_nap` VARCHAR(50) DEFAULT NULL, -- Logika választó
    `export_allapot` VARCHAR(50) DEFAULT NULL,  -- Mit tegyen exportkor
    `extra_adatok` JSON DEFAULT NULL,           -- ✨ Itt a 1200 oszlop helye (rugalmasan)
    `frissitve` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;";

try {
    $pdo->exec($sql);
    // echo "Sikeres ellenőrzés/létrehozás.";
} catch (PDOException $e) {
    die("Hiba a tábla létrehozásakor: " . $e->getMessage());
}

?>
