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

// --- 1. Fejléc kattintás kezelése (KIKAPCSOLVA - A Popup veszi át) ---
function beirErtek(cell) { return; }

// --- 2. Az oszlopfrissítő motor (JAVÍTVA: Megőrzi a badge-et a bal felső sarokban) ---
function vetitOszlopra(colIndex, tipus) {
    const tbody = document.getElementById('tabla-body');
    if (!tbody) return;

    Array.from(tbody.rows).forEach(sor => {
        const adatCella = sor.cells[colIndex];
        if (adatCella && !adatCella.classList.contains('inaktiv-nap')) {
            // 1. Badge (szám) kimentése, ha létezik
            const badge = adatCella.querySelector('.nap-szamlalo-badge');
            const badgeHtml = badge ? badge.outerHTML : '';
            
            // 2. Szöveg tisztítása a művelethez (badge számai nélkül)
            let tartalom = adatCella.textContent.replace(/[0-9]/g, '').trim();
            
            if (tipus === 'M') {
                tartalom = tartalom.replace(' | Ü', '').replace('Ü | ', '').replace('Ü', '')
                                 .replace(' | -', '').replace('- | ', '').replace('-', '').trim();
            } else if (tipus === 'Ü' || tipus === '-') {
                if (tartalom === '' || tartalom === 'Ü' || tartalom === '-') {
                    tartalom = tipus; 
                } else if (tartalom.includes('A')) {
                    let tiszta = tartalom.replace(' | Ü', '').replace('Ü | ', '').replace('Ü', '')
                                         .replace(' | -', '').replace('- | ', '').replace('-', '').trim();
                    tartalom = (tiszta === '') ? tipus : tiszta + ' | ' + tipus;
                }
            }
            
            // 3. VISSZAÍRÁS: A badge marad a helyén, a szöveg pedig frissül mellé/alá
            adatCella.innerHTML = badgeHtml + tartalom;
        }
    });
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