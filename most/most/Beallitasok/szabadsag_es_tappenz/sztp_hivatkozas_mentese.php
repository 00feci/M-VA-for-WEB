<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
require_once __DIR__.'/../../jogosultsag.php';
ellenorizJogosultsag('Beállítások');
// -------------------------------

header('Content-Type: application/json');
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
try {
    $pdo = csatlakozasSzerver1(); // A beállítások a szerver1-en vannak
    $data = json_decode(file_get_contents('php://input'), true);

    // Lekérjük a globális hivatkozásokat tároló rekordot
    $stmt = $pdo->prepare("SELECT extra_adatok FROM szabadsag_es_tappenz_beallitasok WHERE megnevezes = 'RENDSZER_HIVATKOZASOK'");
    $stmt->execute();
    $sor = $stmt->fetch(PDO::FETCH_ASSOC);
    $lista = $sor ? json_decode($sor['extra_adatok'], true) : [];

    // Új elem hozzáadása (egyedi ID generálásával)
   // Új elem hozzáadása típus információval együtt
    $ujId = time();
    $lista[] = [
        'id' => $ujId, 
        'nev' => $data['nev'], 
        'oszlop' => $data['oszlop'], 
        'tipus' => $data['tipus'],
        'logika' => $data['logika'],
        'formatum' => $data['formatum'] // ➕ Formátum mentése
    ];
    $jsonLista = json_encode($lista, JSON_UNESCAPED_UNICODE);
    if ($sor) {
        $stmt = $pdo->prepare("UPDATE szabadsag_es_tappenz_beallitasok SET extra_adatok = ? WHERE megnevezes = 'RENDSZER_HIVATKOZASOK'");
        $stmt->execute([$jsonLista]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO szabadsag_es_tappenz_beallitasok (megnevezes, extra_adatok, kod, hex_szin) VALUES ('RENDSZER_HIVATKOZASOK', ?, 'SYSTEM', '#000000')");
        $stmt->execute([$jsonLista]);
    }

    echo json_encode(['success' => true, 'message' => 'Hivatkozás mentve az extra_adatokba!']);
} catch (Exception $e) { echo json_encode(['success' => false, 'message' => $e->getMessage()]); }
?>

