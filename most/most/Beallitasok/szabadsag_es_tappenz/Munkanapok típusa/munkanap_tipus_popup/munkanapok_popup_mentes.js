// --- 2. A Mentés Logika (A te változatod) ---
async function beallitasokMentese(modalbol = false, napModalbol = false) {
    const mainSelect = document.getElementById('sztp_megnevezes');
    const editSelect = document.getElementById('sztp_edit_megnevezes');
    const select = (editSelect && editSelect.value) ? editSelect : mainSelect;
    
    const fajlLista = document.getElementById('sztp-fajl-lista');
    const napTipusSelect = document.getElementById('sztp_nap_tipusa');
    const id = document.getElementById('sztp_munkanap_id')?.value || "";

    // Alapértelmezett új adatok
    let ujAdatok = { 
        napok: [], 
        nagy_rekord: document.getElementById('sztp_nagy_rekord')?.value || 'nem' 
    };
    let extra = ujAdatok; 

    // Meglévő adatok megőrzése
    if (id) {
        try {
            const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id);
            const d = await r.json();
            if (d.success && d.adat.extra_adatok) {
                const regiExtra = JSON.parse(d.adat.extra_adatok);
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
        adat.extra_adatok.napok = []; 
        for (let i = 1; i < napTipusSelect.options.length; i++) {
            const opt = napTipusSelect.options[i];
            const reszek = opt.text.match(/(.*) \((.*)\)/);
            adat.extra_adatok.napok.push({ nev: reszek ? reszek[1] : opt.text, jel: opt.value });
        }
    }

   let sablonNeve = null;
if (typeof kivalasztottFajlokBuffer !== 'undefined' && kivalasztottFajlokBuffer.length > 0) {
const osszesFajl = kivalasztottFajlokBuffer.length;
let feltoltve = 0;
let hibas = 0;
 // Megkeressük a popup-ban lévő valós státusz és lista elemeket
    const aktivLista = document.getElementById('sztp-modal-fajl-lista') || fajlLista;
    const statuszSzoveg = document.getElementById('sztp-modal-statusz');
    
    if (aktivLista) aktivLista.innerHTML = `<li><span style="color:#2196F3">⏳</span> Feltöltés indul (0 / ${osszesFajl})...</li>`;
    if (statuszSzoveg) statuszSzoveg.innerHTML = `⏳ Feltöltés folyamatban: 0%`;

    const batchSize = 5; 
    
    for (let i = 0; i < osszesFajl; i += batchSize) {
        const batch = kivalasztottFajlokBuffer.slice(i, i + batchSize);
        
        const promises = batch.map(async (fajl) => {
            const formData = new FormData();
            formData.append('sablon', fajl); 
            formData.append('megnevezes', adat.megnevezes); 
            formData.append('relativ_utvonal', fajl.relPath || fajl.name);
            
            try {
                const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_feltoltes.php', { method: 'POST', body: formData });
                const d = await r.json(); 
                if (!d.success) throw new Error(d.message);
                feltoltve++;
            } catch (e) { 
                console.error("Hiba a fájlnál: " + fajl.name, e);
                hibas++;
            }
        });

        await Promise.all(promises);

        // UI frissítése a csomag után
        let szazalek = Math.round(((feltoltve + hibas) / osszesFajl) * 100);
        if (aktivLista) {
            aktivLista.innerHTML = `<li><span style="color:#4CAF50">🚀</span> Feltöltés: <b>${feltoltve + hibas} / ${osszesFajl}</b> fájl kész (${szazalek}%)</li>`;
        }
        if (statuszSzoveg) {
            statuszSzoveg.innerHTML = `🚀 Feltöltés: ${szazalek}% kész`;
        }
    }
    
    if (hibas > 0) {
        alert(`Figyelem: A feltöltés befejeződött, de ${hibas} fájlt hiba miatt nem sikerült menteni!`);
    }
    
    sablonNeve = adat.megnevezes; 
    kivalasztottFajlokBuffer = [];
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
            if (typeof listaBetoltese === 'function') listaBetoltese();
            if (adat.id && !napModalbol && typeof adatokBetoltese === 'function') adatokBetoltese(adat.id); 
            
            const feltoltoModal = document.getElementById('sztp-feltolto-modal');
            if (modalbol && feltoltoModal) feltoltoModal.style.display = 'none';

            if (napModalbol) { 
                document.getElementById('sztp-nap-modal').style.display = 'none'; 
                alert("Nap típusok mentve!"); 
            } else { 
                alert(data.message); 
            }
        } else { 
            alert("Hiba: " + data.message); 
        }
    });
}
