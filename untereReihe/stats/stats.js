class StatsTable {
  constructor(sheetID, sheetName, dataRange, matchRange, keyIndex) {
    this.sheetID = sheetID;
    this.sheetName = sheetName;
    this.dataRange = dataRange;
    this.matchRange = matchRange;
    this.cacheKeyTable = keyIndex + "_table";
    this.cacheKeyMatches = keyIndex + "_match";
    this.cacheKeyRescheduled = keyIndex + "_rescheduled";
    this.spielplanName = keyIndex + "_spielplan";
    this.rescheduleRanges = [];
    this.cacheDuration = 1 * 60 * 5; // 5 Minuten Cache-Dauer
  }

  getURL(range) {
    return `https://docs.google.com/spreadsheets/d/${this.sheetID}/gviz/tq?sheet=${this.sheetName}&range=${range}`;
  }

  fetchAndRenderData(url, cacheKey, renderFunction) {
    fetch(url)
      .then((res) => res.text())
      .then((rep) => {
        let jsonData = JSON.parse(rep.substr(47).slice(0, -2));

        // Speichere die Daten im Cache (localStorage)
        /*let cacheData = {
          data: jsonData,
          expiry: Date.now() + this.cacheDuration,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));*/

        // Render die Tabelle mit den Daten
        renderFunction(jsonData);
      })
      .catch((error) => {
        console.error("Fehler beim Abrufen der Daten: ", error);
      });
  }

  isCacheValid(cacheKey) {
    let cached = JSON.parse(localStorage.getItem(cacheKey));
    if (!cached) return false;
    return Date.now() < cached.expiry;
  }

  renderStatsTable(jsonData) {
    let rows = jsonData.table.rows;
    let tableBody;
    let tableId = "#table-body-";
    let ligaCounter = "0";
    let ligaRows = [];

    rows.forEach((row) => {
      if (row.c[0]) {
        // Spalte A enthält "Liga X" in der ersten Zeile jeder Liga
        // sortiere die für diese Liga gesammelten Zeilen
        ligaRows.sort(
          (a, b) =>
            a.children[0].childNodes[0].nodeValue.trim() -
            b.children[0].childNodes[0].nodeValue.trim()
        );
        // füge die für diese Liga gesammelten Zeilen ein
        ligaRows.forEach((ligaRow) => {
          tableBody.appendChild(ligaRow);
        });

        ligaCounter++;
        tableBody = document.querySelector(tableId + ligaCounter.toString());
        tableBody.innerHTML = ""; // Platzhalter löschen

        ligaRows = [];
      }
      let newRow = document.createElement("tr");
      newRow.innerHTML = `
              <td>${row.c[7]?.v}</td>
              <td>${row.c[1].v}</td>
              <td>${row.c[2].v}</td>
              <td>${row.c[3]?.v}</td>
              <td>${row.c[8]?.v}</td>
          `;
      ligaRows.push(newRow);
    });
    // sortiere die für diese Liga gesammelten Zeilen
    ligaRows.sort(
      (a, b) =>
        a.children[0].childNodes[0].nodeValue.trim() -
        b.children[0].childNodes[0].nodeValue.trim()
    );
    // füge die für diese Liga gesammelten Zeilen ein
    ligaRows.forEach((ligaRow) => {
      tableBody.appendChild(ligaRow);
    });

    // Füge der Tabelle den roten Hintergrund für die letzten drei hinzu
    // TODO: für mehrere Tabellen auf einer Seite, css befindet sich noch in liga1.css
    /*let allRows = tableBody.querySelectorAll("tr");
    let lastThreeRows = [...allRows].slice(-3);

    let firstFourRows = [...allRows].slice(0, 4);
    let firstThreeRows = [...allRows].slice(0, 3);

    // unterschiedliche Färbung der Tabellenplätze
    if (this.name == "liga1") {
      firstFourRows.forEach((row) => row.classList.add("final-four"));
    }

    if (this.name == "liga1" || this.name == "liga2") {
      lastThreeRows.forEach((row) => row.classList.add("last-three"));

      if (allRows[allRows.length - 4]) {
        allRows[allRows.length - 4].classList.add("relegation-bottom");
      }
    }

    if (this.name == "liga2" || this.name == "liga3") {
      firstThreeRows.forEach((row) => row.classList.add("first-three"));

      if (allRows[3]) {
        allRows[3].classList.add("relegation");
      }
    }*/
  }

  loadTableData() {
    if (this.isCacheValid(this.cacheKeyTable)) {
      let cachedData = JSON.parse(
        localStorage.getItem(this.cacheKeyTable)
      ).data;
      this.renderStatsTable(cachedData);
    } else {
      this.fetchAndRenderData(
        this.getURL(this.dataRange),
        this.cacheKeyTable,
        this.renderStatsTable.bind(this)
      );
    }
  }

  initialize() {
    this.loadTableData();
    //this.loadRescheduleData();
    /*
    // Liga Spieltage rendern
    fetchAndRenderMatchdayTables(
      "1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw",
      this.spielplanName,
      this.leagueSize
    );*/
  }
}

function fetchAndRenderTable(sheetID, sheetName, dataRange, tableID) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${sheetName}&range=${dataRange}`;

  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      let jsonData = JSON.parse(data.substr(47).slice(0, -2));
      let rows = jsonData.table.rows;
      let tableBody = document.querySelector(`#${tableID} tbody`);

      if (!tableBody) {
        console.error(`Tabelle mit ID '${tableID}' nicht gefunden.`);
        return;
      }

      tableBody.innerHTML = "";
      rows.forEach((row) => {
        let newRow = document.createElement("tr");
        newRow.innerHTML = row.c
          .map((cell) => {
            let value = cell?.v || "-";

            // Prüfen, ob der Wert ein Datum-Objekt ist
            if (cell?.f && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(cell.f)) {
              value = cell.f; // Der formatierte Wert ist bereits im gewünschten Format
            }

            return `<td>${value}</td>`;
          })
          .join("");
        tableBody.appendChild(newRow);
      });
    })
    .catch((error) => console.error("Fehler beim Abrufen der Tabelle:", error));
}
