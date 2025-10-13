class GameInfos {
  constructor(config) {
    this.sheetID = config.sheetID;
    this.sheetName = config.sheetName;
    this.dataRange = config.dataRange;
    this.cacheKeyTable = config.key + "_table";
    this.cacheDuration = 1 * 60 * 5; // 5 Minuten Cache-Dauer
    this.targetElement = document.querySelector(config.target);
    this.renderMode = config.renderMode || "stats"; // 'stats' oder 'upcoming'
  }

  getURL(range) {
    return `https://docs.google.com/spreadsheets/d/${this.sheetID}/gviz/tq?sheet=${this.sheetName}&range=${range}`;
  }

  fetchAndRenderData(url, cacheKey, renderFunction) {
    fetch(url)
      .then((res) => res.text())
      .then((rep) => {
        let jsonData = JSON.parse(rep.substr(47).slice(0, -2));

        // Cache speichern
        let cacheData = { data: jsonData, expiry: Date.now() + this.cacheDuration };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));

        renderFunction(jsonData);
      })
      .catch((error) => console.error("Fehler beim Abrufen der Daten: ", error));
  }

  isCacheValid(cacheKey) {
    let cached = JSON.parse(localStorage.getItem(cacheKey));
    if (!cached) return false;
    return Date.now() < cached.expiry;
  }

  renderStatsTable(jsonData) {
    let rows = jsonData.table.rows;
    this.targetElement.innerHTML = "";

    rows.forEach((row) => {
      if (row.c[0]) {
        let li = document.createElement("li");
        li.innerHTML = `${
          row.c[18].v == 0 ? "vor " + row.c[19].v + "min" : "vor " + row.c[18].v + "h"
        } - ${row.c[17].v} - ${row.c[0].v}
          <span style="font-style: italic;">${row.c[3].v}</span> ${row.c[1].v}`;
        this.targetElement.appendChild(li);
      }
    });
  }

  renderUpcomingTable(jsonData) {
    let rows = jsonData.table.rows;
    this.targetElement.innerHTML = "";

    rows.forEach((row) => {
      if (row.c[0]) {
        let li = document.createElement("li");
        li.innerHTML = `${
          row.c[19].v == 0 ? "in " + row.c[20].v + "min" : "in " + row.c[19].v + "h"
        } (${row.c[17].f}) - ${row.c[18].v} - ${row.c[0].v}
          <span style="font-style: italic;">vs.</span> ${row.c[1].v}`;
        this.targetElement.appendChild(li);
      }
    });
  }

  initialize() {
    if (this.isCacheValid(this.cacheKeyTable)) {
      let cachedData = JSON.parse(localStorage.getItem(this.cacheKeyTable)).data;
      this.render(cachedData);
    } else {
      this.fetchAndRenderData(
        this.getURL("B2:U100"),
        this.cacheKeyTable,
        this.render.bind(this)
      );
    }
  }

  render(jsonData) {
    if (this.renderMode === "upcoming") this.renderUpcomingTable(jsonData);
    else this.renderStatsTable(jsonData);
  }
}
