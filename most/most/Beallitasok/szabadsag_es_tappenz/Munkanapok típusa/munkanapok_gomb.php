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

?>
<div class="sztp-beallitas-kártya" style="margin-bottom: 1px; padding: 5px; border: 1px solid #ddd; border-radius: 8px; background-color: #363434;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h3 style="margin: 0 0 5px 0; color: #fffcfc;">Munkanapok típusa💼</h3>
            <p style="margin: 0; font-size: 13px; color: #fffcfc;">Itt állíthatod be a munkanapokhoz és naptípusokhoz tartozó szabályokat, színeket.</p>
        </div>
       <button id="btn-munkanap-tipus" type="button" onclick="fajtaBeallitasokMegnyitasa()"
            style="padding: 10px 15px; background-color: #674738; color: #ffffff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; transition: background 0.2s;">
            ⚙️ Beállítások megnyitása
        </button>
    </div>
</div>
