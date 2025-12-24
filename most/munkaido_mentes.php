<?php
// munkaido_mentes.php
// Végleges, naptár-tudatos verzió: Egyetlen rekordot ment, de csak a munkanapokat számolja.

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
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

// 3. TÖRLÉS VAGY MENTÉS ELDÖNTÉSE
$mentendo_kodok = ['SZ', 'TP', 'fn', 'A'];

// 1. ESET: TÖRLÉS (Ha nem a mentendők között van)
if (!in_array($bejovo_ertek, $mentendo_kodok)) {
    try {
       

// 1. ESET: TÖRLÉS / Rendszer Adat (A) - Itt nem mentünk új rekordot, csak felszabadítjuk a helyet
if (!in_array($bejovo_ertek, $mentendo_kodok)) {
    try {
        if (!isset($pdo)) { $pdo = csatlakozasSzerver2(); }
        
        // Hiba 1: Intelligens terület-felszabadítás (Shrink), hogy a szomszédos napok megmaradjanak
        $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_kezdet` = DATE_ADD(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_végzet` > ? AND `sz_tp_kezdet` <= ?")->execute([$bejovo_datum_veg, $bejovo_op, $bejovo_datum_veg, $bejovo_datum_veg]);
        $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_végzet` = DATE_SUB(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_kezdet` < ? AND `sz_tp_végzet` >= ?")->execute([$bejovo_datum, $bejovo_op, $bejovo_datum, $bejovo_datum]);
        $pdo->prepare("DELETE FROM `m_va_adatbazis` WHERE `operátor_szám` = ? AND `sz_tp_kezdet` >= ? AND `sz_tp_végzet` <= ?")->execute([$bejovo_op, $bejovo_datum, $bejovo_datum_veg]);
        
        echo json_encode(['status' => 'ok', 'uzenet' => 'Terület felszabadítva (Adat/Egér)']);
        exit;
    } catch (Exception $e) {
        
        echo json_encode(['status' => 'error', 'uzenet' => 'Hiba a törlésnél: ' . $e->getMessage()]);
        exit;
    }
}
// 4. FELHASZNÁLÓ AZONOSÍTÁSA ÉS PROFIL ADATOK
$cel_user_id = 0;
if ($bejovo_op !== '' && $bejovo_op !== 'kulso') {
    $user_by_login = get_user_by('login', $bejovo_op);
    if ($user_by_login) {
        $cel_user_id = $user_by_login->ID;
    } else {
        $users = get_users(['meta_key' => 'nickname', 'meta_value' => $bejovo_op, 'number' => 1, 'fields' => 'ID']);
        if (!empty($users)) { $cel_user_id = $users[0]; }
    }
}

$PROFIL = [];
if ($cel_user_id > 0) {
    $all_meta = get_user_meta($cel_user_id);
    foreach ($all_meta as $key => $val) {
        $PROFIL[$key] = isset($val[0]) ? $val[0] : '';
    }
    $userdata = get_userdata($cel_user_id);
    if ($userdata) {
        $PROFIL['wp_last_name']  = $userdata->last_name;
        $PROFIL['wp_first_name'] = $userdata->first_name;
        $PROFIL['wp_email']      = $userdata->user_email;
    }
}

function adat($tomb, $kulcs) { return isset($tomb[$kulcs]) ? trim($tomb[$kulcs]) : ''; }

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

// Dátumok előkészítése
$sz_tp_kezdet = $bejovo_datum;
$sz_tp_vegzet = $bejovo_datum_veg;
$sz_tp_napok  = 0;
$start_ts     = strtotime($sz_tp_kezdet);
$end_ts       = strtotime($sz_tp_vegzet);

// NAPTÁR ADATOK LEKÉRÉSE: Megnézzük, melyik nap milyen típusú a táblában
$naptar_adatok = [];
// 2. Mentés előtti tisztítás: Az új rekord helyét felszabadítjuk az átfedések elkerüléséhez

// Hiba 1: Mentés előtti intelligens tisztítás (Shrink logika)
try {
    if (!isset($pdo)) { $pdo = csatlakozasSzerver2(); }
    // Végrehajtjuk a szűkítést mindkét irányba, hogy ne vesszen el adat a széleken
    $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_kezdet` = DATE_ADD(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_végzet` > ? AND `sz_tp_kezdet` <= ?")->execute([$sz_tp_vegzet, $bejovo_op, $sz_tp_vegzet, $sz_tp_vegzet]);
    $pdo->prepare("UPDATE `m_va_adatbazis` SET `sz_tp_végzet` = DATE_SUB(?, INTERVAL 1 DAY) WHERE `operátor_szám` = ? AND `sz_tp_kezdet` < ? AND `sz_tp_végzet` >= ?")->execute([$sz_tp_kezdet, $bejovo_op, $sz_tp_kezdet, $sz_tp_kezdet]);
    $pdo->prepare("DELETE FROM `m_va_adatbazis` WHERE `operátor_szám` = ? AND `sz_tp_kezdet` >= ? AND `sz_tp_végzet` <= ?")->execute([$bejovo_op, $sz_tp_kezdet, $sz_tp_vegzet]);
} catch (Exception $e) { }

try {
    $stmt_naptar = $pdo->prepare("SELECT datum, tipus FROM `munkaido_naptar` WHERE datum BETWEEN ? AND ?");
    $stmt_naptar->execute([$sz_tp_kezdet, $sz_tp_vegzet]);
    $naptar_adatok = $stmt_naptar->fetchAll(PDO::FETCH_KEY_PAIR);
} catch (Exception $e) { $naptar_adatok = []; }

for ($curr = $start_ts; $curr <= $end_ts; $curr = strtotime("+1 day", $curr)) {
    $d = date('Y-m-d', $curr);
    if (($naptar_adatok[$d] ?? 'M') === 'M') { $sz_tp_napok++; }
}

// 4. Visszatérés napja meghatározása
if (!empty($bejovo_visszater)) {
    $sz_tp_utani_nap = $bejovo_visszater;
} else {
    $kovetkezo_ts = strtotime($sz_tp_vegzet . ' +1 day');
    while (date('N', $kovetkezo_ts) >= 6) { 
        $kovetkezo_ts = strtotime(date('Y-m-d', $kovetkezo_ts) . ' +1 day');
    }
    $sz_tp_utani_nap = date('Y-m-d', $kovetkezo_ts);
}
// 6. A TELJES ADATSOR ÖSSZEÁLLÍTÁSA
$vegleges_adatbazis_sor = [
    'státusz'                       => 'Szabadság és Táppénz',
    'státusz_dátum'                 => date('Y.m.d. H:i'),
    'dokumentum_típusa'             => $magyar_dok_tipus,
    'jelentkezés_forrása'           => 'Kézi',
    'jelentkezés_forrása1'          => adat($PROFIL, 'jelentkezes_forrasa1'),
    'jelentkezés_bérigény'          => adat($PROFIL, 'jelentkezes_berigeny'),
    'jelentkezés_mire_hova_jelentkezett' => adat($PROFIL, 'jelentkezes_mire_hova_jelentkezett'),
    'jelentkezés_cv'                => adat($PROFIL, 'jelentkezes_cv'),
    'jelentkezés_mmk'               => adat($PROFIL, 'jelentkezes_mmk'),
    'jelentkezés_vegzettseg'        => adat($PROFIL, 'jelentkezes_vegzettseg'),
    'jelentkezés_mikor_tud_kezdeni' => adat($PROFIL, 'jelentkezes_mikor_tud_kezdeni'),
    'jelentkezés_vállalt_óraszám'   => adat($PROFIL, 'jelentkezes_vallalt_oraszam'),
    'üzenet'                        => '',
    'operátor_szám'                 => $bejovo_op,
    'foglalkoztató_cég'             => adat($PROFIL, 'foglalkoztato_ceg'),
    'foglalkoztató_cég_email'       => adat($PROFIL, 'foglalkoztato_ceg_email'),
    'tevékenység'                   => adat($PROFIL, 'tevekenyseg'),
    'napi_munka_idő'                => adat($PROFIL, 'napi_munka_ido'),
    'bérezés'                       => adat($PROFIL, 'berezes'),
    'munkaidő'                      => adat($PROFIL, 'munkaido'),
    'munkavégzés_helyének_típusa'   => adat($PROFIL, 'munkavegzes_helyenek_tipusa'),
    'vezetéknév'                    => adat($PROFIL, 'last_name') ?: adat($PROFIL, 'wp_last_name'),
    'keresztnév'                    => adat($PROFIL, 'first_name') ?: adat($PROFIL, 'wp_first_name'),
    'születési_név'                 => adat($PROFIL, 'szuletesi_nev'),
    'állandó_cím'                   => adat($PROFIL, 'allando_cim'),
    'levelezési_cím'                => adat($PROFIL, 'levelezesi_cim'),
    'levelezési_cím_település'      => adat($PROFIL, 'levelezesi_cim_telepules'),
    'születési_hely'                => adat($PROFIL, 'szuletesi_hely'),
    'születési_idő'                 => adat($PROFIL, 'szuletesi_ido'),
    'anyja_neve'                    => adat($PROFIL, 'anyja_neve'),
    'személyi_igazolvány'           => adat($PROFIL, 'szemelyi_igazolvany'),
    'taj_szám'                      => adat($PROFIL, 'taj_szam'),
    'adó_azonosító_jel'             => adat($PROFIL, 'ado_azonosito_jel'),
    'telefonszám'                   => adat($PROFIL, 'telefonszam'),
    'email_cím'                     => adat($PROFIL, 'wp_email'),
    'bankszámlaszám'                => adat($PROFIL, 'bankszamlaszam'),
    'számlatulajdonos_neve'         => adat($PROFIL, 'szamlatulajdonos_neve'),
    'bank_neve'                     => adat($PROFIL, 'bank_neve'),
    'skype'                         => adat($PROFIL, 'skype'),
    'munkakezdés_dátuma'            => adat($PROFIL, 'munkakezdes_datuma'),
    'keltezés'                      => adat($PROFIL, 'keltezes'),
    'időarányosan_számított_szabadságok_napja' => adat($PROFIL, 'idoaranyosan_szamitott_szabadsagok_napja'),
    'kilepes_datuma_utolso_munkanap'           => adat($PROFIL, 'kilepes_datuma_utolso_munkanap'),
    'torles_alatt_kilepes_plusz_40nap_LEJAR'   => adat($PROFIL, 'torles_alatt_kilepes_plusz_40nap_LEJAR'),
    'járási_hivatal'                           => adat($PROFIL, 'jarasi_hivatal'),
    'sz_tp_kezdet'                  => $sz_tp_kezdet, 
    'sz_tp_végzet'                  => $sz_tp_vegzet,
    'sz_tp_utáni_nap'               => $sz_tp_utani_nap,
    'sz_tp_napok'                   => $sz_tp_napok,
];

// 7. SQL MENTÉS (UPSERT)
try {
    if (!isset($pdo)) { $pdo = csatlakozasSzerver2(); }
    $stmt_check = $pdo->prepare("SELECT id FROM m_va_adatbazis WHERE `operátor_szám` = ? AND DATE(`sz_tp_kezdet`) = DATE(?)");
    $stmt_check->execute([$bejovo_op, $sz_tp_kezdet]);
    $existing_id = $stmt_check->fetchColumn();

    if ($existing_id) {
        $set_parts = []; $values = [];
        foreach ($vegleges_adatbazis_sor as $col => $val) { $set_parts[] = "`$col` = ?"; $values[] = $val; }
        $sql = "UPDATE `m_va_adatbazis` SET " . implode(", ", $set_parts) . " WHERE `id` = ?";
        $values[] = $existing_id;
    } else {
        $cols = []; $placeholders = []; $values = [];
        foreach ($vegleges_adatbazis_sor as $col => $val) { $cols[] = "`$col`"; $placeholders[] = "?"; $values[] = $val; }
        $sql = "INSERT INTO `m_va_adatbazis` (" . implode(", ", $cols) . ") VALUES (" . implode(", ", $placeholders) . ")";
    }

    $pdo->prepare($sql)->execute($values);
    $db_uzenet = "Sikeres mentés";
} catch (Exception $e) { $db_uzenet = "SQL HIBA: " . $e->getMessage(); }

echo json_encode(['status' => 'ok', 'sql_info' => $db_uzenet, 'debug_user' => $cel_user_id]);
exit;
///EZT itt

