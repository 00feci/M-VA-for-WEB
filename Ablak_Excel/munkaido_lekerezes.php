<?php
// munkaido_lekerezes.php
// EGYSZERŰSÍTETT VERZIÓ - Csak az m_va_adatbazis-t olvassa
// (Mivel most már abba írunk közvetlenül)

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);

$input = json_decode(file_get_contents('php://input'), true);
$op_szam = isset($input['op_szam']) ? trim($input['op_szam']) : '';
$honap   = isset($input['honap'])   ? trim($input['honap'])   : date('Y-m');

if (!$op_szam) { echo json_encode(['status' => 'error']); exit; }

try {
    $pdo = csatlakozasSzerver2(); 

    // 1. TÁVOLLÉTEK (Most már az új adat is itt lesz!)
    $sql = "SELECT * FROM `m_va_adatbazis` WHERE `sz_tp_kezdet` LIKE :honap";
    $params = [':honap' => $honap . '%'];
    
    if ($op_szam !== 'MINDENKI') {
        $sql .= " AND `operátor_szám` = :op";
        $params[':op'] = $op_szam;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $adatok = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formázás a JS-nek
    if ($op_szam === 'MINDENKI') {
        $csoport = [];
        foreach ($adatok as $sor) {
            $op = $sor['operátor_szám'];
            $csoport[$op][] = $sor;
        }
        echo json_encode(['status' => 'ok', 'mod' => 'tomeges', 'adatok' => $csoport]);
    } else {
        echo json_encode(['status' => 'ok', 'mod' => 'egyeni', 'adatok' => $adatok]);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'uzenet' => $e->getMessage()]);
}
?>