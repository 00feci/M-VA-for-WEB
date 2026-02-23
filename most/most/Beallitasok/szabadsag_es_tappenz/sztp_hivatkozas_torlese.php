<?php
// --- JOGOSULTSÁG ELLENŐRZÉSE ---
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
// 1. Biztosítjuk, hogy a Session fusson, mielőtt kiolvassuk a verziót
if (session_status() === PHP_SESSION_NONE) { session_start(); }

// 2. Összerakjuk a dinamikus, "telepítési" útvonalat
$verzio = $_SESSION['verzio'] ?? ''; // Ha valamiért üres lenne, ne dőljön össze
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/eles_verziok/' . $verzio . '/jogosultsag.php';
// 3. Ellenőrzés
ellenorizJogosultsag('Beállítások'); // Csak ezt a szót kell átírni!

header('Content-Type: application/json');
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
try {
    $pdo = csatlakozasSzerver1();
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("SELECT extra_adatok FROM szabadsag_es_tappenz_beallitasok WHERE megnevezes = 'RENDSZER_HIVATKOZASOK'");
    $stmt->execute();
    $sor = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($sor) {
        $lista = json_decode($sor['extra_adatok'], true);
        // ID alapján kiszűrjük az elemet
        $ujLista = array_values(array_filter($lista, function($i) use ($data) { return $i['id'] != $data['id']; }));
        
        $stmt = $pdo->prepare("UPDATE szabadsag_es_tappenz_beallitasok SET extra_adatok = ? WHERE megnevezes = 'RENDSZER_HIVATKOZASOK'");
        $stmt->execute([json_encode($ujLista, JSON_UNESCAPED_UNICODE)]);
        echo json_encode(['success' => true, 'message' => 'Hivatkozás törölve!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nem található rekord a törléshez.']);
    }
} catch (Exception $e) { echo json_encode(['success' => false, 'message' => $e->getMessage()]); }
?>
