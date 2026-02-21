async function beallitasokMentese(modalbol = false, napModalbol = false) {
    const mainSelect = document.getElementById('sztp_megnevezes'), editSelect = document.getElementById('sztp_edit_megnevezes');
    const select = (editSelect && editSelect.value) ? editSelect : mainSelect;
    const fajlLista = document.getElementById('sztp-fajl-lista'), napTipusSelect = document.getElementById('sztp_nap_tipusa');
   const id = document.getElementById('sztp_id')?.value || "";
    // Alapértelmezett új adatok
    let ujAdatok = { 
        napok: [], 
        nagy_rekord: document.getElementById('sztp_nagy_rekord')?.value || 'nem' 
    };
    let extra = ujAdatok; 
    // ✨ Meglévő adatok (egyedi PDF pipák) megőrzése és összefésülése
    if (id) {
        try {
            const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id);
            const d = await r.json();
            if (d.success && d.adat.extra_adatok) {
                const regiExtra = JSON.parse(d.adat.extra_adatok);
                // ✨ Összefésülés: Megtartjuk a régit (PDF-ek), de frissítjük az újat (napok, nagy_rekord)
                extra = { ...regiExtra, ...ujAdatok };
            }
        } catch (e) { console.error("Adatmegőrzési hiba", e); }
    }
    const adat = {
        id: id,
        megnevezes: (select && select.selectedIndex > 0) ? select.options[select.selectedIndex].text : null,
        kod: document.getElementById('sztp_kod')?.value || '',
        hex_szin: document.getElementById('sztp_szin')?.value || '#ffffff',
        sablon_neve: null,
        extra_adatok: extra 
    };
    if (napModalbol && !adat.megnevezes) adat.megnevezes = "GLOBAL_NAP_TIPUSOK";
    if (!adat.megnevezes && !napModalbol) return alert("Válassz vagy adj hozzá megnevezést!");
    if (napTipusSelect) {
        adat.extra_adatok.napok = []; // Frissítjük a napokat az extra objektumban
        for (let i = 1; i < napTipusSelect.options.length; i++) {
            const opt = napTipusSelect.options[i], reszek = opt.text.match(/(.*) \((.*)\)/);
            adat.extra_adatok.napok.push({ nev: reszek ? reszek[1] : opt.text, jel: opt.value });
        }
    }
    let sablonNeve = null;
    if (kivalasztottFajlokBuffer.length > 0) {
        if (fajlLista) fajlLista.innerHTML = '<li>⏳ Feltöltés...</li>';
        for (let fajl of kivalasztottFajlokBuffer) {
            const formData = new FormData();
            formData.append('sablon', fajl); formData.append('megnevezes', adat.megnevezes); 
            formData.append('relativ_utvonal', fajl.relPath || fajl.name);
            try {
                const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_feltoltes.php', { method: 'POST', body: formData });
                const d = await r.json(); if (!d.success) throw new Error(d.message);
            } catch (e) { alert("Hiba: " + e.message); return; }
        }
        sablonNeve = adat.megnevezes; kivalasztottFajlokBuffer = [];
    } else if (fajlLista) {
        const elsoSor = fajlLista.querySelector('li');
        if (elsoSor && !elsoSor.innerText.includes('Jelenleg nincs')) sablonNeve = adat.megnevezes;
    }
    adat.sablon_neve = sablonNeve;
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_mentes.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adat)
    })
    .then(r => r.json()).then(data => {
        if (data.success) {
            listaBetoltese();
            if (adat.id && !napModalbol) adatokBetoltese(adat.id); 
            if (modalbol) feltoltoModalBezaras();
            if (napModalbol) { document.getElementById('sztp-nap-modal').style.display = 'none'; alert("Nap típusok mentve!"); }
            else { alert(data.message); }
        } else { alert("Hiba: " + data.message); }
    });
}
      function feltoltoModalBezaras() {
    const modal = document.getElementById('sztp-feltolto-modal');
    if (modal) modal.style.display = 'none';
}
