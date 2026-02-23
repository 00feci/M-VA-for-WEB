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
<div style="display: flex; gap: 10px;">
                    <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; background: #252525; padding: 8px 12px; border-radius: 8px; border: 1px solid #444;">
                        <label style="font-size: 0.75em; color: #aaa; font-weight: bold;">Dokumentum?</label>
                        <select id="sztp_sql_rekord" style="padding: 4px; background: #121212; border: 1px solid #333; color: white; border-radius: 4px; cursor: pointer; font-size: 0.85em;">
                            <option value="nem">Nem</option>
                            <option value="igen">Igen</option>
                        </select>
                    </div>
