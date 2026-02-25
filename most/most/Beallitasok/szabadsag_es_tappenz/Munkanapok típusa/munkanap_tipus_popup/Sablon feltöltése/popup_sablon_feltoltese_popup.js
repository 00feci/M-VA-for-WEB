function sztpTallozas(mappaMod) {
    const input = document.createElement('input');
    input.type = 'file';
    // Az accept szűrő eltávolítva, hogy minden fájl látható legyen
    input.multiple = true;
    if (mappaMod) input.webkitdirectory = true;
    input.onchange = e => sztpFajlokFeltoltese(Array.from(e.target.files));
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
