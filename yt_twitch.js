const sheetID = '1FVP0fTkG11YD4lSsuXcgzvdqW0OwUAFg_pCbwVYFvCU';
const sheetName = 'Test_Streaming';
const range = 'A2:D'; 
const rangeYT = 'F2:F'; 
const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${sheetName}&range=${range}`;
const gvizUrlYT = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${sheetName}&range=${rangeYT}`;


fetch(gvizUrl)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const now = new Date();

    for (const row of rows) {
      const channel = row.c[0]?.v;
      const dateStr = row.c[1]?.f; 
      const startStr = row.c[2]?.f;
      const endStr = row.c[3]?.f;

      if (!channel || !dateStr || !startStr || !endStr) continue;

      const startTime = new Date(`${dateStr}T${startStr}:00`);
      const endTime = new Date(`${dateStr}T${endStr}:00`);

      if (now >= startTime && now <= endTime) {
        const button = document.getElementById('live-button');
        button.href = `https://twitch.tv/${channel}`;
        button.innerText = `🔴 ${channel} ist LIVE auf Twitch`;
        button.style.display = 'inline-block';
        return;
      }
    }

    // Falls keiner live ist:
    document.getElementById('live-button').style.display = 'none';
  })
  .catch(err => console.error("Fehler beim Laden der Daten:", err));



fetch(gvizUrlYT)
  .then(res => res.text())
  .then(text => {
    const jsonYT = JSON.parse(text.substr(47).slice(0, -2));
    const rowsYT = jsonYT.table.rows;
    const linksYT = rowsYT.map(row => row.c[0]?.v).filter(Boolean);

    if (linksYT.length === 0) return;

    const halfHour = 5 * 60 * 1000;
    const now = Date.now();
    const index = Math.floor(now / halfHour) % linksYT.length;

    const videoId = extractYouTubeID(linksYT[index]);
    document.getElementById('youtube-player').src =
      `https://www.youtube.com/embed/${videoId}`;
  });

function extractYouTubeID(url) {
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : '';
}