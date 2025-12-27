console.log("🚀 A beallitasok.js sikeresen betöltve!");

const menuAdatok = {
    'fomenu': {
        cim: 'Beállítások',
        breadcrumb: 'Iroda > Beállítások',
        gombok: [
            { felirat: '📅 Szabadság és Táppénz', cel: 'szabadsag' },
            { felirat: '👥 Felhasználók', cel: 'felhasznalok' },
            { felirat: '⚙️ Rendszer', cel: 'rendszer' }
        ]
    },
    'szabadsag': {
        cim: 'Szabadság beállítások',
        breadcrumb: 'Iroda > Beállítások > Szabadság',
        gombok: [
            { felirat: '🎨 Színvariációk', cel: 'szabadsag_szinek' },
            { felirat: '📝 Megnevezések', cel: 'szabadsag_nevek' },
            { felirat: '🔙 Vissza', cel: 'fomenu' }
        ]
    },
    'felhasznalok': {
        cim: 'Felhasználók kezelése',
        breadcrumb: 'Iroda > Beállítások > Felhasználók',
        gombok: [
            { felirat: '🔙 Vissza', cel: 'fomenu' }
        ]
    },
    'rendszer': {
        cim: 'Rendszer beállítások',
        breadcrumb: 'Iroda > Beállítások > Rendszer',
        gombok: [
            { felirat: '🔙 Vissza', cel: 'fomenu' }
        ]
    }
};

function navigacio(cel) {
    console.log("Kattintás észlelve, cél:", cel);

    // 🎨 CSS dinamikus betöltése a Felhasználókhoz
    if (cel === 'felhasznalok' && !document.getElementById('felhasznalok-css')) {
        let link = document.createElement('link');
        link.id = 'felhasznalok-css';
        link.rel = 'stylesheet';
        link.href = 'Beallitasok/beallitasok/Felhasznalok/css/felhasznalok.css?v=' + new Date().getTime();
        document.head.appendChild(link);
        console.log("CSS betöltve a felhasználókhoz.");
    }

    const adat = menuAdatok[cel];
    if (!adat) {
        console.error("Hiba: Nincs definiálva adat ehhez a gombhoz:", cel);
        return;
    }

    // Cím és Breadcrumb frissítése
    document.getElementById('panel-cim').innerText = adat.cim;
    document.getElementById('breadcrumb').innerHTML = adat.breadcrumb.replace(/ > /g, ' <span>&gt;</span> ');

  // Konténer ürítése
    const kontener = document.getElementById('menu-kontener');
    kontener.innerHTML = '';

    // 1. Gombok sora (itt lesz a Vissza gomb)
    const gombSor = document.createElement('div');
    gombSor.className = 'dashboard-gomb-sor';
    
    adat.gombok.forEach(gomb => {
        const div = document.createElement('div');
        div.className = 'dashboard-gomb';
        div.innerText = gomb.felirat;
        div.onclick = () => navigacio(gomb.cel);
        gombSor.appendChild(div);
    });
    kontener.appendChild(gombSor);

    // 2. Tartalom helye (ide tölti be a JS a táblázatot)
    const tartalomDiv = document.createElement('div');
    tartalomDiv.id = 'modul-tartalom';
    tartalomDiv.style.width = '100%';
    kontener.appendChild(tartalomDiv);
    kontener.appendChild(gombSor);

    // Ide szúrjuk be a dinamikus tartalom helyét
    const tartalomDiv = document.createElement('div');
    tartalomDiv.id = 'modul-tartalom';
    kontener.appendChild(tartalomDiv);

   // 🚀 Speciális modul betöltése
    if (cel === 'felhasznalok') {
        console.log("Felhasználók modul indítása...");
        if (typeof felhasznalokBetoltese !== 'function') {
            const script = document.createElement('script');
            // Időbélyeg hozzáadása a cache ellen, hogy az új mentes() függvény töltődjön be
            script.src = 'Beallitasok/beallitasok/Felhasznalok/js/felhasznalok.js?v=' + new Date().getTime();
            script.onload = () => {
                console.log("felhasznalok.js sikeresen betöltve és elindítva.");
                felhasznalokBetoltese();
            };
            document.body.appendChild(script);
        } else {
            felhasznalokBetoltese();
        }
    }
}
