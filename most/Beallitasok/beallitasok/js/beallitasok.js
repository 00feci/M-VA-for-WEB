const menuAdatok = {

    'fomenu': {
        cim: 'Beállítások',
        breadcrumb: 'Iroda > Beállítások',
        gombok: [
            { felirat: '📅 Szabadság és Táppénz', cel: 'szabadsag' },
            { felirat: '👥 Felhasználók', cel: 'felhasznalok' },
           // { felirat: '⚙️ Rendszer', cel: 'rendszer' }
        ]
    },
    'szabadsag': {
        cim: '📅 Szabadság és Táppénz beállítások',
        breadcrumb: 'Iroda > Beállítások > Szabadság és Táppénz',
        gombok: [
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
    // 🎨 CSS dinamikus betöltése
    if (cel === 'felhasznalok' && !document.getElementById('felhasznalok-css')) {
        let link = document.createElement('link');
        link.id = 'felhasznalok-css';
        link.rel = 'stylesheet';
        link.href = 'Beallitasok/beallitasok/Felhasznalok/css/felhasznalok.css?v=' + new Date().getTime();
        document.head.appendChild(link);
    }
    const adat = menuAdatok[cel];
    if (!adat) return;
    
    // Cím és Breadcrumb frissítése
    document.getElementById('panel-cim').innerText = adat.cim;
    document.getElementById('breadcrumb').innerHTML = adat.breadcrumb.replace(/ > /g, ' <span>&gt;</span> ');
  const kontener = document.getElementById('menu-kontener');
    if (!kontener) return;
    kontener.innerHTML = '';
    
    // 🚦 Navigáció: Főmenüben az ikonokat mutatjuk, modulokban a funkciógombokat
    if (cel === 'fomenu') {
        adat.gombok.forEach(g => {
            const gomb = document.createElement('div');
            gomb.className = 'dashboard-gomb';
            gomb.innerText = g.felirat;
            gomb.onclick = () => navigacio(g.cel);
            kontener.appendChild(gomb);
        });
    } else {
        // Dinamikus gombgenerálás a modulhoz (Színvariációk, Megnevezések, stb.)
        const gombSor = document.createElement('div');
        gombSor.className = 'dashboard-gomb-sor';
        gombSor.style.display = 'flex';
        gombSor.style.width = '100%';
        gombSor.style.gap = '10px';
        gombSor.style.marginBottom = '15px';

        adat.gombok.forEach(g => {
            const gomb = document.createElement('div');
            gomb.className = 'dashboard-gomb';
            gomb.style.flex = '1';
            gomb.innerText = g.felirat;
            gomb.onclick = () => navigacio(g.cel);
            gombSor.appendChild(gomb);
        });
        kontener.appendChild(gombSor);
    }
    // 2. Tartalom helye (ID: modul-tartalom) - Itt csak egy változót használunk!
    const modulDoboz = document.createElement('div');
    modulDoboz.id = 'modul-tartalom';
    modulDoboz.style.width = '100%';
    kontener.appendChild(modulDoboz);

    // 🚀 Modul betöltése
    if (cel === 'felhasznalok') {
        if (typeof felhasznalokBetoltese !== 'function') {
            const script = document.createElement('script');
            script.src = 'Beallitasok/beallitasok/Felhasznalok/js/felhasznalok.js?v=' + new Date().getTime();
            script.onload = () => felhasznalokBetoltese();
            document.body.appendChild(script);
        } else {
            felhasznalokBetoltese();
        }
        // 🚀 Szabadság és Táppénz modul betöltése (Kiszervezett fájl)
    if (cel === 'szabadsag') {
        if (typeof szTpModulBetoltese !== 'function') {
            const script = document.createElement('script');
            script.src = 'Beallitasok/szabadsag_es_tappenz/js/sz_tp_modul.js?v=' + new Date().getTime();
            script.onload = () => szTpModulBetoltese();
            document.body.appendChild(script);
        } else {
            szTpModulBetoltese();
        }
    }
} // Itt zárjuk be a navigacio függvényt rendesen
        
function felhasznalokMegnyitasa() {
    window.location.href = 'Beallitasok/beallitasok/Felhasznalok/felhasznalok.php';
}

function szTpBeallitasokMegnyitasa() {
    // Itt hívjuk meg a popupot vagy irányítunk az új beállító oldalra
    console.log("Szabadság és Táppénz beállítások megnyitása...");
    // Később ide jön a Modal (Ablak) megnyitó kódja
}

// Élő előnézet frissítése a HEX kód alapján
function frissitSzTpElonezet() {
    const kod = document.getElementById('sztp_kod').value;
    const szin = document.getElementById('sztp_hex').value;
    const elonezet = document.getElementById('szin-elonezet');
    
    if(elonezet) {
        elonezet.style.backgroundColor = szin;
        elonezet.textContent = kod;
    }
}
    }
}


