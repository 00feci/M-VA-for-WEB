<?php
// munkaido_mentes.php
// Végleges, naptár-tudatos verzió: Egyetlen rekordot ment, de csak a munkanapokat számolja.

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_szerkezet.php';
date_default_timezone_set('Europe/Budapest');

header('Content-Type: application/json; charset=utf-8');

// 1. ADATOK FOGADÁSA
$raw = file_get_contents('php://input');
$URLAP = json_decode($raw, true); 

if (!$URLAP) { 
    echo json_encode(['status' => 'error', 'uzenet' => 'Üres kérés']);
    exit;
}

// 2. BEJÖVŐ ADATOK KINYERÉSE
$bejovo_op        = isset($URLAP['op_szam']) ? trim($URLAP['op_szam']) : '';
$bejovo_datum     = isset($URLAP['datum'])   ? trim($URLAP['datum'])   : date('Y-m-d');
$bejovo_datum_veg = isset($URLAP['datum_veg']) ? trim($URLAP['datum_veg']) : $bejovo_datum; 
$bejovo_visszater = isset($URLAP['visszateres_napja']) ? trim($URLAP['visszateres_napja']) : '';
$bejovo_ertek     = isset($URLAP['ertek'])   ? trim($URLAP['ertek'])   : ''; 
$bejovo_tipus     = isset($URLAP['tipus'])   ? trim($URLAP['tipus'])   : '';
$bejovo_napok     = isset($URLAP['napok'])   ? (int)$URLAP['napok']    : 0;

// HIÁNYZÓ LISTA DEFINIÁLÁSA
$mentendo_kodok = ['SZ', 'TP', 'fn', 'rendes-szabadsag', 'tanulmanyi-szabadsag', 'kozeli-hozzatartozo-halala-miatt', 'tappenz', 'tappenz-gyap', 'fizetes-nelkuli-szabadsag'];

// 3. FELHASZNÁLÓ PROFIL ADATOK BETÖLTÉSE (ELŐREHOZVA A TÖRLÉS ELÉ!)
$cel_user_id = 0;
if ($bejovo_op !== '' && $bejovo_op !== 'kulso') {
    $user_by_login = get_user_by('login', $bejovo_op);
    if ($user_by_login) { $cel_user_id = $user_by_login->ID; }
}

$PROFIL = [];
if ($cel_user_id > 0) {
    $all_meta = get_user_meta($cel_user_id);
    foreach ($all_meta as $key => $val) { $PROFIL[$key] = isset($val[0]) ? $val[0] : ''; }
    $userdata = get_userdata($cel_user_id);
    if ($userdata) {
        $PROFIL['wp_last_name']  = $userdata->last_name;
        $PROFIL['wp_first_name'] = $userdata->first_name;
        $PROFIL['wp_email']      = $userdata->user_email;
    }
}

// 4. TÖRLÉS VAGY FIX JELÖLÉS (A, Ü, -) TISZTÍTÁSA ÉS DARABOLÁSA
if (!in_array($bejovo_ertek, $mentendo_kodok)) {
    try {
        if (!isset($pdo)) { $pdo = csatlakozasSzerver2(); }

        // Split logika
        $stmt_check = $pdo->prepare("SELECT * FROM `m_va_adatbazis` WHERE `operátor_szám` = ? AND `sz_tp_kezdet` < ? AND `sz_tp_végzet` > ?");
        $stmt_check->execute([$bejovo_op, $bejovo_datum, $bejovo_datum_veg]);
        $split_rekord = $stmt_check->fetch(PDO::FETCH_ASSOC);

        if ($split_rekord) {
            $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_végzet` = DATE_SUB(?, INTERVAL 1 DAY) WHERE `id` = ?")
                ->execute([$bejovo_datum, $split_rekord['id']]);

            $uj_resz = $split_rekord;
            unset($uj_resz['id']); 
            $uj_resz['sz_tp_kezdet'] = date('Y-m-d', strtotime($bejovo_datum_veg . ' +1 day'));
            $uj_resz['státusz_dátum'] = date('Y.m.d. H:i');
            intelligensMentes($pdo, 'm_va_adatbazis', $uj_resz);
        }

        // Tisztítás
        $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_kezdet` = DATE_ADD(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_végzet` > ? AND `sz_tp_kezdet` <= ?")->execute([$bejovo_datum_veg, $bejovo_op, $bejovo_datum_veg, $bejovo_datum_veg]);
        $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_végzet` = DATE_SUB(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_kezdet` < ? AND `sz_tp_végzet` >= ?")->execute([$bejovo_datum, $bejovo_op, $bejovo_datum, $bejovo_datum]);
        $pdo->prepare("DELETE FROM `m_va_adatbazis` WHERE `operátor_szám` = ? AND `sz_tp_kezdet` >= ? AND `sz_tp_végzet` <= ?")->execute([$bejovo_op, $bejovo_datum, $bejovo_datum_veg]);

        if ($bejovo_ertek === 'Ü' || $bejovo_ertek === '-') {
            $fix_adatok = [
                'operátor_szám'     => $bejovo_op,
                'sz_tp_kezdet'      => $bejovo_datum,
                'sz_tp_végzet'      => $bejovo_datum_veg,
                'dokumentum_típusa' => $bejovo_ertek,
                'státusz'           => 'Fix jelölés',
                'jelentkezés_forrása' => 'Kézi',
                'státusz_dátum'     => date('Y.m.d. H:i')
            ];
            $fix_sor = keszitsMentendoSort('m_va_adatbazis', $PROFIL, $fix_adatok);
            intelligensMentes($pdo, 'm_va_adatbazis', $fix_sor);
        }

        // Tisztítás és törlés
        $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_kezdet` = DATE_ADD(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_végzet` > ? AND `sz_tp_kezdet` <= ?")->execute([$bejovo_datum_veg, $bejovo_op, $bejovo_datum_veg, $bejovo_datum_veg]);
        $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_végzet` = DATE_SUB(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_kezdet` < ? AND `sz_tp_végzet` >= ?")->execute([$bejovo_datum, $bejovo_op, $bejovo_datum, $bejovo_datum]);
        $pdo->prepare("DELETE FROM `m_va_adatbazis` WHERE `operátor_szám` = ? AND `sz_tp_kezdet` >= ? AND `sz_tp_végzet` <= ?")->execute([$bejovo_op, $bejovo_datum, $bejovo_datum_veg]);

        if ($bejovo_ertek === 'Ü' || $bejovo_ertek === '-') {
            $fix_adatok = [
                'operátor_szám'     => $bejovo_op,
                'sz_tp_kezdet'      => $bejovo_datum,
                'sz_tp_végzet'      => $bejovo_datum_veg,
                'dokumentum_típusa' => $bejovo_ertek,
                'státusz'           => 'Fix jelölés',
                'jelentkezés_forrása' => 'Kézi',
                'státusz_dátum'     => date('Y.m.d. H:i')
            ];
            $fix_sor = keszitsMentendoSort('m_va_adatbazis', $PROFIL, $fix_adatok);
            intelligensMentes($pdo, 'm_va_adatbazis', $fix_sor);
        }

        echo json_encode(['status' => 'ok', 'uzenet' => 'Sikeres módosítás: ' . $bejovo_ertek]);
        exit;
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'uzenet' => 'Hiba: ' . $e->getMessage()]);
        exit;
    }
}


// 5. TÍPUSOK ÉS KALKULÁCIÓ (Naptár-szűréssel)
$tipus_szotar = [
    'rendes-szabadsag'                 => 'Rendes szabadság',
    'tanulmanyi-szabadsag'             => 'Tanulmányi szabadság',
    'kozeli-hozzatartozo-halala-miatt' => 'Közeli hozzátartozó halála miatt',
    'tappenz'                          => 'Táppénz',
    'tappenz-gyap'                     => 'Táppénz (GYÁP)',
    'fizetes-nelkuli-szabadsag'        => 'Fizetés nélküli szabadság'
];
$magyar_dok_tipus = $tipus_szotar[$bejovo_tipus] ?? 'Szabadság és Táppénz';

// 5. MUNKANAPOK ÉS VISSZATÉRÉS SZÁMÍTÁSA
$sz_tp_kezdet = $bejovo_datum;
$sz_tp_vegzet = $bejovo_datum_veg;
$start_ts     = strtotime($sz_tp_kezdet);
$end_ts       = strtotime($sz_tp_vegzet);

try {
    if (!isset($pdo)) { $pdo = csatlakozasSzerver2(); }
    $stmt_naptar = $pdo->prepare("SELECT datum, tipus FROM `munkaido_naptar` WHERE datum BETWEEN ? AND ?");
    $stmt_naptar->execute([$sz_tp_kezdet, $sz_tp_vegzet]);
    $naptar_adatok = $stmt_naptar->fetchAll(PDO::FETCH_KEY_PAIR);
} catch (Exception $e) { $naptar_adatok = []; }

$sz_tp_napok = 0;
if ($bejovo_napok > 0) {
    $sz_tp_napok = $bejovo_napok; 
} else {
    for ($curr = $start_ts; $curr <= $end_ts; $curr = strtotime("+1 day", $curr)) {
        $d = date('Y-m-d', $curr);
        if (($naptar_adatok[$d] ?? 'M') === 'M') { $sz_tp_napok++; }
    }
}

if (!empty($bejovo_visszater)) {
    $sz_tp_utani_nap = $bejovo_visszater;
} else {
    $kovetkezo_ts = strtotime($sz_tp_vegzet . ' +1 day');
    while (date('N', $kovetkezo_ts) >= 6 || ($naptar_adatok[date('Y-m-d', $kovetkezo_ts)] ?? 'M') !== 'M') { 
        $kovetkezo_ts = strtotime("+1 day", $kovetkezo_ts);
    }
    $sz_tp_utani_nap = date('Y-m-d', $kovetkezo_ts);
}

// 6. SZEMETES VÉDELEM: Csak akkor tisztítunk, ha van mentendő munkanap!
if ($sz_tp_napok > 0) {
    try {
        $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_kezdet` = DATE_ADD(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_végzet` > ? AND `sz_tp_kezdet` <= ?")->execute([$sz_tp_vegzet, $bejovo_op, $sz_tp_vegzet, $sz_tp_vegzet]);
        $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_végzet` = DATE_SUB(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_kezdet` < ? AND `sz_tp_végzet` >= ?")->execute([$sz_tp_kezdet, $bejovo_op, $sz_tp_kezdet, $sz_tp_kezdet]);
        $pdo->prepare("DELETE FROM `m_va_adatbazis` WHERE `operátor_szám` = ? AND `sz_tp_kezdet` >= ? AND `sz_tp_végzet` <= ?")->execute([$bejovo_op, $sz_tp_kezdet, $sz_tp_vegzet]);

        $aktualis_valtozasok = [
            'operátor_szám' => $bejovo_op, 'sz_tp_kezdet' => $sz_tp_kezdet, 'sz_tp_végzet' => $sz_tp_vegzet,
            'sz_tp_napok' => $sz_tp_napok, 'sz_tp_utáni_nap' => $sz_tp_utani_nap,
            'jelentkezés_forrása' => 'Kézi', 'dokumentum_típusa' => $magyar_dok_tipus,
            'státusz' => 'Szabadság és Táppénz', 'státusz_dátum' => date('Y.m.d. H:i')
        ];
        
        $vegleges_adatbazis_sor = keszitsMentendoSort('m_va_adatbazis', $PROFIL, $aktualis_valtozasok);
        intelligensMentes($pdo, 'm_va_adatbazis', $vegleges_adatbazis_sor);
        
        echo json_encode(['status' => 'ok', 'uzenet' => 'Mentés sikeres!', 'visszater' => $sz_tp_utani_nap]);
    } catch (Exception $e) { echo json_encode(['status' => 'error', 'uzenet' => 'SQL hiba: ' . $e->getMessage()]); }
} else {
    echo json_encode(['status' => 'ok', 'uzenet' => 'Nincs mentendő munkanap a tartományban.']);
}
exit;