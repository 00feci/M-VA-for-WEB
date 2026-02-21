// Felelős a fájlok listájának letöltéséért és frissítéséért
function sablonFajlokBetoltese(id, extraAdatok) {
    const lista = document.getElementById('sztp-fajl-lista');
    if (!lista) return;

    if (!id) {
        lista.innerHTML = `<li>📄 Jelenleg nincs fájl</li>`;
        return;
    }

    fetch('Beallitasok/szabadsag_es_tappenz/sztp_fajl_listazasa.php?id=' + id)
        .then(r => r.json())
        .then(fData => {
            try {
                const extra = extraAdatok ? JSON.parse(extraAdatok) : {};
                const pdfSet = extra.pdf_beallitasok || { mind: false, fajlok: [] };
                
                // 🕵️ NYOMOZÓ KÓD: Ezt írja ki a böngésző konzoljába (F12)
               // console.log("----- PDF NYOMOZÁS -----");
                //console.log("Kapott extraAdatok a PHP-ból (SQL):", extraAdatok);
                //console.log("PDF Beállítások objektum:", pdfSet);
                //console.log("Kapott fájlok a szerverről:", fData.fajlok);

               const selectElem = document.getElementById('sztp_edit_megnevezes') || document.getElementById('sztp_megnevezes');
                let megnevezes = "";
                if (selectElem) {
                    if (selectElem.tagName.toLowerCase() === 'select' && selectElem.selectedIndex >= 0) {
                        megnevezes = selectElem.options[selectElem.selectedIndex].text;
                    } else {
                        megnevezes = selectElem.value || "";
                    }
                }
                
                lista.innerHTML = (fData.success && fData.fajlok.length > 0)
                    ? fData.fajlok.map(f => {
                        const path = megnevezes + '/' + f;
                        const isDoc = f.toLowerCase().endsWith('.doc') || f.toLowerCase().endsWith('.docx');
                        
                        // 🚀 JAVÍTÁS: Megnézzük mappával ÉS mappa nélkül is!
                        const pipalva = isDoc && (pdfSet.mind || (pdfSet.fajlok && (pdfSet.fajlok.includes(path) || pdfSet.fajlok.includes(f))));
                        
                         // 🕵️ NYOMOZÓ KÓD: Ezt írja ki a böngésző konzoljába (F12)
                 //       if(isDoc) {
                   //          console.log(`Fájl: ${f} | Keresett útvonal: ${path} | Pipálva lesz? ${pipalva}`);
                     //   }

                        return `<li>📄 ${f} ${pipalva ? '<span style="color: #4CAF50; font-size: 0.8em; margin-left: 8px;">[PDF ✅]</span>' : ''}</li>`;
                    }).join('')
                    : `<li>📄 Jelenleg nincs fájl</li>`;
            } catch(e) { console.error("Lista rendering hiba", e); }
        });
}
