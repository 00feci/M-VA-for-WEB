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
    $pdo = csatlakozasSzerver2(); // ðŸ‘ˆ csatlakozasSzerver2 hasznÃ¡lata
    // SzÅ±rÃ©s a 'SzabadsÃ¡g Ã©s TÃ¡ppÃ©nz' stÃ¡tuszra a legfrissebb dÃ¡tum szerint
    $stmt = $pdo->query("SELECT * FROM m_va_adatbazis WHERE stÃ¡tusz = 'SzabadsÃ¡g Ã©s TÃ¡ppÃ©nz' ORDER BY stÃ¡tusz_dÃ¡tum DESC LIMIT 1");
    $adat = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($adat) {
        echo json_encode(['success' => true, 'adat' => $adat]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nem talÃ¡lhatÃ³ rekord az adatbÃ¡zisban.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
