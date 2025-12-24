<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
date_default_timezone_set('Europe/Budapest');

// XLSXWriter betöltése
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/php_xlsx_writer/xlsxwriter.class.php'; // XLSXWriter

$ev = isset($_GET['ev']) ? (int)$_GET['ev'] : date('Y');
$honap = isset($_GET['honap']) ? (int)$_GET['honap'] : date('n');

// Valódi napok száma az adott hónapban
$napokValos = cal_days_in_month(CAL_GREGORIAN, $honap, $ev);
// Fix tábla: mindig 31 napos
$maxNapok   = 31;

$napNevek = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];

$writer = new XLSXWriter();
$writer->setAuthor('Munkaidő rendszer');

// Fejléc
$fejlec = ['OP szám' => 'string', 'Név' => 'string'];

for ($nap = 1; $nap <= $maxNapok; $nap++) {
    if ($nap <= $napokValos) {
        // Valódi nap: dátum + napnév
        $datum     = sprintf('%04d-%02d-%02d', $ev, $honap, $nap);
        $ts        = strtotime($datum);
        $napNev    = $napNevek[date('w', $ts)];
        $cimke     = date('Y.m.d', $ts) . " $napNev";
        $fejlec[$cimke] = 'string';
    } else {
        // Nem létező nap: vizuálisan üres fejléc
        // különböző számú szóközzel, hogy a kulcsok egyediek legyenek
        $spaces = str_repeat(' ', $nap - $napokValos); // 1, 2, 3 szóköz
        $fejlec[$spaces] = 'string';
    }
}


$fejlec['Összes szabi']         = 'string';
$fejlec['Összes táppénz']       = 'string';
$fejlec['Fizetetlen szabadság'] = 'string';

$writer->writeSheetHeader('Munkaidő', $fejlec);


// Adatok a POST-ból
$data = json_decode(file_get_contents('php://input'), true);
if (!empty($data['rows'])) {
    foreach ($data['rows'] as $row) {
        $writer->writeSheetRow('Munkaidő', $row);
    }
}

// Fájlnév és letöltés
$filename = sprintf('munkaido_%04d.%02d.xlsx', $ev, $honap);
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="'.$filename.'"');
header('Content-Transfer-Encoding: binary');
$writer->writeToStdOut();
exit;
