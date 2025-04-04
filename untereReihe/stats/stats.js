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
    this.statsSheetColLigaNumber = 0; // Spalte A
    this.statsSheetColDiscordName = 1; // Spalte B
    this.statsSheetColGGName = 2;
    this.statsSheetColSubdivision = 3; // usw.
    this.statsSheetColLeagueParticipations = 4;
    this.statsSheetColPB = 5;
    this.statsSheetColWordsOfWisdom = 6;
    this.statsSheetColPlacement = 7;
    this.statsSheetColPoints = 8;
    this.statsSheetCol5ks = 9;
    this.statsSheetCol4800 = 10;
    this.statsSheetColExt = 11;
    this.statsSheetColYellowCards = 12;
    this.statsSheetColMPlayed = 13;
    this.statsSheetColMWon = 14;
    this.statsSheetColMHealth = 15;
    this.statsSheetColNMPlayed = 16;
    this.statsSheetColNMWon = 17;
    this.statsSheetColNMHealth = 18;
    this.statsSheetColNMPZPlayed = 19;
    this.statsSheetColNMPZWon = 20;
    this.statsSheetColNMPZHealth = 21;
    this.statsSheetColDACHPlayed = 22;
    this.statsSheetColDACHWon = 23;
    this.statsSheetColDACHHealth = 24;
    this.statsSheetColFavMode = 25;
    this.sheetData;
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

        // Rendere die Tabelle mit den Daten
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
    this.sheetData = rows;
    let tableBody;
    let tableId = "#table-body-";
    let ligaCounter = "0";
    let ligaRows = [];

    rows.forEach((row) => {
      if (row.c[this.statsSheetColLigaNumber]) {
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
      let playerSubdivision = row.c[this.statsSheetColSubdivision]?.v;
      let playerSubdivisionIcon = getPlayerSubdivisionIcon(playerSubdivision);
      newRow.innerHTML = `
              <td>${row.c[this.statsSheetColPlacement]?.v}</td>
              <td style="text-align: right">${
                row.c[this.statsSheetColDiscordName].v
              }</td>
              <td style="text-align: left">${playerSubdivisionIcon} ${
        row.c[this.statsSheetColGGName].v
      }</td>
              <td>${row.c[this.statsSheetColPoints]?.v}</td>
          `;

      newRow.addEventListener("click", () => {
        this.openModal(row);
      });
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

  openModal(sheetRow) {
    const modal = document.getElementById("statsModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDetails = document.getElementById("modalDetails");

    modalTitle.innerHTML = `Statistiken für ${getPlayerSubdivisionIcon(
      sheetRow.c[this.statsSheetColSubdivision]?.v
    )} ${sheetRow.c[this.statsSheetColGGName].v}`;

    /*modalDetails.innerHTML = `
        <strong>Match ID:</strong> ${matchData.id}<br>
        <strong>Ergebnis:</strong> ${
          matchData.ergebnis || "Noch nicht verfügbar"
        }
    `;

    const mapsContainer = document.createElement("div");
    mapsContainer.id = "maps-container";
    mapsContainer.style.marginTop = "20px";

    if (matchData.maps && matchData.maps.length > 0) {
      const maps = matchData.maps;
      const rows = [[], [], []];

      for (let i = 0; i < maps.length; i++) {
        if (i < 2) rows[0].push(maps[i]);
        else if (i < 5) rows[1].push(maps[i]);
        else rows[2].push(maps[i]);
      }

      rows.forEach((row) => {
        if (row.length > 0) {
          const rowDiv = document.createElement("div");
          rowDiv.className = "maps-row";
          rowDiv.style.display = "flex";
          rowDiv.style.justifyContent = "space-around";
          rowDiv.style.marginBottom = "10px";

          row.forEach((mapInfo) => {
            const [mapName, winner, moveType, link] = mapInfo;

            const mapBox = document.createElement("a");
            mapBox.href = link;
            mapBox.target = "_blank";
            mapBox.textContent = mapName;
            mapBox.style.padding = "10px";
            mapBox.style.border = "2px solid";
            mapBox.style.borderRadius = "5px";
            mapBox.style.backgroundColor = "#f9f9f9";
            mapBox.style.textDecoration = "none";
            mapBox.style.color = "#333";
            mapBox.style.display = "inline-block";
            mapBox.style.minWidth = "120px";
            mapBox.style.textAlign = "center";

            if (winner === "blue") {
              mapBox.style.borderColor = "blue";
            } else if (winner === "red") {
              mapBox.style.borderColor = "red";
            }

            rowDiv.appendChild(mapBox);
          });

          mapsContainer.appendChild(rowDiv);
        }
      });
    } else {
      mapsContainer.innerHTML = "<em>Keine Maps verfügbar</em>";
    }

    modalDetails.appendChild(mapsContainer);*/
    modal.style.display = "flex";
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

function getPlayerSubdivisionIcon(playerSubdivision) {
  return `<img src="./../../img/herzen/${playerSubdivision}.png" alt="${playerSubdivision}" style="height: 1em; vertical-align: middle;" />`;
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

document.addEventListener("DOMContentLoaded", function () {
  // Event-Listener für das Schließen des Modals
  const modal = document.getElementById("statsModal");
  const closeModalButton = modal.querySelector(".close");
  closeModalButton.addEventListener("click", function () {
    modal.style.display = "none"; // Modal ausblenden
  });

  // Optional: Modal schließen, wenn außerhalb des Inhalts geklickt wird
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none"; // Modal ausblenden
    }
  });
});
