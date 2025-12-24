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
function toggleSzerkesztoMod() {
    szerkesztoModAktiv = !szerkesztoModAktiv;
    document.body.classList.toggle('szerkeszto-mod-aktiv', szerkesztoModAktiv);
    const btn = document.getElementById('btnSzerkesztoMod');
    if(btn) {
        btn.innerHTML = szerkesztoModAktiv ? '✏️ Szerkesztés: BE' : '👁️ Csak olvasás';
        btn.style.background = szerkesztoModAktiv ? '#ff5722' : '#ccc'; 
    }
}
// Ékezet-eltávolító segéd
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function valasszTipust(tipus) {
    kivalasztottTipus = tipus;
    frissitGombStilusok();
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
// Alapállapot beállítása
window.onload = frissitKijelzo;


function frissitStickyTopok() {
  const toolbar = document.querySelector('.sticky-gombok');
  const row1 = document.querySelector('table.munkaido thead tr.fejlec-datumok');
  const hToolbar = toolbar ? toolbar.offsetHeight : 0;
  const hRow1 = row1 ? row1.offsetHeight : 0;
  document.documentElement.style.setProperty('--sticky-toolbar-h', hToolbar + 'px');
  document.documentElement.style.setProperty('--header1-h', hRow1 + 'px');
}
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