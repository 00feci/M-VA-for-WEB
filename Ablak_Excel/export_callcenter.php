<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

$pdo = csatlakozasSzerver1();
header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
header("Content-Disposition: attachment; filename=call_center_hasznalat.xlsx");

require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/php_xlsx_writer/xlsxwriter.class.php';   // ha már használod

$writer = new XLSXWriter();
// Első sor lekérése a fejléc meghatározásához
$query = $pdo->query("SELECT * FROM call_center_hasznalat ORDER BY betöltés_dátum DESC");
$rows = $query->fetchAll(PDO::FETCH_ASSOC);

if (!empty($rows)) {
    // Fejléc az SQL oszlopnevekből
    $header = array_keys($rows[0]);

    // Fejléc kiírás (minden oszlop string típus)
    $types = [];
    foreach ($header as $col) {
        $types[$col] = 'string';
    }
    $writer->writeSheetHeader('Sheet1', $types);

    // Sorok kiírása
    foreach ($rows as $r) {
        $writer->writeSheetRow('Sheet1', array_values($r));
    }
}


$writer->writeToStdOut();
exit;
