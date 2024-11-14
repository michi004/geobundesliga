let sheetID = '1rzYKg1Xz4al00i29DRlgo8MHn2mSieFK2Il8Y2VD0fU';
let spreadsheetLiga1 = 'Spielplan Liga 1';
let dataRange1 = 'P3:X16';  // Datenbereich für die 1. Liga
let URL1 = 'https://docs.google.com/spreadsheets/d/' + sheetID + '/gviz/tq?sheet=' + spreadsheetLiga1 + '&range=' + dataRange1;

let dataRange2 = 'B3:E23'; // Datenbereich für die aktuellen Spiele
let URL2 = 'https://docs.google.com/spreadsheets/d/' + sheetID + '/gviz/tq?sheet=' + spreadsheetLiga1 + '&range=' + dataRange2;

let cacheKey_L1T = 'L1_TableData'; // Schlüssel für Liga-Tabelle Cache
let cacheKey_L1M = 'L1_MatchData';  // Schlüssel für aktuelle Spiele Cache
let cacheDuration = 1000 * 60 * 5; // Cache-Dauer: 5 Minuten

// Funktion zum Abrufen und Rendern der Liga-Daten
function fetchAndRenderData(URL, cacheKey, renderFunction) {
    fetch(URL)
    .then(res => res.text())
    .then(rep => {
        let jsonData = JSON.parse(rep.substr(47).slice(0,-2));

        // Speichere die Daten im Cache (localStorage)
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

// Funktion zum Rendern der Liga-Tabelle (1. Liga)
function renderLeagueTable(jsonData) {
    let rows = jsonData.table.rows;
    let tableBody = document.querySelector('.league-table tbody');
    tableBody.innerHTML = ''; // Platzhalter löschen

    rows.forEach(row => {
        //let points = row.c[8]?.v; // Punktewert aus der 3. Spalte (Index 2)
        //points = parseFloat(points).toFixed(2); // Rundet die Punkte auf 2 Nachkommastellen
        
        let newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${row.c[0].v}</td>
            <td>${row.c[1].v}</td>
            <td>${row.c[3].v}</td>
            <td>${row.c[4].v}</td>
            <td>${row.c[5].v}</td>
            <td>${row.c[6].v}</td>
            <td>${row.c[7].v}</td>
            <td>${parseFloat(row.c[8]?.v).toFixed(2)}</td>
        `;
        tableBody.appendChild(newRow);
    });

    // Füge der Tabelle den roten Hintergrund für die letzten drei hinzu
    let allRows = tableBody.querySelectorAll('tr');
    let lastThreeRows = [...allRows].slice(-3); // Letzte 3 Zeilen auswählen
    

    // First three rows for the top positions
    let firstFourRows = [...allRows].slice(0, 4); 
    firstFourRows.forEach(row => {
        row.classList.add('final-four');
    });

    lastThreeRows.forEach(row => {
        row.classList.add('last-three');
    });

    // Fourth last row as a special relegation position
    if (allRows[allRows.length - 4]) {
        allRows[allRows.length - 4].classList.add('relegation-bottom');
    }
}

// Funktion zur Bestimmung der aktuellen Spielwoche basierend auf festgelegten Zeiträumen
function getSpielwoche() {
    const today = new Date();

    // Definiere die Start- und Enddaten für jede Spielwoche
    const spielwochen = [
        { start: new Date("2024-11-11"), end: new Date("2024-11-24"), week: 1 },
        { start: new Date("2024-11-25"), end: new Date("2024-12-08"), week: 2 },
        { start: new Date("2024-12-09"), end: new Date("2025-01-05"), week: 3 },
        { start: new Date("2025-01-06"), end: new Date("2025-01-19"), week: 4 },
        { start: new Date("2025-01-20"), end: new Date("2025-02-02"), week: 5 }
    ];

    // Finde die aktuelle Spielwoche basierend auf dem heutigen Datum
    for (const spielwoche of spielwochen) {
        if (today >= spielwoche.start && today <= spielwoche.end) {
            return spielwoche;
        }
    }
    return null; // Falls das Datum außerhalb der definierten Zeiträume liegt
}

// Funktion zur Formatierung des Datums im Format "DD.MM.YY"
function formatDate(date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Monate sind nullbasiert
    let year = String(date.getFullYear()).slice(-2); // Nur die letzten zwei Ziffern des Jahres
    return `${day}.${month}.${year}`;
}

// Funktion zur Aktualisierung der Spielwoche in der Tabelle
function updateSpielwoche() {
    const spielwoche = getSpielwoche();
    if (!spielwoche) return;

    const wocheNummer = spielwoche.week;
    const wocheStart = formatDate(spielwoche.start);
    const wocheEnde = formatDate(spielwoche.end);
    
    const headerElement = document.querySelector(".week");
    const datumSubHeader = document.querySelector(".date");

    if (headerElement) {
        headerElement.textContent = `Spielwoche ${wocheNummer}`;
    }
    if (datumSubHeader) {
        datumSubHeader.textContent = `${wocheStart} - ${wocheEnde}`;
    }
}

// Initiale Aktualisierung beim Laden der Seite
updateSpielwoche();


// Funktion zum Rendern der aktuellen Spiele (Match-Tabelle)
function renderMatchTable(jsonData) {
    let rows = jsonData.table.rows;
    let tableBody = document.querySelector('.match-table tbody');
    tableBody.innerHTML = ''; // Platzhalter löschen

    rows.forEach(row => {
        let newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${row.c[0]?.v || '-'}</td>
            <td>${row.c[1]?.v || '-'}</td>
            <td>${row.c[2]?.v || '-'}</td>
            <td>${row.c[3]?.v || '-'}</td>
        `;
        tableBody.appendChild(newRow);
    });
}



// Funktion zum Überprüfen, ob der Cache noch gültig ist
function isCacheValid(cacheKey) {
    let cached = JSON.parse(localStorage.getItem(cacheKey));
    if (!cached) return false; // Kein Cache vorhanden
    return Date.now() < cached.expiry; // Überprüfe Ablaufzeit
}

// Lade die Liga-Daten entweder aus dem Cache oder durch API-Abfrage
function loadTableData() {
    if (isCacheValid(cacheKey_L1T)) {
        let cachedData = JSON.parse(localStorage.getItem(cacheKey_L1T)).data;
        renderLeagueTable(cachedData);
    } else {
        fetchAndRenderData(URL1, cacheKey_L1T, renderLeagueTable);
    }
}

// Lade die Spieldaten des aktuellen Spieltags (Match-Tabelle)
function loadMatchData() {
    if (isCacheValid(cacheKey_L1M)) {
        let cachedData = JSON.parse(localStorage.getItem(cacheKey_L1M)).data;
        renderMatchTable(cachedData);
    } else {
        fetchAndRenderData(URL2, cacheKey_L1M, renderMatchTable);
    }
}

// Lade die Liga- und Spieldaten beim Seitenaufruf
loadTableData();
loadMatchData();
