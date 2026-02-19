<?php
// 1. Behúzzuk a felületi gombot
include __DIR__ . '/munkanapok_popup.php';
// 2. Később ide jönnek a Popup HTML-ek és a JS fájlok include-jai
include __DIR__ . '/munkanapok_popup_kod_szin.php'; ?>
                        </div>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
               <div style="display: flex; gap: 10px;">
                    <?php include __DIR__ . '/munkanapok_popup_mentes.php'; ?>
                    <?php include __DIR__ . '/popup_sablon_feltoltese_vezer.php'; ?>
                </div>
               <div style="display: flex; gap: 10px;">
                    <?php include __DIR__ . '/munkanapok_popup_torles.php'; ?>
                   <?php include __DIR__ . '/popup_sablon_kezelese_vezer.php'; ?>
                </div>
                 <?php include __DIR__ . '/munkanapok_popup_nagy_rekord.php'; ?>
                    <?php include __DIR__ . '/munkanapok_popup_bezaras.php'; ?>
                </div>
            </div>
        </div>
         <?php include __DIR__ . '/munkanapok_popup_sablon_fajlok_listaja.php'; ?>
    </div>
</div>
?>
