<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['kijelentkezes'])) {
    session_unset();    // Összes session változó törlése
    session_destroy();  // Session megsemmisítése
    header("Location: /Iroda/belepes.php"); // Vissza a belépő oldalra
    exit;
}

// 📦 Betöltjük az adatbázis kapcsolatot
require_once __DIR__ . '/../../sql_config.php';
$pdo = csatlakozasSzerver1(); // <- ez hozza létre a $pdo-t

// 🛡️ Felhasználó jogosultság újraellenőrzése (friss adatbázisból)
$felhasznalo = $_SESSION['felhasznalo'] ?? '';
$stmt = $pdo->prepare("SELECT * FROM m_va_felhasznalok WHERE `felhasználónév` = :nev");
$stmt->execute(['nev' => $felhasznalo]);
$adat = $stmt->fetch(PDO::FETCH_ASSOC);

// Ha nincs jog, visszadobjuk a belépő oldalra
if ($adat['m-va'] !== 'OK') {
    header("Location: /Iroda/belepes.php?hiba=jogosultsag");
    exit;
}

// innen mehet tovább a m-va.php tartalma...

?>
<!DOCTYPE html> <!-- Ez jelzi a böngészőnek, hogy ez egy modern, HTML5 dokumentum -->
<html lang="hu"> <!-- Megmondja a böngészőnek és keresőknek, hogy az oldal nyelve magyar -->
<head>
  <meta charset="UTF-8"> <!-- Karakterkódolás -->
  <title>M-VA</title> <!-- Böngésző fülön megjelenő cím -->
  <link rel="icon" type="image/png" href="/Iroda/Marika-min.png"> <!-- Favicon -->
</head>
<body>

<h1>Üdvözlöm, <?= htmlspecialchars($adat['név']) ?>!</h1>

<!-- Itt kezdődik a tartalom -->
 <style>

 h1 {
            text-align: center; /* Középre igazítás */
            font-family: Arial, sans-serif; /* Betűtípus egységesítése */
    }


      body {               /* Az egész oldalra hat */
    background-color: black; /* Fekete háttér */
    color: white;            /* Alapértelmezett szövegszín legyen fehér */
}

form {
    max-width: 400px; /* Max szélesség, nagy képernyőn se legyen túl széles */
    margin: 20px auto; /* Középre igazítás és felül-alul margó */
    padding: 30px; /*Belső margó*/
    border: 1px solid #ccc; /*Keret vastakság és # szinkód*/
    border-radius: 100px;/*Sarkok kerekitése*/
    font-family: Arial, sans-serif;/*Betütipus és sans-serif (talpatlan) betűtípust.*/
    background-color: #222;  /*Sötét háttér a formnak */
    display: flex; /* Flexbox */
    flex-direction: column; /* Egymás alá rendezés */
    align-items: center; /* Tartalom középre igazítása */
}

.gomb {
  width: 254px;
  height: 52px;
  font-family: 'Segoe UI', sans-serif;
  font-size: 18pt;
  color: white;
  border: none;
  border-radius: 8px;
  margin: 10px;
}

.gomb_tomeges_de_egyedi_email {
  width: 250px;
  height: 66px;
  font-family: 'Segoe UI', sans-serif;
  font-size: 18pt;
  color: white;
  border: none;
  border-radius: 8px;
  margin: 10px;
}

.zold {
  background-color: lightgreen;
  cursor: pointer;
  opacity: 1;
}

.piros {
  background-color: darkred;
  cursor: not-allowed;
  opacity: 0.6;
}
  </style>


<?php
// Jogosultságok friss lekérdezés után:
$jog1 = $adat['Szerződés'] ?? 'NINCS';         // Gomb1 jogosultsága
$jog2 = $adat['Szabadság_és_Táppénz_kezelő'] ?? 'NINCS';     
$jog3 = $adat['ALL_tábla_betöltő'] ?? 'NINCS';       
$jog4 = $adat['ALL_tábla_kezelő'] ?? 'NINCS';    
$jog5 = $adat['Toborzás'] ?? 'NINCS';     
$jog6 = $adat['Hóvégi_zárás'] ?? 'NINCS';       
$jog7 = $adat['Tömeges_de_egyedi_e-mail'] ?? 'NINCS';     
?>
<form method="POST" enctype="multipart/form-data" action="gomb_kilk.php">

<button type="submit" name="funkcio" value="Szerződés"
    class="gomb <?= $jog1 === 'OK' ? 'zold' : 'piros' ?>"
    <?= $jog1 !== 'OK' ? 'disabled' : '' ?>>
    <?= $jog1 === 'OK' ? 'Szerződés kezelő' : 'Nincs hozzáférés' ?>
  </button>

<button type="submit" name="funkcio" value="Szabadság_és_Táppénz_kezelő"
    class="gomb <?= $jog2 === 'OK' ? 'zold' : 'piros' ?>"
    <?= $jog2 !== 'OK' ? 'disabled' : '' ?>>
    <?= $jog2 === 'OK' ? 'SZ és TP kezelő' : 'Nincs hozzáférés' ?>
  </button>

<button type="button" name="funkcio" 
    class="gomb <?= $jog3 === 'OK' ? 'zold' : 'piros' ?>"
    <?= $jog3 !== 'OK' ? 'disabled' : '' ?>
    onclick="funkcio2Inditasa(this)">
    <?= $jog3 === 'OK' ? 'ALL tábla betöltő' : 'Nincs hozzáférés' ?>
    
</button>

  <button type="submit" name="funkcio" value="ALL_tábla_kezelő"
    class="gomb <?= $jog4 === 'OK' ? 'zold' : 'piros' ?>"
    <?= $jog4 !== 'OK' ? 'disabled' : '' ?>>
    <?= $jog4 === 'OK' ? 'ALL tábla kezelő' : 'Nincs hozzáférés' ?>
  </button>

  <button type="submit" name="funkcio" value="Toborzás"
    class="gomb <?= $jog5 === 'OK' ? 'zold' : 'piros' ?>"
    <?= $jog5 !== 'OK' ? 'disabled' : '' ?>>
    <?= $jog5 === 'OK' ? 'Toborzás' : 'Nincs hozzáférés' ?>
  </button>

  <button type="submit" name="funkcio" value="Hóvégi_zárás"
    class="gomb <?= $jog6 === 'OK' ? 'zold' : 'piros' ?>"
    <?= $jog6 !== 'OK' ? 'disabled' : '' ?>>
    <?= $jog6 === 'OK' ? 'Hóvégi zárás' : 'Nincs hozzáférés' ?>
  </button>

  <button type="submit" name="funkcio" value="Tömeges_de_egyedi_e-mail"
    class="gomb_tomeges_de_egyedi_email <?= $jog7 === 'OK' ? 'zold' : 'piros' ?>"
    <?= $jog7 !== 'OK' ? 'disabled' : '' ?>>
    <?= $jog7 === 'OK' ? 'Tömeges,  de egyedi e-mail' : 'Nincs hozzáférés' ?>
  </button>


  <input type="file" id="fajl" name="fajl" style="display:none" accept=".txt" onchange="fajlBekuldes()">
  <input type="file" id="fajl" name="fajl" accept=".txt" style="display: none">
<!--  input type="file" változtatás -->
  <input type="file" id="fajl" name="fajl" accept=".txt"
       style="display: none"
       onchange="fajlBekuldes(document.querySelector('button[name=funkcio]'))">
<!--  input type="file" változtatás -->
  
</form>


<form method="POST">
  <button type="submit" name="kijelentkezes">Kijelentkezés</button>
</form>

<!-- ALL_tábla_betöltő  -->
<script>
function funkcio2Inditasa(gomb) {
  const form = gomb.closest("form");
  const fileInput = document.getElementById("fajl");

  // Gomb visszaállítás
  fileInput.value = "";

  fileInput.onchange = function () {
    const file = fileInput.files[0];
    if (!file) return;

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("fajl", file);

    // ⏳ Gomb felirat: Feldolgozás... %
    gomb.disabled = true;
    gomb.textContent = "Feldolgozás... 0%";

    xhr.upload.addEventListener("progress", function (e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        gomb.textContent = `Feldolgozás... ${percent}%`;
      }
    });

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        gomb.disabled = false;
        try {
          const res = JSON.parse(xhr.responseText);
         if (res.status === "ok") {
    gomb.textContent = "✔️ Kész";
    alert("✅ " + res.uzenet);
          } else {
            gomb.textContent = "❌ Hiba";
            alert("❌ " + res.uzenet);
          }
        } catch (e) {
          gomb.textContent = "❌ Hiba";
          alert("❌ Hibás válasz vagy kapcsolat.");
        }

        // Gomb visszaállítása
        setTimeout(() => {
          gomb.textContent = "ALL tábla betöltő";
        }, 2000);
      }
    };

    xhr.open("POST", "ALL_tabla_betolto/ALL_tabla_betolto.php", true);
    xhr.send(formData);
  };

  fileInput.click();
}
</script>
<!-- ALL_tábla_betöltő  -->

</body>
</html>