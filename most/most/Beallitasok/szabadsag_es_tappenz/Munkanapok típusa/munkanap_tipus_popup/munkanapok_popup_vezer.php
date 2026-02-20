<?php
// 1. Behúzzuk a felületi gombot
include __DIR__ . '/munkanapok_popup.php';
// 2. Később ide jönnek a Popup HTML-ek és a JS fájlok include-jai
include __DIR__ . '/munkanapok_popup_kod_szin.php'; 


// JS Fájlok betöltése
$scriptPath = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup.js';
echo "<script src='{$scriptPath}?v=" . time() . "'></script>"

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

$scriptAdat = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup_nagy_rekord.js';
echo "<script src='{$scriptAdat}?v=" . time() . "'></script>";

$scriptAdat = 'Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/munkanapok_popup_adatok.js';
echo "<script src='{$scriptAdat}?v=" . time() . "'></script>";

// popup váz
?> 
 </div>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
               <div style="display: flex; gap: 10px;">
                    <?php include __DIR__ . '/munkanapok_popup_mentes.php'; ?>
                    <?php include __DIR__ . '/Sablon feltöltése/popup_sablon_feltoltese_vezer.php'; ?>
                </div>
               <div style="display: flex; gap: 10px;">
                    <?php include __DIR__ . '/munkanapok_popup_torles.php'; ?>
                   <?php include __DIR__ . '/Sablon kezelése/popup_sablon_kezelese_vezer.php'; ?>
                </div>
                 <?php include __DIR__ . '/munkanapok_popup_nagy_rekord.php'; ?>
                  <?php include __DIR__ . '/munkanapok_popup_bezaras.php'; ?>
                </div>
            </div>
        </div>
          <?php include __DIR__ . '/munkanapok_popup_sablon_fajlok_listaja.php'; ?>
    </div>
</div>
