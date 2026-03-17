// xcxxx kód, ezt a blokot cseréld
async function sablonKezeleseOldal(frissitendoMappa = null) {
    const kontener = document.getElementById('modul-tartalom');
    const kategoriaId = document.getElementById('sztp_id')?.value || ""; 
    
    const sel = document.getElementById('sztp_megnevezes') || document.getElementById('sztp_edit_megnevezes');
    let megnevezesValue = "";
    const isMappaValid = frissitendoMappa && String(frissitendoMappa) !== "undefined" && String(frissitendoMappa) !== "null";

    if (isMappaValid) {
        megnevezesValue = frissitendoMappa;
    } else if (sel && sel.selectedIndex > 0) {
        megnevezesValue = sel.options[sel.selectedIndex].text;
    }
    const megjelenitettCim = megnevezesValue || "Sablonok";

    const gombSor = document.getElementById('modul-gomb-sor');
    if (gombSor) {
        gombSor.innerHTML = `<div class="dashboard-gomb" style="flex: 1; background: #607d8b; color: white;" onclick="szTpModulBetoltese(); setTimeout(() => fajtaBeallitasokMegnyitasa(), 100);">🔙 Vissza a beállításokhoz</div>`;
    }

    try {
        // ✨ HTML sablon betöltése
        const hR = await fetch('Beallitasok/szabadsag_es_tappenz/Munkanapok típusa/munkanap_tipus_popup/Sablon kezelése/sablon_kezelese.html');
        kontener.innerHTML = await hR.text();

        const idElem = document.getElementById('sztp_id');
        if (idElem) idElem.value = kategoriaId;
        
        const cimElem = document.getElementById('sztp-mappa-cim');
        if (cimElem) cimElem.innerText = `📁 ${megjelenitettCim} mappaszerkezete`;

        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_mappa_tree.php?megnevezes=' + encodeURIComponent(megnevezesValue));
        const d = await r.json();
        
        let pdfSettings = null;
        if(kategoriaId) {
            const res = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + kategoriaId);
            const sData = await res.json();
            if(sData.success && sData.adat.extra_adatok) {
                pdfSettings = JSON.parse(sData.adat.extra_adatok).pdf_beallitasok || null;
            }
        }

        if (d.success) {
            document.getElementById('sztp-fajl-fa').innerHTML = renderelFa(d.tree, megnevezesValue, pdfSettings);
            if(pdfSettings && pdfSettings.mind) {
                const allCheck = document.getElementById('pdf-all-toggle');
                if(allCheck) allCheck.checked = true;
            }
        }
    } catch (e) { console.error("Hiba a sablon kezelésekor:", e); }
}

function renderelFa(elemek, aktualisKategoria = "", pdfSettings = null) {
    if (!elemek || elemek.length === 0) return '<p style="color: #666;">A mappa üres.</p>';
    let html = '<ul style="list-style: none; padding-left: 20px; line-height: 2.2;">';
    elemek.forEach(i => {
        const ikon = i.type === 'folder' ? '📂' : '📄';
        const isDoc = i.name.toLowerCase().endsWith('.doc') || i.name.toLowerCase().endsWith('.docx');
        const tisztaUtvonal = i.path.replace(/\\/g, '/'), kodoltUtvonal = encodeURI(tisztaUtvonal);
        
        html += `<li style="color: #2196F3; border-bottom: 1px solid #222; padding: 2px 0;">
            <span style="cursor: default; font-weight: bold; min-width: 250px; display: inline-block;">${ikon} ${i.name}</span>
            <span style="display: inline-flex; gap: 12px; align-items: center; margin-left: 10px; vertical-align: middle;">
                ${i.type === 'file' ? `<a href="/Iroda/Dokumentum_tar/Szabadsag_es_tappenz/Sablonok/${kodoltUtvonal}" download style="text-decoration: none; font-size: 1.25em;" title="Letöltés">📥</a>` : ''}
                ${isDoc ? `<div style="display: inline-flex; align-items: center; gap: 4px; background: #121212; padding: 2px 6px; border-radius: 4px; border: 1px solid #333;" title="PDF készítés ebből a fájlból">
                    <span style="font-size: 0.7em; color: #888;">PDF</span>
                    <input type="checkbox" class="sztp-pdf-toggle" data-path="${tisztaUtvonal}" style="cursor:pointer;" onclick="sztpEgyediPdfToggle()" 
                    ${(pdfSettings && (pdfSettings.mind || (pdfSettings.fajlok && pdfSettings.fajlok.includes(tisztaUtvonal)))) ? 'checked' : ''}>
                </div>` : ''}
                <button onclick="sztpGyorsFeltoltesInditasa('${tisztaUtvonal}', ${i.type === 'folder'}, '${aktualisKategoria}')" style="border: none; background: none; cursor: pointer; color: #4CAF50; font-size: 1.25em; padding: 0;" title="Feltöltés / Felülírás">📤</button>
                <button onclick="sztpElemTorlese('${tisztaUtvonal}', '${aktualisKategoria}')" style="border: none; background: none; cursor: pointer; color: #f44336; font-size: 1.2em; padding: 0;" title="Törlés">🗑️</button>
            </span>
            ${i.date ? `<span style="color: #777; font-size: 0.8em; margin-left: 15px;">🕒 ${i.date}</span>` : ''}
            ${i.children ? renderelFa(i.children, aktualisKategoria, pdfSettings) : ''}
        </li>`;
    });
    return html + '</ul>';
}

function sztpGlobalPdfToggle(checked) {
    const egyediCheckek = document.querySelectorAll('.sztp-pdf-toggle');
    egyediCheckek.forEach(c => { c.checked = checked; });
}

function sztpEgyediPdfToggle() {
    const osszes = document.querySelectorAll('.sztp-pdf-toggle');
    const globalCheck = document.getElementById('pdf-all-toggle');
    const mindPipalva = osszes.length > 0 && Array.from(osszes).every(c => c.checked);
    if (globalCheck) globalCheck.checked = mindPipalva;
}

async function sztpPdfMentese() {
    const osszes = document.querySelectorAll('.sztp-pdf-toggle');
    const globalCheck = document.getElementById('pdf-all-toggle');
    const beallitasok = {
        mind: globalCheck ? globalCheck.checked : false,
        fajlok: Array.from(osszes).filter(c => c.checked).map(c => c.dataset.path)
    };

    const idElem = document.getElementById('sztp_id');
    const id = idElem ? idElem.value : null;

    if (!id) return alert("Hiba: Nincs kiválasztott kategória ID!");
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id);
        const d = await r.json();
        if (!d.success) throw new Error(d.message);
        let extra = d.adat.extra_adatok ? JSON.parse(d.adat.extra_adatok) : {};
        extra.pdf_beallitasok = beallitasok;
        const mentR = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_mentes.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, megnevezes: d.adat.megnevezes, kod: d.adat.kod, szin: d.adat.hex_szin, extra_adatok: extra })
        });
        const mentD = await mentR.json();
        alert(mentD.message);
    } catch (e) { alert("Hiba a mentés során!"); }
}

async function sztpElemTorlese(utvonal, kategoria) {
    if (confirm("BIZTOSAN törölni szeretnéd ezt az elemet?\n" + utvonal)) {
        try {
            const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_fajl_torlese.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: utvonal })
            });
            const d = await r.json();
            if (d.success) { sablonKezeleseOldal(kategoria); } else { alert("Hiba: " + d.message); }
        } catch (e) { console.error(e); }
    }
}

function sztpGyorsFeltoltesInditasa(utvonal, mappaE, kategoria) {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async e => {
        const fajl = e.target.files[0];
        if (!fajl) return;
        const formData = new FormData();
        formData.append('sablon', fajl);
        const reszek = utvonal.split('/').filter(p => p !== "");
        let megnevezes = kategoria || reszek[0] || "Vegyes";
        let relPath = mappaE ? utvonal.replace(megnevezes + "/", "") + fajl.name : utvonal.replace(megnevezes + "/", "");
        formData.append('megnevezes', megnevezes);
        formData.append('relativ_utvonal', relPath);
        try {
            const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_feltoltes.php', { method: 'POST', body: formData });
            const d = await r.json();
            alert(d.message);
            if (d.success) sablonKezeleseOldal(megnevezes);
        } catch (err) { alert("Hiba a feltöltés során!"); }
    };
    input.click();
}
// kod
