
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
window.addEventListener('load', frissitStickyTopok);


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


