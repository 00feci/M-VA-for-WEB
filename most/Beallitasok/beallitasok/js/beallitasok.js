// 1. Navigációs gombok vagy Menüpontok generálása
    if (cel === 'felhasznalok') {
        // Speciális funkciógombok a Felhasználók modulhoz
        const gombSor = document.createElement('div');
        gombSor.className = 'dashboard-gomb-sor';
        gombSor.style.display = 'flex';
        gombSor.style.justifyContent = 'space-between';
        gombSor.style.width = '100%';
        gombSor.style.marginBottom = '15px';
        
        const gombok = [
            { f: '🔙 Vissza', c: 'fomenu', color: '' },
            { f: '💾 Mentés', fn: mentesKivalasztott, color: '' },
            { f: '🗑️ Törlés', fn: torlesKivalasztott, color: '#c62828' }
        ];

        gombok.forEach(g => {
            const btn = document.createElement('div');
            btn.className = 'dashboard-gomb';
            btn.style.flex = '1';
            btn.style.margin = '0 5px';
            btn.innerText = g.f;
            if (g.color) btn.style.borderColor = g.color;
            btn.onclick = g.fn ? () => g.fn() : () => navigacio(g.c);
            gombSor.appendChild(btn);
        });
        kontener.appendChild(gombSor);

        // Tartalom helye és betöltése
        const modulDoboz = document.createElement('div');
        modulDoboz.id = 'modul-tartalom';
        modulDoboz.style.width = '100%';
        kontener.appendChild(modulDoboz);

        if (typeof felhasznalokBetoltese !== 'function') {
            const script = document.createElement('script');
            script.src = 'Beallitasok/beallitasok/Felhasznalok/js/felhasznalok.js?v=' + new Date().getTime();
            script.onload = () => felhasznalokBetoltese();
            document.body.appendChild(script);
        } else {
            felhasznalokBetoltese();
        }
    } else {
        // Általános menüpontok kirakása a menuAdatok alapján (fomenu, szabadsag, rendszer)
        adat.gombok.forEach(g => {
            const gomb = document.createElement('div');
            gomb.className = 'dashboard-gomb';
            gomb.innerText = g.felirat;
            gomb.onclick = () => navigacio(g.cel);
            kontener.appendChild(gomb);
        });
    }
