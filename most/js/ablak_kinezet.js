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