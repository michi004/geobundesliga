// Nur für die Preseason Signups der Teil
let sheetID = '1rzYKg1Xz4al00i29DRlgo8MHn2mSieFK2Il8Y2VD0fU';
let spreadsheetName = 'Re Signups';  // Tabellenblatt-Name
let dataRange = 'H4:I31';   // Bereich: Zeilen 4 bis 19, Spalte B (Spieler) und C (Status)
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

    for (let i = 0; i < rows.length; i += 2) {
        // Spieler 1
        let player1 = rows[i].c[0]?.v || 'Unbekannt';
        let status1 = rows[i].c[1]?.v || '0';

        // Spieler 2 (falls vorhanden)
        let player2 = (rows[i + 1] && rows[i + 1].c[0]?.v) || 'Unbekannt';
        let status2 = (rows[i + 1] && rows[i + 1].c[1]?.v) || '0';

        // Erstelle eine neue Tabellenzeile
        let newRow = document.createElement('tr');

        // Füge zwei Spieler ein
        newRow.innerHTML = `
            <td>${player1}</td>
            <td>${player2}</td>
        `;

        // Färbe die Zellen grün, wenn der Status "1" ist
        if (status1 == '1') {
            newRow.children[0].style.backgroundColor = 'green';
        }
        if (status2 == '1') {
            newRow.children[1].style.backgroundColor = 'green';
        }

        // Füge die Zeile dem Tabellenkörper hinzu
        tableBody.appendChild(newRow);
    }
}


// Lade die Spieler-Daten beim Seitenaufruf
document.addEventListener('DOMContentLoaded', function() {
    fetchAndRenderData();
});