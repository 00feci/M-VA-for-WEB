// ✏️ Szerkesztő mód állapota
let szerkesztoModAktiv = false;

// 🎨 Cella stílusok kezelése
function addCssClassToCell(td, tipusClass) {
  if (!td) return;
  // Régi típusos osztályok törlése
  td.classList.remove(
    'rendes-szabadsag',
    'tanulmanyi-szabadsag',
    'kozeli-hozzatartozo-halala-miatt',
    'tappenz',
    'tappenz-gyap',
    'fizetes-nelkuli-szabadsag',
    'rendszer-adat'
  );
  // Új osztály hozzáadása
  if (tipusClass) {
    td.classList.add(tipusClass);
  }
}

function toggleSzerkesztoMod() {
    szerkesztoModAktiv = !szerkesztoModAktiv;
    document.body.classList.toggle('szerkeszto-mod-aktiv', szerkesztoModAktiv);
    const btn = document.getElementById('btnSzerkesztoMod');
    if(btn) {
        btn.innerHTML = szerkesztoModAktiv ? '✏️ Szerkesztés' : '👁️ Csak olvasás';
        btn.style.background = szerkesztoModAktiv ? '#00CED1' : '#f2f2f2';
        btn.style.color = 'black';
    }
}

// Alapállapot beállítása (Slider hívások nélkül)
window.onload = function() {
    console.log("Naptár felület betöltve, hiba mentesen.");
};


function frissitStickyTopok() {
  const toolbar = document.querySelector('.sticky-gombok');
  const row1 = document.querySelector('table.munkaido thead tr.fejlec-datumok');
  const hToolbar = toolbar ? toolbar.offsetHeight : 0;
  const hRow1 = row1 ? row1.offsetHeight : 0;
  document.documentElement.style.setProperty('--sticky-toolbar-h', hToolbar + 'px');
  document.documentElement.style.setProperty('--header1-h', hRow1 + 'px');
}

window.addEventListener('resize', frissitStickyTopok);

document.addEventListener("DOMContentLoaded", function() {
  const select = document.getElementById("tipusSelect");
  const preview = document.getElementById("tipusPreview");
  
  frissitStickyTopok();

  if (select && preview) {
    const applyPreview = () => {
      const opt = select.selectedOptions[0];
      if (!opt) return;
      const kod = opt.dataset.kod || ''; 
      const cssClass = opt.value;        

      if (cssClass === 'eger' || !kod) {
        preview.textContent = '🖱';
        preview.className = 'kod-preview';
      } else {
        preview.textContent = kod;
        preview.className = 'kod-preview ' + cssClass;
      }
    };
    select.addEventListener("change", applyPreview);
    applyPreview(); 
  }
});

// Ékezet-eltávolító segéd
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
// kod