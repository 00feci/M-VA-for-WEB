// Felelős a Kód és Szín dobozok beállításáért
function kodSzinBetoltese(kod, hex_szin) {
    if (document.getElementById('sztp_kod')) document.getElementById('sztp_kod').value = kod || '';
    if (document.getElementById('sztp_szin')) document.getElementById('sztp_szin').value = hex_szin || '#ffffff';
    if (document.getElementById('sztp_hex')) document.getElementById('sztp_hex').value = hex_szin || '#ffffff';
    frissitSztpElonezet('picker');
}

// Felelős a vizuális előnézet frissítéséért (gépeléskor is)
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
        doboz.style.backgroundColor = szin; doboz.textContent = kod;
        const r = parseInt(szin.substr(1,2), 16), g = parseInt(szin.substr(3,2), 16), b = parseInt(szin.substr(5,2), 16);
        doboz.style.color = (((r*299)+(g*587)+(b*114))/1000 >= 128) ? 'black' : 'white';
    }
}
