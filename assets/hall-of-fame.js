(function () {
  "use strict";

  const hall = window.CBL_HALL_OF_FAME;
  if (!hall || !hall.seasons) return;

  const seasonButtons = Array.from(document.querySelectorAll("[data-season]"));
  const categoryButtons = Array.from(document.querySelectorAll("[data-category]"));
  const categorySections = Array.from(document.querySelectorAll("[data-award-category]"));
  const highlightsRoot = document.querySelector("[data-hall-highlights]");
  const hittingRoot = document.querySelector("[data-hall-hitting]");
  const pitchingRoot = document.querySelector("[data-hall-pitching]");
  const status = document.querySelector("[data-hall-status]");
  let currentSeason = hall.defaultSeason;
  let currentCategory = "all";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function photoStyle(item) {
    const position = /^[\w.% -]+$/.test(item.photoPosition || "") ? item.photoPosition : "center top";
    const parsedScale = Number(item.photoScale || 1);
    const scale = Math.min(1.6, Math.max(1, Number.isFinite(parsedScale) ? parsedScale : 1));
    return `--photo-position:${escapeHtml(position)};--photo-scale:${scale}`;
  }

  function renderMetrics(metrics) {
    if (!Array.isArray(metrics) || !metrics.length) return "";
    return `<div class="honor-metrics">${metrics.map((metric) => `
      <span><small>${escapeHtml(metric.label)}</small><strong>${escapeHtml(metric.value)}</strong></span>
    `).join("")}</div>`;
  }

  function renderTags(tags) {
    if (!Array.isArray(tags) || !tags.length) return "";
    return `<div class="honor-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`;
  }

  function renderHighlight(item, index, season) {
    const isPrimary = item.kind === "mvp";
    const priority = index === 0 ? ' fetchpriority="high"' : ' loading="lazy"';
    return `
      <article class="honor-feature ${isPrimary ? "primary" : "secondary"}">
        <div class="honor-photo-frame">
          <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(`${season.label}${item.award}${item.player}`)}" style="${photoStyle(item)}" decoding="async"${priority}>
          <span>${escapeHtml(season.label)}</span>
        </div>
        <div class="honor-content">
          <span class="honor-kicker">${escapeHtml(item.awardEn)}</span>
          <small>${isPrimary ? "年度最高個人榮耀" : "年度球迷支持榮耀"}</small>
          <h3>${escapeHtml(item.player)}</h3>
          <p class="honor-team">${escapeHtml(item.team)}</p>
          <blockquote>${escapeHtml(item.quote)}</blockquote>
          ${renderMetrics(item.metrics)}
          ${renderTags(item.tags)}
        </div>
        <div class="honor-team-seal" title="${escapeHtml(item.team)}">
          <img src="${escapeHtml(item.logo)}" alt="${escapeHtml(`${item.team} LOGO`)}" loading="lazy" decoding="async">
        </div>
        <div class="honor-nameplate">
          <span>CBL HALL OF FAME · ${escapeHtml(season.recordLabel)}</span>
          <strong>${escapeHtml(item.award)} · ${escapeHtml(item.player)}</strong>
        </div>
      </article>
    `;
  }

  function renderWinnerPhoto(item, awardName) {
    return `
      <div class="award-photo-frame">
        <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(`${awardName}${item.name}`)}" style="${photoStyle(item)}" loading="lazy" decoding="async">
      </div>
    `;
  }

  function renderSharedAward(item, index) {
    const names = item.winners.map((winnerItem) => winnerItem.name).join(" · ");
    const teams = Array.from(new Set(item.winners.map((winnerItem) => winnerItem.team))).join(" · ");
    return `
      <article class="hof-award-card shared-card${item.winners.length === 2 ? " saves" : ""}">
        <span class="award-index">${String(index + 1).padStart(2, "0")}</span>
        <div class="shared-photos ${item.winners.length === 2 ? "two" : ""}">
          ${item.winners.map((winnerItem) => `<img src="${escapeHtml(winnerItem.photo)}" alt="${escapeHtml(winnerItem.name)}" style="${photoStyle(winnerItem)}" loading="lazy" decoding="async">`).join("")}
        </div>
        <div class="award-copy">
          <small>${escapeHtml(item.name)} · 共同得主</small>
          <h3>${escapeHtml(names)}</h3>
          <p>${escapeHtml(teams)}</p>
          <div class="shared-team-logos">
            ${item.winners.map((winnerItem) => `<span><img src="${escapeHtml(winnerItem.logo)}" alt="${escapeHtml(`${winnerItem.team} LOGO`)}" loading="lazy" decoding="async"></span>`).join("")}
          </div>
          <strong>${escapeHtml(item.stat)}</strong>
        </div>
      </article>
    `;
  }

  function renderAward(item, index) {
    if (item.shared && item.winners.length > 1) return renderSharedAward(item, index);
    const winnerItem = item.winners[0];
    return `
      <article class="hof-award-card">
        <span class="award-index">${String(index + 1).padStart(2, "0")}</span>
        ${renderWinnerPhoto(winnerItem, item.name)}
        <span class="award-logo"><img src="${escapeHtml(winnerItem.logo)}" alt="${escapeHtml(`${winnerItem.team} LOGO`)}" loading="lazy" decoding="async"></span>
        <div class="award-copy">
          <small>${escapeHtml(item.name)}${item.tied ? " · 並列得主" : ""}</small>
          <h3>${escapeHtml(winnerItem.name)}</h3>
          <p>${escapeHtml(winnerItem.team)}</p>
          <strong>${escapeHtml(item.stat)}</strong>
        </div>
      </article>
    `;
  }

  function setSummary(season) {
    document.querySelector("[data-hall-description]").textContent = season.description;
    document.querySelector("[data-hall-award-count]").textContent = season.awardCount;
    document.querySelector("[data-hall-player-count]").textContent = season.playerCount;
    document.querySelector("[data-hall-season-label]").textContent = season.label;
  }

  function renderSeason(seasonKey, announce = true) {
    const season = hall.seasons[seasonKey];
    if (!season) return;
    currentSeason = seasonKey;
    setSummary(season);
    highlightsRoot.classList.toggle("single", season.highlights.length === 1);
    highlightsRoot.innerHTML = season.highlights.map((item, index) => renderHighlight(item, index, season)).join("");
    hittingRoot.innerHTML = season.hitting.map(renderAward).join("");
    pitchingRoot.innerHTML = season.pitching.map(renderAward).join("");
    seasonButtons.forEach((button) => {
      const active = button.dataset.season === seasonKey;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (announce) status.textContent = `已顯示${season.label}名人堂正式紀錄`;
    updateHash();
  }

  function setCategory(category, announce = true) {
    currentCategory = category;
    categoryButtons.forEach((button) => {
      const active = button.dataset.category === category;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    categorySections.forEach((section) => {
      section.hidden = category !== "all" && section.dataset.awardCategory !== category;
    });
    if (announce) {
      const selected = categoryButtons.find((button) => button.dataset.category === category);
      status.textContent = `已切換至${selected ? selected.textContent.trim() : "全部榮耀"}`;
    }
    updateHash();
  }

  function updateHash() {
    const hash = `#season-${currentSeason}-${currentCategory}`;
    if (window.location.hash !== hash) history.replaceState(null, "", hash);
  }

  function readInitialState() {
    const match = window.location.hash.match(/^#season-(1|2)(?:-(all|mvp|hitter|pitcher))?$/);
    if (!match) return;
    currentSeason = match[1];
    currentCategory = match[2] || "all";
  }

  seasonButtons.forEach((button) => {
    button.addEventListener("click", () => renderSeason(button.dataset.season));
  });

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => setCategory(button.dataset.category));
  });

  document.addEventListener("error", (event) => {
    if (event.target instanceof HTMLImageElement) event.target.classList.add("image-unavailable");
  }, true);

  readInitialState();
  renderSeason(currentSeason, false);
  setCategory(currentCategory, false);
})();
