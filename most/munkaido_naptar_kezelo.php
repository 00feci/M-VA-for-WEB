<?php
// munkaido_naptar_kezelo.php
// TÁBLA: munkaido_naptar (Az eredeti, egyszerű név)
// Funkció: Ünnepnapok (Ü) és Pihenőnapok (-) kezelése

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);

$action = $_GET['action'] ?? '';

try {
    // 1. Csatlakozás a 2-es szerverhez (ahol a többi adat is van)
    $pdo = csatlakozasSzerver2();

    // 2. AUTOMATIKUS TÁBLA LÉTREHOZÁS (munkaido_naptar néven!)
    // Ha még nem létezik, megcsinálja.
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `munkaido_naptar` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `datum` date NOT NULL,
          `tipus` varchar(10) NOT NULL, -- Ü, -, M
          `rogzitve` datetime DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `datum_unique` (`datum`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

// --- MENTÉS (SAVE) ---
    if ($action === 'save') {
        $input  = json_decode(file_get_contents('php://input'), true);
        $datums = $input['datums'] ?? []; // Dátumok tömbje
        $tipus  = $input['tipus'] ?? '';

        if (empty($datums) || !$tipus) throw new Exception('Hiányzó adatok.');

        $pdo->beginTransaction();
        try {
            $sql = "INSERT INTO `munkaido_naptar` (`datum`, `tipus`) 
                    VALUES (:datum, :tipus) 
                    ON DUPLICATE KEY UPDATE `tipus` = :tipus";
            $stmt = $pdo->prepare($sql);
            
            foreach ($datums as $datum) {
                $stmt->execute([':datum' => $datum, ':tipus' => $tipus]);
            }
            
            $pdo->commit();
            echo json_encode(['status' => 'ok', 'uzenet' => count($datums) . ' nap sikeresen mentve.']);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    // --- BETÖLTÉS (LOAD) ---
    elseif ($action === 'load') {
        $ev    = $_GET['ev'] ?? date('Y');
        $honap = $_GET['honap'] ?? date('m');
        
        $keresendo = $ev . '-' . str_pad($honap, 2, '0', STR_PAD_LEFT) . '%';

        // Itt olvassuk ki a táblából
        $stmt = $pdo->prepare("SELECT datum, tipus FROM `munkaido_naptar` WHERE datum LIKE :honap");
        $stmt->execute([':honap' => $keresendo]);
        
        $adatok = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        echo json_encode(['status' => 'ok', 'adatok' => $adatok]);
    }

    else {
        throw new Exception('Érvénytelen action.');
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'uzenet' => $e->getMessage()]);
}
?>