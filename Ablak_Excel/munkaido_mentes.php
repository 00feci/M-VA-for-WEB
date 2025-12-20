<?php
// munkaido_mentes.php
// Végleges verzió: Adatok fogadása Ablak.php-ból + Profil adatok (Meta) összefésülése
// 2025. - Javitott meta kulcsokkal és útvonalakkal

// 1. KÖRNYEZET BETÖLTÉSE (Ablak.php alapján ellenőrizve)
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
date_default_timezone_set('Europe/Budapest');

header('Content-Type: application/json; charset=utf-8');

// 2. ADATOK FOGADÁSA (JSON)
$raw = file_get_contents('php://input');
$URLAP = json_decode($raw, true); 

if (!$URLAP) { 
    echo json_encode(['status' => 'error', 'uzenet' => 'Üres kérés']);
    exit;
}

// 3. BEJÖVŐ ADATOK KINYERÉSE
$bejovo_op     = isset($URLAP['op_szam']) ? trim($URLAP['op_szam']) : '';
$bejovo_datum  = isset($URLAP['datum'])   ? trim($URLAP['datum'])   : date('Y-m-d');
$bejovo_ertek  = isset($URLAP['ertek'])   ? trim($URLAP['ertek'])   : ''; 
$bejovo_tipus  = isset($URLAP['tipus'])   ? trim($URLAP['tipus'])   : ''; 
$bejovo_nap_tipus = isset($URLAP['nap_tipus']) ? trim($URLAP['nap_tipus']) : 'M';

// --- INTELIGENS ELÁGAZÁS: MENTÉS VAGY TÖRLÉS? ---

$mentendo_kodok = ['SZ', 'TP', 'fn']; // Csak ezeket mentjük el
$torles_kodok   = ['-', 'A', 'Ü', 'M', '']; // Ezeknél törlünk (ha volt adat)

// 1. ESET: TÖRLÉS (Ha nem a mentendők között van)
if (!in_array($bejovo_ertek, $mentendo_kodok)) {
    
    // Azonnal végrehajtjuk a törlést, nem kell hozzá Profil adat
    try {
        if (!isset($pdo)) { $pdo = csatlakozasSzerver2(); } // Weboldal DB
        
        // Azt töröljük, ami ehhez az emberhez tartozik, és ezen a napon KEZDŐDIK
        // Itt is a sz_tp_kezdet mezőt figyeljük!
        $sql_del = "DELETE FROM `m_va_adatbazis` WHERE `operátor_szám` = ? AND DATE(`sz_tp_kezdet`) = DATE(?)";
        $stmt_del = $pdo->prepare($sql_del);
        $stmt_del->execute([$bejovo_op, $bejovo_datum]);
        
        // Megnézzük, hány sort töröltünk (0 vagy 1)
        if ($stmt_del->rowCount() > 0) {
            $uzenet = "Sikeres TÖRLÉS (Mert az érték: '$bejovo_ertek' volt)";
        } else {
            $uzenet = "Nincs mit törölni (Tiszta volt a nap)";
        }
        
        // Naplózás a biztonság kedvéért (Törlést is látni akarjuk)
        $logFajl = $_SERVER['DOCUMENT_ROOT'] . '/Iroda/logok/munkaido_mentes.log';
        $logsor = date('Y-m-d H:i:s') . " | RADÍR | Op: $bejovo_op | Dátum: $bejovo_datum | $uzenet\n";
        @file_put_contents($logFajl, $logsor, FILE_APPEND);

        // Válasz és KILÉPÉS (Ne fusson tovább a mentéshez!)
        echo json_encode(['status' => 'ok', 'uzenet' => $uzenet]);
        exit;

    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'uzenet' => 'Hiba a törlésnél: ' . $e->getMessage()]);
        exit;
    }
}

// 2. ESET: MENTÉS
// Ha a kód nem lépett ki fentebb, akkor ez egy "SZ", "TP" vagy "fn".
// A script fut tovább lefelé: Profil keresése -> Adatok összerakása -> SQL INSERT/UPDATE...

// 4. FELHASZNÁLÓ KERESÉSE (Login vagy Nickname alapján)
$cel_user_id = 0;
$log_uzenet = "Sikertelen azonosítás";

if ($bejovo_op !== '' && $bejovo_op !== 'kulso') {
    // A) Login név (user_login)
    $user_by_login = get_user_by('login', $bejovo_op);
    if ($user_by_login) {
        $cel_user_id = $user_by_login->ID;
        $log_uzenet = "Azonosítva Login alapján ($bejovo_op)";
    }
    
    // B) Nickname (Ha a Login nem talált, de a listában szerepel a nickname kulcs)
    if ($cel_user_id === 0) {
        $users = get_users(['meta_key' => 'nickname', 'meta_value' => $bejovo_op, 'number' => 1, 'fields' => 'ID']);
        if (!empty($users)) { 
            $cel_user_id = $users[0]; 
            $log_uzenet = "Azonosítva Nickname alapján ($bejovo_op)";
        }
    }
}

// 5. PROFIL ADATOK BETÖLTÉSE A MEMÓRIÁBA
$PROFIL = [];
if ($cel_user_id > 0) {
    // Összes meta lekérése
    $all_meta = get_user_meta($cel_user_id);
    foreach ($all_meta as $key => $val) {
        $PROFIL[$key] = isset($val[0]) ? $val[0] : '';
    }
    
    // Alap WP adatok pótlása (ha a metában nem lenne)
    $userdata = get_userdata($cel_user_id);
    if ($userdata) {
        $PROFIL['wp_last_name']  = $userdata->last_name;
        $PROFIL['wp_first_name'] = $userdata->first_name;
        $PROFIL['wp_email']      = $userdata->user_email;
    }
}

// BELSŐ SEGÉDFÜGGVÉNY (Hogy ne kelljen külső fájl)
function adat($tomb, $kulcs) {
    return isset($tomb[$kulcs]) ? trim($tomb[$kulcs]) : '';
}

// --- LOGIKA A MAGYAR ELNEVEZÉSEKHEZ ---

// 1. Dokumentum típusa (A pontos típus fordítása magyarra)
$tipus_szotar = [
    'rendes-szabadsag'                 => 'Rendes szabadság',
    'tanulmanyi-szabadsag'             => 'Tanulmányi szabadság',
    'kozeli-hozzatartozo-halala-miatt' => 'Közeli hozzátartozó halála miatt',
    'tappenz'                          => 'Táppénz',
    'tappenz-gyap'                     => 'Táppénz (GYÁP)',
    'fizetes-nelkuli-szabadsag'        => 'Fizetés nélküli szabadság'
];

// Ha a bejövő típus benne van a szótárban, azt használjuk. 
// Ha nincs (pl. sima egérhúzásnál), akkor "Egyéb".
$magyar_dok_tipus = $tipus_szotar[$bejovo_tipus] ?? '';



// 2. Státusz meghatározása (Kérésed szerint fix szöveg, vagy dinamikus)

// 6. A VÉGLEGES ADATSOR ÖSSZEÁLLÍTÁSA


// --- SZ/TP KALKULÁCIÓ (Javított: Nap típusa és naptár alapján) ---

// 1. Dátumok: Mivel cellánként mentünk, a tól-ig az adott nap.
$sz_tp_kezdet = $bejovo_datum;
$sz_tp_vegzet = $bejovo_datum;

// 2. Darabszám (sz_tp_napok):
// A JS által küldött 'nap_tipus' (fejléc) alapján döntünk.
// Ha 'M' (Munkanap) -> 1 napot számolunk.
// Ha 'Ü' (Ünnep) vagy '-' (Hétvége) -> 0 napot számolunk.
// 2. Darabszám (sz_tp_napok) - JAVÍTOTT MŰSZAKOS VERZIÓ
// Nem a fejlécet nézzük, hanem a beírt értéket.
// Ha SZABADSÁG vagy TÁPPÉNZ van, akkor az 1 napnak számít, akkor is, ha hétvége.

// Megtisztítjuk a bejövő értéket (Pl. "SZ " -> "SZ")
$ertek_tiszta = trim($bejovo_ertek);

// Kulcsszavak, amik 1 napot jelentenek
if (
    $ertek_tiszta === 'SZ' || 
    $ertek_tiszta === 'TP' || 
    $ertek_tiszta === 'fn' ||
    strpos($ertek_tiszta, 'SZ') !== false || // Ha pl. "SZ | -"
    strpos($ertek_tiszta, 'TP') !== false ||
    strpos($ertek_tiszta, 'fn') !== false ||
    in_array($bejovo_tipus, ['rendes-szabadsag', 'tappenz', 'tappenz-gyap', 'fizetes-nelkuli-szabadsag'])
) {
    $sz_tp_napok = 1;
} else {
    // Ha csak sima pihenőnap (-) vagy ünnep (Ü), és nincs szabadság kivéve
    $sz_tp_napok = 0;
}

// BIZTONSÁGI ELLENŐRZÉS:
// Ha véletlenül 'M' (Munkanap) jött be mint érték, az NEM szabadság!
if ($ertek_tiszta === 'M') {
    $sz_tp_napok = 0;
}



// 3. Visszatérés napja (sz_tp_utáni_nap):
// Megkeressük a naptár szerinti következő HÉTKÖZNAPOT (Hétfő-Péntek).
// (Ez egy becslés, mert nem látjuk a jövő havi beosztást, de naptárilag helyes).
$kovetkezo_ts = strtotime($bejovo_datum . ' +1 day');
while (date('N', $kovetkezo_ts) >= 6) { // 6=Szombat, 7=Vasárnap
    $kovetkezo_ts = strtotime(date('Y-m-d', $kovetkezo_ts) . ' +1 day');
}
$sz_tp_utani_nap = date('Y-m-d', $kovetkezo_ts);



//Adatbázis
$vegleges_adatbazis_sor = [
'státusz'                       => 'Szabadság és Táppénz',
'státusz_dátum'                 => date('Y.m.d. H:i'), // a modosítás dátuma
'dokumentum_típusa'             => $magyar_dok_tipus,  // Most már: tipus_szotar
'jelentkezés_forrása'           => adat($PROFIL, 'jelentkezes_forrasa'),
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
'tevékenység'                   =>  adat($PROFIL, 'tevekenyseg'),
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
'munkakezdés_dátuma'            => adat($PROFIL, 'munkakezdes_datuma'), // JAVÍTVA: Profilból jön!
'keltezés'                      => adat($PROFIL, 'keltezes'),
'időarányosan_számított_szabadságok_napja' => adat($PROFIL, 'idoaranyosan_szamitott_szabadsagok_napja'),
'kilepes_datuma_utolso_munkanap'           => adat($PROFIL, 'kilepes_datuma_utolso_munkanap'),
'torles_alatt_kilepes_plusz_40nap_LEJAR'   => adat($PROFIL, 'torles_alatt_kilepes_plusz_40nap_LEJAR'),
'járási_hivatal'                           => adat($PROFIL, 'jarasi_hivatal'),
/// ezek kerülnek szerkeztésre
'sz_tp_kezdet'                  => $sz_tp_kezdet, 
'sz_tp_végzet'                  => $sz_tp_vegzet,
'sz_tp_utáni_nap'               => $sz_tp_utani_nap,
'sz_tp_napok'                   => $sz_tp_napok,
];

// 7. MENTÉS AZ ADATBÁZISBA (SQL UPSERT - Javított: sz_tp_kezdet alapú azonosítás)

try {
    if (!isset($pdo)) { $pdo = csatlakozasSzerver2(); }
    
    // --- 1. KERESÉS (Azonosítás a KEZDŐ DÁTUM alapján) ---
    $keresett_op = $vegleges_adatbazis_sor['operátor_szám'];
    
    // MOST MÁR EZT FIGYELJÜK: Melyik napra szól a szabadság?
    $keresett_nap = $vegleges_adatbazis_sor['sz_tp_kezdet']; 
    
    // Azt kérdezzük az SQL-től: 
    // "Van már ennek az embernek bejegyzése, ahol a sz_tp_kezdet pont ez a nap?"
    // Használjuk a DATE() függvényt a biztonság kedvéért.
    $stmt_check = $pdo->prepare("SELECT id FROM m_va_adatbazis WHERE `operátor_szám` = ? AND DATE(`sz_tp_kezdet`) = DATE(?)");
    $stmt_check->execute([$keresett_op, $keresett_nap]);
    
    $existing_id = $stmt_check->fetchColumn();

    // --- 2. MENTÉS VAGY FRISSÍTÉS ---
    $sql = "";
    $values = [];

    if ($existing_id) {
        // --- UPDATE (Már van bejegyzés erre a napra -> Frissítés) ---
        $set_parts = [];
        foreach ($vegleges_adatbazis_sor as $col => $val) {
            if ($col === 'id') continue;
            $set_parts[] = "`$col` = ?";
            $values[] = $val;
        }
        $sql = "UPDATE `m_va_adatbazis` SET " . implode(", ", $set_parts) . " WHERE `id` = ?";
        $values[] = $existing_id;
        $muvelet_neve = "UPDATE (ID: $existing_id)";

    } else {
        // --- INSERT (Még nincs bejegyzés erre a napra -> Új sor) ---
        $cols = [];
        $placeholders = [];
        foreach ($vegleges_adatbazis_sor as $col => $val) {
            $cols[] = "`$col`";
            $placeholders[] = "?";
            $values[] = $val;
        }
        $sql = "INSERT INTO `m_va_adatbazis` (" . implode(", ", $cols) . ") VALUES (" . implode(", ", $placeholders) . ")";
        $muvelet_neve = "INSERT (Új sor)";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    $db_uzenet = "Sikeres SQL művelet: " . $muvelet_neve;

} catch (PDOException $e) {
    $db_uzenet = "SQL HIBA: " . $e->getMessage();
} catch (Exception $e) {
    $db_uzenet = "Általános hiba: " . $e->getMessage();
}

// 8. NAPLÓZÁS (Biztonsági mentés Log fájlba is)
$log_szoveg  = "==================================================\n";
$log_szoveg .= "IDŐPONT: " . date('Y-m-d H:i:s') . "\n";
$log_szoveg .= "AZONOSÍTÁS: " . $log_uzenet . " (User ID: $cel_user_id)\n";
$log_szoveg .= "ADATBÁZIS: " . $db_uzenet . "\n"; // Itt látod, hogy sikerült-e
$log_szoveg .= "ADATSOR:\n";
$log_szoveg .= print_r($vegleges_adatbazis_sor, true);
$log_szoveg .= "==================================================\n\n";

$logFajl = $_SERVER['DOCUMENT_ROOT'] . '/Iroda/logok/munkaido_mentes.log';
if (!is_dir(dirname($logFajl))) { @mkdir(dirname($logFajl), 0777, true); }
@file_put_contents($logFajl, $log_szoveg, FILE_APPEND | LOCK_EX);

// 9. VÁLASZ KÜLDÉSE
echo json_encode([
    'status' => 'ok',
    'uzenet' => 'Mentve: ' . $muvelet_neve,
    'sql_info' => $db_uzenet,
    'debug_user' => $cel_user_id
]);
exit;
// 8. VÁLASZ KÜLDÉSE A BÖNGÉSZŐNEK
echo json_encode([
    'status' => 'ok',
    'uzenet' => 'Szerver: Adatok logolva. ' . $log_uzenet,
    'debug_user' => $cel_user_id
]);
exit;