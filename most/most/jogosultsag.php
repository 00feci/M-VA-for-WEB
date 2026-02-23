<?php
// jogosultsag.php - Központi jogosultság ellenőrző

function ellenorizJogosultsag($szuksegesModul) {
    // ✨ 1. AUTOMATIKUS FELISMERÉS: JavaScript (fetch) hívta, vagy sima oldal?
    $isAjax = false;
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) { $isAjax = true; }
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) { $isAjax = true; }
    if (isset($_SERVER['HTTP_SEC_FETCH_MODE']) && $_SERVER['HTTP_SEC_FETCH_MODE'] === 'cors') { $isAjax = true; }

    // 2. Session ellenőrzése (ha még nincs elindítva)
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 3. Felhasználónév lekérése
    $felhasznalo = $_SESSION['felhasznalo'] ?? '';
    
    if (empty($felhasznalo)) {
        jogosultsagMegtagadva($isAjax);
    }

    // 4. Adatbázis kapcsolat
    require_once $_SERVER['DOCUMENT_ROOT'] .'/Iroda/sql_config.php';
    $pdo = csatlakozasSzerver1();

    // 5. Jogosultság lekérdezése
    $stmt = $pdo->prepare("SELECT * FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
    $stmt->execute(['nev' => $felhasznalo]);
    $adat = $stmt->fetch(PDO::FETCH_ASSOC);

    // 6. Van-e ilyen oszlop, és 'OK'-e az értéke?
    if (!$adat || !array_key_exists($szuksegesModul, $adat) || $adat[$szuksegesModul] !== 'OK') {
        jogosultsagMegtagadva($isAjax);
    }
}

// Segédfüggvény: Mi történjen, ha nincs jog?
function jogosultsagMegtagadva($isAjax) {
    if ($isAjax) {
        // Ha háttérben futó JS hívta meg (fetch), ne HTML-t, hanem JSON hibát adjunk vissza!
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false, 
            'error'   => 'Nincs jogosultságod ehhez a művelethez!',
            'hiba'    => 'Nincs jogosultságod ehhez a művelethez!',
            'uzenet'  => 'Nincs jogosultságod ehhez a művelethez!',
            'message' => 'Nincs jogosultságod ehhez a művelethez!' // Ezt a sort adtuk hozzá!
        ]);
        exit;
    } else {
        // Ha a böngészőből nyitotta meg simán az oldalt, irányítsuk át!
        header("Location: /Iroda/belepes.php?hiba=jogosultsag");
        exit;
    }
}
?>
