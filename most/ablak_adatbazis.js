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

// Ékezet-eltávolító segéd
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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