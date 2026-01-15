function megnevezesSzerkesztoMegnyitasa() {
    const modal = document.getElementById('sztp-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('sztp_tomeges_bevitel').focus();
    }
}

function modalBezaras() {
    const modal = document.getElementById('sztp-modal');
    if (modal) modal.style.display = 'none';
    document.getElementById('sztp_tomeges_bevitel').value = ''; 
}

function megnevezesekMentese() {
    const szoveg = document.getElementById('sztp_tomeges_bevitel').value;
    const elemek = szoveg.split(/[\n,]/).map(item => item.trim()).filter(item => item !== "");
    if (elemek.length === 0) return modalBezaras();
    
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_tomeges_mentes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nevek: elemek })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            document.getElementById('sztp_tomeges_bevitel').value = '';
            listaBetoltese(); 
        } else {
            alert("Hiba: " + data.message);
        }
        modalBezaras();
    });
}

function beallitasokTorlese() {
    const id = document.getElementById('sztp_id').value;
    if (!id) return alert("Nincs kiválasztva mentett beállítás!");
    if (confirm("Biztosan törölni szeretnéd ezt a beállítást?")) {
        fetch('Beallitasok/szabadsag_es_tappenz/sztp_torlese.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(r => r.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                adatokBetoltese(''); 
                listaBetoltese();   
            }
        });
    }
}

function szuresSztpMegnevezesre(szo, targetId = 'sztp_megnevezes') {
    const select = document.getElementById(targetId);
    if (!select) return;
    const keresendo = szo.toLowerCase();
    for (let i = 1; i < select.options.length; i++) {
        select.options[i].style.display = select.options[i].text.toLowerCase().includes(keresendo) ? "" : "none";
    }
}
function fajtaBeallitasokMegnyitasa() {
    const select = document.getElementById('sztp_megnevezes');
    const editSelect = document.getElementById('sztp_edit_megnevezes');
    if (select && editSelect) {
        editSelect.value = select.value; // Szinkronizáljuk a választást
    }
    document.getElementById('sztp-fajta-modal').style.display = 'flex';
    frissitSztpElonezet('picker');
}

function listaBetoltese() {
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?v=' + new Date().getTime())
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const selects = [document.getElementById('sztp_megnevezes'), document.getElementById('sztp_edit_megnevezes')];
            
            selects.forEach(select => {
                if (!select) return;
                const mentettId = select.value;
                select.innerHTML = '<option value="">-- Kiválasztás --</option>';
                data.lista.forEach(i => {
                    if (i.megnevezes === "GLOBAL_NAP_TIPUSOK") {
                        if (select.id === 'sztp_megnevezes') adatokBetoltese(i.id, true);
                        return; 
                    }
                    const opt = document.createElement('option');
                    opt.value = i.id;
                    opt.textContent = i.megnevezes;
                    select.appendChild(opt);
                });
                if (mentettId) select.value = mentettId;
            });
        });
}
function adatokBetoltese(id, globalisBetoltes = false) {
    const idInput = document.getElementById('sztp_id');
    const mainSelect = document.getElementById('sztp_megnevezes');
    const editSelect = document.getElementById('sztp_edit_megnevezes');
    const btnFeltolt = document.getElementById('btn-sztp-feltoltes');
    const btnKezel = document.getElementById('btn-sztp-kezeles');

    if (!idInput) return;

    if (id && !globalisBetoltes) {
        if (mainSelect && mainSelect.value !== id) mainSelect.value = id;
        if (editSelect && editSelect.value !== id) editSelect.value = id;
    }

    if (!id && !globalisBetoltes) {
        idInput.value = '';
        document.getElementById('sztp_kod').value = '';
        document.getElementById('sztp_szin').value = '#ffffff';
        document.getElementById('sztp_hex').value = '#ffffff';
        [btnFeltolt, btnKezel].forEach(b => { if(b) { b.disabled = true; b.style.background = '#ccc'; b.style.cursor = 'not-allowed'; }});
        frissitSztpElonezet('picker');
        return;
    }

    if (!globalisBetoltes) {
        [btnFeltolt, btnKezel].forEach(b => { if(b) { b.disabled = false; b.style.cursor = 'pointer'; }});
        if (btnFeltolt) btnFeltolt.style.background = '#2196F3';
        if (btnKezel) btnKezel.style.background = '#607d8b';
    }
    
    fetch('Beallitasok/szabadsag_es_tappenz/sztp_lekerese.php?id=' + id)
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.adat) return;
            
            // ✨ Itt a hiba javítása: használjuk a már definiált idInput-ot
            if (!globalisBetoltes) {
                idInput.value = data.adat.id;
                document.getElementById('sztp_kod').value = data.adat.kod;
                document.getElementById('sztp_szin').value = data.adat.hex_szin;
                document.getElementById('sztp_hex').value = data.adat.hex_szin;
            }
            // ... (fajl_listazasa és extra_adatok betöltése maradhat itt, vagy átveheted a sz_tp_modul.js-ből)
            frissitSztpElonezet('picker');
        });
}

function frissitSztpElonezet(tipus) {
    const kodInput = document.getElementById('sztp_kod');
    const picker = document.getElementById('sztp_szin');
    const hexInput = document.getElementById('sztp_hex');
    const doboz = document.getElementById('szin-elonezet-doboz');
    if (!kodInput || !picker || !hexInput) return;
    if (tipus === 'picker') hexInput.value = picker.value;
    if (tipus === 'hex' && hexInput.value.length === 7) picker.value = hexInput.value;
    const kod = kodInput.value || '-';
    const szin = picker.value;
    if (doboz) {
        doboz.style.backgroundColor = szin;
        doboz.textContent = kod;
        const r = parseInt(szin.substr(1,2), 16), g = parseInt(szin.substr(3,2), 16), b = parseInt(szin.substr(5,2), 16);
        doboz.style.color = (((r*299)+(g*587)+(b*114))/1000 >= 128) ? 'black' : 'white';
    }
}
async function beallitasokMentese(modalbol = false, napModalbol = false) {
    const select = document.getElementById('sztp_megnevezes');
    const fajlLista = document.getElementById('sztp-fajl-lista');
    const napTipusSelect = document.getElementById('sztp_nap_tipusa');
    
    const adat = {
        id: document.getElementById('sztp_id').value,
        megnevezes: (select && select.selectedIndex > 0) ? select.options[select.selectedIndex].text : null,
        kod: document.getElementById('sztp_kod')?.value || '',
        szin: document.getElementById('sztp_szin')?.value || '#ffffff',
        sablon_neve: null,
        extra_adatok: [] 
    };

    // ✨ Ha globális mentés van, és nincs kiválasztott név, adunk neki egy fix nevet
    if (napModalbol && !adat.megnevezes) {
        adat.megnevezes = "GLOBAL_NAP_TIPUSOK";
    }

    if (!adat.megnevezes && !napModalbol) return alert("Válassz vagy adj hozzá megnevezést!");

    // ✨ Nap típusok összegyűjtése a JSON mentéshez
    if (napTipusSelect) {
        for (let i = 1; i < napTipusSelect.options.length; i++) {
            const opt = napTipusSelect.options[i];
            const reszek = opt.text.match(/(.*) \((.*)\)/);
            adat.extra_adatok.push({
                nev: reszek ? reszek[1] : opt.text,
                jel: opt.value
            });
        }
    }

    let sablonNeve = null;

    if (kivalasztottFajlokBuffer.length > 0) {
        fajlLista.innerHTML = '<li>⏳ Feltöltés folyamatban...</li>';
        for (let fajl of kivalasztottFajlokBuffer) {
            const formData = new FormData();
            formData.append('sablon', fajl);
            formData.append('megnevezes', adat.megnevezes); 
            const relPath = fajl.relPath || fajl.webkitRelativePath || fajl.name;
            formData.append('relativ_utvonal', relPath);
            try {
                const r = await fetch('Beallitasok/szabadsag_es_tappenz/sztp_feltoltes.php', { method: 'POST', body: formData });
                const d = await r.json();
                if (!d.success) throw new Error(d.message);
            } catch (e) {
                alert("Hiba: " + e.message);
                fajlLista.innerHTML = '<li>❌ Hiba történt.</li>';
                return;
            }
        }
        sablonNeve = adat.megnevezes; // A mappa neve lesz a sablon neve
        kivalasztottFajlokBuffer = [];
    } else {
        const elsoSor = fajlLista.querySelector('li');
        if (elsoSor && !elsoSor.innerText.includes('Jelenleg nincs')) {
            sablonNeve = adat.megnevezes;
        }
    }

    adat.sablon_neve = sablonNeve;

    fetch('Beallitasok/szabadsag_es_tappenz/sztp_mentes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adat)
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            listaBetoltese();
            if (adat.id && !napModalbol) adatokBetoltese(adat.id); 
            if (modalbol) feltoltoModalBezaras();
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
