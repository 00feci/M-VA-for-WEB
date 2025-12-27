<?php
function getTablaTerkepe($tablaNev) {
    $terkepek = [
        'm_va_adatbazis' => [
    'státusz'                       => adat($PROFIL, 'statusz'),
    'státusz_dátum'                 => adat($PROFIL, 'statusz_datum'),
    'dokumentum_típusa'             => adat($PROFIL, 'dokumentum_tipusa'),
    'jelentkezés_forrása'           => adat($PROFIL, 'jelentkezes_forrasa'),
    'jelentkezés_forrása1'          => adat($PROFIL, 'jelentkezes_forrasa1'),
    'jelentkezés_bérigény'          => adat($PROFIL, 'jelentkezes_berigeny'),
    'jelentkezés_mire_hova_jelentkezett'    => adat($PROFIL, 'jelentkezes_mire_hova_jelentkezett'),
    'jelentkezés_cv'                => adat($PROFIL, 'jelentkezes_cv'),
    'jelentkezés_mmk'               => adat($PROFIL, 'jelentkezes_mmk'),
    'jelentkezés_vegzettseg'        => adat($PROFIL, 'jelentkezes_vegzettseg'),
    'jelentkezés_mikor_tud_kezdeni' => adat($PROFIL, 'jelentkezes_mikor_tud_kezdeni'),
    'jelentkezés_vállalt_óraszám'   => adat($PROFIL, 'jelentkezes_vallalt_oraszam'),
    'üzenet'                        => adat($PROFIL, 'uzenet'),
    'operátor_szám'                 => adat($PROFIL, 'nickname'),
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
    'sz_tp_kezdet'                  => adat($PROFIL, 'sz_tp_kezdet'),
    'sz_tp_végzet'                  => adat($PROFIL, 'sz_tp_vegzet'),
    'sz_tp_utáni_nap'               => adat($PROFIL, 'sz_tp_utani_nap'),
    'sz_tp_napok'                   => adat($PROFIL, 'sz_tp_napok'),

   ],
        // Ide később felvehetsz más táblákat is
        'masik_tabla' => [ 'oszlop' => 'meta_kulcs' ]
    ];
    return $terkepek[$tablaNev] ?? [];
}

/**
 * Összefésüli a profiladatokat az egyedi adatokkal.
 */
function keszitsMentendoSort($tablaNev, $profil, $egyediAdatok) {
    $terkep = getTablaTerkepe($tablaNev);
    $veglegesSor = [];

    foreach ($terkep as $oszlop => $metaKulcs) {
        // 1. Megnézzük, kaptunk-e egyedi adatot (pl. új dátumot)
        if (array_key_exists($oszlop, $egyediAdatok)) {
            $veglegesSor[$oszlop] = $egyediAdatok[$oszlop];
        } 
        // 2. Ha nincs egyedi, megpróbáljuk a profilból kinyerni
        elseif ($metaKulcs !== 'fixed') {
            // Speciális kezelés WP nevekre
            if ($oszlop === 'vezetéknév') $veglegesSor[$oszlop] = $profil['last_name'] ?? ($profil['wp_last_name'] ?? '');
            elseif ($oszlop === 'keresztnév') $veglegesSor[$oszlop] = $profil['first_name'] ?? ($profil['wp_first_name'] ?? '');
            else $veglegesSor[$oszlop] = $profil[$metaKulcs] ?? '';
        }
        // 3. Ha fixed és nincs megadva, marad az üres (hogy ne legyen 1364 hiba)
        else {
            $veglegesSor[$oszlop] = '';
        }
    }
    return $veglegesSor;
}

/**
 * Kezeli a szerver csatlakozást és a mentést.
 */
function intelligensMentes($pdo, $tablaNev, $adatSor) {
    $oszlopok = array_keys($adatSor);
    $cols = implode("`, `", $oszlopok);
    $placeholders = implode(", ", array_fill(0, count($adatSor), "?"));
    
    // Az UPDATE rész összeállítása ciklussal a fn() helyett
    $updateResz = [];
    foreach ($oszlopok as $k) {
        $updateResz[] = "`$k` = VALUES(`$k`)";
    }
    $updateSql = implode(", ", $updateResz);
    
    $sql = "INSERT INTO `$tablaNev` (`$cols`) VALUES ($placeholders) 
            ON DUPLICATE KEY UPDATE $updateSql";

    return $pdo->prepare($sql)->execute(array_values($adatSor));
}