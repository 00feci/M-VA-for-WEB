// Felelős KIZÁRÓLAG a Feltöltés gomb állapotáért és színéért
function feltoltesGombAllapot(engedelyezve) {
    const btnFeltolt = document.getElementById('btn-sztp-feltoltes');
    if (!btnFeltolt) return;

    btnFeltolt.disabled = !engedelyezve;
    btnFeltolt.style.cursor = engedelyezve ? 'pointer' : 'not-allowed';
    // Itt tudod a jövőben külön módosítani az aktív/inaktív színeket!
    btnFeltolt.style.background = engedelyezve ? '#2196F3' : '#ccc'; 
}
