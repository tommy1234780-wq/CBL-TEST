(function () {
  "use strict";

  const data = window.CBL_SEASON3;
  if (!data) return;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function youtubeId(value) {
    if (/^[A-Za-z0-9_-]{11}$/.test(String(value || ""))) return String(value);
    try {
      const url = new window.URL(String(value));
      if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] || "";
      if (url.hostname.includes("youtube.com")) {
        return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
      }
    } catch (_) {}
    return "";
  }

  function activateVideo(button) {
    const id = button.dataset.youtubeId;
    if (!id) return;
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
    frame.title = button.dataset.videoTitle || "CBL 賽事影片";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    button.replaceWith(frame);
  }

  function createVideoCard(video) {
    const id = youtubeId(video.id || video.url);
    const article = document.createElement("article");
    article.className = "video-card";
    article.innerHTML = `
      <div class="video-wrapper">
        <button class="video-poster" type="button" data-youtube-id="${escapeHtml(id)}" data-video-title="${escapeHtml(video.title)} 賽事影片" aria-label="播放 ${escapeHtml(video.title)}">
          ${id ? `<img src="https://i.ytimg.com/vi/${escapeHtml(id)}/hqdefault.jpg" alt="" loading="lazy" decoding="async">` : ""}
          <span class="video-play" aria-hidden="true"></span>
          <small>點擊播放</small>
        </button>
      </div>
      <div class="video-meta">
        ${video.label ? `<span>${escapeHtml(video.label)}</span>` : ""}
        <strong>${escapeHtml(video.title)}</strong>
        ${video.game ? `<small>${escapeHtml(video.game)}</small>` : ""}
      </div>`;
    const button = article.querySelector(".video-poster");
    if (button && id) button.addEventListener("click", () => activateVideo(button), { once: true });
    return article;
  }

  function mountVideos(root, videos) {
    if (!root || !videos.length) return;
    root.replaceChildren(...videos.map(createVideoCard));
  }

  window.CBL_HOME_VIDEO = { createVideoCard, mountVideos };
  mountVideos(document.querySelector("[data-season3-videos]"), data.videos);

  const orbitRoot = document.querySelector("[data-season3-team-orbit]");
  if (orbitRoot) {
    const renderTeams = (hidden) => data.teams.map((team) => `
      <a href="team_introduction.html?division=${escapeHtml(team.division)}#team-${escapeHtml(team.id)}"${hidden ? ' aria-hidden="true" tabindex="-1"' : ""}>
        <img src="${escapeHtml(team.logo)}" alt="${hidden ? "" : escapeHtml(team.displayName + " LOGO")}" loading="lazy" decoding="async">
        <span>${escapeHtml(team.shortName)}</span>
      </a>`).join("");
    orbitRoot.innerHTML = renderTeams(false) + renderTeams(true);
  }

  const weeklyLink = document.querySelector("[data-weekly-report-link]");
  const weeklyAction = document.querySelector("[data-weekly-link-action]");
  const schedule = window.CBL_SEASON3_SCHEDULE;
  const results = window.CBL_SEASON3_RESULTS;
  if (weeklyLink && schedule && results) {
    const latestDate = schedule.games
      .filter((game) => ["完賽", "沒收"].includes(results.gameResults?.[game.id]?.status))
      .map((game) => game.date)
      .sort()
      .pop();
    if (latestDate) {
      weeklyLink.href = "賽程戰績表.html?result=latest#schedule";
      weeklyLink.setAttribute("aria-label", `查看 ${latestDate} 當週完整賽果`);
      if (weeklyAction) weeklyAction.textContent = "查看當週完整賽果";
    }
  }
})();
