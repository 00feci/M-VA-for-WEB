<?php
// munkaido_lekerezes.php
// 4 RÉTEGŰ VERZIÓ + ÖNGYÓGYÍTÁS
// Most már ellenőrzi és létrehozza a hiányzó táblát indításkor!

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);

$input = json_decode(file_get_contents('php://input'), true);
$op_szam = isset($input['op_szam']) ? trim($input['op_szam']) : '';
$honap   = isset($input['honap'])   ? trim($input['honap'])   : date('Y-m');

if (!$op_szam) {
    echo json_encode(['status' => 'error', 'uzenet' => 'Hiányzó OP szám']);
    exit;
}

try {
    $pdo_Tavollet = csatlakozasSzerver2(); 
    $pdo_Munka    = csatlakozasSzerver1();

    // =========================================================
    // ÚJ RÉSZ: BIZTONSÁGI TÁBLA LÉTREHOZÁS (ÖNGYÓGYÍTÁS) 🚑
    // =========================================================
    // Mielőtt olvasnánk belőle, biztosítjuk, hogy létezzen a tábla.
    $pdo_Tavollet->exec("
        CREATE TABLE IF NOT EXISTS `munkaido_korrekciok` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `operator` varchar(20) NOT NULL,
          `datum` date NOT NULL,
          `uj_ertek` varchar(50) NOT NULL,
          `rogzitve` datetime DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `op_datum_unique` (`operator`, `datum`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    // =========================================================

    $honap_sql   = $honap;
    $honap_excel = str_replace('-', '%', $honap); 

    // 1. NAPTÁR (munkaido_naptar)
    // Ha véletlenül ez se létezne, a korrekcio_kezelo majd létrehozza, 
    // de itt feltételezzük, hogy ez már megvan.
    $stmt_n = $pdo_Tavollet->prepare("SELECT datum, tipus FROM `munkaido_naptar` WHERE datum LIKE :honap");
    $stmt_n->execute([':honap' => $honap_sql . '%']);
    $naptar_adatok = $stmt_n->fetchAll(PDO::FETCH_KEY_PAIR);

    // 2. TÁVOLLÉTEK
    $sql_tavollet = "SELECT * FROM `m_va_adatbazis` WHERE `sz_tp_kezdet` LIKE :honap";
    $params_t = [':honap' => $honap_sql . '%'];
    if ($op_szam !== 'MINDENKI') {
        $sql_tavollet .= " AND `operátor_szám` = :op";
        $params_t[':op'] = $op_szam;
    }
    $stmt_t = $pdo_Tavollet->prepare($sql_tavollet);
    $stmt_t->execute($params_t);
    $nyers_tavolletek = $stmt_t->fetchAll(PDO::FETCH_ASSOC);

    // 3. MUNKA
    $sql_munka = "SELECT `Operátor név`, `Dátum` FROM `call_center_hasznalat` WHERE `Dátum` LIKE :honap";
    $stmt_m = $pdo_Munka->prepare($sql_munka);
    $stmt_m->execute([':honap' => $honap_excel . '%']);
    $nyers_munka = $stmt_m->fetchAll(PDO::FETCH_ASSOC);

    // 4. KORREKCIÓK (A FÓLIA)
    $sql_korr = "SELECT operator, datum, uj_ertek FROM `munkaido_korrekciok` WHERE datum LIKE :honap";
    $params_k = [':honap' => $honap_sql . '%'];
    if ($op_szam !== 'MINDENKI') {
        $sql_korr .= " AND `operator` = :op";
        $params_k[':op'] = str_pad($op_szam, 4, '0', STR_PAD_LEFT);
    }
    $stmt_k = $pdo_Tavollet->prepare($sql_korr);
    $stmt_k->execute($params_k);
    $nyers_korrekciok = $stmt_k->fetchAll(PDO::FETCH_ASSOC);

    $korrekcio_map = [];
    foreach ($nyers_korrekciok as $k) {
        $k_kulcs = $k['operator'] . '|' . $k['datum'];
        $korrekcio_map[$k_kulcs] = $k['uj_ertek'];
    }


    // --- ÖSSZEFÉSÜLÉS ---
    $kozos = [];

    // A) Távollétek
    foreach ($nyers_tavolletek as $sor) {
        $op = trim($sor['operátor_szám']);
        if ($op_szam !== 'MINDENKI' && intval($op) != intval($op_szam)) continue;

        $kezdetStr = str_replace('.', '-', trim($sor['sz_tp_kezdet']));
        $vegStr    = str_replace('.', '-', trim($sor['sz_tp_végzet']));
        try { $kezdet = new DateTime($kezdetStr); $veg = new DateTime($vegStr); } catch (Exception $e) { continue; }

        while ($kezdet <= $veg) {
            if ($kezdet->format('Y-m') === $honap) {
                $std_op = str_pad($op, 4, '0', STR_PAD_LEFT); 
                $datumIso = $kezdet->format('Y-m-d');
                $kulcs = $std_op . '|' . $datumIso;

                if (!isset($kozos[$kulcs])) $kozos[$kulcs] = ['elemek' => []];
                
                $tipus = $sor['dokumentum_típusa'] ?? $sor['státusz'];
                if ($tipus && !in_array($tipus, $kozos[$kulcs]['elemek'])) {
                    $kozos[$kulcs]['elemek'][] = $tipus;
                }
                
                if (!isset($kozos[$kulcs]['adatok'])) {
                    $kozos[$kulcs]['adatok'] = $sor;
                    $kozos[$kulcs]['adatok']['operátor_szám'] = $std_op;
                }
            }
            $kezdet->modify('+1 day');
        }
    }

    // B) Munka (CENTRIFUGA)
    foreach ($nyers_munka as $sor) {
        $db_op = trim($sor['Operátor név']);
        if ($op_szam !== 'MINDENKI' && intval($db_op) != intval($op_szam)) continue;

        $nyersDatum = $sor['Dátum'];
        $tisztaDatum = str_replace(['.', ' ', '/'], '-', $nyersDatum);
        $tisztaDatum = preg_replace('/-+/', '-', $tisztaDatum);
        $tisztaDatum = trim($tisztaDatum, '-');
        try { $d = new DateTime($tisztaDatum); $datumIso = $d->format('Y-m-d'); } catch (Exception $e) { continue; }

        $std_op = str_pad($db_op, 4, '0', STR_PAD_LEFT);
        $kulcs = $std_op . '|' . $datumIso;

        if (!isset($kozos[$kulcs])) {
            $kozos[$kulcs] = ['elemek' => [], 'adatok' => ['operátor_szám' => $std_op]];
        }
        if (!in_array('A', $kozos[$kulcs]['elemek'])) array_unshift($kozos[$kulcs]['elemek'], 'A');
    }

    // C) Naptár + FÓLIA ELLENŐRZÉS + Formázás
    foreach ($kozos as $kulcs => &$obj) {
        // 1. FÓLIA (Korrekció)
        if (isset($korrekcio_map[$kulcs])) {
            $javitott_ertek = $korrekcio_map[$kulcs];
            $obj['adatok']['dokumentum_típusa'] = $javitott_ertek;
            $obj['adatok']['javitott'] = true; // Jelölés a frontendnek!
            continue; 
        }

        // 2. Normál logika
        $parts = explode('|', $kulcs);
        $datum = $parts[1];

        if (isset($naptar_adatok[$datum])) {
            $naptarTipus = $naptar_adatok[$datum];
            if (($naptarTipus === 'Ü' || $naptarTipus === '-') && !in_array($naptarTipus, $obj['elemek'])) {
                $obj['elemek'][] = $naptarTipus;
            }
        }
        
        $egyediElemek = array_unique($obj['elemek']);
        $egyediElemek = array_filter($egyediElemek, function($value) { return !is_null($value) && $value !== ''; });
        $finalString = implode(' | ', $egyediElemek);
        
        $obj['adatok']['dokumentum_típusa'] = $finalString;
        $obj['adatok']['javitott'] = false;
    }

    $kimenet_lista = [];
    foreach ($kozos as $elem) {
        if (!isset($elem['adatok']['operátor_szám'])) {
            $parts = explode('|', key($kozos));
            $elem['adatok']['operátor_szám'] = $parts[0];
        }
        $kimenet_lista[] = $elem['adatok'];
    }

    if ($op_szam === 'MINDENKI') {
        $csoportositva = [];
        foreach ($kimenet_lista as $sor) {
            $op = $sor['operátor_szám'];
            if (!isset($csoportositva[$op])) $csoportositva[$op] = [];
            $csoportositva[$op][] = $sor;
        }
        echo json_encode(['status' => 'ok', 'mod' => 'tomeges', 'adatok' => $csoportositva]);
    } else {
        echo json_encode(['status' => 'ok', 'mod' => 'egyeni', 'adatok' => $kimenet_lista]);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'uzenet' => $e->getMessage()]);
}
?>