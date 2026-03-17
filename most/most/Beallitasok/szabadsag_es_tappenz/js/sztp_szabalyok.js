async function generaltSzabalyokPopup() {
    const id = document.getElementById('sztp_id')?.value;
    if (!id) return alert("Hiba: Nincs kiválasztott kategória!");

    // ✨ Lekérjük a kategória nap típusait és a mentett szabályokat
    const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id);
    const d = await r.json();
    if (!d.success) return;

    const extra = d.adat.extra_adatok ? JSON.parse(d.adat.extra_adatok) : {};
    const napok = extra.napok || [];
    const mentettSzabalyok = extra.generalo_szabalyok || {};

    const modalBody = document.getElementById('generalo-szabalyok-lista');
    modalBody.innerHTML = napok.map(n => `
        <div style="background: #252525; padding: 12px; border-radius: 6px; border: 1px solid #444; margin-bottom: 10px;">
            <div style="color: #ffeb3b; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #333;">📅 Munkanap típusa: ${n.nev} (${n.jel})</div>
            <div style="display: flex; gap: 15px;">
                <div style="flex: 1;">
                    <label style="display: block; font-size: 0.75em; color: #aaa;">Egy nap esetén (fájlnév minta):</label>
                    <input type="text" class="szabaly-input" data-tipus="${n.jel}" data-mod="egy" oninput="frissitSzabalyElonezet(this)" 
                        value="${mentettSzabalyok[n.jel]?.egy || '{név} {dátum}'}" style="width: 100%; padding: 6px; background: #121212; color: white; border: 1px solid #444; border-radius: 4px;">
                    <div class="elonezet-doboz" id="pre-${n.jel}-egy" style="font-size: 0.7em; color: #4CAF50; margin-top: 3px; font-family: monospace;">Élő: -</div>
                </div>
                <div style="flex: 1;">
                    <label style="display: block; font-size: 0.75em; color: #aaa;">Több nap esetén (fájlnév minta):</label>
                    <input type="text" class="szabaly-input" data-tipus="${n.jel}" data-mod="tobb" oninput="frissitSzabalyElonezet(this)" 
                        value="${mentettSzabalyok[n.jel]?.tobb || '{név} {mettől}-{meddig}'}" style="width: 100%; padding: 6px; background: #121212; color: white; border: 1px solid #444; border-radius: 4px;">
                    <div class="elonezet-doboz" id="pre-${n.jel}-tobb" style="font-size: 0.7em; color: #4CAF50; margin-top: 3px; font-family: monospace;">Élő: -</div>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('sztp-generalo-modal').style.display = 'flex';
    // Kezdeti előnézet frissítés
    document.querySelectorAll('.szabaly-input').forEach(i => frissitSzabalyElonezet(i));
}


function frissitSzabalyElonezet(input) {
    const minta = input.value;
    const kijelzo = document.getElementById('pre-' + input.dataset.tipus + '-' + input.dataset.mod);
    if (!kijelzo) return;

    // ✨ Itt a korábban megírt hivatkozás leképező logikát hívjuk
    let eredmeny = minta;
    // Példa regex a {kapcsos} hivatkozásokhoz
    const matches = minta.match(/{([^}]+)}/g);
    if (matches) {
        matches.forEach(m => {
            const hivNev = m.replace('{','').replace('}','');
            // Megkeressük a hivatkozások között (minta adat rekordból)
            // Itt a szamolHivatkozasErteket logikát kell alkalmazni ha kész van
            eredmeny = eredmeny.replace(m, "[ÉRTÉK]"); 
        });
    }
    kijelzo.innerText = "Minta: " + eredmeny + ".pdf";
}



async function generatSzabalyokMentese() {
    const id = document.getElementById('sztp_id').value;
    const inputok = document.querySelectorAll('.szabaly-input');
    let szabalyok = {};
    
    inputok.forEach(i => {
        if(!szabalyok[i.dataset.tipus]) szabalyok[i.dataset.tipus] = {};
        szabalyok[i.dataset.tipus][i.dataset.mod] = i.value;
    });

    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id);
        const d = await r.json();
        let extra = d.adat.extra_adatok ? JSON.parse(d.adat.extra_adatok) : {};
        extra.generalo_szabalyok = szabalyok;

        await fetch('Beallitasok/szabadsag_es_tappenz/sztp_mentes.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, megnevezes: d.adat.megnevezes, kod: d.adat.kod, szin: d.adat.hex_szin, extra_adatok: extra })
        });
        alert("Generálási szabályok elmentve!");
        document.getElementById('sztp-generalo-modal').style.display = 'none';
    } catch (e) { alert("Hiba a mentéskor!"); }
}

function exportSzabalyokPopup() {
    // Ezt majd a következő körben részletezzük, most csak megnyitjuk
    alert("Export szabályok: Csoportosítás beállítása.");
}
