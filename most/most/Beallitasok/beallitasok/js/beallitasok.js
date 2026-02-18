const menuAdatok = {
    'fomenu': {
        cim: '⚙️ Beállítások',
        breadcrumb: 'Iroda > Beállítások',
        gombok: [
            { felirat: '📅 Szabadság és Táppénz', cel: 'szabadsag' },
            { felirat: '👥 Felhasználók', cel: 'felhasznalok' },
           // { felirat: '⚙️ Rendszer', cel: 'rendszer' }
        ]
    },

    'felhasznalok': {
        cim: 'Felhasználók kezelése',
        breadcrumb: 'Iroda > Beállítások > Felhasználók',
        gombok: [
        { felirat: '🔙 Vissza', cel: 'fomenu' }
      ]
    },
    'szabadsag': {
        cim: '📅 Szabadság és Táppénz beállítások',
        breadcrumb: 'Iroda > Beállítások > Szabadság és Táppénz',
        gombok: [] // A gombokat a vezer.php-ból kapja meg
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
        gombSor.id = 'modul-gomb-sor';
        gombSor.style.display = 'flex';
        gombSor.style.width = '100%';
        gombSor.style.gap = '40px'; // 👈 Még nagyobb távolság a gombok között
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

    }

    if (cel === 'szabadsag') {

        fetch('Beallitasok/szabadsag_es_tappenz/vezer.php')

            .then(response => response.text())

            .then(html => {
                const tartalom = document.getElementById('modul-tartalom');
                if (tartalom) {
                    // 1. Beillesztjük a HTML-t
                 // 1. Beillesztjük a HTML-t
                    tartalom.innerHTML = html;
                    
                    // 2. HIBAJAVÍTÁS: Kivesszük az inaktív scripteket a HTML-ből, hogy ne csapják be a duplikáció-szűrőt
                    const inaktivScriptek = tartalom.querySelectorAll('script');
                    const scriptek = Array.from(inaktivScriptek);
                    inaktivScriptek.forEach(s => s.remove());
                    
                    // Szekvenciális (egymás utáni) script betöltés
                    function scriptBetolto(index) {
                        // Ha az összes script betöltött, jöhet a modul indítása
                        if (index >= scriptek.length) {
                            if (typeof szTpModulBetoltese === 'function') {
                                szTpModulBetoltese();
                            } else {
                                console.error("Kritikus hiba: szTpModulBetoltese nem található!");
                            }
                            return;
                        }

                        const oldScript = scriptek[index];
                        const src = oldScript.getAttribute('src');

                        if (src) {
                            const tisztaSrc = src.split('?')[0];
                            // Ha a DOM-ban már benne van a script, egyből mehet a következő
                            if (document.querySelector(`script[src*="${tisztaSrc}"]`)) {
                                scriptBetolto(index + 1);
                                return;
                            }

                            const newScript = document.createElement('script');
                            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                            
                            // Csak akkor hívja be a következőt, ha ez az adott fájl 100%-osan letöltött
                            newScript.onload = () => scriptBetolto(index + 1);
                            newScript.onerror = () => {
                                console.error("Hiba a script betöltésekor: ", src);
                                scriptBetolto(index + 1);
                            };
                            document.body.appendChild(newScript);
                        } else {
                            // Belső (inline) scriptek azonnali futtatása
                            const newScript = document.createElement('script');
                            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                            document.body.appendChild(newScript);
                            scriptBetolto(index + 1);
                        }
                    }

                    // Elindítjuk az első script betöltését
                    scriptBetolto(0);
                }
            });
    }
} // <--- Navigáció függvény lezárása
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



