function adatokBetolteseANaptarba(opSzam) {
    if (!opSzam) return;

    // xcxxx kód, ezt a blokot cseréld
    // ELŐTISZTÍTÁS: Tisztítás után visszatöltjük az alapértelmezett "A" értékeket
    const cellak = document.querySelectorAll(`td[data-op="${opSzam}"]`);
    cellak.forEach(td => {
        if (!td.classList.contains('inaktiv-nap')) {
            const nap = td.dataset.nap;
            // Alaphelyzetbe állítás
            td.textContent = '';
            td.className = 'ures-cella';
            delete td.dataset.kezdet;
            delete td.dataset.vegzet;
            
            // Ha van mentett rendszer-adat (A), akkor azt rögtön visszaírjuk alapnak
            if (window.AJelolesek && window.AJelolesek[opSzam] && window.AJelolesek[opSzam][nap]) {
                const ertek = window.AJelolesek[opSzam][nap];
                td.textContent = ertek;
                if (ertek === 'A') {
                    td.dataset.tipus = 'rendszer-adat';
                    addCssClassToCell(td, 'rendszer-adat');
                }
            }
        }
    });
    
    const aktualisHonap = `${window.AblakCfg.ev}-${String(window.AblakCfg.honap).padStart(2,'0')}`;

    fetch(`${window.AblakCfg.apiBase}munkaido_lekerezes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op_szam: opSzam, honap: aktualisHonap })
    })
    .then(r => r.json())
    .then(response => {
        if (response.status === 'ok' && response.adatok) {
            // Újratöltjük az adatokat a tiszta sorba
            megjelenitoFugveny(response.adatok, opSzam);
        }
    })
    .catch(err => console.error("Hiba:", opSzam, err));
}

// 🔄 Egy cella adatainak elküldése a szervernek (SQL-szinkronhoz előkészítve)
function syncCellToServer(td) {
  if (!window.AblakCfg) return;

  const tr = td.closest('tr');
  if (!tr) return;

  // OP szám
  let op = td.dataset.op || '';
  if (!op) {
    const opField = tr.querySelector('select.opszam-select, input[name="op_szam[]"]');
    if (opField) op = opField.value.trim();
  }

  const datum = td.dataset.datum || '';
  const ertek = td.innerText.trim();
  const tipus = td.dataset.tipus || '';

  // 🔹 ÚJ RÉSZ: A nap típusának lekérése a fejlécből (M, Ü, -)
  let napTipus = 'M'; // Alapértelmezés
  const index = td.cellIndex;
  const fejlecSor = document.querySelector('tr.fejlec-napok-tipusa');
  if (fejlecSor && fejlecSor.cells[index]) {
      napTipus = fejlecSor.cells[index].innerText.trim(); 
      // Ha a fejlécben esetleg "|" jelek vannak, az első karaktert vagy tisztított értéket vesszük
      // De az Ablak.php-ban elvileg csak "M", "Ü", "-" van.
  }

  if (!op || !datum) return;

  const payload = {
    op_szam: op,
    datum: datum,
    ertek: ertek,
    tipus: tipus,
    nap_tipus: napTipus // 🔹 Ezt küldjük pluszban!
  };

  fetch(`${window.AblakCfg.apiBase}munkaido_mentes.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => { });
}

// --- VÉGLEGES, AGRESSZÍV STATISZTIKA SZÁMOLÓ ---
function frissitOsszesOszlop() {
    const tbody = document.getElementById('tabla-body');
    if (!tbody || !window.AblakCfg) return;

    let osszesHiba = 0; // Ebben számoljuk a sárga háromszögeket

    Array.from(tbody.rows).forEach((tr) => {
        let szabi = 0, tappenz = 0, fizNelkuli = 0;
        const cellak = tr.querySelectorAll('td[data-nap]');

        cellak.forEach(td => {
            if (td.classList.contains('inaktiv-nap')) return;

            // Számoljuk a hibás cellákat
            if (td.classList.contains('hibas-nap-jelzo')) {
                osszesHiba++;
            }

            const tartalom = td.textContent.trim(); 
            if (!tartalom) return;

            if (tartalom.includes('SZ') || tartalom.includes('Rendes szabadság')) szabi++;
            else if (tartalom.includes('TP') || tartalom.includes('Táppénz')) tappenz++;
            else if (tartalom.includes('fn')) fizNelkuli++;
        });

        let cellaSzabi = tr.querySelector('.osszeg-szabi');
        let cellaTp    = tr.querySelector('.osszeg-tp');
        let cellaFn    = tr.querySelector('.osszeg-fn');
        if (cellaSzabi) cellaSzabi.textContent = szabi;
        if (cellaTp)    cellaTp.textContent    = tappenz;
        if (cellaFn)    cellaFn.textContent    = fizNelkuli;
    });

    // MEGJELENÍTÉS A FELSŐ SÁVBAN (Sticky toolbar)
    let hibaKontener = document.getElementById('globalis-hiba-szamlalo');
    
    if (!hibaKontener) {
        // Megkeressük a "Rendszer Adat:" feliratot tartalmazó span-t
        const spanok = document.querySelectorAll('.sticky-gombok span');
        let rendszerAdatLabel = null;
        for (let s of spanok) {
            if (s.textContent.includes('Rendszer Adat:')) {
                rendszerAdatLabel = s;
                break;
            }
        }

        if (rendszerAdatLabel) {
            hibaKontener = document.createElement('span');
            hibaKontener.id = 'globalis-hiba-szamlalo';
            // Stílus: pirosas szín a figyelemfelkeltéshez, margó a távolsághoz
            hibaKontener.style.cssText = "margin-right:15px; font-weight:bold; cursor:help; font-size:18px; color:#d32f2f; display:none;";
            
            // Beszúrjuk közvetlenül a "Rendszer Adat:" felirat elé
            rendszerAdatLabel.parentNode.insertBefore(hibaKontener, rendszerAdatLabel);
        }
    }

    if (hibaKontener) {
        if (osszesHiba > 0) {
            hibaKontener.style.display = 'inline-block';
            // Tömör formátum: ⚠️ és a szám
            hibaKontener.innerHTML = `⚠️${osszesHiba}`;
            // Buboréksúgó beállítása
            hibaKontener.title = "Hibás rekordok száma:";
        } else {
            hibaKontener.style.display = 'none';
        }
    }
}

// --- ÓVATOS MEGJELENÍTŐ (Javított szövegek + "M" elrejtése + Sárga háromszög) ---
function megjelenitoFugveny(adatok, opSzam, kellFrissites = true) {
    if (!adatok || !opSzam) return;

    adatok.forEach(function(rekord) {
        let nyers = rekord.dokumentum_típusa || rekord.státusz || '';
        if (!nyers) return; 

        let statuszKod = nyers;
        if (statuszKod.includes('Rendes szabadság') || statuszKod.includes('Szabadság')) statuszKod = 'SZ';
        if (statuszKod.toLowerCase().includes('tanulmányi')) statuszKod = 'SZ'; 
        if (statuszKod.toLowerCase().includes('hozzátartozó') || statuszKod.toLowerCase().includes('halála')) statuszKod = 'SZ';
        if (statuszKod.includes('Táppénz') || statuszKod.includes('tappenz')) {
            statuszKod = 'TP';
            statuszKod = statuszKod.replace(/ \(GYÁP\)/gi, ''); 
        }
        if (statuszKod.includes('Fizetés nélküli')) statuszKod = 'fn';
        if (statuszKod === 'M' || statuszKod === 'Munkanap') statuszKod = '';
        statuszKod = statuszKod.replace(/ és /g, ' | ');
        
        const vizsgalt = statuszKod.toLowerCase(); 
        let tipusClass = 'egyeb';
        if (vizsgalt.indexOf('fn') > -1) tipusClass = 'fizetes-nelkuli-szabadsag';
        else if (vizsgalt.indexOf('tp') > -1) tipusClass = 'tappenz';
        else if (vizsgalt.indexOf('sz') > -1) tipusClass = 'rendes-szabadsag';
        else if (vizsgalt.indexOf('a') > -1) tipusClass = 'rendszer-adat'; 

        if (rekord.javitott === true) tipusClass += ' javitott-adat'; 

        if (!rekord.sz_tp_kezdet || !rekord.sz_tp_végzet) return; 

        const kezdetStr = String(rekord.sz_tp_kezdet);
        const vegzetStr = String(rekord.sz_tp_végzet);
        const kezdet = new Date(kezdetStr.indexOf('T') === -1 ? kezdetStr + 'T12:00:00' : kezdetStr);
        const vegzet = new Date(vegzetStr.indexOf('T') === -1 ? vegzetStr + 'T12:00:00' : vegzetStr);
        
        let aktualisNap = new Date(kezdet);
        while (aktualisNap <= vegzet) {
            const ev = aktualisNap.getFullYear();
            const honap = aktualisNap.getMonth() + 1;
            const nap = aktualisNap.getDate();

            if (ev === window.AblakCfg.ev && honap === window.AblakCfg.honap) {
                let cella = document.querySelector(`td[data-op="${opSzam}"][data-nap="${nap}"]`);
                if (!cella) cella = document.querySelector(`td[data-op="${opSzam}"][data-nap="0${nap}"]`);

                if (cella && !cella.classList.contains('inaktiv-nap')) {
                    let jelenlegi = cella.textContent.trim();
                    let ujKod = statuszKod;

                    if (rekord.jelentkezés_forrása !== 'Kézi') {
                        if (jelenlegi !== '' && statuszKod !== '' && statuszKod !== 'A') {
                            if (jelenlegi.includes(' | ')) {
                                let reszek = jelenlegi.split(' | ');
                                ujKod = reszek[0] + ' | ' + statuszKod + ' | ' + reszek[1];
                            } else if (jelenlegi === 'A') {
                                ujKod = 'A | ' + statuszKod;
                            } else if (jelenlegi === '-' || jelenlegi === 'Ü') {
                                ujKod = statuszKod + ' | ' + jelenlegi;
                            }
                        }
                    } else { ujKod = statuszKod; }

                    cella.innerHTML = ujKod; 

                    if (aktualisNap.getTime() === vegzet.getTime() && rekord.sz_tp_napok > 1) {
                        const badge = `<span class="nap-szamlalo-badge">${rekord.sz_tp_napok}</span>`;
                        cella.insertAdjacentHTML('afterbegin', badge);
                    }
                    
                   // ÚJ LOGIKA: A sárga háromszög ezentúl a NEM KÉZI forrást jelzi (HR ellenőrzés szükséges)
                    if (statuszKod && statuszKod !== 'A' && rekord.jelentkezés_forrása !== 'Kézi') {
                        cella.classList.add('hibas-nap-jelzo');
                        cella.title = `Importált adat (Forrás: ${rekord.jelentkezés_forrása}). HR ellenőrzés szükséges!`;
                    }

                    if (statuszKod && statuszKod !== 'A') {
                        cella.dataset.kezdet = rekord.sz_tp_kezdet;
                        cella.dataset.vegzet = rekord.sz_tp_végzet;
                    }

                    if (statuszKod !== '' && tipusClass !== 'egyeb') {
                        cella.classList.add(...tipusClass.split(' '));
                    }
                }
            }
            aktualisNap.setDate(aktualisNap.getDate() + 1);
        }
    });

    if (kellFrissites) {
        setTimeout(function() { frissitOsszesOszlop(); }, 500);
    }
}


// --- ÚJ: TÖMEGES BETÖLTÉS (BUSZ-ELV) ---
function adatokBetolteseTomegesen() {
    if (!window.AblakCfg) return;

    const aktualisHonap = `${window.AblakCfg.ev}-${String(window.AblakCfg.honap).padStart(2,'0')}`;

    // Egyetlen kérés 'MINDENKI' paraméterrel
    fetch(`${window.AblakCfg.apiBase}munkaido_lekerezes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            op_szam: 'MINDENKI',
            honap: aktualisHonap
        })
    })
    .then(r => r.json())
    .then(valasz => {
        if (valasz.status === 'ok' && valasz.adatok) {
            console.log("📦 Tömeges adatcsomag megérkezett!");
            
            // A válasz egy objektum: { '0057': [...], '1234': [...] }
            // Végigmegyünk a kulcsokon (OP számokon)
            Object.keys(valasz.adatok).forEach(opSzam => {
                const rekordok = valasz.adatok[opSzam];
                // Meghívjuk a már jól működő megjelenítőt mindenkinél
                // DE! Fontos, hogy ne frissítsen minden egyes embernél statisztikát, mert az lassú.
                // Ezért a megjelenitoFugveny-t kicsit okosítani kell, vagy a végén frissítünk egyet.
                megjelenitoFugveny(rekordok, opSzam, false); // false = ne frissíts statisztikát még
            });

            // A végén egyszerre frissítünk minden statisztikát
            setTimeout(() => {
                console.log("🔥 Statisztikák végső újraszámolása...");
                frissitOsszesOszlop();
            }, 500);
        }
    })
    .catch(err => console.error("Hiba a tömeges letöltésnél:", err));
}

// 🎯 Betöltés
fetch(`${window.AblakCfg.apiBase}felhasznalok_lista.php`)
  .then(response => response.json())
// ... (A fetch lekérte a felhasználó listát) ...
.then(data => {
    window.FelhasznaloLista = data;
    const tbody = document.getElementById('tabla-body');
    tbody.innerHTML = '';
    
    // 1. Táblázat felépítése (Üres sorok kirajzolása)
    data.forEach(felhasznalo => {
        const tr = letrehozTablaSort(felhasznalo);
        tbody.appendChild(tr);
    });

    initTomSelect();
    frissitStickyTopok();
    
    // Naptár fejléc betöltése (Alapzat)
    naptarFejlecBetoltese(); 

    // --- ITT A KAPCSOLÓ! ---
    // false = ÉLES ÜZEM (Mindenki egyszerre, 1 kéréssel)
    // true  = TESZT ÜZEM (Csak egy ember, vagy régi lassú módszer)
    
    const TESZT_UZEMMOD = true; // <--- EZT ÁLLÍTSD ÁT, HA KÉSZ VAGY!
    const TESZT_ALANY   = '0057';

    if (TESZT_UZEMMOD) {
        console.warn("⚠️ TESZT MÓD AKTÍV: Csak egy felhasználó betöltése!");
        adatokBetolteseANaptarba(TESZT_ALANY); 
    } else {
        console.log("🚀 ÉLES MÓD: Tömeges betöltés indítása...");
        adatokBetolteseTomegesen(); // Ezt a függvényt mindjárt megírjuk!
    }
});
function applyNapTipusToSingleCell(td) {
  const ertek = ertekek[aktualisIndex]; // "🖱", "Ü", "-", "M"

  if (ertek === '🖱') {
    return; // Egér állapot: itt nem csinálunk semmit
  }

  // Cellatartalom TELJES felülírása
  if (ertek === 'M') {
    // M = munkanap → cella kiürítése
    td.innerText = '';
  } else if (ertek === 'Ü' || ertek === '-') {
    // Ünnepnap / Hétvége → csak ez legyen benne
    td.innerText = ertek;
  }

  // Bármilyen SZ/TP/fn szín / típus törlése
  // Bármilyen SZ/TP/fn szín / típus törlése
  if (typeof addCssClassToCell === 'function') {
    td.dataset.tipus = '';
    addCssClassToCell(td, null);
  }

  // Napok típusa jelölés: egyedi kattintásból jött
  td.dataset.orokolt = 'egyedi';

  frissitOsszesOszlop();

  // 🔄 SQL-szinkron előkészítés: cella adatainak elküldése a szervernek
  syncCellToServer(td);
}

// --- NAPTÁR FEJLÉC KEZELÉSE (SQL MENTÉS ÉS BETÖLTÉS) ---

// 1. BETÖLTÉS: Induláskor lekéri a mentett M/Ü/- állapotokat
function naptarFejlecBetoltese() {
    if (!window.AblakCfg) return;

    console.log("📅 Naptár fejléc betöltése az adatbázisból...");

    const url = `${window.AblakCfg.apiBase}munkaido_naptar_kezelo.php?action=load&ev=${window.AblakCfg.ev}&honap=${window.AblakCfg.honap}`;

    fetch(url)
        .then(response => response.json())
        .then(res => {
            if (res.status === 'ok' && res.adatok) {
                alkalmazNaptarAdatok(res.adatok);
            }
        })
        .catch(err => console.error("Hiba a naptár betöltésekor:", err));
}
// 2. MENTÉS: Amikor kattintasz, elküldi az új értéket
function naptarFejlecMentese(cella, ujErtek) {
    if (!window.AblakCfg) return;

    // Dátum kitalálása a cella pozíciójából
    const nap = cella.cellIndex - 1; // 2. oszlop = 1. nap
    const ev = window.AblakCfg.ev;
    const honap = window.AblakCfg.honap;
    const datumStr = `${ev}-${String(honap).padStart(2, '0')}-${String(nap).padStart(2, '0')}`;

    const payload = {
        datum: datumStr,
        tipus: ujErtek // "M", "Ü", "-"
    };

    fetch(`${window.AblakCfg.apiBase}munkaido_naptar_kezelo.php?action=save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => {
        console.log(`💾 Fejléc mentve (${datumStr} => ${ujErtek}):`, res.uzenet);
    })
    .catch(err => console.error("Mentési hiba:", err));
}