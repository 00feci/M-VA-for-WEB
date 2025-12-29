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



    // 1. Gombok sora (Vissza gomb)

   // 1. Gombok sora (🔙 Vissza, 💾 Mentés, 🗑️ Törlés)
    const gombSor = document.createElement('div');
    gombSor.className = 'dashboard-gomb-sor';
    gombSor.style.display = 'flex';
    gombSor.style.justifyContent = 'space-between'; // Bal, közép, jobb elrendezés
    gombSor.style.width = '100%';
    gombSor.style.marginBottom = '15px';
    
    // 🔙 Vissza gomb (Bal szél)
    const visszaGomb = document.createElement('div');
    visszaGomb.className = 'dashboard-gomb';
    visszaGomb.style.flex = '1';
    visszaGomb.innerText = '🔙 Vissza';
    visszaGomb.onclick = () => navigacio('fomenu');
    gombSor.appendChild(visszaGomb);

    if (cel === 'felhasznalok') {
        // 💾 Mentés gomb (Közép)
        const mentesGomb = document.createElement('div');
        mentesGomb.className = 'dashboard-gomb';
        mentesGomb.style.flex = '1';
        mentesGomb.style.margin = '0 10px';
        mentesGomb.innerText = '💾 Mentés';
        mentesGomb.onclick = () => mentesKivalasztott();
        gombSor.appendChild(mentesGomb);

        // 🗑️ Törlés gomb (Jobb szél)
        const torlesGomb = document.createElement('div');
        torlesGomb.className = 'dashboard-gomb';
        torlesGomb.style.flex = '1';
        torlesGomb.innerText = '🗑️ Törlés';
        torlesGomb.style.borderColor = '#c62828';
        torlesGomb.onclick = () => torlesKivalasztott();
        gombSor.appendChild(torlesGomb);
    }
    kontener.appendChild(gombSor);



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
