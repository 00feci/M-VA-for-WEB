// Felelős a NAGY rekord legördülő beállításáért
function nagyRekordBetoltese(extraAdatok) {
    const nrSelect = document.getElementById('sztp_nagy_rekord');
    if (!nrSelect) return;

    if (!extraAdatok) {
        nrSelect.value = 'nem'; // Alapértelmezett, ha nincs adat
        return;
    }

    try {
        const extra = JSON.parse(extraAdatok);
        nrSelect.value = extra.sql_rekord || 'nem';
    } catch (e) {
        console.error("JSON hiba a nagy rekordnál", e);
        nrSelect.value = 'nem';
    }
}
