class LeagueTable {
  constructor(
    sheetID,
    name,
    sheetName,
    dataRange,
    matchRange,
    keyIndex,
    leagueSize
  ) {
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
    this.cacheDuration = 1000 * 60 * 5; // 5 Minuten Cache-Dauer
    this.leagueSize = leagueSize;

    // Spalten im Google Sheet
    this.statsSheetColLigaNumber = 0; // Spalte A
    this.statsSheetColDiscordName = 1; // Spalte B
    this.statsSheetColGGName = 2;
    this.statsSheetColGGLink = 3;
    this.statsSheetColSubdivision = 3 + 1; // usw.
    this.statsSheetColLeagueParticipations = 4 + 1;
    this.statsSheetColPB = 5 + 1;
    this.statsSheetColWordsOfWisdom = 6 + 1;
    this.statsSheetColPlacement = 7 + 1;
    this.statsSheetColPoints = 8 + 1;
    this.statsSheetCol5ks = 9 + 1;
    this.statsSheetCol4800 = 10 + 1;
    this.statsSheetColExt = 11 + 1;
    this.statsSheetColYellowCards = 12 + 1;
    this.statsSheetColMPlayed = 13 + 1;
    this.statsSheetColMWon = 14 + 1;
    this.statsSheetColMHealth = 15 + 1;
    this.statsSheetColNMPlayed = 16 + 1;
    this.statsSheetColNMWon = 17 + 1;
    this.statsSheetColNMHealth = 18 + 1;
    this.statsSheetColNMPZPlayed = 19 + 1;
    this.statsSheetColNMPZWon = 20 + 1;
    this.statsSheetColNMPZHealth = 21 + 1;
    this.statsSheetColDACHPlayed = 22 + 1;
    this.statsSheetColDACHWon = 23 + 1;
    this.statsSheetColDACHHealth = 24 + 1;
    this.statsSheetColFavMode = 25 + 1;
    this.sheetData;
  }

  getURL(range) {
    return `https://docs.google.com/spreadsheets/d/${this.sheetID}/gviz/tq?sheet=${this.sheetName}&range=${range}`;
  }

  getURLStats(sheetID, sheetName, range) {
    // for stats data
    return `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${sheetName}&range=${range}`;
  }

  fetchAndRenderData(url, cacheKey, renderFunction) {
    fetch(url)
      .then((res) => res.text())
      .then((rep) => {
        let jsonData = JSON.parse(rep.substr(47).slice(0, -2));

        // Speichere die Daten im Cache (localStorage)
        let cacheData = {
          data: jsonData,
          expiry: Date.now() + this.cacheDuration,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));

        // Render die Tabelle mit den Daten
        renderFunction(jsonData);
      })
      .catch((error) => {
        console.error("Fehler beim Abrufen der Daten: ", error);
      });
  }

  fetchAndReturnStatsData(url, cacheKey) {
    let jsonData;
    fetch(url)
      .then((res) => res.text())
      .then((rep) => {
        jsonData = JSON.parse(rep.substr(47).slice(0, -2));

        // Speichere die Daten im Cache (localStorage)
        let cacheData = {
          data: jsonData,
          expiry: Date.now() + this.cacheDuration,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      })
      .catch((error) => {
        console.error("Fehler beim Abrufen der Daten: ", error);
      });
    return jsonData;
  }

  isCacheValid(cacheKey) {
    let cached = JSON.parse(localStorage.getItem(cacheKey));
    if (!cached) return false;
    return Date.now() < cached.expiry;
  }

  renderLeagueTable(jsonData) {
    let rows = jsonData.table.rows;
    let tableBody = document.querySelector(".league-table tbody");
    tableBody.innerHTML = ""; // Platzhalter löschen

    rows.forEach((row) => {
      let newRow = document.createElement("tr");
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
      newRow.addEventListener("click", () => {
        this.openStatsModalForName(row.c[1].v);
      });
      newRow.classList.add("league-table-row");
      tableBody.appendChild(newRow);
    });

    // Füge der Tabelle den roten Hintergrund für die letzten drei hinzu
    let allRows = tableBody.querySelectorAll("tr");

    //unterschiedliche Färbung der Tabellenplätze

    if (this.name == "liga1") {
      let firstFourRows = [...allRows].slice(0, 4);
      firstFourRows.forEach((row) => row.classList.add("final-four"));
    }

    if (
      this.name == "liga1" ||
      this.name == "liga3a" ||
      this.name == "liga3b"
    ) {
      let lastThreeRows = [...allRows].slice(-3);
      lastThreeRows.forEach((row) => row.classList.add("last-three"));

      if (allRows[allRows.length - 4]) {
        allRows[allRows.length - 4].classList.add("relegation-bottom");
      }
    }

    if (this.name == "liga2") {
      let lastFourRows = [...allRows].slice(-4);
      lastFourRows.forEach((row) => row.classList.add("last-three"));

      if (allRows[3]) {
        allRows[allRows.length - 5].classList.add("relegation-bottom");
      }
    }

    if (
      this.name == "liga2" ||
      this.name == "liga4a" ||
      this.name == "liga4b"
    ) {
      let firstThreeRows = [...allRows].slice(0, 3);
      firstThreeRows.forEach((row) => row.classList.add("first-three"));

      if (allRows[3]) {
        allRows[3].classList.add("relegation");
      }
    }

    if (this.name == "liga3a" || this.name == "liga3b") {
      let firstTwoRows = [...allRows].slice(0, 2);
      firstTwoRows.forEach((row) => row.classList.add("first-three"));

      if (allRows[2]) {
        allRows[2].classList.add("relegation");
      }
    }
  }

  openModal(matchData) {
    const modal = document.getElementById("gameModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDetails = document.getElementById("modalDetails");

    modalTitle.innerHTML = `${
      matchData.ergebnis != "N/A" ? '<span style="color:blue;">|</span>' : ""
    } ${matchData.blau} vs ${matchData.rot} ${
      matchData.ergebnis != "N/A" ? '<span style="color:red;">|</span>' : ""
    }`;

    let punkteText;
    if (
      typeof matchData.punkteBlau === "number" &&
      typeof matchData.punkteRot === "number" &&
      !(matchData.punkteBlau === 0 && matchData.punkteRot === 0)
    ) {
      if (matchData.punkteBlau > matchData.punkteRot) {
        matchData.punkteBlau += 1;
      } else if (matchData.punkteRot > matchData.punkteBlau) {
        matchData.punkteRot += 1;
      }

      const punkteBlau = matchData.punkteBlau.toFixed(2);
      const punkteRot = matchData.punkteRot.toFixed(2);
      punkteText = `${punkteBlau} : ${punkteRot}`;
    } else {
      punkteText = "N/A";
    }

    let lebenText;
    if (
      typeof matchData.healthBlau === "number" &&
      typeof matchData.healthRot === "number"
    ) {
      lebenText = `${matchData.healthBlau} : ${matchData.healthRot}`;
    } else {
      lebenText = "N/A";
    }

    modalDetails.innerHTML = `
      <strong>Match ID:</strong> ${matchData.id}<br>
      <strong>Ergebnis:</strong> ${
        matchData.ergebnis || "Noch nicht verfügbar"
      }<br>
      <strong>Punkte:</strong> ${punkteText}<br>
      <strong>Leben:</strong> ${lebenText}<br>
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
            const [mapName, winner, matchtype, health, link] = mapInfo;

            const mapBox = document.createElement("a");
            mapBox.href = link;
            mapBox.target = "_blank";
            mapBox.style.padding = "10px";
            mapBox.style.borderRadius = "5px";
            mapBox.style.display = "inline-block";
            mapBox.style.minWidth = "120px";
            mapBox.style.color = "#333";
            mapBox.style.textDecoration = "none";
            mapBox.style.border = "1px solid #ccc";
            mapBox.style.backgroundColor = "#f9f9f9";
            mapBox.style.textAlign = "left";

            // Gewinnerfarbe setzen
            if (winner === "blue") {
              mapBox.style.borderLeft = "5px solid blue";
            } else if (winner === "red") {
              mapBox.style.borderRight = "5px solid red";
            }

            // Inhalt mit Mapname & Matchtyp
            mapBox.innerHTML = `
              <div>${mapName}</div>
              <div style="font-size: 0.8em; color: #777;">${
                matchtype == "move"
                  ? "Moving"
                  : matchtype == "bmd"
                  ? "Better Moving Duel"
                  : matchtype == "no move"
                  ? "NM"
                  : "NMPZ"
              }</div>
            `;

            rowDiv.appendChild(mapBox);
          });

          mapsContainer.appendChild(rowDiv);
        }
      });
    } else {
      mapsContainer.innerHTML = "<em>Keine Maps verfügbar</em>";
    }

    modalDetails.appendChild(mapsContainer);
    modal.style.display = "flex";
  }

  renderMatchTable(jsonData) {
    let rows = jsonData.table.rows;
    let tableBody = document.querySelector(".match-table tbody");
    tableBody.innerHTML = "";

    rows.forEach((row) => {
      let newRow = document.createElement("tr");
      newRow.classList.add("match-row");

      newRow.innerHTML = `
                <td>${row.c[0]?.v || "-"}</td>
                <td>${row.c[1]?.v || "-"}</td>
                <td>${row.c[2]?.v || "-"}</td>
                <td>${row.c[3]?.v || "-"}</td>
            `;

      newRow.addEventListener("click", () => {
        this.openModal({
          blau: row.c[0]?.v || "N/A",
          rot: row.c[1]?.v || "N/A",
          id: row.c[2]?.v || "N/A",
          ergebnis: row.c[3]?.v || "N/A",
          punkteBlau: row.c[4]?.v != null ? parseFloat(row.c[4].v) : undefined,
          punkteRot: row.c[5]?.v != null ? parseFloat(row.c[5].v) : undefined,
          healthBlau: row.c[8]?.v || "N/A",
          healthRot: row.c[9]?.v || "N/A",
          maps: JSON.parse(row.c[10]?.v || "[]"),
        });
      });

      tableBody.appendChild(newRow);
    });
  }

  renderRescheduleTable(jsonData) {
    //arrays mit anzahl der spiele pro spielwoche
    const liga1Games = [3, 3, 3, 2, 2, 2];
    const liga23Games = [3, 3, 3, 2, 2, 2];
    const liga4Games = [3, 2, 2, 2, 2, 2];

    // arrays mit jeweiligen offsets für jede spielwoche
    const liga1Offsets = this.calculateOffsets(liga1Games, 8);
    const liga23Offsets = this.calculateOffsets(liga23Games, 7);
    const liga4Offsets = this.calculateOffsets(liga4Games, 7);

    let offset;
    if (this.name === "liga1") {
      offset = liga1Offsets[getSpielwoche().week - 1] - 3;
    } else if (
      this.name === "liga2" ||
      this.name === "liga3a" ||
      this.name === "liga3b"
    ) {
      offset = liga23Offsets[getSpielwoche().week - 1] - 3;
    } else if (this.name === "liga4a" || this.name === "liga4b") {
      offset = liga4Offsets[getSpielwoche().week - 1] - 3;
    }

    let rows = jsonData.table.rows;
    let tableBody = document.querySelector("#nachholspiele tbody");
    tableBody.innerHTML = ""; // Platzhalter löschen
    rows = rows.slice(0, offset);

    rows.forEach((row) => {
      if (!row.c[4]?.v) {
        // Prüfen, ob Spalte E leer ist
        let newRow = document.createElement("tr");
        newRow.innerHTML = `
                    <td>${row.c[1]?.v || "-"}</td>
                    <td>${row.c[2]?.v || "-"}</td>
                    <td>${row.c[3]?.v || "-"}</td>
                    <td>${row.c[4]?.v || "-"}</td>
                `;
        tableBody.appendChild(newRow);
      }
    });
  }

  loadTableData() {
    if (this.isCacheValid(this.cacheKeyTable)) {
      let cachedData = JSON.parse(
        localStorage.getItem(this.cacheKeyTable)
      ).data;
      this.renderLeagueTable(cachedData);
    } else {
      this.fetchAndRenderData(
        this.getURL(this.dataRange),
        this.cacheKeyTable,
        this.renderLeagueTable.bind(this)
      );
    }
  }

  loadAndReturnStatsTableData() {
    if (this.isCacheValid("PlayerStats_table")) {
      let cachedData = JSON.parse(
        localStorage.getItem("PlayerStats_table")
      ).data;
      return cachedData;
    } else {
      return this.fetchAndReturnStatsData(
        this.getURLStats(
          "1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw",
          "Player_stats",
          "A3:AA120"
        ),
        "PlayerStats_table"
      );
    }
  }

  openStatsModalForName(name) {
    let jsonData = this.loadAndReturnStatsTableData();
    let rows = jsonData.table.rows;
    rows.forEach((row) => {
      if (row.c[2]?.v == name) {
        this.openStatsModal(row);
      }
    });
  }

  // copied from stats page
  openStatsModal(sheetRow) {
    const modal = document.getElementById("statsModal");
    const modalTitle = document.getElementById("statsModalTitle");
    const modalDetails = document.getElementById("statsModalDetails");

    modalTitle.innerHTML = `Statistiken für ${this.getPlayerSubdivisionIcon(
      sheetRow.c[this.statsSheetColSubdivision]?.v || "base"
    )} ${sheetRow.c[this.statsSheetColGGName].v}`;

    modalDetails.innerHTML = `
      <table class="player-info" style="background-color: #d4d4d4">
        <tr>
          <td class="label">Discord</td>
          <td>${sheetRow.c[this.statsSheetColDiscordName].v}</td>
        </tr>
        <tr>
          <td class="label">Profillink</td>
          <td><a href="${sheetRow.c[this.statsSheetColGGLink].v}">Link</a></td>
        </tr>
        <tr>
          <td class="label">Region</td>
          <td>${sheetRow.c[this.statsSheetColSubdivision]?.v || "-"}</td>
        </tr>
        <tr>
          <td class="label">Saisonteilnahmen</td>
          <td>${
            sheetRow.c[this.statsSheetColLeagueParticipations]?.v || "-"
          }</td>
        </tr>
        <tr>
          <td class="label">Beste Platzierung <br> reguläre Seasons</td>
          <td>${sheetRow.c[this.statsSheetColPB]?.v || "-"}</td>
        </tr>
        <tr><td></td><td></td></tr>
        <tr><td></td><td></td></tr>
        <tr><td></td><td></td></tr>
        <tr><td></td><td></td></tr>
        <tr><td></td><td></td></tr>
        <tr><td></td><td></td></tr>
        <tr><td></td><td></td></tr>
        <tr>
          <td class="label">Platzierung in Liga</td>
          <td>${sheetRow.c[this.statsSheetColPlacement]?.v || "-"}</td>
        </tr>
        <tr>
          <td class="label">Punkte</td>
          <td>${
            Math.round(sheetRow.c[this.statsSheetColPoints]?.v * 100) / 100
          }</td>
        </tr>
        <tr>
          <td class="label">Anzahl 5k</td>
          <td>${sheetRow.c[this.statsSheetCol5ks]?.v || "0"}</td>
        </tr>
        <tr>
          <td class="label">Anzahl 4800+</td>
          <td>${sheetRow.c[this.statsSheetCol4800]?.v || "0"}</td>
        </tr>
        <tr>
          <td class="label">Extensions</td>
          <td>${sheetRow.c[this.statsSheetColExt]?.v || "0"}</td>
        </tr>
        <tr>
          <td class="label">Gelbe Karten</td>
          <td>${sheetRow.c[this.statsSheetColYellowCards]?.v || "0"}</td>
        </tr>
        <tr>
          <td class="label">Moving-Duels (${
            sheetRow.c[this.statsSheetColMPlayed]?.v || "0"
          })</td>
          <td>${sheetRow.c[this.statsSheetColMWon]?.v || "0"}-${
      sheetRow.c[this.statsSheetColMPlayed]?.v -
      sheetRow.c[this.statsSheetColMWon]?.v
    } / ${sheetRow.c[this.statsSheetColMHealth]?.v || "0"}</td>
        </tr>
        <tr>
          <td class="label">NM-Duels (${
            sheetRow.c[this.statsSheetColNMPlayed]?.v || "0"
          })</td>
          <td>${sheetRow.c[this.statsSheetColNMWon]?.v || "0"}-${
      sheetRow.c[this.statsSheetColNMPlayed]?.v -
      sheetRow.c[this.statsSheetColNMWon]?.v
    } / ${sheetRow.c[this.statsSheetColNMHealth]?.v || "0"}</td>
        </tr>
        <tr>
          <td class="label">NMPZ-Duels (${
            sheetRow.c[this.statsSheetColNMPZPlayed]?.v || "0"
          })</td>
          <td>${sheetRow.c[this.statsSheetColNMPZWon]?.v || "0"}-${
      sheetRow.c[this.statsSheetColNMPZPlayed]?.v -
      sheetRow.c[this.statsSheetColNMPZWon]?.v
    } / ${sheetRow.c[this.statsSheetColNMPZHealth]?.v || "0"}</td>
        </tr>
        <tr>
          <td class="label">DACH-Duels (${
            sheetRow.c[this.statsSheetColDACHPlayed]?.v || "0"
          })</td>
          <td>${sheetRow.c[this.statsSheetColDACHWon]?.v || "0"}-${
      sheetRow.c[this.statsSheetColDACHPlayed]?.v -
      sheetRow.c[this.statsSheetColDACHWon]?.v
    } / ${sheetRow.c[this.statsSheetColDACHHealth]?.v || "0"}</td>
        </tr>
        <tr>
          <td class="label">Lieblingsmodus</td>
          <td>${sheetRow.c[this.statsSheetColFavMode]?.v || "-"}</td>
        </tr>
      </table>
    `;
    modal.style.display = "flex";
  }

  getPlayerSubdivisionIcon(playerSubdivision) {
    return `<img src="./../img/herzen/${playerSubdivision}.png" alt="${playerSubdivision}" style="height: 1em; vertical-align: middle;" />`;
  }

  loadMatchData() {
    if (this.isCacheValid(this.cacheKeyMatches)) {
      let cachedData = JSON.parse(
        localStorage.getItem(this.cacheKeyMatches)
      ).data;
      console.log(cachedData);
      this.renderMatchTable(cachedData);
    } else {
      // Verwende die dynamisch berechnete Match-Range
      console.log(this.matchRange + "neuladung");

      this.fetchAndRenderData(
        this.getURL(this.matchRange),
        this.cacheKeyMatches,
        this.renderMatchTable.bind(this)
      );
    }
  }

  loadRescheduleData() {
    if (this.isCacheValid(this.cacheKeyRescheduled)) {
      let cachedData = JSON.parse(
        localStorage.getItem(this.cacheKeyRescheduled)
      ).data;
      this.renderRescheduleTable(cachedData);
    } else {
      // Verwende die dynamisch berechnete Match-Range
      this.fetchAndRenderData(
        this.getURL(this.rescheduleRanges),
        this.cacheKeyRescheduled,
        this.renderRescheduleTable.bind(this)
      );
    }
  }

  updateSpielwoche() {
    const spielwoche = getSpielwoche();
    if (!spielwoche) return;

    const wocheNummer = spielwoche.week;
    const wocheStart = formatDate(spielwoche.start);
    const wocheEnde = formatDate(spielwoche.end);

    //arrays mit anzahl der spiele pro spielwoche
    const liga1Games = [3, 3, 3, 2, 2, 2];
    const liga23Games = [3, 3, 3, 2, 2, 2];
    const liga4Games = [3, 2, 2, 2, 2, 2];

    // arrays mit jeweiligen offsets für jede spielwoche
    const liga1Offsets = this.calculateOffsets(liga1Games, 8);
    const liga23Offsets = this.calculateOffsets(liga23Games, 7);
    const liga4Offsets = this.calculateOffsets(liga4Games, 7);

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
    if (this.name == "liga1") {
      startRow = liga1Offsets[wocheNummer - 1]; // Offset für die aktuelle Woche
      endRow = liga1Games[wocheNummer - 1] * 8 + startRow - 1;
    } else if (
      this.name == "liga2" ||
      this.name == "liga3a" ||
      this.name == "liga3b"
    ) {
      startRow = liga23Offsets[wocheNummer - 1]; // Offset für die aktuelle Woche
      endRow = liga23Games[wocheNummer - 1] * 7 + startRow - 1;
    } else {
      startRow = liga4Offsets[wocheNummer - 1]; // Offset für die aktuelle Woche
      endRow = liga4Games[wocheNummer - 1] * 7 + startRow - 1;
    }
    this.matchRange = `B${startRow}:L${endRow}`;
  }

  //hilfsfunktion
  calculateOffsets(gamesPerWeek, spieleProTag) {
    let offsets = [];
    let currentOffset = 3;

    for (let i = 0; i < gamesPerWeek.length; i++) {
      offsets.push(currentOffset); // Offset für die aktuelle Woche speichern
      currentOffset += gamesPerWeek[i] * spieleProTag; // Nächsten Offset berechnen
    }

    return offsets;
  }

  initialize() {
    this.updateSpielwoche();
    this.loadMatchData();
    this.loadTableData();
    this.loadRescheduleData();

    //seite 2
    //variable tabellengröße bei unterschiedlicher ligagröße
    let dataRange1 = "S24:V" + (this.leagueSize + 23);
    let dataRange2 = "S46:V" + (this.leagueSize + 45);
    let dataRange3 = "T67:W" + (this.leagueSize + 66);

    // Event-Listener für das Schließen des Modals
    let modal = document.getElementById("gameModal");
    let closeModalButton = modal.querySelector(".close");
    closeModalButton.addEventListener("click", function () {
      modal.style.display = "none"; // Modal ausblenden
    });

    // Optional: Modal schließen, wenn außerhalb des Inhalts geklickt wird
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none"; // Modal ausblenden
      }
    });

    // Event-Listener für das Schließen des Modals
    let statsModal = document.getElementById("statsModal");
    let closeStatsModalButton = statsModal.querySelector(".close");
    closeStatsModalButton.addEventListener("click", function () {
      statsModal.style.display = "none"; // Modal ausblenden
    });

    // Optional: Modal schließen, wenn außerhalb des Inhalts geklickt wird
    statsModal.addEventListener("click", function (event) {
      if (event.target === statsModal) {
        statsModal.style.display = "none"; // Modal ausblenden
      }
    });

    // horizontale slideshow mit extra daten
    fetchAndRenderTable(
      "1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw",
      this.spielplanName,
      dataRange1,
      "pinpointTable"
    );
    fetchAndRenderTable(
      "1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw",
      this.spielplanName,
      dataRange2,
      "yellowCards"
    );
    fetchAndRenderTable(
      "1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw",
      this.spielplanName,
      dataRange3,
      "extensions"
    );

    // Liga Spieltage rendern
    fetchAndRenderMatchdayTables(
      "1Uxxbeuk95zrvLEHi8E9qfB9q6iklD6MZ8KAsUbsC2nw",
      this.spielplanName,
      this.leagueSize
    );
  }
}

// Hilfsfunktionen (z. B. für die Spielwochenberechnung)
function getSpielwoche() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Setzt die Zeit auf Mitternacht
  const spielwochen = [
    { start: new Date("2025-04-06"), end: new Date("2025-04-20"), week: 1 },
    { start: new Date("2025-04-21"), end: new Date("2025-05-04"), week: 2 },
    { start: new Date("2025-05-05"), end: new Date("2025-05-18"), week: 3 },
    { start: new Date("2025-05-19"), end: new Date("2025-06-01"), week: 4 },
    { start: new Date("2025-06-02"), end: new Date("2025-06-15"), week: 5 },
    { start: new Date("2025-06-16"), end: new Date("2025-07-02"), week: 6 },
    /*{ start: new Date("2025-06-30"), end: new Date("2025-07-13"), week: 7 },*/
  ];

  // Setzt ebenfalls die Zeit aller Start- und Enddaten auf Mitternacht
  spielwochen.forEach((sw) => {
    sw.start.setHours(0, 0, 0, 0);
    sw.end.setHours(23, 59, 59, 0);
  });

  // Rückgabe der passenden Spielwoche
  //return spielwochen.find((sw) => today >= sw.start && today <= sw.end) || null;

  const aktuelleWoche = spielwochen.find(
    (sw) => today >= sw.start && today <= sw.end
  );

  // Nach der letzten Spielwoche, wird der letzte Spieltag zurückgegeben
  if (!aktuelleWoche && today > spielwochen[spielwochen.length - 1].end) {
    return spielwochen[spielwochen.length - 1];
  }

  return aktuelleWoche || null;
}

function formatDate(date) {
  let day = String(date.getDate()).padStart(2, "0");
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

// scrollanimation für weitere informationen
window.addEventListener("scroll", () => {
  const secondSection = document.querySelector(".second-section");
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
  showSlides((slideIndex += n));
}

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "flex";
  dots[slideIndex - 1].className += " active";
}

function fetchAndRenderTable(
  sheetID,
  sheetName,
  dataRange,
  tableID,
  onRowClick
) {
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
          .slice(0, 4)
          .map((cell) => {
            let value = cell?.v || "-";

            // Prüfen, ob der Wert ein Datum-Objekt ist
            if (cell?.f && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(cell.f)) {
              value = cell.f; // Der formatierte Wert ist bereits im gewünschten Format
            }

            return `<td>${value}</td>`;
          })
          .join("");

        if (typeof onRowClick === "function") {
          newRow.addEventListener("click", () => onRowClick(row));
          newRow.classList.add("clickable"); // CSS-Stil hinzufügen
        }

        tableBody.appendChild(newRow);
      });
    })
    .catch((error) => console.error("Fehler beim Abrufen der Tabelle:", error));
}

// Vertikale Slideshow für Spieltage
function fetchAndRenderMatchdayTables(sheetID, sheetName, leagueSize) {
  if (leagueSize % 2 === 0) {
    matchdaySize = leagueSize / 2; // Anzahl der Spiele pro Spieltag
    totalMatchdays = leagueSize - 1; // Anzahl der Spieltage (keine Rückrunde)
  } else {
    matchdaySize = leagueSize / 2 - 0.5; // Anzahl der Spiele pro Spieltag
    totalMatchdays = leagueSize; // Anzahl der Spieltage (keine Rückrunde)
  }

  const slideshowContainer = document.querySelector(".matchday-slideshow");
  const prevButton = document.querySelector(".prevDay");
  const nextButton = document.querySelector(".nextDay");
  const matchdayList = document.getElementById("matchday-list");

  let currentIndex = 1;

  function createMatchdayTable(index) {
    const startRow = 3 + (index - 1) * matchdaySize;
    const endRow = startRow + matchdaySize - 1;
    const dataRange = `B${startRow}:L${endRow}`;
    const tableID = `matchday-${index}`;

    const table = document.createElement("table");
    table.id = tableID;
    table.classList.add("matchday-table");
    if (index !== currentIndex) {
      table.classList.add("faded");
    }
    table.innerHTML = `<thead><tr><th colspan='4'>Spieltag ${index}</th></tr></thead><tbody></tbody>`;

    // ✨ Hier der wichtige Teil:
    fetchAndRenderTable(sheetID, sheetName, dataRange, tableID, (row) => {
      const blau = row.c[0]?.v || "N/A";
      const rot = row.c[1]?.v || "N/A";
      const id = row.c[2]?.v || "N/A";
      const ergebnis = row.c[3]?.v || "N/A";
      //const punkteBlau = parseFloat(row.c[4]?.v) || "N/A";
      //const punkteRot = parseFloat(row.c[5]?.v) || "N/A";
      const punkteBlau =
        row.c[4]?.v != null ? parseFloat(row.c[4].v) : undefined;
      const punkteRot =
        row.c[5]?.v != null ? parseFloat(row.c[5].v) : undefined;
      const healthBlau = row.c[8]?.v || "N/A";
      const healthRot = row.c[9]?.v || "N/A";
      const maps = JSON.parse(row.c[10]?.v || "[]");

      openModal({
        blau,
        rot,
        id,
        ergebnis,
        punkteBlau,
        punkteRot,
        healthBlau,
        healthRot,
        maps,
      });
    });

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

    let indices = [
      getWrappedIndex(currentIndex - 1),
      getWrappedIndex(currentIndex),
      getWrappedIndex(currentIndex + 1),
    ];

    indices.forEach((i) => {
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
    document.querySelectorAll(".matchday-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (parseInt(btn.textContent) === currentIndex) {
        btn.classList.add("active");
      }
    });
  }

  function openModal(matchData) {
    const modal = document.getElementById("gameModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDetails = document.getElementById("modalDetails");

    modalTitle.innerHTML = `${
      matchData.ergebnis != "N/A" ? '<span style="color:blue;">|</span>' : ""
    } ${matchData.blau} vs ${matchData.rot} ${
      matchData.ergebnis != "N/A" ? '<span style="color:red;">|</span>' : ""
    }`;

    let punkteText;
    if (
      typeof matchData.punkteBlau === "number" &&
      typeof matchData.punkteRot === "number" &&
      !(matchData.punkteBlau === 0 && matchData.punkteRot === 0)
    ) {
      if (matchData.punkteBlau > matchData.punkteRot) {
        matchData.punkteBlau += 1;
      } else if (matchData.punkteRot > matchData.punkteBlau) {
        matchData.punkteRot += 1;
      }
      const punkteBlau = matchData.punkteBlau.toFixed(2);
      const punkteRot = matchData.punkteRot.toFixed(2);
      punkteText = `${punkteBlau} : ${punkteRot}`;
    } else {
      punkteText = "N/A";
    }

    let lebenText;
    if (
      typeof matchData.healthBlau === "number" &&
      typeof matchData.healthRot === "number"
    ) {
      lebenText = `${matchData.healthBlau} : ${matchData.healthRot}`;
    } else {
      lebenText = "N/A";
    }

    modalDetails.innerHTML = `
      <strong>Match ID:</strong> ${matchData.id}<br>
      <strong>Ergebnis:</strong> ${
        matchData.ergebnis || "Noch nicht verfügbar"
      }<br>
      <strong>Punkte:</strong> ${punkteText}<br>
      <strong>Leben:</strong> ${lebenText}<br>
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
            const [mapName, winner, matchtype, health, link] = mapInfo;

            const mapBox = document.createElement("a");
            mapBox.href = link;
            mapBox.target = "_blank";
            mapBox.style.padding = "10px";
            mapBox.style.borderRadius = "5px";
            mapBox.style.display = "inline-block";
            mapBox.style.minWidth = "120px";
            mapBox.style.color = "#333";
            mapBox.style.textDecoration = "none";
            mapBox.style.border = "1px solid #ccc";
            mapBox.style.backgroundColor = "#f9f9f9";
            mapBox.style.textAlign = "left";

            // Gewinnerfarbe setzen
            if (winner === "blue") {
              mapBox.style.borderLeft = "5px solid blue";
            } else if (winner === "red") {
              mapBox.style.borderRight = "5px solid red";
            }

            // Inhalt mit Mapname & Matchtyp
            mapBox.innerHTML = `
              <div>${mapName}</div>
              <div style="font-size: 0.8em; color: #777;">${
                matchtype == "move"
                  ? "Moving"
                  : matchtype == "bmd"
                  ? "Better Moving Duel"
                  : matchtype == "no move"
                  ? "NM"
                  : "NMPZ"
              }</div>
            `;

            rowDiv.appendChild(mapBox);
          });

          mapsContainer.appendChild(rowDiv);
        }
      });
    } else {
      mapsContainer.innerHTML = "<em>Keine Maps verfügbar</em>";
    }

    modalDetails.appendChild(mapsContainer);
    modal.style.display = "flex";
  }

  generateMatchdayList();
  renderMatchdayTables();
}
