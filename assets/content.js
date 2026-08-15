(() => {
  const URL = "https://iwwwpgdrasrhmrhncsim.supabase.co/functions/v1/content-manager";
  const KEY = "sb_publishable_2Ko8glEiFB6NfunRyCr_4A_c1c1fvmO";
  const youtubeEmbed = (value) => {
    try {
      const url = new URL(value);
      if (url.hostname.includes("youtu.be")) return "https://www.youtube.com/embed/" + url.pathname.slice(1);
      if (url.hostname.includes("youtube.com")) {
        const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
        if (id) return "https://www.youtube.com/embed/" + id;
      }
    } catch {}
    return value;
  };
  const videoCard = (item) => {
    const article = document.createElement("article");
    article.className = "video-card";
    const wrap = document.createElement("div");
    wrap.className = "video-wrapper";
    const frame = document.createElement("iframe");
    frame.src = youtubeEmbed(item.url);
    frame.title = item.title;
    frame.loading = "lazy";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    wrap.append(frame);
    const meta = document.createElement("div");
    meta.className = "video-meta";
    const strong = document.createElement("strong");
    strong.textContent = item.title;
    meta.append(strong);
    article.append(wrap, meta);
    return article;
  };
  async function loadContent() {
    try {
      const response = await fetch(URL, { headers: { apikey: KEY } });
      if (!response.ok) return;
      const data = await response.json();
      const assets = Object.fromEntries((data.assets || []).map((asset) => [asset.asset_key, asset]));
      const weekly = document.getElementById("weekly-report-image");
      if (weekly && assets.weekly_report) {
        weekly.src = assets.weekly_report.url;
        weekly.alt = assets.weekly_report.alt_text || "CBL 第三屆每週戰況";
      }
      [["black-hole", "black-hole-videos"], ["stellar", "stellar-videos"]].forEach(([division, id]) => {
        const holder = document.getElementById(id);
        const videos = (data.items || []).filter((item) => item.kind === "video" && item.division === division).slice(0, 3);
        if (holder && videos.length) holder.replaceChildren(...videos.map(videoCard));
      });
    } catch (error) {
      console.warn("CBL content load failed", error);
    }
  }
  loadContent();
})();