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

// --- 1. Fejléc kattintás kezelése (Azonnali vetítéssel) ---
function beirErtek(cell) {
  const ertek = ertekek[aktualisIndex]; // "🖱", "Ü", "-", "M"
  
  if (!cell.classList.contains('napok-tipusa') || ertek === '🖱') {
    return;
  }
  
  // Fejléc frissítése
  cell.innerText = ertek;
  
  // AZONNALI VETÍTÉS: Frissítjük az oszlopot a táblázatban
  vetitOszlopra(cell.cellIndex, ertek);
  
  // Elmentjük az adatbázisba
  naptarFejlecMentese(cell, ertek);
  
  // Újraszámoljuk az összesítőt
  frissitOsszesOszlop();
}

// --- 2. Az oszlopfrissítő motor (Ez akadályozza meg az "M" szaladását) ---
function vetitOszlopra(colIndex, tipus) {
    const tbody = document.getElementById('tabla-body');
    if (!tbody) return;

    Array.from(tbody.rows).forEach(sor => {
        const adatCella = sor.cells[colIndex];
        if (adatCella && !adatCella.classList.contains('inaktiv-nap')) {
            const tartalom = adatCella.innerText.trim();
            
          if (tipus === 'M') {
    // Munkanap (M) esetén töröljük az Ü/- jeleket a szövegből
    if (tartalom.includes('Ü') || tartalom.includes('-')) {
        adatCella.innerText = tartalom.replace(' | Ü', '').replace('Ü | ', '').replace('Ü', '')
                                     .replace(' | -', '').replace('- | ', '').replace('-', '').trim();
    }
          } else if (tipus === 'Ü' || tipus === '-') {
    // Ünnep vagy Hétvége esetén:
    if (tartalom === '') {
        adatCella.innerText = tipus; // Ha üres, beírjuk
    } else if (tartalom === 'A' || tartalom.includes('A')) {
        // SZ|A SZABÁLY: Ha van már benne rendszeradat, fűzzük hozzá a fejlécet
        if (!tartalom.includes(tipus)) {
            adatCella.innerText = tartalom + ' | ' + tipus;
        }
    }
}
        }
    });
}

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
        // Klónozzuk a cellát, hogy ne rontsuk el a naptárban lévőt
        let cellClone = cells[c].cloneNode(true);
        // Eltávolítjuk a számot (badge) a klónból, hogy ne kerüljön az Excelbe
        let badges = cellClone.querySelectorAll('.nap-szamlalo-badge');
        badges.forEach(b => b.remove());
        // Így az Excelbe csak a tiszta betűjel (SZ, TP, stb.) kerül
        value = cellClone.innerText.trim();
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


// --- JELENLÉTI ADATOK LEKÉRÉSE EGY ADOTT OPERÁTORRA ---
function adatokBetolteseANaptarba(opSzam) {
    if (!opSzam) return;

    // ELŐTISZTÍTÁS: Reload helyett kiürítjük a dolgozó sorát a naptárban
    const cellak = document.querySelectorAll(`td[data-op="${opSzam}"]`);
    cellak.forEach(td => {
        if (!td.classList.contains('inaktiv-nap')) {
            td.textContent = '';
            td.className = 'ures-cella'; // Minden színt és hibajelzőt leveszünk
            delete td.dataset.kezdet;
            delete td.dataset.vegzet;
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

// Ékezet-eltávolító segéd
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
        btn.style.background = szerkesztoModAktiv ? '#ff5722' : '#ccc'; 
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
    const napokSzama = window.AblakCfg ? (window.AblakCfg.napokValos || 31) : 31;

    // 3. PONT: "A" korlát elengedése
    let startLimit = 1;
    let endLimit = napokSzama;

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
                <div style="background: #fff3e0; border-left: 5px solid #ff9800; padding: 10px; margin-bottom: 15px; font-weight: bold; color: #e65100;">
                    ⚠️ Egy popup = 1 dokumentum ⚠️
                </div>
                <div id="popupEredetiAdatok" style="margin-bottom:10px; color:#666; font-size:14px;"></div>
                <div style="font-weight:bold; margin-top:10px;">📅 Időszak kijelölése:</div>
                <div class="mini-naptar-kontener" id="popupMiniNaptar"></div>
                <div class="tipus-valaszto-kontener" style="margin-top:15px; display:flex; align-items:center; gap:10px;">
                    <span id="popupTipusPreview" class="kod-preview">🖱</span>
                    <select id="popupTipusSelect" onchange="updatePopupPreview(this)" style="flex:1; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
                        <option value="">-- Válassz típust --</option>
                        <option value="rendszer-adat" data-kod="A">rendszerből Adat</option>
                        <option value="rendes-szabadsag" data-kod="SZ">Rendes szabadság</option>
                        <option value="tanulmanyi-szabadsag" data-kod="SZ">Tanulmányi szabadság</option>
                        <option value="kozeli-hozzatartozo-halala-miatt" data-kod="SZ">Közeli hozzátartozó halála miatt</option>
                        <option value="tappenz" data-kod="TP">Táppénz</option>
                        <option value="tappenz-gyap" data-kod="TP">Táppénz (GYÁP)</option>
                        <option value="fizetes-nelkuli-szabadsag" data-kod="fn">Fizetés nélküli szabadság</option>
                    </select>
                </div>
                <div class="popup-footer">
                    <button class="btn-reset" onclick="popupTorles()" style="background:#d32f2f; color:white;">🗑️ TÖRLÉS</button>
                    <button class="btn-save" onclick="popupMentese()">💾 MENTÉS</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('popupCim').innerText = `Szerkesztés: ${nev}`;
    
    // xcxxx kód, ezt a blokot cseréld
    const select = document.getElementById('popupTipusSelect');
    
    // 4. hiba javítása: Megkeressük a típus teljes nevét a dataset.tipus alapján
    let teljesTipusNev = '';
    if (select && cella.dataset.tipus) {
        const option = Array.from(select.options).find(opt => opt.value === cella.dataset.tipus);
        teljesTipusNev = option ? option.text : '';
    }
    
    const badge = cella.querySelector('.nap-szamlalo-badge');
    const napokSzamaAdat = badge ? badge.innerText : '1';
    const tisztaKod = cella.innerText.replace(napokSzamaAdat, '').trim();
    
    // Ha van teljes nevünk, azt írjuk ki, ha nincs, akkor a cella rövid kódját
    const megjelenitendoNev = teljesTipusNev || tisztaKod;
    
    const kezdet = cella.dataset.kezdet ? cella.dataset.kezdet.replaceAll('-', '.') : '';
    const vegzet = cella.dataset.vegzet ? cella.dataset.vegzet.replaceAll('-', '.') : '';
    const datumKiiras = kezdet ? ` (${kezdet} - ${vegzet})` : '';

    document.getElementById('popupEredetiAdatok').innerHTML = 'Jelenleg: ' + (megjelenitendoNev && megjelenitendoNev !== '🖱' ? `<b>${megjelenitendoNev} (${napokSzamaAdat} nap)${datumKiiras}</b>` : '<i>(Üres)</i>');

    generaldMiniNaptarat(nap, startLimit, endLimit, opKod);

    kivalasztottTipus = '';
    if(select) {
        select.value = '';
        // 2. hiba javítása: Kényszerítjük a színes négyzetet az alaphelyzetre (🖱)
        updatePopupPreview(select); 
    }


    overlay.style.display = 'flex';
    overlay.querySelector('.btn-save').dataset.op = opKod;
}

function bezardAPopupot() {
    const popup = document.getElementById('szerkesztoPopup');
    if (popup) popup.style.display = 'none';
}

function generaldMiniNaptarat(fokuszNap, startLimit, endLimit, opKod) {
    const kontener = document.getElementById('popupMiniNaptar');
    if (!kontener) return;
    kontener.innerHTML = '';
    const fejlecRow = document.querySelector('tr.fejlec-napok-tipusa');
    const getCellContent = (n) => {
        let c = document.querySelector(`td[data-op="${opKod}"][data-nap="${n}"]`);
        if (!c) c = document.querySelector(`td[data-op="${opKod}"][data-nap="${String(n).padStart(2, '0')}"]`);
        return c ? c.textContent.trim() : '';
    };

    for (let i = startLimit; i <= endLimit; i++) {
        const div = document.createElement('div');
        div.className = 'nap-box';
        div.dataset.nap = i;
        const aktualisTartalom = getCellContent(i);
        let napTipus = ''; 
        if(fejlecRow && fejlecRow.cells[i+1]) {
            const txt = fejlecRow.cells[i+1].innerText.trim();
            if(txt === 'Ü') { div.classList.add('unnep'); napTipus='Ü'; }
            if(txt === '-') { div.classList.add('hetvege'); napTipus='-'; }
        }
        div.innerHTML = `<div class="nap-szam">${i}</div><div class="nap-jelenlegi-kod" style="font-size: 18px; font-weight: bold; color: #333;">${aktualisTartalom}</div><div class="nap-tipus">${napTipus}</div>`;
        if (i === fokuszNap) div.classList.add('kivalasztva');
        div.onclick = function() { div.classList.toggle('kivalasztva'); };
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

function popupMentese() {
    const select = document.getElementById('popupTipusSelect');
    const opt = select ? select.selectedOptions[0] : null;
    if (!opt || !opt.value) { alert("Válassz típust!"); return; }

    const kivalasztottTipus = opt.dataset.kod;
    const kivalasztottOsztaly = opt.value;
    const opKod = document.querySelector('#szerkesztoPopup .btn-save').dataset.op;
    const kijeloltNapok = Array.from(document.querySelectorAll('#popupMiniNaptar .nap-box.kivalasztva'))
                       .map(box => parseInt(box.dataset.nap)).sort((a, b) => a - b);

    if (kijeloltNapok.length === 0) { alert("Jelölj ki napokat!"); return; }

    const ev = window.AblakCfg.ev;
    const honap = String(window.AblakCfg.honap).padStart(2, '0');
    const napokValos = window.AblakCfg.napokValos || 31;

    let blokkok = [];
    let aktualisBlokk = [kijeloltNapok[0]];
    for (let i = 1; i < kijeloltNapok.length; i++) {
        if (kijeloltNapok[i] === kijeloltNapok[i-1] + 1) aktualisBlokk.push(kijeloltNapok[i]); 
        else { blokkok.push(aktualisBlokk); aktualisBlokk = [kijeloltNapok[i]]; }
    }
    blokkok.push(aktualisBlokk);

    const igeretek = blokkok.map(blokk => {
        const start = blokk[0];
        const veg = blokk[blokk.length - 1];
        let visszateres = "";
        for (let j = veg + 1; j <= napokValos; j++) {
            let c = document.querySelector(`td[data-op="${opKod}"][data-nap="${j}"]`);
            if (!c) c = document.querySelector(`td[data-op="${opKod}"][data-nap="${String(j).padStart(2, '0')}"]`);
            let txt = c ? c.textContent.trim() : "";
            if (txt !== '-' && txt !== 'Ü') {
                visszateres = `${ev}-${honap}-${String(j).padStart(2, '0')}`;
                break;
            }
        }

     return fetch(`${window.AblakCfg.apiBase}munkaido_mentes.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                op_szam: opKod,
                datum: `${ev}-${honap}-${String(start).padStart(2, '0')}`,
                datum_veg: `${ev}-${honap}-${String(veg).padStart(2, '0')}`,
                visszateres_napja: visszateres,
                ertek: kivalasztottTipus,
                tipus: kivalasztottOsztaly === 'rendszer-adat' ? '' : kivalasztottOsztaly,
                nap_tipus: 'M'
            })
        }).then(r => r.json());
    });

    Promise.all(igeretek).then(() => {
        bezardAPopupot();
        // Reload helyett csak az adott embert frissítjük, így nem ugrik el a görgetés!
        adatokBetolteseANaptarba(opKod); 
    });
}

function popupTorles() {
    const kijeloltNapok = document.querySelectorAll('#popupMiniNaptar .nap-box.kivalasztva');
    if(kijeloltNapok.length === 0) { alert("Jelölj ki legalább egy napot a törléshez!"); return; }
    if(!confirm("Biztosan törlöd a kijelölt napok bejegyzéseit?")) return;
    const opKod = document.querySelector('#szerkesztoPopup .btn-save').dataset.op;
    const ev = window.AblakCfg.ev;
    const honap = String(window.AblakCfg.honap).padStart(2, '0');

    const igéretek = Array.from(kijeloltNapok).map(box => {
        const nap = box.dataset.nap;
        return fetch(`${window.AblakCfg.apiBase}munkaido_mentes.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                op_szam: opKod,
                datum: `${ev}-${honap}-${String(nap).padStart(2, '0')}`,
                ertek: 'A',
                tipus: '',
                nap_tipus: 'M'
            })
        }).then(r => r.json());
    });

   Promise.all(igéretek).then(() => {
        bezardAPopupot();
        // Törlés után is csak az adott embert frissítjük
       adatokBetolteseANaptarba(opKod);
    });
}

function updatePopupPreview(select) {
    const preview = document.getElementById('popupTipusPreview');
    if (!preview) return;
    
    const opt = select.selectedOptions[0];
    if (!opt || !opt.value) {
        preview.textContent = '🖱';
        preview.className = 'kod-preview';
        return;
    }
    
    const kod = opt.dataset.kod || '';
    const cssClass = opt.value;
    
    preview.textContent = kod;
    // A css/ablak.css fájlban lévő osztályok használata (pl. .tappenz, .rendes-szabadsag)
    preview.className = 'kod-preview ' + cssClass;
}
//2