async function sablonKezeleseOldal(frissitendoMappa = null) {
    const kontener = document.getElementById('modul-tartalom');
    const sel = document.getElementById('sztp_megnevezes') || document.getElementById('sztp_edit_megnevezes');
    let megnevezesValue = "";
    const isMappaValid = frissitendoMappa && String(frissitendoMappa) !== "undefined" && String(frissitendoMappa) !== "null";
    if (isMappaValid) megnevezesValue = frissitendoMappa;
    else if (sel && sel.selectedIndex > 0) megnevezesValue = sel.options[sel.selectedIndex].text;
    const megjelenitettCim = megnevezesValue || "Sablonok";

    const gombSor = document.getElementById('modul-gomb-sor');
    if (gombSor) gombSor.innerHTML = `<div class="dashboard-gomb" style="flex: 1; background: #607d8b; color: white;" onclick="szTpModulBetoltese(); setTimeout(() => fajtaBeallitasokMegnyitasa(), 100);">🔙 Vissza a beállításokhoz</div>`;

    kontener.innerHTML = `
        <div style="padding: 10px; background: #121212; min-height: 500px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: white; font-size: 1.1em;">📁 ${megjelenitettCim} mappaszerkezete</h3>
                <div style="display: flex; align-items: center; gap: 10px; background: #252525; padding: 5px 12px; border-radius: 6px; border: 1px solid #444;">
                    <span style="font-size: 0.8em; color: #aaa;">PDF készítés összesre (doc/docx):</span>
                    <label class="sztp-switch"><input type="checkbox" id="pdf-all-toggle"><span class="sztp-slider"></span></label>
                </div>
            </div>
            <div id="sztp-fajl-fa-kontener" style="background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333; overflow: auto; min-height: 300px;">
                <div id="sztp-fajl-fa" style="font-family: monospace;">⏳ Betöltés...</div>
            </div>
        </div>
    `;

    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_mappa_tree.php?megnevezes=' + encodeURIComponent(megnevezesValue));
        const d = await r.json();
        if (d.success) document.getElementById('sztp-fajl-fa').innerHTML = renderelFa(d.tree, megnevezesValue);
    } catch (e) { console.error(e); }
}

function renderelFa(elemek, aktualisKategoria = "") {
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
                
                ${isDoc ? `<div style="display: inline-flex; align-items: center; gap: 4px; background: #121212; padding: 2px 6px; border-radius: 4px; border: 1px solid #333;" title="PDF készítés ebből a fájlból"><span style="font-size: 0.7em; color: #888;">PDF</span><input type="checkbox" style="cursor:pointer;" onclick="console.log('Egyedi PDF mentés:', '${tisztaUtvonal}', this.checked)"></div>` : ''}

                <button onclick="sztpGyorsFeltoltesInditasa('${tisztaUtvonal}', ${i.type === 'folder'}, '${aktualisKategoria}')" style="border: none; background: none; cursor: pointer; color: #4CAF50; font-size: 1.25em; padding: 0;" title="Feltöltés / Felülírás">📤</button>
                <button onclick="sztpElemTorlese('${tisztaUtvonal}', '${aktualisKategoria}')" style="border: none; background: none; cursor: pointer; color: #f44336; font-size: 1.2em; padding: 0;" title="Törlés">🗑️</button>
            </span>
            ${i.date ? `<span style="color: #777; font-size: 0.8em; margin-left: 15px;">🕒 ${i.date}</span>` : ''}
            ${i.children ? renderelFa(i.children, aktualisKategoria) : ''}
        </li>`;
    });
    return html + '</ul>';
}

async function sztpElemTorlese(utvonal, kategoria) {
    if (!confirm("Biztosan törlöd?")) return;
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_fajl_torlese.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: utvonal }) });
        const d = await r.json(); if (d.success) sablonKezeleseOldal(kategoria);
    } catch (e) { console.error(e); }
}

function sztpGyorsFeltoltesInditasa(utvonal, mappaE, kategoria) {
    const input = document.createElement('input'); input.type = 'file';
    input.onchange = async e => {
        const fajl = e.target.files[0]; if (!fajl) return;
        const formData = new FormData(); formData.append('sablon', fajl);
        const reszek = utvonal.split('/').filter(p => p !== "");
        let megnevezes = kategoria || reszek[0] || "Vegyes";
        let relPath = mappaE ? utvonal.replace(megnevezes + "/", "") + fajl.name : utvonal.replace(megnevezes + "/", "");
        formData.append('megnevezes', megnevezes); formData.append('relativ_utvonal', relPath);
        try {
            const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_feltoltes.php', { method: 'POST', body: formData });
            const d = await r.json(); alert(d.message); if (d.success) sablonKezeleseOldal(megnevezes);
        } catch (err) { alert("Hiba!"); }
    };
    input.click();
}

function inicializalFeltoltot() {
    const zona = document.getElementById('sztp-feltolto-zona'); if (!zona) return;
    zona.onclick = (e) => { if (e.target.tagName !== 'BUTTON') sztpTallozas(false); };
    zona.ondragover = e => { e.preventDefault(); zona.style.background = '#e1f0ff'; };
    zona.ondragleave = () => { zona.style.background = '#f0f7ff'; };
    zona.ondrop = async e => {
        e.preventDefault(); zona.style.background = '#f0f7ff';
        const items = e.dataTransfer.items; let mindenFajl = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry();
            if (entry) { const fajlok = await rekurzivFajlOlvasas(entry); mindenFajl = mindenFajl.concat(fajlok); }
        }
        sztpFajlokFeltoltese(mindenFajl);
    };
}

function sztpTallozas(mappaMod) {
    const input = document.createElement('input'); input.type = 'file'; input.multiple = true;
    if (mappaMod) input.webkitdirectory = true;
    input.onchange = e => sztpFajlokFeltoltese(Array.from(e.target.files));
    input.click();
}

async function rekurzivFajlOlvasas(entry, path = "") {
    let fajlok = [];
    if (entry.isFile) {
        const fajl = await new Promise(resolve => entry.file(resolve));
        fajl.relPath = path + fajl.name; fajlok.push(fajl);
    } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const bejegyzesek = await new Promise(resolve => reader.readEntries(resolve));
        for (const b of bejegyzesek) fajlok = fajlok.concat(await rekurzivFajlOlvasas(b, path + entry.name + "/"));
    }
    return fajlok;
}

function sztpFajlokFeltoltese(fajlok) {
    if (!fajlok || fajlok.length === 0) return;
    kivalasztottFajlokBuffer = fajlok; 
    const statusz = document.getElementById('sztp-modal-statusz'), kontener = document.getElementById('sztp-modal-fajl-lista-kontener'), lista = document.getElementById('sztp-modal-fajl-lista');
    if (statusz) statusz.innerHTML = `✅ ${fajlok.length} fájl kész a feltöltésre.`;
    if (kontener) kontener.style.display = 'block';
    if (lista) lista.innerHTML = fajlok.slice(0, 5).map(f => `<li>📄 ${f.relPath || f.name}</li>`).join('') + (fajlok.length > 5 ? `<li>... + ${fajlok.length-5}</li>` : '');
}

function feltoltoModalMegnyitasa() { document.getElementById('sztp-feltolto-modal').style.display = 'flex'; }
function feltoltoModalBezaras() { document.getElementById('sztp-feltolto-modal').style.display = 'none'; }
