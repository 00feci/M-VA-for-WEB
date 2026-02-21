<?php
// jogosultsag.php - Központi jogosultság ellenőrző

function ellenorizJogosultsag($szuksegesModul, $isAjax = false) {
    // 1. Session ellenőrzése (ha még nincs elindítva, bárhol is vagyunk)
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 2. Felhasználónév lekérése
    $felhasznalo = $_SESSION['felhasznalo'] ?? '';
    
    if (empty($felhasznalo)) {
        jogosultsagMegtagadva($isAjax);
    }

    // 3. Adatbázis kapcsolat (Feltételezem, hogy itt be tudod húzni az sql_config.php-t)
    // Ha nem innen húzod be, akkor a pdo-t globálisként kell átadni
    require_once $_SERVER['DOCUMENT_ROOT'] .'/Iroda/sql_config.php';
    $pdo = csatlakozasSzerver1();

    // 4. Jogosultság lekérdezése
    $stmt = $pdo->prepare("SELECT * FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
    $stmt->execute(['nev' => $felhasznalo]);
    $adat = $stmt->fetch(PDO::FETCH_ASSOC);

    // 5. Van-e ilyen oszlop, és 'OK'-e az értéke?
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
            'error' => 'Nincs jogosultságod ehhez a művelethez!'
        ]);
        exit;
    } else {
        // Ha a böngészőből nyitotta meg simán az oldalt, irányítsuk át!
        header("Location: /Iroda/belepes.php?hiba=jogosultsag");
        exit;
    }
}
?>
