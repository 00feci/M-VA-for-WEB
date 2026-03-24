function szTpModulBetoltese() {
    // A vezer.php-ban definiált root div keresése
    const kontener = document.getElementById('sz-tp-modul-root');
    
    if (!kontener) {
        console.warn("Az 'sz-tp-modul-root' nem található, próbálkozás a 'modul-tartalom' elemmel...");
        const tartalmiKontener = document.getElementById('modul-tartalom');
        if (!tartalmiKontener) return;
        tartalmiKontener.innerHTML = '<div id="sz-tp-modul-root"></div>';
        return szTpModulBetoltese();
    }

    // A beágyazott HTML eltávolítva, csak a konténerek maradnak
    kontener.innerHTML = `
        <div id="sztp-feltolto-modal-kontener"></div>
        <div id="sztp-nap-modal-kontener"></div>
        <div id="sztp-plusz-modal-helye"></div>
        ${getHivatkozasModalHtml()}
    `;

    // A külső HTML betöltése a pontos, szóközös elérési úttal
    fetch('Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/Munkanap tipusa/popup_munkanap_tipusa_plusz_popup.html')
        .then(response => response.text())
        .then(html => {
            const pluszHely = document.getElementById('sztp-plusz-modal-helye');
            if (pluszHely) {
                pluszHely.innerHTML = html;
            }
        })
        .catch(err => console.error("Hiba a plusz popup betöltésekor:", err));

    // A többi tartalom betöltése
    setTimeout(() => {
        fetch('Beallitasok/szabadsag_es_tappenz/Napok típusa/nap_tipusok_kezelese.html')
            .then(v => v.text())
            .then(html => {
                const k = document.getElementById('sztp-nap-modal-kontener');
                if (k) {
                    k.innerHTML = html;
                    if (typeof listaBetoltese === 'function') listaBetoltese();
                    if (typeof inicializalFeltoltot === 'function') inicializalFeltoltot();
                }
            }).catch(err => console.error("Hiba a HTML betöltésekor:", err));
    }, 150);
}
