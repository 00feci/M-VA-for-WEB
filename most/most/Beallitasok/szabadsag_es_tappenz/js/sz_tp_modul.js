function szTpModulBetoltese() {
    // Szigorúan a vezer.php-ban definiált root div-et keressük, 
    // hogy ne írjuk felül a felette lévő PHP-s Vissza gombot!
    const kontener = document.getElementById('sz-tp-modul-root');
    
    if (!kontener) {
        console.warn("Az 'sz-tp-modul-root' nem található, próbálkozás a 'modul-tartalom' elemmel...");
        const tartalmiKontener = document.getElementById('modul-tartalom');
        if (!tartalmiKontener) return;
        // Ha nincs root div, de van tartalmi konténer, létrehozzuk a helyet
        tartalmiKontener.innerHTML = '<div id="sz-tp-modul-root"></div>';
        return szTpModulBetoltese();
    }
}
