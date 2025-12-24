<?php
// munkaido_korrekcio_kezelo.php
// JAVÍTVA: A hiányzó 'státusz_dátum' mező pótolva! ✅

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0); // Élesben ne szemetelje tele a kimenetet, a JSON-t várjuk

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

try {
    $pdo = csatlakozasSzerver2(); 

    if ($action === 'save') {
        $op     = $input['op'] ?? '';
        $kezdet = $input['kezdet'] ?? ''; // JS: 2025-12-01
        $veg    = $input['veg'] ?? '';    // JS: 2025-12-03
        $ertek  = $input['ertek'] ?? '';  // Pl: SZ, TP, M

        if (!$op || !$kezdet || !$veg) throw new Exception('Hiányzó adatok!');

        // 1. Dátumok és OP szám formázása (Hogy szeresse az adatbázis)
        $kezdetPontos = str_replace('-', '.', $kezdet); // 2025.12.01
        $vegPontos    = str_replace('-', '.', $veg);
        $opPontos     = str_pad($op, 4, '0', STR_PAD_LEFT); // 0057
        
        // A hiányzó láncszem: A mai dátum a státuszhoz!
        $most = date('Y.m.d'); 

        // 2. ELŐZŐ ADATOK TÖRLÉSE AZ IDŐSZAKBAN
        $delSql = "DELETE FROM `m_va_adatbazis` 
                   WHERE `operátor_szám` = :op 
                   AND (
                       (`sz_tp_kezdet` >= :k AND `sz_tp_kezdet` <= :v) OR 
                       (`sz_tp_végzet` >= :k AND `sz_tp_végzet` <= :v)
                   )";
        
        $stmtDel = $pdo->prepare($delSql);
        $stmtDel->execute([':op'=>$opPontos, ':k'=>$kezdetPontos, ':v'=>$vegPontos]);

        // 3. AZ ÚJ ADAT BESZÚRÁSA (Most már a státusz_dátum-mal!)
        $insSql = "INSERT INTO `m_va_adatbazis` 
                   (`operátor_szám`, `sz_tp_kezdet`, `sz_tp_végzet`, `dokumentum_típusa`, `státusz`, `státusz_dátum`) 
                   VALUES (:op, :kezdet, :veg, :ertek, 'Aktív', :most)";
        
        $stmtIns = $pdo->prepare($insSql);
        $stmtIns->execute([
            ':op' => $opPontos, 
            ':kezdet' => $kezdetPontos, 
            ':veg' => $vegPontos, 
            ':ertek' => $ertek,
            ':most' => $most  // <--- EZ HIÁNYZOTT EDDIG!
        ]);
        
        echo json_encode(['status' => 'ok', 'uzenet' => 'Sikeres mentés!']);
    }

    // --- TÖRLÉS ---
    elseif ($action === 'reset') {
        $op    = $input['op'] ?? '';
        $datum = $input['datum'] ?? ''; 

        $datumPontos = str_replace('-', '.', $datum);
        $opPontos    = str_pad($op, 4, '0', STR_PAD_LEFT);

        $sql = "DELETE FROM `m_va_adatbazis` 
                WHERE `operátor_szám` = :op 
                AND :datum BETWEEN `sz_tp_kezdet` AND `sz_tp_végzet`";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':op' => $opPontos, ':datum' => $datumPontos]);

        echo json_encode(['status' => 'ok', 'uzenet' => 'Rekord törölve.']);
    }

} catch (Exception $e) {
    // Ha még mindig hiba van, most már látni fogjuk a JSON-ben
    echo json_encode(['status' => 'error', 'uzenet' => 'SQL Hiba: ' . $e->getMessage()]);
}
?>