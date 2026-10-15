(() => {
  const ENDPOINT = "/.netlify/functions/content-manager";
  const KEY = "sb_publishable_2Ko8glEiFB6NfunRyCr_4A_c1c1fvmO";
  const weeklyImage = document.getElementById("weekly-report-image");
  const weeklyStage = document.getElementById("weekly-report");

  const setWeeklyState = (state) => {
    if (weeklyStage) weeklyStage.dataset.state = state;
  };

  if (weeklyImage) {
    weeklyImage.addEventListener("load", () => setWeeklyState("ready"));
    weeklyImage.addEventListener("error", () => setWeeklyState("empty"));
    if (weeklyImage.complete) setWeeklyState(weeklyImage.naturalWidth ? "ready" : "empty");
  }

  async function loadContent() {
    try {
      const response = await fetch(ENDPOINT, { headers: { apikey: KEY } });
      if (!response.ok) return;
      const data = await response.json();
      const assets = Object.fromEntries((data.assets || []).map((asset) => [asset.asset_key, asset]));
      if (weeklyImage && assets.weekly_report) {
        setWeeklyState("loading");
        weeklyImage.src = assets.weekly_report.url;
        weeklyImage.alt = assets.weekly_report.alt_text || "CBL 第三屆每週戰況";
      }
      const holder = document.querySelector("[data-season3-videos]");
      const videos = (data.items || [])
        .filter((item) => item.kind === "video")
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
        .slice(0, 3);
      if (holder && videos.length && window.CBL_HOME_VIDEO) {
        window.CBL_HOME_VIDEO.mountVideos(holder, videos.map((item, index) => ({
          url: item.url,
          title: item.title,
          label: "CBL 聯盟賽事",
          game: `GAME ${String(index + 1).padStart(2, "0")}`
        })));
      }
    } catch (error) {
      console.warn("CBL content load failed", error);
    }
  }
  loadContent();
})();
