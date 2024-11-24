class LeagueTable {
    constructor(sheetID, name, sheetName, dataRange, matchRange, cacheKeyTable, cacheKeyMatches) {
        this.sheetID = sheetID;
        this.name = name;
        this.sheetName = sheetName;
        this.dataRange = dataRange;
        this.matchRange = matchRange;
        this.cacheKeyTable = cacheKeyTable;
        this.cacheKeyMatches = cacheKeyMatches;
        this.cacheDuration = 1000 * 60 * 5; // 5 Minuten Cache-Dauer
    }


    getURL(range) {
        return `https://docs.google.com/spreadsheets/d/${this.sheetID}/gviz/tq?sheet=${this.sheetName}&range=${range}`;
    }

    fetchAndRenderData(url, cacheKey, renderFunction) {
        fetch(url)
            .then(res => res.text())
            .then(rep => {
                let jsonData = JSON.parse(rep.substr(47).slice(0, -2));

                // Speichere die Daten im Cache (localStorage)
                let cacheData = {
                    data: jsonData,
                    expiry: Date.now() + this.cacheDuration
                };
                localStorage.setItem(cacheKey, JSON.stringify(cacheData));

                // Render die Tabelle mit den Daten
                renderFunction(jsonData);
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der Daten: ', error);
            });
    }

    isCacheValid(cacheKey) {
        let cached = JSON.parse(localStorage.getItem(cacheKey));
        if (!cached) return false;
        return Date.now() < cached.expiry;
    }

    renderLeagueTable(jsonData) {
        let rows = jsonData.table.rows;
        let tableBody = document.querySelector('.league-table tbody');
        tableBody.innerHTML = ''; // Platzhalter löschen

        rows.forEach(row => {
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
        let lastThreeRows = [...allRows].slice(-3);

        let firstFourRows = [...allRows].slice(0, 4);
        let firstThreeRows = [...allRows].slice(0, 3);
        
        //unterschiedliche Färbung der Tabellenplätze

        if(this.name == 'liga1'){
            firstFourRows.forEach(row => row.classList.add('final-four'));
        }

        if (this.name == 'liga1' || this.name == 'liga2'){
            lastThreeRows.forEach(row => row.classList.add('last-three'));

            if (allRows[allRows.length - 4]) {
                allRows[allRows.length - 4].classList.add('relegation-bottom');
            }
        }

        if (this.name == 'liga2' || this.name == 'liga3'){
            firstThreeRows.forEach(row => row.classList.add('first-three'));

            if (allRows[3]) {
                allRows[3].classList.add('relegation');
            }
        }
    }

    renderMatchTable(jsonData) {
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

    loadTableData() {
        if (this.isCacheValid(this.cacheKeyTable)) {
            let cachedData = JSON.parse(localStorage.getItem(this.cacheKeyTable)).data;
            this.renderLeagueTable(cachedData);
        } else {
            this.fetchAndRenderData(this.getURL(this.dataRange), this.cacheKeyTable, this.renderLeagueTable.bind(this));
        }
    }

    loadMatchData() {
        if (this.isCacheValid(this.cacheKeyMatches)) {
            let cachedData = JSON.parse(localStorage.getItem(this.cacheKeyMatches)).data;
            this.renderMatchTable(cachedData);
        } else {
            this.fetchAndRenderData(this.getURL(this.matchRange), this.cacheKeyMatches, this.renderMatchTable.bind(this));
        }
    }

    updateSpielwoche() {
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

    initialize(){
        this.loadMatchData();
        this.loadTableData();
        this.updateSpielwoche();
    }
}

// Hilfsfunktionen (z. B. für die Spielwochenberechnung)
function getSpielwoche() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Setzt die Zeit auf Mitternacht

    const spielwochen = [
        { start: new Date("2024-11-11"), end: new Date("2024-11-24"), week: 1 },
        { start: new Date("2024-11-25"), end: new Date("2024-12-09"), week: 2 },
        { start: new Date("2024-12-09"), end: new Date("2025-01-06"), week: 3 },
        { start: new Date("2025-01-06"), end: new Date("2025-01-20"), week: 4 },
        { start: new Date("2025-01-20"), end: new Date("2025-02-03"), week: 5 }
    ];

    // Setzt ebenfalls die Zeit aller Start- und Enddaten auf Mitternacht
    spielwochen.forEach(sw => {
        sw.start.setHours(0, 0, 0, 0);
        sw.end.setHours(23, 59, 59, 0);
    });

    // Rückgabe der passenden Spielwoche
    return spielwochen.find(sw => today >= sw.start && today <= sw.end) || null;
}


function formatDate(date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
}

