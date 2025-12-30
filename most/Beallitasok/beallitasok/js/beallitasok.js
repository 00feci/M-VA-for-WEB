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
        const gombSor = document.createElement('div');
        gombSor.className = 'dashboard-gomb-sor';
        gombSor.style.display = 'flex';
        gombSor.style.width = '100%';
        gombSor.style.marginBottom = '15px';

        const visszaGomb = document.createElement('div');
        visszaGomb.className = 'dashboard-gomb';
        visszaGomb.style.flex = '1';
        visszaGomb.innerText = '🔙 Vissza';
        visszaGomb.onclick = () => navigacio('fomenu');
        gombSor.appendChild(visszaGomb);
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
    }
}
