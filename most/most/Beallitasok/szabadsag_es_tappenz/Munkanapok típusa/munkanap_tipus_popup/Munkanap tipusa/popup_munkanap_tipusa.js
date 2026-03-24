function szTpModulBetoltese() {
    const kontener = document.getElementById('sz-tp-modul-root');
    // Csak a konténereket hozzuk létre, a tartalom fájlból jön majd
    kontener.innerHTML = `
        <div id="sztp-feltolto-modal-kontener"></div>
        <div id="sztp-nap-modal-kontener"></div>
        <div id="sztp-plusz-popup-helye"></div> ${getHivatkozasModalHtml()}
    `;

    // A popup_munkanap_tipusa_plusz_popup.html betöltése
    fetch('Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/Munkanap tipusa/popup_munkanap_tipusa_plusz_popup.html')
        .then(response => response.text())
        .then(html => {
            const hely = document.getElementById('sztp-plusz-popup-helye');
            if (hely) {
                hely.innerHTML = html;
            }
        })
        .catch(err => console.error("Hiba a plusz popup betöltésekor:", err));

    // A többi modul betöltése (meglévő kód)
    setTimeout(() => {
        fetch('Beallitasok/szabadsag_es_tappenz/Napok%20t%C3%ADpusa/nap_tipusok_kezelese.html')
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
