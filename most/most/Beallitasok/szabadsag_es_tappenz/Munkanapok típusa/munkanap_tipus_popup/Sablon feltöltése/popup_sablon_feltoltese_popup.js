function sztpTallozas(mappaMod) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    if (mappaMod) input.webkitdirectory = true;
    input.onchange = e => {
        const fajlok = Array.from(e.target.files);
        // ✨ Ha mappát töltünk fel, a File objektumból kinyerjük és rögzítjük az útvonalat
        fajlok.forEach(f => {
            if (f.webkitRelativePath) f.relPath = f.webkitRelativePath;
        });
        sztpFajlokFeltoltese(fajlok);
    };
    input.click();
}
// 📂 Segédfüggvény a mappák mélyére ásáshoz
async function rekurzivFajlOlvasas(entry, path = "") {
    let fajlok = [];
    if (entry.isFile) {
        const fajl = await new Promise(resolve => entry.file(resolve));
        fajl.relPath = path + fajl.name;
        fajlok.push(fajl);
    } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const bejegyzesek = await new Promise(resolve => reader.readEntries(resolve));
        for (const b of bejegyzesek) {
            fajlok = fajlok.concat(await rekurzivFajlOlvasas(b, path + entry.name + "/"));
        }
    }
    return fajlok;
}
function sztpFajlokFeltoltese(fajlok) {
    if (!fajlok || fajlok.length === 0) return;
    
    // ✨ A kiválasztott fájlok behelyezése a sztp_fajtak.js-ben definiált pufferbe
    kivalasztottFajlokBuffer = fajlok; 

    const statusz = document.getElementById('sztp-modal-statusz');
    const kontener = document.getElementById('sztp-modal-fajl-lista-kontener');
    const lista = document.getElementById('sztp-modal-fajl-lista');

    if (statusz) statusz.innerHTML = `✅ ${fajlok.length} fájl/mappa készen áll a feltöltésre.`;
    if (kontener) kontener.style.display = 'block';
    if (lista) {
        // Az első 10 fájl megjelenítése a listában
        lista.innerHTML = fajlok.slice(0, 10).map(f => `<li>📄 ${f.relPath || f.name}</li>`).join('') + 
                         (fajlok.length > 10 ? `<li style="list-style: none; color: #888; margin-top: 5px;">... és még ${fajlok.length - 10} fájl</li>` : '');
    }
}
function feltoltoModalBezaras() {
    const modal = document.getElementById('sztp-feltolto-modal');
    if (modal) modal.style.display = 'none';
}
function feltoltoModalMegnyitasa() {
    const statusz = document.getElementById('sztp-modal-statusz');
    const modalLista = document.getElementById('sztp-modal-fajl-lista');
    const modalListaKontener = document.getElementById('sztp-modal-fajl-lista-kontener');
    
    if (statusz) statusz.innerHTML = ''; 
    if (modalLista) modalLista.innerHTML = '';
    if (modalListaKontener) modalListaKontener.style.display = 'none';
    
    document.getElementById('sztp-feltolto-modal').style.display = 'flex';
}
function inicializalFeltoltot() {
    const zona = document.getElementById('sztp-feltolto-zona');
    if (!zona) return;

    zona.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON') sztpTallozas(false);
    };

    // ✨ Ezek az eseménykezelők kellettek a megfelelő működéshez:
    zona.ondragover = e => {
        e.preventDefault();
        zona.style.background = '#252525'; // Kicsit világosabb jelzés, ha felette van a fájl
        zona.style.borderColor = '#4CAF50';
    };

    zona.ondragleave = () => { 
        zona.style.background = '#1e1e1e'; 
        zona.style.borderColor = '#2196F3';
    };

    zona.ondrop = async e => {
        e.preventDefault();
        zona.style.background = '#1e1e1e';
        zona.style.borderColor = '#2196F3';
        
        const items = e.dataTransfer.items;
        let mindenFajl = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry();
            if (entry) {
                const fajlok = await rekurzivFajlOlvasas(entry);
                mindenFajl = mindenFajl.concat(fajlok);
            }
        }
        sztpFajlokFeltoltese(mindenFajl);
    };
}
