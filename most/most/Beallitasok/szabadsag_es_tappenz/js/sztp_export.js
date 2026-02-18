// xcxxx kód, ezt a blokot cseréld
async function globalisSzabalyokMentese() {
    const fajlnev = document.getElementById('sztp_fajlnev_szabaly')?.value;
    const exportSzabaly = document.getElementById('sztp_export_szabaly')?.value;
    
    if (!fajlnev) return alert("Adj meg egy fájlnév szabályt!");
    
    // Itt a jövőben egy fetch hívás fogja menteni ezeket a globális beállításokat
    console.log("Mentendő szabályok:", { fajlnev, exportSzabaly });
    alert("Generálási és Export szabályok rögzítve!");
}
// kod