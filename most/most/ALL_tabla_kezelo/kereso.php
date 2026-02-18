<?php
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] . '/Iroda/sql_config.php';
$pdo = csatlakozasSzerver1();

// Előzőleg mentett értékek (ha vannak)
$eredetiMezo1 = $_SESSION['eredeti_mezo1'] ?? null;
$eredetiMezo2 = $_SESSION['eredeti_mezo2'] ?? null;

// Most beérkező értékek
$ujMezo1 = $_POST['mezo1'] ?? '';
$ujMezo2 = $_POST['mezo2'] ?? '';

$talalat = false;
$hiba = '';

try {
    if (!empty($ujMezo1)) {
        // mező1 alapján keresünk
        $stmt = $pdo->prepare("SELECT * FROM all_tabla WHERE vonalkod = :ertek LIMIT 1");
        $stmt->execute(['ertek' => $ujMezo1]);
        $talalat = $stmt->fetch(PDO::FETCH_ASSOC);
        $_SESSION['eredeti_mezo1'] = $ujMezo1;
        $_SESSION['eredeti_mezo2'] = ''; // ürítjük, hogy új kereséskor tiszta legyen
    } elseif (!empty($ujMezo2)) {
        // mező2 alapján keresünk
        $stmt = $pdo->prepare("SELECT * FROM all_tabla WHERE szerz_azon = :ertek LIMIT 1");
        $stmt->execute(['ertek' => $ujMezo2]);
        $talalat = $stmt->fetch(PDO::FETCH_ASSOC);
        $_SESSION['eredeti_mezo2'] = $ujMezo2;
        $_SESSION['eredeti_mezo1'] = '';
    } else {
        $hiba = "Legalább egy mezőt ki kell tölteni a kereséshez!";
    }

    if ($talalat) {
        $_SESSION['keresett_adat'] = $talalat;
        header("Location: all_tabla_kezelo.php");
        exit;
    } elseif (!$hiba) {
        $hiba = "Nincs találat a megadott adatokra.";
    }

} catch (PDOException $e) {
    $hiba = "Adatbázis hiba: " . $e->getMessage();
}

// Hiba esetén vissza és popup
echo "<script>
  alert('ℹ️ " . addslashes($hiba) . "');
  window.location.href = 'all_tabla_kezelo.php';
</script>";
exit;
