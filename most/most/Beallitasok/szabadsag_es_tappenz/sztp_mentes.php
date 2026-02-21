<?php

// sztp_mentes.php teteje
require_once __DIR__ . '/../../jogosultsag.php'; // a megfelelő relatív útvonallal

// Ellenőrizzük a 'Szabadsag_es_tappenz' oszlopot! A MÁSODIK PARAMÉTER TRUE! 
// Ez mondja meg neki, hogy dobjon JSON hibaüzenetet átirányítás helyett!
ellenorizJogosultsag('Szabadság_és_Táppénz_kezelő', true);

// ... innentől jöhet a mentési kódod ...
$pdo = csatlakozasSzerver1();

// Adatok fogadása (most már JSON formátumban, mert a Fetch API-val így küldjük)
$data = json_decode(file_get_contents('php://input'), true);
$id = !empty($data['id']) ? intval($data['id']) : null;
$megnevezes = $data['megnevezes'] ?? '';

if (empty($megnevezes)) {
    echo json_encode(['success' => false, 'message' => 'A megnevezés kötelező!']);
    exit;
}

// ✨ DINAMIKUS SQL ÉPÍTŐ
$update_mezok = [];
$insert_oszlopok = [];
$insert_ertekek = [];
$params = [];

foreach ($data as $kulcs => $ertek) {
    if ($kulcs === 'id') continue; // Az ID-t nem frissítjük be oszlopként
    
    // Ha az adat tömb vagy objektum (pl. extra_adatok), biztonságosan JSON formátummá alakítjuk
    if (is_array($ertek) || is_object($ertek)) {
        $ertek = json_encode($ertek);
    }
    
    // SQL darabkák összerakása
    $update_mezok[] = "`$kulcs` = :$kulcs";
    $insert_oszlopok[] = "`$kulcs`";
    $insert_ertekek[] = ":$kulcs";
    $params[$kulcs] = $ertek; // Be a biztonságos paraméter tömbbe
}

try {
    // ✨ Védelem: Létezik-e már rekord ezzel a megnevezéssel?
    $stmt_check = $pdo->prepare("SELECT id FROM szabadsag_es_tappenz_beallitasok WHERE megnevezes = :m");
    $stmt_check->execute(['m' => $megnevezes]);
    $existing_id = $stmt_check->fetchColumn();

    if ($id || $existing_id) {
        // UPDATE DINAMIKUSAN
        $final_id = $id ?: $existing_id;
        $params['final_id_param'] = $final_id; // +1 paraméter a WHERE feltételhez
        
        $set_szoveg = implode(', ', $update_mezok);
        $sql = "UPDATE szabadsag_es_tappenz_beallitasok SET $set_szoveg WHERE id = :final_id_param";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $id = $final_id;
    } else {
        // INSERT DINAMIKUSAN
        $oszlop_szoveg = implode(', ', $insert_oszlopok);
        $ertek_szoveg = implode(', ', $insert_ertekek);
        $sql = "INSERT INTO szabadsag_es_tappenz_beallitasok ($oszlop_szoveg) VALUES ($ertek_szoveg)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $id = $pdo->lastInsertId();
    }    
    echo json_encode(['success' => true, 'message' => 'Sikeres mentés!', 'id' => $id]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Adatbázis hiba: ' . $e->getMessage()]);
}
