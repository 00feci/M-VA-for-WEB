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


// 1. Behúzzuk a felületi gombot
include __DIR__ . '/munkanapok_popup.html';
// 2. Később ide jönnek a Popup HTML-ek és a JS fájlok include-jai
 include __DIR__ . '/Munkanap tipusa/popup_munkanap_tipusa_vezer.php';
include __DIR__ . '/munkanapok_popup_kod_szin.html'; 


// JS Fájlok betöltése
$scriptPath = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup.js';
echo "<script src='{$scriptPath}?v=" . time() . "'></script>";

$scriptPath = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup_mentes.js';
echo "<script src='{$scriptPath}?v=" . time() . "'></script>";

$scriptPath = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup_torles.js';
echo "<script src='{$scriptPath}?v=" . time() . "'></script>";

$scriptKodik = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup_kod_szin.js';
echo "<script src='{$scriptKodik}?v=" . time() . "'></script>";

$scriptFajlok = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup_sablon_fajlok_listaja.js';
echo "<script src='{$scriptFajlok}?v=" . time() . "'></script>";

$scriptKodik = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup_kod_szin.js';
echo "<script src='{$scriptKodik}?v=" . time() . "'></script>";

$scriptFajlok = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup_sablon_fajlok_listaja.js';
echo "<script src='{$scriptFajlok}?v=" . time() . "'></script>";

$scriptAdat = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup_sql_rekord.js';
echo "<script src='{$scriptAdat}?v=" . time() . "'></script>";


// popup váz
?> 
 </div>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
               <div style="display: flex; gap: 10px;">
                    <?php include __DIR__ . '/munkanapok_popup_mentes.html'; ?>
                    <?php include __DIR__ . '/Sablon feltöltése/popup_sablon_feltoltese_vezer.php'; ?>
                </div>
               <div style="display: flex; gap: 10px;">
                    <?php include __DIR__ . '/munkanapok_popup_torles.html'; ?>
                   <?php include __DIR__ . '/Sablon kezelése/popup_sablon_kezelese_vezer.php'; ?>
                </div>
                 <?php include __DIR__ . '/munkanapok_popup_sql_rekord.html'; ?>
                  <?php include __DIR__ . '/munkanapok_popup_bezaras.html'; ?>
                </div>
            </div>
        </div>
          <?php include __DIR__ . '/munkanapok_popup_sablon_fajlok_listaja.html'; ?>
    </div>
</div>
