let ertekek = ["🖱", "Ü", "-", "M"];
let szovegek = {
    "🖱": "Egér",
    "Ü": "Ünnepnap",
    "-": "Hétvége",
    "M": "Munkanap"
};
let aktualisIndex = 0;

function frissitKijelzo() {
    let ertek = ertekek[aktualisIndex];
    document.getElementById("sliderValue").innerText = `${szovegek[ertek]}`;
}

// Jobbra váltás
function valtPlusz() {
  aktualisIndex = (aktualisIndex + 1) % ertekek.length;
  frissitKijelzo();

  const ertek = ertekek[aktualisIndex];
  if (ertek !== '🖱') {
    const select = document.getElementById('tipusSelect');
    if (select) {
      const egerOpt = select.querySelector('option[value="eger"]');
      if (egerOpt) {
        select.value = 'eger';
        select.dispatchEvent(new Event('change'));
      }
    }
  }
}

// Balra váltás
function valtMinusz() {
  aktualisIndex = (aktualisIndex - 1 + ertekek.length) % ertekek.length;
  frissitKijelzo();

  const ertek = ertekek[aktualisIndex];
  if (ertek !== '🖱') {
    const select = document.getElementById('tipusSelect');
    if (select) {
      const egerOpt = select.querySelector('option[value="eger"]');
      if (egerOpt) {
        select.value = 'eger';
        select.dispatchEvent(new Event('change'));
      }
    }
  }
}


// Alapállapot beállítása
window.onload = frissitKijelzo;

function beirErtek(cell) {
  const ertek = ertekek[aktualisIndex]; // "🖱", "Ü", "-", "M"
  
  // Csak a fejléc cellájára engedjük
  if (!cell.classList.contains('napok-tipusa') || ertek === '🖱') {
    return;
  }
  
  // 1. CSAK a fejléc cellájába írjuk bele az értéket
  cell.innerText = ertek;
  
  // 2. Elmentjük az adatbázisba (hogy frissítés után is ott maradjon)
  naptarFejlecMentese(cell, ertek);
  
  // 3. Újraszámoljuk az összesítőt
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

function initTomSelect() {
  document.querySelectorAll('select.opszam-select').forEach(function(opSelect) {
    if (opSelect.tomselect) return; // már inicializálva

    const tsOp = new TomSelect(opSelect, { create: false });
    const nevSelect = opSelect.closest('tr').querySelector('select.nev-select');

    if (nevSelect && !nevSelect.tomselect) {
      const tsNev = new TomSelect(nevSelect, { create: false });

      // OP -> Név
      tsOp.on('change', function(value) {
        const selected = opSelect.querySelector(`option[value="${value}"]`);
        if (selected) tsNev.setValue(selected.dataset.nev, true);
      });

      // Név -> OP
      tsNev.on('change', function(value) {
        const selected = nevSelect.querySelector(`option[value="${value}"]`);
        if (selected) tsOp.setValue(selected.dataset.op, true);
      });

      // Kezdő értékek szinkronja
      if (opSelect.value) {
        const sel = opSelect.querySelector(`option[value="${opSelect.value}"]`);
        if (sel) tsNev.setValue(sel.dataset.nev, true);
      } else if (nevSelect.value) {
        const sel = nevSelect.querySelector(`option[value="${nevSelect.value}"]`);
        if (sel) tsOp.setValue(sel.dataset.op, true);
      }
    }
  });
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



function ujKulsoSorHozzaadasa() {
  const tbody = document.getElementById('tabla-body');
  const napokSzama = window.AblakCfg.napokSzama;                 // 31
  const napokValos = window.AblakCfg.napokValos || napokSzama;   // pl. 28, 30, 31
  const tr = document.createElement('tr');

  // OP szám input (külsős)
  const tdOp = document.createElement('td');
  const inputOp = document.createElement('input');
  inputOp.type = 'text';
  inputOp.name = 'op_szam[]';
  inputOp.className = 'op-nev';
  inputOp.placeholder = 'Külsős OP szám';
  tdOp.appendChild(inputOp);
  tr.appendChild(tdOp);

  // Név input (külsős)
  const tdNev = document.createElement('td');
  const inputNev = document.createElement('input');
  inputNev.type = 'text';
  inputNev.name = 'nev[]';
  inputNev.className = 'op-nev';
  inputNev.placeholder = 'Külsős név';
  tdNev.appendChild(inputNev);
  tr.appendChild(tdNev);

    // Napok cellák (mind zárt, csak vezérlőkből módosítható)
  for (let i = 0; i < napokSzama; i++) {
    const nap = i + 1; // 1..31
    const td = document.createElement('td');
    td.className = 'ures-cella';

    // 🔹 Metaadatok az SQL-szinkron előkészítéséhez
    td.dataset.nap = String(nap);
    td.dataset.datum = `${window.AblakCfg.ev}-${String(window.AblakCfg.honap).padStart(2,'0')}-${String(nap).padStart(2,'0')}`;
    // data-op-t külsősnél később, az OP mező kitöltésekor is frissíthetjük

    if (i >= napokValos) {
      // Nem létező nap: szürke, inaktív
      td.classList.add('inaktiv-nap');
    }

    tr.appendChild(td);
  }


  // 3 összesítő (automatikus számolt értékek)
  for (let i = 0; i < 3; i++) {
    const td = document.createElement('td');
    td.contentEditable = false;
    td.classList.add('osszeg-cella');
    if (i === 0) {
      td.classList.add('osszeg-szabi');
    } else if (i === 1) {
      td.classList.add('osszeg-tp');
    } else {
      td.classList.add('osszeg-fn');
    }
    tr.appendChild(td);
  }

  tbody.appendChild(tr);
}



function exportMunkaido() {
  const tabla = document.querySelector("table.munkaido");
  let rows = [];

  const maxNapok   = window.AblakCfg.napokSzama || 31;          // 31 napos tábla
  const napokValos = window.AblakCfg.napokValos || maxNapok;    // tényleges napok száma

  for (let i = 1; i < tabla.rows.length; i++) {
    let cells = tabla.rows[i].cells;
    let sor = [];

    for (let c = 0; c < cells.length; c++) {
      const inputElem = cells[c].querySelector('input, select');
      let value = '';

      // Nap-oszlopok: 0: OP, 1: Név, 2..(2+maxNapok-1): napok
      // Ha a nap sorszáma nagyobb, mint napokValos (pl. 30, 31 februárban),
      // akkor az exportban mindig üres legyen.
      if (c >= 2 && c < 2 + maxNapok && c >= 2 + napokValos) {
        value = '';
      } else if (inputElem) {
        value = inputElem.value.trim();
      } else {
        value = cells[c].innerText.trim();
      }

      sor.push(value);
    }

    rows.push(sor);
  }

  fetch(`${window.AblakCfg.apiBase}export_munkaido.php?ev=${window.AblakCfg.ev}&honap=${window.AblakCfg.honap}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows })
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `munkaido_${String(window.AblakCfg.ev).padStart(4,'0')}.${String(window.AblakCfg.honap).padStart(2,'0')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

function letrehozTablaSort(felhasznalo) {
  const napokSzama = window.AblakCfg.napokSzama;        // 31
  const napokValos = window.AblakCfg.napokValos || 31;  // pl. 28, 30, 31
  const tr = document.createElement('tr');

  // OP select
  const tdOp = document.createElement('td');
  const selectOp = document.createElement('select');
  selectOp.name = 'op_szam[]';
  selectOp.className = 'op-nev opszam-select';
  window.FelhasznaloLista.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.op_szam;
    option.textContent = opt.op_szam;
    option.dataset.nev = opt.nev;
    if (opt.op_szam === felhasznalo.op_szam) option.selected = true;
    selectOp.appendChild(option);
  });
  tdOp.appendChild(selectOp);
  tr.appendChild(tdOp);

  // Név select
  const tdNev = document.createElement('td');
  const selectNev = document.createElement('select');
  selectNev.name = 'nev[]';
  selectNev.className = 'op-nev nev-select';
  window.FelhasznaloLista.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.nev;
    option.textContent = opt.nev;
    option.dataset.op = opt.op_szam;
    if (opt.nev === felhasznalo.nev) option.selected = true;
    selectNev.appendChild(option);
  });
  tdNev.appendChild(selectNev);
  tr.appendChild(tdNev);

  // Napok cellák (mind zárt, csak vezérlőkből módosítható)
  const opKod = felhasznalo.op_szam; // pl. "0004", "0106", "0120"

  for (let i = 0; i < napokSzama; i++) {
    const nap = i + 1; // 1..31
    const td = document.createElement('td');
    td.className = 'ures-cella';

    // 🔹 Metaadatok az SQL-szinkronhoz
    td.dataset.nap = String(nap);
    td.dataset.datum = `${window.AblakCfg.ev}-${String(window.AblakCfg.honap).padStart(2,'0')}-${String(nap).padStart(2,'0')}`;
    td.dataset.op = opKod; // sorhoz tartozó OP kód (pl. "0004")

    if (i >= napokValos) {
      // Nem létező nap: szürke, inaktív
      td.classList.add('inaktiv-nap');
    } else {
      // Eredeti érték beírása (pl. "A"), ha van
      if (window.AJelolesek &&
          window.AJelolesek[opKod] &&
          window.AJelolesek[opKod][nap]) {
        const ertek = window.AJelolesek[opKod][nap]; // pl. "A"
        td.textContent = ertek;

        if (ertek === 'A') {
          td.dataset.tipus = 'rendszer-adat';
          addCssClassToCell(td, 'rendszer-adat');
        }
      }
    }

    tr.appendChild(td);
  }

  // 3 összesítő (automatikus számolt értékek)
  for (let i = 0; i < 3; i++) {
    const td = document.createElement('td');
    td.contentEditable = false;
    td.classList.add('osszeg-cella');
    if (i === 0) {
      td.classList.add('osszeg-szabi');
    } else if (i === 1) {
      td.classList.add('osszeg-tp');
    } else {
      td.classList.add('osszeg-fn');
    }
    tr.appendChild(td);
  }

  return tr;
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


function exportCallCenter() {
  fetch(`${window.AblakCfg.apiBase}export_callcenter.php`)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "call_center_hasznalat.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
}

function addCssClassToCell(td, tipusClass) {
  // régi típusos osztályok törlése
  td.classList.remove(
    'rendes-szabadsag',
    'tanulmanyi-szabadsag',
    'kozeli-hozzatartozo-halala-miatt',
    'tappenz',
    'tappenz-gyap',
    'fizetes-nelkuli-szabadsag',
    'rendszer-adat'
  );

  // új osztály hozzáadása
  if (tipusClass) {
    td.classList.add(tipusClass);
  }
}

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


// --- VÉGLEGES, AGRESSZÍV STATISZTIKA SZÁMOLÓ ---
function frissitOsszesOszlop() {
    const tbody = document.getElementById('tabla-body');
    if (!tbody || !window.AblakCfg) return;

    // Biztonsági öv: Ha véletlenül nincs meg a napokValos, akkor legyen 31
    const napokValos = window.AblakCfg.napokValos || window.AblakCfg.napokSzama || 31; 
    const maxNapok = window.AblakCfg.napokSzama || 31;

    console.log("Statisztika frissítése indul...");

    // Végigmegyünk minden soron
    Array.from(tbody.rows).forEach((tr, index) => {
        let szabi = 0;
        let tappenz = 0;
        let fizNelkuli = 0;

        // 1. Megkeressük az összes nap-cellát a sorban (data-nap attribútum alapján)
        // Ez a legbiztosabb módszer, nem függ az oszlop sorszámától!
        const cellak = tr.querySelectorAll('td[data-nap]');

        cellak.forEach(td => {
            // Ha inaktív a nap (pl. 32. nap vagy február 30.), kihagyjuk
            if (td.classList.contains('inaktiv-nap')) return;

            // A cella teljes szövege (tisztítva)
            const tartalom = td.textContent.trim(); 
            
            if (!tartalom) return; // Ha üres, tovább

            // --- A VIZSGÁLAT (Egyszerű szövegkeresés) ---
            
            // SZABADSÁG: Ha a szöveg "SZ" vagy "A" (alap), vagy tartalmazza őket
            // Figyelünk rá, hogy a "szenvedély" szóban ne találja meg az SZ-t :)
            // Ezért a pontos egyezést vagy a határolt egyezést nézzük.
            if (tartalom === 'SZ' || tartalom === 'A' || tartalom.includes('SZ ') || tartalom.includes('| SZ') || tartalom.includes('Rendes szabadság')) {
                szabi++;
            }
            
            // TÁPPÉNZ
            else if (tartalom.includes('TP') || tartalom.includes('Táppénz')) {
                tappenz++;
            }
            
            // FIZETÉS NÉLKÜLI
            else if (tartalom === 'fn' || tartalom.includes('fn ') || tartalom.includes('| fn')) {
                fizNelkuli++;
            }
        });

        // 2. Kiírás a sor végére
        // Megkeressük az összesítő cellákat osztálynév alapján (ha van)
        // Ha nincs osztálynév, akkor a sor végéről számolunk visszafele
        
        let cellaSzabi = tr.querySelector('.osszeg-szabi');
        let cellaTp    = tr.querySelector('.osszeg-tp');
        let cellaFn    = tr.querySelector('.osszeg-fn');

        // Ha az osztályok nincsenek meg, próbáljuk pozíció alapján (utolsó 3 cella)
        if (!cellaSzabi && tr.cells.length > 3) {
            cellaFn    = tr.cells[tr.cells.length - 1];
            cellaTp    = tr.cells[tr.cells.length - 2];
            cellaSzabi = tr.cells[tr.cells.length - 3];
        }

        if (cellaSzabi) cellaSzabi.textContent = szabi;
        if (cellaTp)    cellaTp.textContent    = tappenz;
        if (cellaFn)    cellaFn.textContent    = fizNelkuli;
    });
}



// --- JELENLÉTI ADATOK LEKÉRÉSE EGY ADOTT OPERÁTORRA ---
function adatokBetolteseANaptarba(opSzam) {
    // Ha nem kaptunk paramétert, ne csináljunk semmit
    if (!opSzam) return;

    // Hónap lekérése az AblakCfg-ből
    const aktualisHonap = `${window.AblakCfg.ev}-${String(window.AblakCfg.honap).padStart(2,'0')}`;

    // Kérés indítása
    fetch(`${window.AblakCfg.apiBase}munkaido_lekerezes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            op_szam: opSzam,
            honap: aktualisHonap
        })
    })
    .then(r => r.json())
    .then(response => {
        if (response.status === 'ok' && response.adatok && response.adatok.length > 0) {
            // Siker: Megjelenítjük az adatokat, átadva az OP számot is!
            megjelenitoFugveny(response.adatok, opSzam);
        }
    })
    .catch(err => console.error("Hiba az adatok lekérésekor:", opSzam, err));
}

// Ékezet-eltávolító segéd
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}





























// --- ÓVATOS MEGJELENÍTŐ (Javított szövegek + "M" elrejtése) ---
function megjelenitoFugveny(adatok, opSzam, kellFrissites = true) {
    if (!adatok || !opSzam) return;

    if (opSzam.includes('0057') && adatok.length > 0) {
        console.log("🔍 ADATBÁZIS BETÖLTVE:", adatok.length, "sor");
    }

    adatok.forEach(function(rekord) {
        
        // 1. ADAT KINYERÉSE
        let nyers = rekord.dokumentum_típusa || rekord.státusz || '';
        if (!nyers) return; 

        // 2. SZÖVEG CSERE ÉS TISZTÍTÁS 🧹
        let statuszKod = nyers;

        // --- A) Hosszú szövegek cseréje rövidre (SZ) ---
        // Rendes szabadság
        if (statuszKod.includes('Rendes szabadság') || statuszKod.includes('Szabadság')) {
            statuszKod = statuszKod.replace(/Rendes szabadság/gi, 'SZ');
            statuszKod = statuszKod.replace(/Szabadság/gi, 'SZ');
        }
        // Tanulmányi szabadság -> SZ
        if (statuszKod.toLowerCase().includes('tanulmányi')) {
             statuszKod = 'SZ'; 
        }
        // Temetési szabadság (Közeli hozzátartozó...) -> SZ
        if (statuszKod.toLowerCase().includes('hozzátartozó') || statuszKod.toLowerCase().includes('halála')) {
             statuszKod = 'SZ';
        }

        // --- B) Táppénz tisztítás ---
        if (statuszKod.includes('Táppénz') || statuszKod.includes('tappenz')) {
            statuszKod = statuszKod.replace(/Táppénz/gi, 'TP');
            statuszKod = statuszKod.replace(/tappenz/gi, 'TP');
            statuszKod = statuszKod.replace(/ \(GYÁP\)/gi, ''); 
        }

        // --- C) Fizetés nélküli ---
        if (statuszKod.includes('Fizetés nélküli')) {
            statuszKod = statuszKod.replace(/Fizetés nélküli.*$/gi, 'fn');
        }

        // --- D) "M" betű és "Munkanap" irtása 🔫 ---
        // Ha a tisztítás után "M" vagy "Munkanap" maradt, azt töröljük!
        if (statuszKod === 'M' || statuszKod === 'Munkanap') {
            statuszKod = '';
        }

        statuszKod = statuszKod.replace(/ és /g, ' | ');
        
        // Ha a tisztítás után üres lett a kód (pl. mert "M" volt), akkor lépjünk a következőre
        // KIVÉVE, ha törölni akarjuk a cella tartalmát. De a Busz logika miatt inkább írjuk be az üreset.
        
        // --- 3. SZÍNEZÉS ---
        const vizsgalt = statuszKod.toLowerCase(); 
        let tipusClass = 'egyeb';

        if (vizsgalt.indexOf('fn') > -1) {
            tipusClass = 'fizetes-nelkuli-szabadsag';
        } 
        else if (vizsgalt.indexOf('tp') > -1) {
            tipusClass = 'tappenz';
        } 
        else if (vizsgalt.indexOf('sz') > -1) {
            tipusClass = 'rendes-szabadsag';
        }
        else if (vizsgalt.indexOf('a') > -1) {
             tipusClass = 'rendszer-adat'; 
        }

        if (rekord.javitott === true) {
            tipusClass += ' javitott-adat'; 
        }

        // --- 4. RAJZOLÁS ---
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
                    // Itt írjuk be az adatot (ami lehet üres is, ha "M" volt!)
                    cella.textContent = statuszKod; 
                    
                    cella.className = ''; 
                    // Csak akkor színezzük, ha van benne szöveg
                    if (statuszKod !== '' && tipusClass !== 'egyeb') {
                        cella.classList.add(...tipusClass.split(' '));
                    }
                }
            }
            aktualisNap.setDate(aktualisNap.getDate() + 1);
        }
    });

    if (kellFrissites) {
        setTimeout(function() {
            frissitOsszesOszlop();
        }, 500);
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

// Segédfüggvény: A kapott adatok (pl. "2025-12-24": "Ü") felrajzolása
function alkalmazNaptarAdatok(adatok) {
    const fejlecSor = document.querySelector('tr.fejlec-napok-tipusa');
    if (!fejlecSor) return;

    const cellak = fejlecSor.cells;
    const ev = window.AblakCfg.ev;
    const honap = window.AblakCfg.honap;
    const tabla = document.querySelector("table.munkaido"); // Kell a táblázat is!

    for (let i = 2; i < cellak.length; i++) {
        const nap = i - 1; 
        const datumStr = `${ev}-${String(honap).padStart(2, '0')}-${String(nap).padStart(2, '0')}`;
        
        if (adatok[datumStr]) {
            const tipus = adatok[datumStr]; // "Ü" vagy "-"
            
            // 1. Fejléc frissítése
            cellak[i].innerText = tipus;

            // 2. Oszlop frissítése ("Vetítés" a sorokra) 📽️
            // Végigmegyünk az összes soron, és ahol üres a cella, oda beírjuk!
            if (tabla && tabla.rows) {
                for (let r = 2; r < tabla.rows.length; r++) { // 2. sortól kezdődik az adat
                    const sor = tabla.rows[r];
                    if (sor.cells[i]) {
                        const adatCella = sor.cells[i];
                        // Csak akkor írjuk felül, ha üres, vagy ha frissíteni kell a vizuális megjelenést
                        // (Itt használhatjuk ugyanazt a logikát, mint a beirErtek-nél, 
                        //  de egyszerűsítve: ha nincs benne "A" vagy "TP", akkor megjelenítjük a típust)
                        
                        const tartalom = adatCella.innerText.trim();
                        
                        // Ha üres a cella, mehet bele a típus
                        if (tartalom === '') {
                            adatCella.innerText = tipus;
                        }
                        // Ha már van benne valami (pl. A|TP), és nincs benne a típus, hozzáfűzhetjük
                        else if (!tartalom.includes(tipus) && tipus !== 'M') {
                            // Opcionális: összefésülés, ha szeretnéd látni az A mellett az Ü-t is
                            // adatCella.innerText = tartalom + ' | ' + tipus;
                        }
                    }
                }
            }
        }
    }
    console.log("✅ Naptár fejléc és oszlopok frissítve.");
    frissitOsszesOszlop(); 
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









// =========================================================
// 🏥 MODERN POPUP - KÖZVETLEN SZERKESZTŐ (DIRECT EDIT) ✏️
// =========================================================

let kivalasztottTipus = ''; 
let szerkesztoModAktiv = false;

function toggleSzerkesztoMod() {
    szerkesztoModAktiv = !szerkesztoModAktiv;
    document.body.classList.toggle('szerkeszto-mod-aktiv', szerkesztoModAktiv);
    
    const btn = document.getElementById('btnSzerkesztoMod');
    if(btn) {
        btn.innerHTML = szerkesztoModAktiv ? '✏️ Szerkesztés: BE' : '👁️ Csak olvasás';
        btn.style.background = szerkesztoModAktiv ? '#ff5722' : '#ccc'; // Narancssárga, hogy jelezze a veszélyt
    }
}

document.addEventListener('click', function(e) {
    if (!szerkesztoModAktiv) return;

    const td = e.target.closest('td');
    if (!td || !td.dataset.nap || !td.dataset.op) return;
    if (td.classList.contains('inaktiv-nap')) return;

    nyisdMegAPopupot(td);
});

function nyisdMegAPopupot(cella) {
    const opKod = cella.dataset.op;
    const nap = parseInt(cella.dataset.nap);
    
    let nev = opKod;
    if (window.FelhasznaloLista) {
        const user = window.FelhasznaloLista.find(u => u.op_szam == opKod);
        if (user) nev = `${user.nev} (${opKod})`;
    }

    let overlay = document.getElementById('szerkesztoPopup');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'szerkesztoPopup';
        overlay.className = 'popup-overlay';
        overlay.innerHTML = `
            <div class="popup-doboz">
                <div class="popup-fejlec">
                    <div class="popup-cim" id="popupCim"></div>
                    <div class="popup-bezars" onclick="bezardAPopupot()">×</div>
                </div>
                
                <div id="popupEredetiAdatok" style="margin-bottom:10px; color:#666; font-size:14px;"></div>
                
                <div style="font-weight:bold; margin-top:10px;">📅 Időszak kijelölése (Kezdete - Vége):</div>
                <div class="mini-naptar-kontener" id="popupMiniNaptar"></div>
                
                <div class="tipus-valaszto">
                    <button class="tipus-btn btn-sz" onclick="valasszTipust('SZ')">Szabadság</button>
                    <button class="tipus-btn btn-tp" onclick="valasszTipust('TP')">Táppénz</button>
                    <button class="tipus-btn btn-fn" onclick="valasszTipust('fn')">Fiz. Nélk.</button>
                    <button class="tipus-btn btn-a" onclick="valasszTipust('A')">Jelenlét (A)</button>
                </div>

                <div class="popup-footer">
                    <button class="btn-reset" onclick="popupTorles()" style="background:#d32f2f; color:white;">🗑️ REKORD TÖRLÉSE</button>
                    <button class="btn-save" onclick="popupMentese()">💾 FELÜLÍRÁS (MENTÉS)</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('popupCim').innerText = `Szerkesztés: ${nev}`;
    
    // Jelenlegi állapot (csak infónak)
    const eredetiSzoveg = cella.innerText; 
    const eredetiKontener = document.getElementById('popupEredetiAdatok');
    eredetiKontener.innerHTML = 'Jelenleg a cellában: ';
    if(!eredetiSzoveg) eredetiKontener.innerHTML += '<i>(Üres)</i>';
    else eredetiKontener.innerHTML += `<b>${eredetiSzoveg}</b>`;

    generaldMiniNaptarat(nap);

    kivalasztottTipus = '';
    frissitGombStilusok();
    overlay.style.display = 'flex';
    
    const saveBtn = overlay.querySelector('.btn-save');
    saveBtn.dataset.op = opKod;
}

function bezardAPopupot() {
    document.getElementById('szerkesztoPopup').style.display = 'none';
}

function generaldMiniNaptarat(fokuszNap) {
    const kontener = document.getElementById('popupMiniNaptar');
    kontener.innerHTML = '';
    const napokSzama = window.AblakCfg.napokSzama;
    const fejlecRow = document.querySelector('tr.fejlec-napok-tipusa');

    for (let i = 1; i <= napokSzama; i++) {
        const div = document.createElement('div');
        div.className = 'nap-box';
        div.dataset.nap = i;
        
        let napTipus = ''; 
        if(fejlecRow && fejlecRow.cells[i+1]) {
            const txt = fejlecRow.cells[i+1].innerText.trim();
            if(txt === 'Ü') { div.classList.add('unnep'); napTipus='Ü'; }
            if(txt === '-') { div.classList.add('hetvege'); napTipus='-'; }
        }

        div.innerHTML = `<div class="nap-szam">${i}</div><div class="nap-tipus">${napTipus}</div>`;

        if (i === fokuszNap) {
            div.classList.add('kivalasztva');
            setTimeout(() => div.scrollIntoView({block: "center", inline: "center", behavior:"smooth"}), 10);
        }

        div.onclick = function() {
            div.classList.toggle('kivalasztva');
        };
        kontener.appendChild(div);
    }
}

function valasszTipust(tipus) {
    kivalasztottTipus = tipus;
    frissitGombStilusok();
}

function frissitGombStilusok() {
    document.querySelectorAll('.tipus-btn').forEach(btn => btn.classList.remove('aktiv'));
    if (kivalasztottTipus === 'SZ') document.querySelector('.btn-sz').classList.add('aktiv');
    if (kivalasztottTipus === 'TP') document.querySelector('.btn-tp').classList.add('aktiv');
    if (kivalasztottTipus === 'fn') document.querySelector('.btn-fn').classList.add('aktiv');
    if (kivalasztottTipus === 'A')  document.querySelector('.btn-a').classList.add('aktiv');
}

// --- KÖZVETLEN CSATLAKOZÁS A MŰKÖDŐ MENTÉSHEZ ---

// --- MENTÉS A LÉTEZŐ PHP-VAL ---
function popupMentese() {
    if (!kivalasztottTipus) { alert("Válassz típust (SZ, TP, fn)!"); return; }

    const saveBtn = document.querySelector('#szerkesztoPopup .btn-save');
    const opKod = saveBtn.dataset.op;
    
    // Kijelölt napok
    const napok = [];
    document.querySelectorAll('#popupMiniNaptar .nap-box.kivalasztva').forEach(box => {
        napok.push(parseInt(box.dataset.nap));
    });

    if (napok.length === 0) { alert("Jelölj ki napokat!"); return; }

    const ev = window.AblakCfg.ev;
    const honap = String(window.AblakCfg.honap).padStart(2, '0');

    // Milyen típusnevet vár a PHP szótára? (munkaido_mentes.php 100. sor)
    let belsoTipus = '';
    if (kivalasztottTipus === 'SZ') belsoTipus = 'rendes-szabadsag';
    if (kivalasztottTipus === 'TP') belsoTipus = 'tappenz';
    if (kivalasztottTipus === 'fn') belsoTipus = 'fizetes-nelkuli-szabadsag';

    // Ciklus: Minden kijelölt napot külön elküldünk a te PHP-dnak
    const igéretek = napok.map(nap => {
        const datumStr = `${ev}-${honap}-${String(nap).padStart(2, '0')}`;
        
        return fetch(`${window.AblakCfg.apiBase}munkaido_mentes.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                op_szam: opKod,
                datum: datumStr,
                ertek: kivalasztottTipus,
                tipus: belsoTipus,
                nap_tipus: 'M' // Itt küldjük az M-et, hogy tudja: munkanapról van szó
            })
        }).then(r => r.json());
    });

    Promise.all(igéretek).then(() => {
        bezardAPopupot();
        adatokBetolteseANaptarba(opKod); 
        alert("Sikeres mentés az időszakra!");
    });
}

// --- TÖRLÉS (VISSZAÁLLÍTÁS) ---
function popupTorles() {
    const kivalasztott = document.querySelector('#popupMiniNaptar .nap-box.kivalasztva');
    if(!kivalasztott) { alert("Jelölj ki egy napot!"); return; }
    
    if(!confirm("Biztosan törlöd a bejegyzést?")) return;

    const opKod = document.querySelector('#szerkesztoPopup .btn-save').dataset.op;
    const nap = kivalasztott.dataset.nap;
    const datumStr = `${window.AblakCfg.ev}-${String(window.AblakCfg.honap).padStart(2, '0')}-${String(nap).padStart(2, '0')}`;

    // A te PHP-dban az 'A' vagy az üres érték váltja ki a törlést (32. sor)
    fetch(`${window.AblakCfg.apiBase}munkaido_mentes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            op_szam: opKod,
            datum: datumStr,
            ertek: 'A',
            tipus: '',
            nap_tipus: 'M'
        })
    }).then(() => {
        bezardAPopupot();
        adatokBetolteseANaptarba(opKod);
        alert("Bejegyzés törölve.");
    });
}