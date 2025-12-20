<?php
// munkaido_korrekcio_kezelo.php
// Ez kezeli a HR-es javításait (A Fóliát)
// TÁBLA: munkaido_korrekciok

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);

$action = $_GET['action'] ?? '';

try {
    // 1. Csatlakozás a 2-es szerverhez (oda tesszük a javításokat is)
    $pdo = csatlakozasSzerver2();

    // 2. AUTOMATIKUS TÁBLA LÉTREHOZÁS
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `munkaido_korrekciok` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `operator` varchar(20) NOT NULL,
          `datum` date NOT NULL,
          `uj_ertek` varchar(50) NOT NULL, -- Ez lesz, ami felülírja az eredetit
          `rogzitve` datetime DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `op_datum_unique` (`operator`, `datum`) -- Egy embernek egy napra csak egy javítása lehet
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $input = json_decode(file_get_contents('php://input'), true);

    // --- MENTÉS (JAVÍTÁS ÍRÁSA) ---
    if ($action === 'save') {
        $op    = $input['op'] ?? '';
        $datum = $input['datum'] ?? '';
        $ertek = $input['ertek'] ?? ''; // Pl. "Igazolt távollét"

        if (!$op || !$datum) throw new Exception('Hiányzó adatok (OP vagy Dátum).');

        // Padoljuk az OP számot, hogy biztosan egyezzen (pl. 57 -> 0057)
        $op = str_pad($op, 4, '0', STR_PAD_LEFT);

        $sql = "INSERT INTO `munkaido_korrekciok` (`operator`, `datum`, `uj_ertek`) 
                VALUES (:op, :datum, :ertek) 
                ON DUPLICATE KEY UPDATE `uj_ertek` = :ertek, `rogzitve` = NOW()";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':op' => $op, ':datum' => $datum, ':ertek' => $ertek]);
        
        echo json_encode(['status' => 'ok', 'uzenet' => 'Javítás rögzítve.']);
    }

    // --- VISSZAÁLLÍTÁS (RESET / RADÍR) ---
    elseif ($action === 'reset') {
        $op    = $input['op'] ?? '';
        $datum = $input['datum'] ?? '';

        if (!$op || !$datum) throw new Exception('Hiányzó adatok.');

        $op = str_pad($op, 4, '0', STR_PAD_LEFT);

        // Egyszerűen töröljük a sort a fóliáról -> Előbukkan az eredeti adat!
        $stmt = $pdo->prepare("DELETE FROM `munkaido_korrekciok` WHERE `operator` = :op AND `datum` = :datum");
        $stmt->execute([':op' => $op, ':datum' => $datum]);

        echo json_encode(['status' => 'ok', 'uzenet' => 'Visszaállítva eredetire.']);
    }

    else {
        throw new Exception('Ismeretlen action.');
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'uzenet' => $e->getMessage()]);
}
?>