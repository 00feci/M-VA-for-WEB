<?php
// Segédfüggvény (itt definiáljuk, hogy mindenhol elérhető legyen)
if (!function_exists('adat')) {
    function adat($tomb, $kulcs) {
        return isset($tomb[$kulcs]) ? trim($tomb[$kulcs]) : '';
    }
}

function getTablaTerkepe($tablaNev) {
    $terkepek = [
        'm_va_adatbazis' => [
    'státusz'                       => 'statusz',
    'státusz_dátum'                 => 'statusz_datum',
    'dokumentum_típusa'             => 'dokumentum_tipusa',
    'jelentkezés_forrása'           => 'jelentkezes_forrasa',
    'jelentkezés_forrása1'          => 'jelentkezes_forrasa1',
    'jelentkezés_bérigény'          => 'jelentkezes_berigeny',
    'jelentkezés_mire_hova_jelentkezett'    => 'jelentkezes_mire_hova_jelentkezett',
    'jelentkezés_cv'                => 'jelentkezes_cv',
    'jelentkezés_mmk'               => 'jelentkezes_mmk',
    'jelentkezés_vegzettseg'        => 'jelentkezes_vegzettseg',
    'jelentkezés_mikor_tud_kezdeni' => 'jelentkezes_mikor_tud_kezdeni',
    'jelentkezés_vállalt_óraszám'   => 'jelentkezes_vallalt_oraszam',
    'üzenet'                        => 'uzenet',
    'operátor_szám'                 => 'nickname',
    'foglalkoztató_cég'             => 'foglalkoztato_ceg',
    'foglalkoztató_cég_email'       => 'foglalkoztato_ceg_email',
    'tevékenység'                   => 'tevekenyseg',
    'napi_munka_idő'                => 'napi_munka_ido',
    'bérezés'                       => 'berezes',
    'munkaidő'                      => 'munkaido',
    'munkavégzés_helyének_típusa'   => 'munkavegzes_helyenek_tipusa',
    'vezetéknév'                    => 'last_name',
    'keresztnév'                    => 'first_name',
    'születési_név'                 => 'szuletesi_nev',
    'állandó_cím'                   => 'allando_cim',
    'levelezési_cím'                => 'levelezesi_cim',
    'levelezési_cím_település'      => 'levelezesi_cim_telepules',
    'születési_hely'                => 'szuletesi_hely',
    'születési_idő'                 => 'szuletesi_ido',
    'anyja_neve'                    => 'anyja_neve',
    'személyi_igazolvány'           => 'szemelyi_igazolvany',
    'taj_szám'                      => 'taj_szam',
    'adó_azonosító_jel'             => 'ado_azonosito_jel',
    'telefonszám'                   => 'telefonszam',
    'email_cím'                     => 'wp_email',
    'bankszámlaszám'                => 'bankszamlaszam',
    'számlatulajdonos_neve'         => 'szamlatulajdonos_neve',
    'bank_neve'                     => 'bank_neve',
    'skype'                         => 'skype',
    'munkakezdés_dátuma'            => 'munkakezdes_datuma',
    'keltezés'                      => 'keltezes',
    'időarányosan_számított_szabadságok_napja' => 'idoaranyosan_szamitott_szabadsagok_napja',
    'kilepes_datuma_utolso_munkanap'           => 'kilepes_datuma_utolso_munkanap',
    'torles_alatt_kilepes_plusz_40nap_LEJAR'   => 'torles_alatt_kilepes_plusz_40nap_LEJAR',
    'járási_hivatal'                           => 'jarasi_hivatal',
    'sz_tp_kezdet'                  => 'sz_tp_kezdet',
    'sz_tp_végzet'                  => 'sz_tp_vegzet',
    'sz_tp_utáni_nap'               => 'sz_tp_utani_nap',
    'sz_tp_napok'                   => 'sz_tp_napok',

   ],
        // Ide később felvehetsz más táblákat is
        'masik_tabla' => [ 'oszlop' => 'meta_kulcs' ]
    ];
    return $terkepek[$tablaNev] ?? [];
}

/**
 * INTELLIGENS ÖSSZEFŰZŐ: Eldönti a prioritást.
 */
function keszitsMentendoSort($tablaNev, $profil, $egyediAdatok) {
    $terkep = getTablaTerkepe($tablaNev);
    $veglegesSor = [];

    foreach ($terkep as $oszlop => $metaKulcs) {
        // 1. Ha a PHP-ból kaptunk egyedi adatot, az az erősebb
        if (array_key_exists($oszlop, $egyediAdatok)) {
            $veglegesSor[$oszlop] = $egyediAdatok[$oszlop];
        } 
        // 2. Ha van meta-kulcs megadva, keressük a profilban
        elseif (!empty($metaKulcs)) {
            if ($oszlop === 'vezetéknév') {
                $veglegesSor[$oszlop] = adat($profil, 'last_name') ?: adat($profil, 'wp_last_name');
            } elseif ($oszlop === 'keresztnév') {
                $veglegesSor[$oszlop] = adat($profil, 'first_name') ?: adat($profil, 'wp_first_name');
            } else {
                $veglegesSor[$oszlop] = adat($profil, $metaKulcs);
            }
        } 
        // 3. Egyébként marad üres, hogy ne legyen SQL hiba
        else {
            $veglegesSor[$oszlop] = '';
        }
    }
    return $veglegesSor;
}

/**
 * UNIVERZÁLIS MENTŐ: Bármilyen szerverhez (PDO) jó.
 */
function intelligensMentes($pdo, $tablaNev, $adatSor) {
    $oszlopok = array_keys($adatSor);
    $cols = implode("`, `", $oszlopok);
    $placeholders = implode(", ", array_fill(0, count($adatSor), "?"));
    
    $updateResz = [];
    foreach ($oszlopok as $k) {
        $updateResz[] = "`$k` = VALUES(`$k`)";
    }
    
    $sql = "INSERT INTO `$tablaNev` (`$cols`) VALUES ($placeholders) 
            ON DUPLICATE KEY UPDATE " . implode(", ", $updateResz);

    return $pdo->prepare($sql)->execute(array_values($adatSor));
}