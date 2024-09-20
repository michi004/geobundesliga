let sheetID = '1wqB2lp45cttqm-Ce0QxYGpsjRSg_lCp5-aQ3L3Dnb1I';
let spreadsheetName = 'Spielplan Liga 1';

let cacheDuration = 5 * 60 * 1000; // Cache-Dauer: 5 Minuten
let currentDay = 1; // Der aktuelle Spieltag
const totalDays = 15; // Insgesamt 15 Spieltage

// Funktion zum Abrufen und Rendern der Liga-Daten
function fetchAndRenderData(URL, cacheKey, renderFunction) {
    fetch(URL)
        .then(res => res.text())
        .then(rep => {
            let jsonData = JSON.parse(rep.substr(47).slice(0, -2)); // Entfernt unnötige Zeichen von der Antwort

            // Speichere die Daten im Cache (localStorage) mit dem spezifischen Spieltag
            let cacheData = {
                data: jsonData,
                expiry: Date.now() + cacheDuration
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));

            // Render die Tabelle mit den Daten
            renderFunction(jsonData);
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Daten: ', error);
        });
}

// Funktion zum Rendern der aktuellen Spiele (Match-Tabelle)
function renderMatchTable(jsonData) {
    let rows = jsonData.table.rows;
    let tableBody = document.querySelector('#table-body'); // Selektion korrigiert

    tableBody.innerHTML = ''; // Lösche vorhandene Einträge

    // Erstelle die Zelle für den Spieltag über alle Zeilen hinweg
    let spieltagCell = document.createElement('td');
    spieltagCell.setAttribute('rowspan', rows.length); // Setzt die Zelle über alle Zeilen hinweg
    spieltagCell.textContent = `Spieltag ${currentDay}`;
    spieltagCell.style.textAlign = 'center'; // Zentriert den Text in der Zelle
    spieltagCell.style.fontWeight = 'bold'; // Setzt den Text fett
    spieltagCell.style.verticalAlign = 'middle'; // Zentriert den Text vertikal

    // Erstelle die restlichen Spalten für die erste Zeile
    let firstRow = document.createElement('tr');
    firstRow.appendChild(spieltagCell); // Füge "Spieltag 1" in die erste Zeile ein

    firstRow.innerHTML += `
        <td>${rows[0].c[0]?.v || '-'}</td>
        <td>${rows[0].c[1]?.v || '-'}</td>
        <td>${rows[0].c[2]?.v || '-'}</td>
        <td>${rows[0].c[3]?.v || '-'}</td>
    `;

    tableBody.appendChild(firstRow);

    // Füge die restlichen Spielreihen ohne die linke Spalte hinzu
    for (let i = 1; i < rows.length; i++) {
        let newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${rows[i].c[0]?.v || '-'}</td>
            <td>${rows[i].c[1]?.v || '-'}</td>
            <td>${rows[i].c[2]?.v || '-'}</td>
            <td>${rows[i].c[3]?.v || '-'}</td>
        `;
        tableBody.appendChild(newRow);
    }
}

// Funktion zum Überprüfen, ob der Cache für einen spezifischen Spieltag noch gültig ist
function isCacheValid(cacheKey) {
    let cached = JSON.parse(localStorage.getItem(cacheKey));
    if (!cached) return false; // Kein Cache vorhanden
    return Date.now() < cached.expiry; // Überprüfe Ablaufzeit
}

// Lade die Spieldaten des aktuellen Spieltags (Match-Tabelle)
function loadMatchData(day) {
    const dataRangeDay = `B${3 + (day - 1) * 8 + day}:I${10 + (day - 1) * 8 + day}`;
    const URL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${spreadsheetName}&range=${dataRangeDay}`;

    // Einzigartiger Cache-Key für den aktuellen Spieltag
    let cacheKey = `spielplan_day_${day}`;

    if (isCacheValid(cacheKey)) {
        // Lade Daten aus dem Cache
        let cachedData = JSON.parse(localStorage.getItem(cacheKey)).data;
        renderMatchTable(cachedData);
    } else {
        // Lade Daten von Google Sheets und rendere die Tabelle
        fetchAndRenderData(URL, cacheKey, renderMatchTable);
    }
}

// Gehe zum vorherigen Spieltag
function prevSlide() {
    currentDay = (currentDay - 1 < 1) ? totalDays : currentDay - 1;
    loadMatchData(currentDay);
}

// Gehe zum nächsten Spieltag
function nextSlide() {
    currentDay = (currentDay + 1 > totalDays) ? 1 : currentDay + 1;
    loadMatchData(currentDay);
}

// Initiales Laden des ersten Spieltags
loadMatchData(currentDay);
