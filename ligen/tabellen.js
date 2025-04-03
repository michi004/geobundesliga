class LeagueTable {
    constructor(sheetID, name, sheetName, dataRange, matchRange, keyIndex, leagueSize) {
        this.sheetID = sheetID;
        this.name = name;
        this.sheetName = sheetName;
        this.dataRange = dataRange;
        this.matchRange = matchRange;
        this.cacheKeyTable = keyIndex + "_table";
        this.cacheKeyMatches = keyIndex + "_match";
        this.cacheKeyRescheduled = keyIndex + "_rescheduled";
        this.spielplanName = keyIndex + "_spielplan";
        this.rescheduleRanges = [];
        this.cacheDuration =  1 * 60 * 5; // 5 Minuten Cache-Dauer
        this.leagueSize = leagueSize;
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
                <td>${row.c[2].v}</td>
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
/*
    renderRescheduleTable(jsonData) {
        // Anzahl der Spiele pro Spielwoche
        const liga12Games = [3, 3, 3, 2, 2];
        const liga3Games = [3, 3, 3, 3, 3];
    
        // Offsets für jede Woche
        const liga12Offsets = this.calculateOffsets(liga12Games)
        const liga3Offsets = this.calculateOffsets(liga3Games)
        
        let offset
        if (this.name === "liga1" || this.name === "liga2") {
            offset = liga12Offsets[getSpielwoche().week-1]-3
        } else {
            offset = liga3Offsets[getSpielwoche().week-1]-3
        }

        let rows = jsonData.table.rows;
        let tableBody = document.querySelector('.match-table:last-of-type tbody');
        tableBody.innerHTML = ''; // Platzhalter löschen
        rows.slice(0,offset).forEach(row => {
            if (!row.c[4]?.v) { // Prüfen, ob Spalte E leer ist
                let newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${row.c[1]?.v || '-'}</td>
                    <td>${row.c[2]?.v || '-'}</td>
                    <td>${row.c[3]?.v || '-'}</td>
                    <td>${row.c[4]?.v || '-'}</td>
                `;
                tableBody.appendChild(newRow);
            }
        });
    }*/

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
            console.log(cachedData)
            this.renderMatchTable(cachedData);
        } else {
            // Verwende die dynamisch berechnete Match-Range
            console.log(this.matchRange + "neuladung")

            this.fetchAndRenderData(this.getURL(this.matchRange), this.cacheKeyMatches, this.renderMatchTable.bind(this));
        }
    }
/*
    loadRescheduleData() {
        if (this.isCacheValid(this.cacheKeyRescheduled)) {
            let cachedData = JSON.parse(localStorage.getItem(this.cacheKeyRescheduled)).data;
            this.renderRescheduleTable(cachedData);
        } else {
            // Verwende die dynamisch berechnete Match-Range
            this.fetchAndRenderData(this.getURL(this.rescheduleRanges), this.cacheKeyRescheduled, this.renderRescheduleTable.bind(this));
        }
    }*/
    

    updateSpielwoche() {
        const spielwoche = getSpielwoche();
        if (!spielwoche) return;
    
        const wocheNummer = spielwoche.week;
        const wocheStart = formatDate(spielwoche.start);
        const wocheEnde = formatDate(spielwoche.end);

        //arrays mit anzahl der spiele pro spielwoche
        const liga12Games = [3, 2, 2, 2, 2, 2];
        const liga3Games = [3, 3, 3, 2, 2, 2];
        
        // arrays mit jeweiligen offsets für jede spielwoche
        const liga12Offsets = this.calculateOffsets(liga12Games);
        const liga3Offsets = this.calculateOffsets(liga3Games);
    
        //überschrift
        const headerElement = document.querySelector(".week");
        const datumSubHeader = document.querySelector(".date");
    
        if (headerElement) {
            headerElement.textContent = `Spielwoche ${wocheNummer}`;
        }
        if (datumSubHeader) {
            datumSubHeader.textContent = `${wocheStart} - ${wocheEnde}`;
        }
    
        let startRow = 0;
        let endRow = 0;
        // Dynamische Match-Range basierend auf der Liga
        if(this.name == "liga1" || this.name == "liga2"){
            startRow = liga12Offsets[wocheNummer - 1];// Offset für die aktuelle Woche
            endRow = liga12Games[wocheNummer - 1] * 7 + startRow - 1;
        } else {
            startRow = liga3Offsets[wocheNummer - 1];// Offset für die aktuelle Woche
            endRow = liga3Games[wocheNummer - 1] * 7 + startRow - 1;
        } 
        this.matchRange = `B${startRow}:E${endRow}`;
    }
    

    //hilfsfunktion
    calculateOffsets(gamesPerWeek, spieleProTag = 7) {
        let offsets = [];
        let currentOffset = 3;
    
        for (let i = 0; i < gamesPerWeek.length; i++) {
            offsets.push(currentOffset); // Offset für die aktuelle Woche speichern
            currentOffset += gamesPerWeek[i] * spieleProTag; // Nächsten Offset berechnen
        }
    
        return offsets;
    }   
    

    initialize(){
        this.updateSpielwoche();
        this.loadMatchData();
        this.loadTableData();
        //this.loadRescheduleData();

        //seite 2
        //variable tabellengröße bei unterschiedlicher ligagröße
        let dataRange1 = "S24:V" + (this.leagueSize + 23);
        let dataRange2 = "S46:V" + (this.leagueSize + 45);
        let dataRange3 = "T67:W" + (this.leagueSize + 66);

        // horizontale slideshow mit extra daten 
        fetchAndRenderTable("1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw", this.spielplanName, dataRange1, "pinpointTable");
        fetchAndRenderTable("1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw", this.spielplanName, dataRange2, "yellowCards");
        fetchAndRenderTable("1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw", this.spielplanName, dataRange3, "extensions");

        // Liga Spieltage rendern 
        fetchAndRenderMatchdayTables("1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw", this.spielplanName, this.leagueSize);
    }
}

// Hilfsfunktionen (z. B. für die Spielwochenberechnung)
function getSpielwoche() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Setzt die Zeit auf Mitternacht
    const spielwochen = [
        { start: new Date("2025-03-21"), end: new Date("2025-04-20"), week: 1 },
        { start: new Date("2025-04-21"), end: new Date("2025-05-04"), week: 2 },
        { start: new Date("2025-05-05"), end: new Date("2025-05-18"), week: 3 },
        { start: new Date("2025-05-19"), end: new Date("2025-06-01"), week: 4 },
        { start: new Date("2025-06-02"), end: new Date("2025-06-15"), week: 5 },
        { start: new Date("2025-06-16"), end: new Date("2025-06-29"), week: 6 },
        { start: new Date("2025-06-30"), end: new Date("2025-07-13"), week: 7 }
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

// scrollanimation für weitere informationen
window.addEventListener('scroll', () => {
    const secondSection = document.querySelector('.second-section');
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    const scrollAmount = Math.min(scrollPosition / windowHeight, 1) * 100;

    secondSection.style.transform = `translateY(${100 - scrollAmount}%)`;
});

//
//
//
//
//
//
//
//tabellen 2te seite

//extra info tabellen slideshow
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "flex";
    dots[slideIndex-1].className += " active";
}

function fetchAndRenderTable(sheetID, sheetName, dataRange, tableID) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${sheetName}&range=${dataRange}`;
    
    fetch(url)
        .then(response => response.text())
        .then(data => {
            let jsonData = JSON.parse(data.substr(47).slice(0, -2));
            let rows = jsonData.table.rows;
            let tableBody = document.querySelector(`#${tableID} tbody`);
            
            if (!tableBody) {
                console.error(`Tabelle mit ID '${tableID}' nicht gefunden.`);
                return;
            }
            
            tableBody.innerHTML = '';
            rows.forEach(row => {
                let newRow = document.createElement('tr');
                newRow.innerHTML = row.c.map(cell => {
                    let value = cell?.v || '-';

                    // Prüfen, ob der Wert ein Datum-Objekt ist
                    if (cell?.f && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(cell.f)) {
                        value = cell.f; // Der formatierte Wert ist bereits im gewünschten Format
                    }

                    return `<td>${value}</td>`;
                }).join('');
                tableBody.appendChild(newRow);
            });
        })
        .catch(error => console.error('Fehler beim Abrufen der Tabelle:', error));
}

// Vertikale Slideshow für Spieltage
function fetchAndRenderMatchdayTables(sheetID, sheetName, leagueSize) {
    const matchdaySize = leagueSize / 2; // Anzahl der Spiele pro Spieltag
    const totalMatchdays = leagueSize - 1; // Anzahl der Spieltage (keine Rückrunde)
    
    const slideshowContainer = document.querySelector(".matchday-slideshow");
    const prevButton = document.querySelector(".prevDay");
    const nextButton = document.querySelector(".nextDay");
    const matchdayList = document.getElementById("matchday-list");
    
    let currentIndex = 1;
    
    function createMatchdayTable(index) {
        const startRow = 3 + (index - 1) * matchdaySize;
        const endRow = startRow + matchdaySize - 1;
        const dataRange = `B${startRow}:E${endRow}`;
        const tableID = `matchday-${index}`;
        
        const table = document.createElement("table");
        table.id = tableID;
        table.classList.add("matchday-table");
        if (index !== currentIndex) {
            table.classList.add("faded");
        }
        table.innerHTML = `<thead><tr><th colspan='4'>Spieltag ${index}</th></tr></thead><tbody></tbody>`;
        
        fetchAndRenderTable(sheetID, sheetName, dataRange, tableID);
        
        return table;
    }

    function getWrappedIndex(index) {
        if (index < 1) return totalMatchdays;
        if (index > totalMatchdays) return 1;
        return index;
    }

    function renderMatchdayTables() {
        slideshowContainer.innerHTML = "";
        slideshowContainer.appendChild(prevButton);

        let indices = [getWrappedIndex(currentIndex - 1), getWrappedIndex(currentIndex), getWrappedIndex(currentIndex + 1)];
        
        indices.forEach(i => {
            slideshowContainer.appendChild(createMatchdayTable(i));
        });
        
        slideshowContainer.appendChild(nextButton);
        updateMatchdayView();
    }

    prevButton.addEventListener("click", function () {
        currentIndex = getWrappedIndex(currentIndex - 1);
        renderMatchdayTables();
    });

    nextButton.addEventListener("click", function () {
        currentIndex = getWrappedIndex(currentIndex + 1);
        renderMatchdayTables();
    });

    function generateMatchdayList() {
        for (let i = 1; i <= totalMatchdays; i++) {
            const li = document.createElement("li");
            const button = document.createElement("button");
            
            button.textContent = i;
            button.classList.add("matchday-btn");
            button.addEventListener("click", () => goToMatchday(i));

            li.appendChild(button);
            matchdayList.appendChild(li);
        }
    }

    function goToMatchday(matchday) {
        currentIndex = matchday;
        renderMatchdayTables();
    }

    function updateMatchdayView() {
        document.querySelectorAll(".matchday-btn").forEach(btn => {
            btn.classList.remove("active");
            if (parseInt(btn.textContent) === currentIndex) {
                btn.classList.add("active");
            }
        });
    }

    generateMatchdayList();
    renderMatchdayTables();
}
