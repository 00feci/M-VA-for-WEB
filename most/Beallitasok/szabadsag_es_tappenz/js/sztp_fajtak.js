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

function szuresSztpMegnevezesre(szo) {
    const select = document.getElementById('sztp_megnevezes');
    if (!select) return;
    const options = select.options;
    const keresendo = szo.toLowerCase();
    for (let i = 1; i < options.length; i++) {
        const szoveg = options[i].text.toLowerCase();
        options[i].style.display = szoveg.includes(keresendo) ? "" : "none";
    }
}
