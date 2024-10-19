// Nur für die Preseason Signups der Teil
let sheetID = '1rzYKg1Xz4al00i29DRlgo8MHn2mSieFK2Il8Y2VD0fU';
let spreadsheetName = 'Re Signups';  // Tabellenblatt-Name
let dataRange = 'E4:F19';   // Bereich: Zeilen 4 bis 19, Spalte B (Spieler) und C (Status)
let URL = 'https://docs.google.com/spreadsheets/d/' + sheetID + '/gviz/tq?sheet=' + spreadsheetName + '&range=' + dataRange;

// Funktion zum Abrufen und Rendern der Spieler-Daten
function fetchAndRenderData() {
    fetch(URL)
    .then(res => res.text())
    .then(rep => {
        let jsonData = JSON.parse(rep.substr(47).slice(0,-2)); 
        console.log(jsonData); // Bereinige das JSON
        renderLeagueTable(jsonData);  // Render die Tabelle mit den Daten
    })
    .catch(error => {
        console.error('Fehler beim Abrufen der Daten: ', error);
    });
}

// Funktion zum Rendern der Liga-Tabelle
function renderLeagueTable(jsonData) {
    let rows = jsonData.table.rows;
    let tableBody = document.querySelector('.league-table tbody');
    tableBody.innerHTML = ''; // Vorhandene Daten löschen

    rows.forEach((row) => {
        let player = row.c[0]?.v || 'Unbekannt';  // Spielername in Spalte B (Index 0)
        let status = row.c[1]?.v || '0';  // Wert in der C-Spalte (Index 1)

        // Erstelle eine neue Tabellenzeile
        let newRow = document.createElement('tr');

        // Füge nur den Spielernamen ein
        newRow.innerHTML = `
            <td>${player}</td>
        `;

        // Färbe die Zeile grün, wenn in Spalte C eine "1" steht
        if (status == '1') {
            newRow.style.backgroundColor = 'green';
        }

        // Füge die Zeile dem Tabellenkörper hinzu
        tableBody.appendChild(newRow);
    });
}

// Lade die Spieler-Daten beim Seitenaufruf
document.addEventListener('DOMContentLoaded', function() {
    fetchAndRenderData();
});