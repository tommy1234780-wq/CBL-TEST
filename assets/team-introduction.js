(function () {
  "use strict";

  const data = window.CBL_SEASON3;
  const root = document.querySelector("[data-team-directory]");
  const status = document.querySelector("[data-team-filter-status]");
  const buttons = [...document.querySelectorAll("[data-team-filter]")];
  if (!data || !root || !status || !buttons.length) return;

  const allowedFilters = new Set(["all", "black-hole", "stellar"]);
  const query = new URLSearchParams(location.search);
  let activeFilter = allowedFilters.has(query.get("division")) ? query.get("division") : "all";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function renderTeamCard(team) {
    const division = data.divisions[team.division];
    const story = team.introduction.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    return `
      <article class="official-team-card" id="team-${escapeHtml(team.id)}" data-division="${escapeHtml(team.division)}">
        <div class="team-card-overview">
          <div class="team-logo-stage">
            <img src="${escapeHtml(team.logo)}" alt="${escapeHtml(team.displayName)} LOGO" loading="lazy" decoding="async">
          </div>
          <div class="team-card-copy">
            <span class="team-division-chip">${escapeHtml(division.name)} · ${escapeHtml(division.englishName)}</span>
            <h3>${escapeHtml(team.displayName)}</h3>
            <p>${escapeHtml(team.summary)}</p>
          </div>
        </div>
        <p class="team-tagline">${escapeHtml(team.tagline)}</p>
        <div class="team-card-actions">
          <a href="賽程戰績表.html?team=${escapeHtml(team.id)}#schedule">查看本隊上半季賽程</a>
        </div>
        <details class="team-story">
          <summary>查看完整球隊介紹</summary>
          <div class="team-story-copy">${story}</div>
        </details>
      </article>`;
  }

  function renderDivision(divisionId) {
    const division = data.divisions[divisionId];
    const teams = data.teams.filter((team) => team.division === divisionId);
    return `
      <section class="division-directory-section" data-division-section="${escapeHtml(divisionId)}" aria-labelledby="${escapeHtml(divisionId)}-heading">
        <header class="division-directory-heading">
          <img src="${escapeHtml(division.logo)}" alt="${escapeHtml(division.name)}官方 LOGO">
          <div>
            <span class="eyebrow">${escapeHtml(division.englishName)}</span>
            <h2 id="${escapeHtml(divisionId)}-heading">${escapeHtml(division.name)}</h2>
            <p>${escapeHtml(division.tagline)}</p>
          </div>
          <span class="division-count">6 OFFICIAL TEAMS</span>
        </header>
        <div class="team-directory-grid">${teams.map(renderTeamCard).join("")}</div>
      </section>`;
  }

  function updateFilter(filter, updateUrl) {
    activeFilter = allowedFilters.has(filter) ? filter : "all";
    document.querySelectorAll("[data-division-section]").forEach((section) => {
      section.hidden = activeFilter !== "all" && section.dataset.divisionSection !== activeFilter;
    });
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.teamFilter === activeFilter));
    });

    const visibleCount = activeFilter === "all" ? data.teams.length : data.teams.filter((team) => team.division === activeFilter).length;
    const label = activeFilter === "all" ? "全部球隊" : data.divisions[activeFilter].name;
    status.textContent = `目前顯示：${label}，共 ${visibleCount} 支正式球隊`;

    if (updateUrl) {
      const nextUrl = new URL(location.href);
      if (activeFilter === "all") nextUrl.searchParams.delete("division");
      else nextUrl.searchParams.set("division", activeFilter);
      nextUrl.hash = "";
      history.replaceState({}, "", nextUrl);
    }
  }

  root.innerHTML = renderDivision("black-hole") + renderDivision("stellar");
  buttons.forEach((button) => button.addEventListener("click", () => updateFilter(button.dataset.teamFilter, true)));
  updateFilter(activeFilter, false);

  if (location.hash.startsWith("#team-")) {
    const target = document.querySelector(location.hash);
    if (target) {
      const division = target.dataset.division;
      if (division && activeFilter !== "all" && activeFilter !== division) updateFilter(division, true);
      target.classList.add("is-targeted");
      const details = target.querySelector("details");
      if (details) details.open = true;
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
  }
})();
