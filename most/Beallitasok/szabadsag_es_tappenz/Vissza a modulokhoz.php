<div class="sztp-vissza-kontener" style="margin-bottom: 15px;">
    <form method="POST" action="beallitasok.php">
        <button class="sztp-egyedi-vissza" type="submit" name="melyik" value="vissza" 
            style="padding: 10px 20px; background: #444; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold; transition: background 0.2s;">
            ⬅ Vissza a modulokhoz
        </button>
    </form>
</div>

<style>
.sztp-egyedi-vissza:hover { background: #555 !important; }
/* Ha a modul aktív, elrejtjük az eredeti felső vissza gombot a CSS segítségével */
body.sztp-active .vissza-gomb { display: none !important; }
</style>
