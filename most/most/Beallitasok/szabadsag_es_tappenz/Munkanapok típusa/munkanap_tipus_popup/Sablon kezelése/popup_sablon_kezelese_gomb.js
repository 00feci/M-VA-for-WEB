// Felelős KIZÁRÓLAG a Kezelés gomb állapotáért és színéért
function kezelesGombAllapot(engedelyezve) {
    const btnKezel = document.getElementById('btn-sztp-kezeles');
    if (!btnKezel) return;

    btnKezel.disabled = !engedelyezve;
    btnKezel.style.cursor = engedelyezve ? 'pointer' : 'not-allowed';
    // Itt is jöhet bármilyen egyedi szín a jövőben!
    btnKezel.style.background = engedelyezve ? '#607d8b' : '#ccc';
}
