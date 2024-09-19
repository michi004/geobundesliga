let sheetID = '1wqB2lp45cttqm-Ce0QxYGpsjRSg_lCp5-aQ3L3Dnb1I';
    let spreadsheetName = 'öffentliche tabelle';
    let dataRange = 'B5:F20';
    let URL = 'https://docs.google.com/spreadsheets/d/' + sheetID + '/gviz/tq?sheet=' + spreadsheetName + '&range=' + dataRange;
    
    fetch(URL)
    .then(res => res.text())
    .then(rep => {
        let jsonData = JSON.parse(rep.substr(47).slice(0,-2));

        // Extrahiere die eigentlichen Tabellen-Daten
        let rows = jsonData.table.rows;
        let tableBody = document.querySelector('.league-table tbody');
        tableBody.innerHTML = ''; // Platzhalter löschen

        // Füge die Daten zur Tabelle hinzu
        rows.forEach(row => {
            let points = row.c[2]?.v || 0; // Punktewert aus der 3. Spalte (Index 2)
            points = parseFloat(points).toFixed(2); // Rundet die Punkte auf 2 Nachkommastellen
            
            let newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${row.c[0].v}</td>
                <td>${row.c[1].v}</td>
                <td>${points}</td>
                <td>${row.c[3].v}</td>
                <td>${row.c[4].v}</td>
            `;
            tableBody.appendChild(newRow);
        });

        // Füge der Tabelle den roten Hintergrund für die letzten drei hinzu
        let allRows = tableBody.querySelectorAll('tr');
        let lastThreeRows = [...allRows].slice(-3); // Letzte 3 Zeilen auswählen
        
        lastThreeRows.forEach(row => {
            row.classList.add('last-three');
        });
    })
    .catch(error => console.error('Fehler beim Abrufen der Daten: ', error));