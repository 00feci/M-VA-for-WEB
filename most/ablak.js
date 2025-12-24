
// Alapállapot beállítása
window.onload = frissitKijelzo;

// --- 3. Betöltéskori logika (Frissítés után ez fut le) ---
function alkalmazNaptarAdatok(adatok) {
    const fejlecSor = document.querySelector('tr.fejlec-napok-tipusa');
    if (!fejlecSor) return;

    const cellak = fejlecSor.cells;
    const ev = window.AblakCfg.ev;
    const honap = window.AblakCfg.honap;

    for (let i = 2; i < cellak.length; i++) {
        const nap = i - 1; 
        const datumStr = `${ev}-${String(honap).padStart(2, '0')}-${String(nap).padStart(2, '0')}`;
        
        if (adatok[datumStr]) {
            const tipus = adatok[datumStr]; 
            // Fejléc beállítása
            cellak[i].innerText = tipus;
            // Oszlop frissítése a fenti szabályrendszerrel
            vetitOszlopra(i, tipus);
        }
    }
    console.log("✅ Naptár fejléc és oszlopok frissítve.");
    frissitOsszesOszlop(); 
}


function valasztottFelhasznalo(selectElem) {
  const opInput = selectElem.closest('tr').querySelector('input[name="op_szam[]"]');
  const selectedOption = selectElem.selectedOptions[0];
  if (!opInput || !selectedOption) return;
  const opSzam = selectedOption.dataset.op;
  if (opSzam === 'kulso') {
    opInput.readOnly = false;
    opInput.value = '';
    opInput.placeholder = 'Külsős OP szám';
  } else {
    opInput.readOnly = true;
    opInput.value = opSzam;
    opInput.placeholder = '';
  }
}

// --- FELÜLÍRÓ SZERKESZTŐ (AMIT MONDOK, AZ LESZ!) ---
function applyTipusToCell(td) {
    const select = document.getElementById('tipusSelect');
    if (!select) return;

    const opt = select.selectedOptions[0];
    if (!opt) return;

    const ujKod = opt.dataset.kod || '';   // Pl. "TP" vagy "SZ"
    const tipusClass = opt.value;          // Pl. "tappenz"

    if (!ujKod) return; // Ha nincs kód, nem csinálunk semmit

    // --- ITT A VÁLTOZÁS: NINCS ÖSSZEFŰZÉS ---
    // Nem érdekel minket, mi volt ott (A, A|SZ, stb.)
    // Egyszerűen felülírjuk az új értékkel.
    
    td.textContent = ujKod; 
    
    // Beállítjuk a típust és a stílust
    td.dataset.tipus = tipusClass;
    addCssClassToCell(td, tipusClass);

    // Ha korábban örökölt adat volt, most már egyedi
    if (td.dataset.orokolt === 'igen') {
        delete td.dataset.orokolt;
    }

    // Újraszámoljuk a statisztikát
    frissitOsszesOszlop();

    // Elküldjük a szervernek (Mentés)
    syncCellToServer(td);
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


function frissitStickyTopok() {
  const toolbar = document.querySelector('.sticky-gombok');
  const row1 = document.querySelector('table.munkaido thead tr.fejlec-datumok');
  const hToolbar = toolbar ? toolbar.offsetHeight : 0;
  const hRow1 = row1 ? row1.offsetHeight : 0;
  document.documentElement.style.setProperty('--sticky-toolbar-h', hToolbar + 'px');
  document.documentElement.style.setProperty('--header1-h', hRow1 + 'px');
}

window.addEventListener('load', frissitStickyTopok);
window.addEventListener('resize', frissitStickyTopok);
document.fonts && document.fonts.ready && document.fonts.ready.then(frissitStickyTopok);

document.addEventListener("DOMContentLoaded", function() {
  const select = document.getElementById("tipusSelect");
  const preview = document.getElementById("tipusPreview");
  if (!select || !preview) return; // védőkorlát, ha nincs még a DOM-ban

const applyPreview = () => {
  const opt = select.selectedOptions[0];
  if (!opt) return;
  const kod = opt.dataset.kod || ''; // "A" / "SZ" / "TP" / "fn" vagy üres (Egér)
  const cssClass = opt.value;        // "eger", "rendes-szabadsag", stb.

  if (cssClass === 'eger' || !kod) {
    // Egér állapot: semmit nem írunk a cellákba, csak jelzés
    preview.textContent = '🖱';
    preview.className = 'kod-preview';
  } else {
    preview.textContent = kod;
    preview.className = 'kod-preview ' + cssClass;

    // ❗ Ha SZ/TP/fn van kiválasztva, a Napok típusa slider menjen "Egér"-re
    aktualisIndex = 0;        // ertekek[0] = "🖱"
    frissitKijelzo();
  }
};


  select.addEventListener("change", applyPreview);
  applyPreview(); // induláskor beállít
});


function betoltes() {
  const fileInput = document.getElementById('betoltesFile');
  if (!fileInput) {
    alert("Hiányzik a betoltesFile input.");
    return;
  }
  fileInput.click();
}


//Rátöltés funkció
function ratoltes() {
  const fileInput = document.getElementById('ratoltesFile');
  if (!fileInput) {
    alert("Hiányzik a ratoltesFile input.");
    return;
  }
  fileInput.click();
}

document.addEventListener('DOMContentLoaded', function () {
  const ratInput = document.getElementById('ratoltesFile');
  if (ratInput) {
    ratInput.addEventListener('change', function () {
      if (!this.files || !this.files.length) return;

      const formData = new FormData();
      formData.append('ratoltes_file', this.files[0]);

      fetch(`${window.AblakCfg.apiBase}ratoltes_callcenter.php`, {
        method: 'POST',
        body: formData
      })
        .then(r => r.json())
        .then(res => {
          alert(res.uzenet || 'Rátöltés kész.');
          location.reload();
        })
        .catch(() => {
          alert('Hiba történt rátöltés közben.');
        })
        .finally(() => {
          this.value = '';
        });
    });
  }

  const betInput = document.getElementById('betoltesFile');
  if (betInput) {
    betInput.addEventListener('change', function () {
      if (!this.files || !this.files.length) return;

      const formData = new FormData();
      formData.append('betoltes_file', this.files[0]);

      fetch(`${window.AblakCfg.apiBase}betoltes_callcenter.php`, {
        method: 'POST',
        body: formData
      })
        .then(r => r.json())
        .then(res => {
          alert(res.uzenet || 'Betöltés kész.');
          location.reload();
        })
        .catch(() => {
          alert('Hiba történt betöltés közben.');
        })
        .finally(() => {
          this.value = '';
        });
    });
  }

  // 👉 Nap-cellák kattintása: SZ/TP/fn típus alkalmazása
  const tbody = document.getElementById('tabla-body');
    if (tbody && window.AblakCfg) {
    tbody.addEventListener('click', function (e) {
      const td = e.target.closest('td');
      if (!td) return;

      // Inaktív napokra ne reagáljunk
      if (td.classList.contains('inaktiv-nap')) return;

      const napokSzama = window.AblakCfg.napokSzama || 0;
      const idx = td.cellIndex;

      // Csak a nap-oszlopokban engedjük (0: OP, 1: Név, 2..napokSzama+1: napok)
      if (idx >= 2 && idx < 2 + napokSzama) {
        const ertek = ertekek[aktualisIndex]; // Napok típusa slider állása

        if (ertek === '🖱') {
          // Egér állapot → SZ/TP/fn vezérlő (tipusSelect) működjön
          applyTipusToCell(td);
        } else {
          // Ü / - / M állapot → egyedi nap-típus beállítás a cellára
          applyNapTipusToSingleCell(td);
        }
      }
    });


    // 👉 Billentyűzet letiltása az "A"-ként zárolt cellákban
    tbody.addEventListener('keydown', function (e) {
      const td = e.target.closest('td');
      if (!td) return;

      if (td.dataset.locked === 'A') {
        e.preventDefault();
      }
    });
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

