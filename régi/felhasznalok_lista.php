<?php
// felhasznalok_lista.php
// JSON lista a Munkaidő modulhoz:
// [
//   { "op_szam": "0001", "nev": "Vezetéknév Keresztnév", "ceg": "A" },
//   ...
// ]

require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';

header('Content-Type: application/json; charset=utf-8');

$lista = [];

// Összes WP user (Ultimate Member felhasználók is)
$users = get_users([
    'number' => -1,        // minden user
    'fields' => ['ID','user_login'],
]);

foreach ($users as $user) {
    $user_id   = $user->ID;
    $op_szam   = $user->user_login; // Operátor szám
    $vezetek   = get_user_meta($user_id, 'first_name', true);
    $kereszt   = get_user_meta($user_id, 'last_name', true);
    $ceg       = get_user_meta($user_id, 'foglalkoztato_ceg', true);

    $nev = trim($vezetek . ' ' . $kereszt);

    // Ha nincs név kitöltve, legalább az OP szám jelenjen meg
    if ($nev === '') {
        $nev = $op_szam;
    }

    $lista[] = [
        'op_szam' => $op_szam,
        'nev'     => $nev,
        'ceg'     => $ceg,
    ];
}

// Rendezés név szerint (nem kötelező, csak átláthatóbb)
usort($lista, function ($a, $b) {
    return strcasecmp($a['nev'], $b['nev']);
});

echo json_encode($lista, JSON_UNESCAPED_UNICODE);
exit;
