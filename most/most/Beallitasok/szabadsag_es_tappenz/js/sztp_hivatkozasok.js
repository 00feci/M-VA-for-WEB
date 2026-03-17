
async function hivatkozasokOldalMegnyitasa() {
    const kontener = document.getElementById('modul-tartalom');
    const gombSor = document.getElementById('modul-gomb-sor');
    if (gombSor) {
        gombSor.innerHTML = `<div class="dashboard-gomb" style="flex: 1; background: #607d8b; color: white;" onclick="szTpModulBetoltese()">🔙 Vissza a beállításokhoz</div>`;
    }
    kontener.innerHTML = `
        <div style="padding: 15px; background: #121212; max-height: 70vh; overflow-y: auto; border-radius: 8px; scrollbar-width: thin; scrollbar-color: #444 #121212;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; position: sticky; top: 0; background: #121212; z-index: 10;">
                <h3 style="margin: 0; color: white; font-size: 1.1em;">🔗 Hivatkozások leképezése és szabályok</h3>
                <div style="display: flex; gap: 10px;">
                    <button onclick="generaltSzabalyokPopup()" style="padding: 8px 12px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8em;">⚙️ Generálási szabályok</button>
                    <button onclick="exportSzabalyokPopup()" style="padding: 8px 12px; background: #673ab7; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8em;">⚙️ Export szabályok</button>
                    <button onclick="ujHivatkozasPopup()" style="padding: 8px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8em;">+ Új hivatkozás</button>
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1; background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                    <h4 style="margin-top: 0; color: #9c27b0; font-size: 0.9em; border-bottom: 1px solid #444; padding-bottom: 5px;">Adatbázis minta (Legfrissebb rekord)</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85em; color: #ddd; font-family: monospace;">
                        <thead>
                            <tr style="background: #252525; text-align: left;">
                                <th style="padding: 10px; border-bottom: 2px solid #333;">SQL oszlop</th>
                                <th style="padding: 10px; border-bottom: 2px solid #333;">Aktuális adat (Példa)</th>
                            </tr>
                        </thead>
                        <tbody id="sztp-minta-adatok-test"></tbody>
                    </table>
                </div>
                <div style="flex: 1; background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                    <h4 style="margin-top: 0; color: #2196F3; font-size: 0.9em; border-bottom: 1px solid #444; padding-bottom: 5px;">Aktív hivatkozások és szabályok</h4>
                    <ul id="sztp-aktiv-hivatkozasok" style="list-style: none; padding: 0; margin: 0; color: #ddd; font-size: 0.85em;"></ul>
                </div>
            </div>
        </div>
        ${getHivatkozasModalHtml()}
    </div>
        
        <div id="sztp-generalo-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10001; align-items: center; justify-content: center;">
            <div style="background: #1e1e1e; color: white; padding: 25px; border-radius: 12px; width: 800px; border: 1px solid #333; max-height: 90vh; display: flex; flex-direction: column;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 10px;">⚙️ Generálási szabályok (Fájlnév minták)</h3>
                <div id="generalo-szabalyok-lista" style="overflow-y: auto; flex: 1; padding-right: 10px; margin: 15px 0;">
                    </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #333; padding-top: 15px;">
                    <button onclick="document.getElementById('sztp-generalo-modal').style.display='none'" style="padding: 8px 20px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer;">Mégse</button>
                    <button onclick="generatSzabalyokMentese()" style="padding: 8px 25px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">💾 Szabályok mentése</button>
                </div>
            </div>
        </div>
    `;
}
    mintaAdatokBetoltese();
    hivatkozasokListazasa();
    
    async function mintaAdatokBetoltese() {
    const tbody = document.getElementById('sztp-minta-adatok-test');
    if (!tbody) return;
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_minta_adatok.php');
        const d = await r.json();
        if (d.success && d.adat) {
            mintaAdatRekord = d.adat;
            aktualisSqlOszlopok = Object.keys(d.adat);
            tbody.innerHTML = Object.entries(d.adat).map(([k, v]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #333; font-weight: bold; color: #9c27b0;">${k}</td><td style="padding: 8px; border-bottom: 1px solid #333; color: #ddd;">${v || '-'}</td></tr>`).join('');
        }
    } catch (e) { console.error(e); }
}

function ujHivatkozasPopup() {
    const modal = document.getElementById('sztp-hivatkozas-modal');
    const select = document.getElementById('hiv_sql_oszlop');
    if (modal && select) {
        select.innerHTML = aktualisSqlOszlopok.map(o => `<option value="${o}">${o}</option>`).join('');
        modal.style.display = 'flex';
        hivatkozasokListazasa();
    }
}
async function hivatkozasMentese() {
    const nev = document.getElementById('hiv_nev').value;
    const oszlop = document.getElementById('hiv_sql_oszlop').value;
    const tipus = document.getElementById('hiv_muvelet_tipus').value;
    const logika = document.getElementById('hiv_logika').value;
    const formatum = document.getElementById('hiv_formatum').value;
    if (!nev) return alert("Adj meg egy hivatkozás nevet!");
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozas_mentese.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nev, oszlop, tipus, logika, formatum })
        });
        const d = await r.json();
        if (d.success) {
            document.getElementById('hiv_nev').value = '';
            document.getElementById('hiv_logika').value = '';
            hivatkozasokListazasa();
        }
        alert(d.message);
    } catch (e) { alert("Hiba a mentés során!"); }
}

async function hivatkozasokListazasa() {
    const tbody = document.getElementById('hiv_lista_test');
    const foLista = document.getElementById('sztp-aktiv-hivatkozasok');
    if (!tbody) return;
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozasok_lekerese.php');
        const d = await r.json();
        if (d.success) {
            const ikonok = { add: '➕', sub: '➖', mul: '✖️', div: '➗', txt: '🔤' };
            tbody.innerHTML = d.lista.map(i => {
                const eredmeny = szamolHivatkozasErteket(i.oszlop, i.tipus, i.logika, i.formatum);
                return `<tr style="border-bottom: 1px solid #333;"><td style="padding: 8px; color: #2196F3; font-weight: bold;">${i.nev}</td><td style="padding: 8px; color: #aaa;">${i.oszlop} <span style="color: #4CAF50;">${ikonok[i.tipus] || ''}</span> ${i.logika}</td><td style="padding: 8px; color: #ffeb3b; font-family: monospace; font-weight: bold; text-align: right;">=> ${eredmeny}</td><td style="padding: 8px; text-align: right; white-space: nowrap;"><button onclick="hivatkozasSorrend(${i.id}, -1)" style="background: none; border: none; cursor: pointer; color: #2196F3;">▲</button><button onclick="hivatkozasSorrend(${i.id}, 1)" style="background: none; border: none; cursor: pointer; color: #2196F3;">▼</button><button onclick="hivatkozasTorlese(${i.id})" style="background: none; border: none; cursor: pointer; color: #f44336; margin-left: 10px;">🗑️</button></td></tr>`;
            }).join('');
            if (foLista) {
                foLista.innerHTML = d.lista.length > 0 ? d.lista.map(i => `<li style="padding: 5px 10px; border-bottom: 1px solid #333;"><b style="color: #2196F3;">${i.nev}</b>: <span style="color: #ffeb3b;">${szamolHivatkozasErteket(i.oszlop, i.tipus, i.logika, i.formatum)}</span></li>`).join('') : '<li style="color: #666; font-style: italic; padding: 10px;">Nincs még létrehozott hivatkozás.</li>';
            }
        }
    } catch (e) { console.error(e); }
}
async function hivatkozasTorlese(id) {
    if (!confirm("Biztosan törlöd?")) return;
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozas_torlese.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        const d = await r.json();
        if (d.success) hivatkozasokListazasa();
        alert(d.message);
    } catch (e) { alert("Hiba!"); }
}
async function hivatkozasSorrend(id, irany) {
    try {
        const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozasok_lekerese.php');
        const d = await r.json();
        if (!d.success) return;
        let lista = d.lista;
        const index = lista.findIndex(i => i.id == id);
        if (index === -1) return;
        const ujIndex = index + irany;
        if (ujIndex < 0 || ujIndex >= lista.length) return;
        [lista[index], lista[ujIndex]] = [lista[ujIndex], lista[index]];
        const sr = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_hivatkozasok_sorrendje.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lista }) });
        const sd = await sr.json();
        if (sd.success) hivatkozasokListazasa();
    } catch (e) { console.error(e); }
}


function szamolHivatkozasErteket(oszlop, tipus, logika, formatum = "") {
    const alapErtek = mintaAdatRekord[oszlop];
    if (alapErtek === undefined || alapErtek === null) return "Nincs adat";
    let ertek = String(alapErtek).trim();
    let vegEredmeny = "";
    let log = String(logika).toLowerCase().trim();
    if (tipus === 'txt') { vegEredmeny = ertek + logika; } else {
        const isDate = /^\d{4}[-.]\d{2}[-.]\d{2}/.test(ertek);
        if (isDate) {
            if (log.includes('év') || log.includes('hónap') || log.includes('nap')) {
                let d = new Date(ertek.replace(/\./g, '-'));
                let szam = parseInt(log.replace(/[^0-9]/g, '')) || 0;
                let szorzo = (tipus === 'sub') ? -1 : 1;
                if (log.includes('év')) d.setFullYear(d.getFullYear() + (szam * szorzo));
                else if (log.includes('hónap')) d.setMonth(d.getMonth() + (szam * szorzo));
                else if (log.includes('nap')) d.setDate(d.getDate() + (szam * szorzo));
                vegEredmeny = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
            } else { vegEredmeny = ertek.replace(/-/g, '.'); }
        } else {
            let n1 = parseFloat(ertek.replace(',', '.')), n2 = parseFloat(log.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
            if (isNaN(n1)) vegEredmeny = ertek; else {
                switch(tipus) {
                    case 'add': vegEredmeny = (n1 + n2).toFixed(2); break;
                    case 'sub': vegEredmeny = (n1 - n2).toFixed(2); break;
                    case 'mul': vegEredmeny = (n1 * n2).toFixed(2); break;
                    case 'div': vegEredmeny = n2 !== 0 ? (n1 / n2).toFixed(2) : "Hiba"; break;
                    default: vegEredmeny = ertek;
                }
            }
        }
    }
    vegEredmeny = vegEredmeny.toString().replace(/\.00$/, '');
    const f = formatum.toUpperCase().trim();
    if (f !== "" && vegEredmeny.includes('.') && vegEredmeny.split('.').length === 3) {
        const p = vegEredmeny.split('.');
        if (f === 'ÉÉÉÉ') return p[0]; if (f === 'HH') return p[1]; if (f === 'NN') return p[2];
    }
    return vegEredmeny.replace('.', ',');
}


function frissitHivatkozasElonezet() {
    const oszlop = document.getElementById('hiv_sql_oszlop').value;
    const tipus = document.getElementById('hiv_muvelet_tipus').value;
    const logika = document.getElementById('hiv_logika').value;
    const formatum = document.getElementById('hiv_formatum').value;
    const kijelzo = document.getElementById('hiv_live_eredmeny');
    if (kijelzo) kijelzo.innerText = "Élő eredmény: " + szamolHivatkozasErteket(oszlop, tipus, logika, formatum);
}

function getHivatkozasModalHtml() {
    return `
        <div id="sztp-hivatkozas-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: #1e1e1e; color: white; padding: 25px; border-radius: 12px; width: 600px; border: 1px solid #333;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 10px;">🔗 Hivatkozás létrehozása</h3>
                <div style="display: flex; flex-direction: column; gap: 15px; margin: 20px 0;">
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;"><label style="display: block; font-size: 0.8em; color: #aaa;">Név:</label><input type="text" id="hiv_nev" style="width: 100%; padding: 8px; background: #252525; color: white; border: 1px solid #444; border-radius: 4px;"></div>
                        <div style="flex: 1;"><label style="display: block; font-size: 0.8em; color: #aaa;">SQL Oszlop:</label><select id="hiv_sql_oszlop" onchange="frissitHivatkozasElonezet()" style="width: 100%; padding: 8px; background: #252525; color: white; border: 1px solid #444; border-radius: 4px;"></select></div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <div style="width: 140px;"><label style="display: block; font-size: 0.8em; color: #aaa;">Művelet:</label><select id="hiv_muvelet_tipus" onchange="frissitHivatkozasElonezet()" style="width: 100%; padding: 8px; background: #252525; color: white; border: 1px solid #444; border-radius: 4px;"><option value="add">+ Összeadás</option><option value="sub">- Kivonás</option><option value="mul">* Szorzás</option><option value="div">/ Osztás</option><option value="txt">Szöveg</option></select></div>
                        <div style="flex: 1;"><label style="display: block; font-size: 0.8em; color: #aaa;">Logika:</label><input type="text" id="hiv_logika" oninput="frissitHivatkozasElonezet()" style="width: 100%; padding: 8px; background: #252525; color: white; border: 1px solid #444; border-radius: 4px;"></div>
                    </div>
                    <div id="hiv_live_eredmeny" style="padding: 10px; background: #121212; border-radius: 6px; text-align: center; color: #ffeb3b;">Élő eredmény: -</div>
                    <button onclick="hivatkozasMentese()" style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer;">Hozzáadás</button>
                </div>
                <div style="max-height: 200px; overflow-y: auto; background: #121212; padding: 10px;"><table style="width: 100%; border-collapse: collapse;"><tbody id="hiv_lista_test"></tbody></table></div>
                <div style="display: flex; justify-content: flex-end; margin-top: 20px;"><button onclick="document.getElementById('sztp-hivatkozas-modal').style.display='none'" style="padding: 8px 20px; background: #444; color: white; border: none; border-radius: 4px;">Bezárás</button></div>
            </div>
        </div>`;
}
let mintaAdatRekord = {}; let aktualisSqlOszlopok = [];
