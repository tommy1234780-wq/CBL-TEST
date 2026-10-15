(function () {
  "use strict";

  const league = window.CBL_SEASON3;
  const schedule = window.CBL_SEASON3_SCHEDULE;
  const results = window.CBL_SEASON3_RESULTS || { gameResults: {}, standings: {} };
  const listRoot = document.querySelector("[data-schedule-list]");
  const statusRoot = document.querySelector("[data-schedule-status]");
  const teamSelect = document.querySelector("[data-schedule-team]");
  const divisionButtons = [...document.querySelectorAll("[data-schedule-division]")];
  const viewButtons = [...document.querySelectorAll("[data-schedule-view]")];
  const schedulePanel = document.querySelector("[data-view-panel='schedule']");
  const overviewPanel = document.querySelector("[data-view-panel='overview']");
  const overviewList = document.querySelector("[data-overview-list]");
  const overviewTeamSelect = document.querySelector("[data-overview-team]");
  const overviewMonths = document.querySelector("[data-overview-months]");
  const overviewStatus = document.querySelector("[data-overview-status]");
  const overviewUpdated = document.querySelector("[data-overview-updated]");
  const standingsPanel = document.querySelector("[data-view-panel='standings']");
  const standingsButtons = [...document.querySelectorAll("[data-standings-division]")];
  const standingsBoard = document.querySelector("[data-standings-board]");
  const standingsStatus = document.querySelector("[data-standings-status]");
  const standingsGames = document.querySelector("[data-standings-games]");
  const standingsUpdated = document.querySelector("[data-standings-updated]");
  const updatedRoot = document.querySelector("[data-schedule-updated]");
  const noticeRoot = document.querySelector("[data-schedule-notice]");

  if (!league || !schedule || !listRoot || !statusRoot || !teamSelect || !overviewPanel || !overviewList || !overviewTeamSelect) return;

  const divisionLabels = {
    all: "全部賽事",
    "black-hole": "黑洞組",
    stellar: "恆星組",
    crossover: "跨組交流"
  };
  const allowedDivisions = new Set(Object.keys(divisionLabels));
  const query = new URLSearchParams(location.search);
  const initialTeam = league.teams.some((team) => team.id === query.get("team")) ? query.get("team") : "";
  let activeDivision = initialTeam ? "all" : (allowedDivisions.has(query.get("division")) ? query.get("division") : "all");
  let activeTeam = initialTeam;
  let activeView = query.get("view") === "standings" || location.hash === "#standings"
    ? "standings"
    : query.get("view") === "overview" || location.hash === "#overview" ? "overview" : "schedule";
  let activeStandingsDivision = query.get("standings") === "stellar" ? "stellar" : "black-hole";
  const availableMonths = [...new Set(schedule.games.map((game) => game.date.slice(0, 7)))].sort();
  let activeOverviewMonth = availableMonths.includes(query.get("month")) ? query.get("month") : "all";
  const requestedWeek = /^\d{4}-\d{2}-\d{2}$/.test(query.get("week") || "") ? query.get("week") : "";
  const latestResultDate = schedule.games
    .filter((game) => ["完賽", "沒收"].includes(results.gameResults?.[game.id]?.status))
    .map((game) => game.date)
    .sort()
    .pop() || "";
  let focusDate = requestedWeek || (query.get("result") === "latest" ? latestResultDate : "");

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  const getTeam = (id) => league.teams.find((team) => team.id === id) || null;
  const getGameResult = (id) => results.gameResults?.[id] || null;

  function populateTeamSelect() {
    const options = ["<option value=''>全部球隊</option>"];
    ["black-hole", "stellar"].forEach((divisionId) => {
      options.push(`<optgroup label="${escapeHtml(league.divisions[divisionId].name)}">`);
      league.teams
        .filter((team) => team.division === divisionId)
        .forEach((team) => options.push(`<option value="${escapeHtml(team.id)}">${escapeHtml(team.displayName)}</option>`));
      options.push("</optgroup>");
    });
    teamSelect.innerHTML = options.join("");
    teamSelect.value = activeTeam;
    overviewTeamSelect.innerHTML = options.join("");
    overviewTeamSelect.value = activeTeam;
  }

  function formatDateParts(dateValue) {
    const date = new Date(`${dateValue}T12:00:00+08:00`);
    const dateText = new Intl.DateTimeFormat("zh-TW", {
      year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Taipei"
    }).format(date);
    const weekday = new Intl.DateTimeFormat("zh-TW", {
      weekday: "short", timeZone: "Asia/Taipei"
    }).format(date);
    return { dateText, weekday };
  }

  function renderVersionNote() {
    if (updatedRoot && schedule.updatedAt) {
      const { dateText } = formatDateParts(schedule.updatedAt);
      updatedRoot.textContent = `賽程最後更新：${dateText}`;
      if (overviewUpdated) overviewUpdated.textContent = `賽程最後更新：${dateText}`;
    }
    if (noticeRoot) noticeRoot.textContent = schedule.notice || "如有賽程異動，以聯盟最新公告為準。";
  }

  function renderTeam(teamId, sideLabel) {
    const team = getTeam(teamId);
    if (!team) return "";
    return `
      <a class="game-team" href="team_introduction.html?division=${escapeHtml(team.division)}#team-${escapeHtml(team.id)}" aria-label="查看${escapeHtml(team.displayName)}介紹">
        <img src="${escapeHtml(team.logo)}" alt="${escapeHtml(team.displayName)} LOGO" loading="lazy" decoding="async">
        <strong>${escapeHtml(team.shortName)}</strong>
        <small>${escapeHtml(sideLabel)}</small>
      </a>`;
  }

  function renderSeed(label, divisionId) {
    const division = league.divisions[divisionId];
    return `
      <div class="game-team">
        <img src="${escapeHtml(division.logo)}" alt="${escapeHtml(division.name)} LOGO" loading="lazy" decoding="async">
        <strong>${escapeHtml(label)}</strong>
        <small>排名席位</small>
      </div>`;
  }

  function renderMatchStatus(game) {
    const result = getGameResult(game.id);
    if (!result || result.status === "未賽") return "<span class='game-versus'>VS</span>";
    if (result.status === "延期") return "<span class='game-state game-state-delayed'>延期</span>";
    if (result.status !== "完賽" && result.status !== "沒收") return "<span class='game-versus'>VS</span>";

    const awayScore = Number(result.awayScore);
    const homeScore = Number(result.homeScore);
    const awayWinner = awayScore > homeScore ? " is-winner" : "";
    const homeWinner = homeScore > awayScore ? " is-winner" : "";
    return `
      <div class="game-final-score" aria-label="${escapeHtml(result.status)}，客隊 ${escapeHtml(awayScore)} 比主隊 ${escapeHtml(homeScore)}">
        <span>${result.status === "沒收" ? "沒收" : "FINAL"}</span>
        <strong><b class="${awayWinner.trim()}">${escapeHtml(awayScore)}</b><i>:</i><b class="${homeWinner.trim()}">${escapeHtml(homeScore)}</b></strong>
      </div>`;
  }

  function renderGame(game) {
    const divisionName = divisionLabels[game.division];
    const result = getGameResult(game.id);
    const resultIsFinal = result && (result.status === "完賽" || result.status === "沒收");
    const matchup = game.division === "crossover"
      ? `${renderSeed(game.leftSeed, "black-hole")}${renderMatchStatus(game)}${renderSeed(game.rightSeed, "stellar")}`
      : `${renderTeam(game.away, "客隊／先攻")}${renderMatchStatus(game)}${renderTeam(game.home, "主隊／後攻")}`;
    const pending = game.division === "crossover" && !resultIsFinal
      ? "<span class='pending-note'>對戰依排名，主客待定</span>"
      : resultIsFinal
        ? `<span class="confirmed-note">比分已確認${result.confirmedAt ? ` · ${escapeHtml(result.confirmedAt)}` : ""}</span>`
        : result?.status === "延期" ? "<span class='pending-note'>賽程延期</span>" : "";
    return `
      <article class="schedule-game-card${resultIsFinal ? " is-final" : ""}" data-division="${escapeHtml(game.division)}" data-game-id="${escapeHtml(game.id)}">
        <div class="game-card-head">
          <span class="game-division-chip">${escapeHtml(divisionName)}</span>
          <span class="game-id">${escapeHtml(game.id)}</span>
        </div>
        <div class="game-time-row">
          <time datetime="${escapeHtml(game.date)}T${escapeHtml(game.time)}">${escapeHtml(game.time)}</time>
          <span>GAME ${String(game.slot).padStart(2, "0")}</span>
        </div>
        <div class="game-matchup">${matchup}</div>
        <div class="game-card-foot">
          <span>${escapeHtml(game.venue)}</span>
          ${pending}
        </div>
      </article>`;
  }

  function filteredGames() {
    return schedule.games
      .filter((game) => {
        if (activeTeam) return game.away === activeTeam || game.home === activeTeam;
        return activeDivision === "all" || game.division === activeDivision;
      })
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }

  function renderSchedule() {
    const games = filteredGames();
    const grouped = games.reduce((result, game) => {
      (result[game.date] ||= []).push(game);
      return result;
    }, {});

    if (!games.length) {
      listRoot.innerHTML = "<div class='schedule-empty'>目前沒有符合條件的上半季賽程。</div>";
    } else {
      listRoot.innerHTML = Object.entries(grouped).map(([date, dateGames]) => {
        const { dateText, weekday } = formatDateParts(date);
        return `
          <section class="schedule-day${date === focusDate ? " is-focused" : ""}" data-schedule-date="${escapeHtml(date)}" aria-labelledby="date-${escapeHtml(date)}">
            <header class="schedule-day-heading">
              <time id="date-${escapeHtml(date)}" datetime="${escapeHtml(date)}">${escapeHtml(dateText)}<span>${escapeHtml(weekday)}</span></time>
              <p>${dateGames.length} 場賽事 · ${escapeHtml(dateGames[0].venue)}</p>
            </header>
            <div class="schedule-games-grid">${dateGames.map(renderGame).join("")}</div>
          </section>`;
      }).join("");
    }

    const team = getTeam(activeTeam);
    const label = team ? team.displayName : divisionLabels[activeDivision];
    const focusLabel = focusDate ? `· 已定位 ${formatDateParts(focusDate).dateText} 賽果` : "";
    statusRoot.innerHTML = `<strong>目前顯示：${escapeHtml(label)} ${escapeHtml(focusLabel)}</strong><span>共 ${games.length} 場上半季賽事</span>`;
    divisionButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(!activeTeam && button.dataset.scheduleDivision === activeDivision));
    });
    teamSelect.value = activeTeam;
    overviewTeamSelect.value = activeTeam;
  }

  function monthLabel(month) {
    const [year, value] = month.split("-");
    return `${year} 年 ${Number(value)} 月`;
  }

  function overviewTeamName(teamId) {
    return getTeam(teamId)?.shortName || "";
  }

  function renderOverviewGame(game) {
    const result = getGameResult(game.id);
    const isFinal = result && (result.status === "完賽" || result.status === "沒收");
    const matchup = game.division === "crossover"
      ? `${escapeHtml(game.leftSeed)}<i>VS</i>${escapeHtml(game.rightSeed)}`
      : `${escapeHtml(overviewTeamName(game.away))}<i>VS</i>${escapeHtml(overviewTeamName(game.home))}`;
    const score = isFinal ? `<b>${escapeHtml(result.awayScore)} : ${escapeHtml(result.homeScore)}</b>` : "";
    return `
      <div class="overview-game${isFinal ? " is-final" : ""}" data-overview-game-id="${escapeHtml(game.id)}">
        <span class="overview-division ${escapeHtml(game.division)}">${escapeHtml(divisionLabels[game.division])}</span>
        <strong>${matchup}</strong>
        <small>${escapeHtml(game.id)}${result?.status === "延期" ? " · 延期" : ""}</small>
        ${score}
      </div>`;
  }

  function renderOverviewMonths() {
    if (!overviewMonths) return;
    const items = [{ value: "all", label: "全部月份" }, ...availableMonths.map((month) => ({
      value: month,
      label: `${Number(month.slice(5))} 月`
    }))];
    overviewMonths.innerHTML = items.map((item) => `
      <button type="button" data-overview-month="${escapeHtml(item.value)}" aria-pressed="${item.value === activeOverviewMonth}">${escapeHtml(item.label)}</button>`).join("");
    overviewMonths.querySelectorAll("[data-overview-month]").forEach((button) => button.addEventListener("click", () => {
      activeOverviewMonth = button.dataset.overviewMonth;
      renderOverview();
      syncUrl();
    }));
  }

  function overviewGames() {
    return schedule.games
      .filter((game) => activeOverviewMonth === "all" || game.date.startsWith(activeOverviewMonth))
      .filter((game) => !activeTeam || game.away === activeTeam || game.home === activeTeam)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }

  function renderOverview() {
    renderOverviewMonths();
    overviewTeamSelect.value = activeTeam;
    teamSelect.value = activeTeam;
    const games = overviewGames();
    const monthGroups = games.reduce((groups, game) => {
      const month = game.date.slice(0, 7);
      (groups[month] ||= []).push(game);
      return groups;
    }, {});

    if (!games.length) {
      overviewList.innerHTML = "<div class='schedule-empty'>目前沒有符合條件的賽季總覽。</div>";
    } else {
      overviewList.innerHTML = Object.entries(monthGroups).map(([month, monthGames]) => {
        const dateGroups = monthGames.reduce((groups, game) => {
          (groups[game.date] ||= []).push(game);
          return groups;
        }, {});
        const rows = Object.entries(dateGroups).map(([date, dateGames]) => {
          const { dateText, weekday } = formatDateParts(date);
          const byTime = Object.fromEntries(dateGames.map((game) => [game.time, game]));
          return `
            <article class="overview-row" role="row" data-overview-date="${escapeHtml(date)}">
              <div class="overview-date" role="rowheader"><time datetime="${escapeHtml(date)}">${escapeHtml(dateText)}</time><span>${escapeHtml(weekday)} · ${escapeHtml(dateGames[0].venue)}</span></div>
              ${["08:00", "10:50", "13:40"].map((time) => `<div class="overview-slot${byTime[time] ? "" : " is-empty"}" role="cell" data-time="${time}">${byTime[time] ? renderOverviewGame(byTime[time]) : "<span>—</span>"}</div>`).join("")}
            </article>`;
        }).join("");
        const dateCount = Object.keys(dateGroups).length;
        return `
          <details class="overview-month" data-overview-month-section="${escapeHtml(month)}" open>
            <summary><strong>${escapeHtml(monthLabel(month))}</strong><span>${dateCount} 個比賽日 · ${monthGames.length} 場</span></summary>
            <div class="overview-table" role="table" aria-label="${escapeHtml(monthLabel(month))}賽程">
              <div class="overview-table-head" role="row"><span role="columnheader">比賽日</span><span role="columnheader">08:00</span><span role="columnheader">10:50</span><span role="columnheader">13:40</span></div>
              <div role="rowgroup">${rows}</div>
            </div>
          </details>`;
      }).join("");
    }

    const team = getTeam(activeTeam);
    const label = team ? team.displayName : activeOverviewMonth === "all" ? "全部賽程" : monthLabel(activeOverviewMonth);
    const dateCount = new Set(games.map((game) => game.date)).size;
    overviewStatus.innerHTML = `<strong>目前顯示：${escapeHtml(label)}</strong><span>${dateCount} 個比賽日 · ${games.length} 場賽事</span>`;
  }

  function syncUrl() {
    const url = new URL(location.href);
    ["division", "team", "view", "standings", "month", "result", "week"].forEach((key) => url.searchParams.delete(key));
    if (activeView === "standings") {
      url.searchParams.set("view", "standings");
      if (activeStandingsDivision === "stellar") url.searchParams.set("standings", "stellar");
      url.hash = "standings";
    } else if (activeView === "overview") {
      url.searchParams.set("view", "overview");
      if (activeTeam) url.searchParams.set("team", activeTeam);
      if (activeOverviewMonth !== "all") url.searchParams.set("month", activeOverviewMonth);
      url.hash = "overview";
    } else {
      if (activeTeam) url.searchParams.set("team", activeTeam);
      else if (activeDivision !== "all") url.searchParams.set("division", activeDivision);
      url.hash = "schedule";
    }
    history.replaceState({}, "", url);
  }

  function renderStandings() {
    standingsButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.standingsDivision === activeStandingsDivision));
    });

    if (!standingsBoard) return;
    const division = league.divisions[activeStandingsDivision];
    const fallbackRows = league.teams
      .filter((team) => team.division === activeStandingsDivision)
      .map((team) => ({ teamId: team.id, rank: null, played: 0, wins: 0, draws: 0, losses: 0,
        points: 0, scored: 0, allowed: 0, difference: 0, winningPercentage: null, recent: [] }));
    const rows = results.standings?.[activeStandingsDivision] || fallbackRows;
    const completedGames = schedule.games.filter((game) => {
      const result = getGameResult(game.id);
      if (!result || (result.status !== "完賽" && result.status !== "沒收")) return false;
      return game.division === activeStandingsDivision || game.division === "crossover";
    }).length;
    const totalPlayed = rows.reduce((total, row) => total + Number(row.played || 0), 0);

    if (standingsStatus) standingsStatus.textContent = totalPlayed
      ? (Number(results.confirmedGames || 0) >= schedule.games.length ? "上半季完賽" : "賽季進行中")
      : "尚未開賽";
    if (standingsGames) standingsGames.textContent = `${completedGames} 場`;
    if (standingsUpdated) {
      standingsUpdated.textContent = results.standingsUpdatedAt
        ? formatDateParts(results.standingsUpdatedAt).dateText
        : "賽季開始後更新";
    }

    const rowMarkup = rows.map((row) => {
      const team = getTeam(row.teamId);
      if (!team) return "";
      const rank = row.rank === null || row.rank === undefined ? "—" : row.rank;
      const rankLabel = rank === "待裁定" ? "待定" : rank;
      const rankTitle = rank === "待裁定" ? " title=\"同分待聯盟裁定\"" : "";
      const percentage = row.winningPercentage === null || row.winningPercentage === undefined
        ? "—"
        : Number(row.winningPercentage).toFixed(3).replace(/^0/, "");
      const difference = Number(row.difference || 0);
      const differenceText = difference > 0 ? `+${difference}` : String(difference);
      const recent = Array.isArray(row.recent) && row.recent.length
        ? row.recent.map((outcome) => `<i class="recent-${outcome === "勝" ? "win" : outcome === "敗" ? "loss" : "draw"}">${escapeHtml(outcome)}</i>`).join("")
        : "<span class='recent-empty'>—</span>";
      return `
        <article class="standings-row" role="row" aria-label="${escapeHtml(team.displayName)}戰績">
          <span class="standings-rank" role="cell" data-label="名次"${rankTitle}>${escapeHtml(rankLabel)}</span>
          <a class="standings-team" role="cell" href="team_introduction.html?division=${escapeHtml(team.division)}#team-${escapeHtml(team.id)}">
            <img src="${escapeHtml(team.logo)}" alt="" loading="lazy" decoding="async">
            <span><strong>${escapeHtml(team.shortName)}</strong><small>${escapeHtml(team.displayName)}</small></span>
          </a>
          <b role="cell" data-label="已賽">${escapeHtml(row.played)}</b>
          <b role="cell" data-label="勝">${escapeHtml(row.wins)}</b>
          <b role="cell" data-label="和">${escapeHtml(row.draws)}</b>
          <b role="cell" data-label="敗">${escapeHtml(row.losses)}</b>
          <b class="standings-points" role="cell" data-label="積分">${escapeHtml(row.points)}</b>
          <span role="cell" data-label="得失分">${escapeHtml(row.scored)}:${escapeHtml(row.allowed)} <small>${escapeHtml(differenceText)}</small></span>
          <span role="cell" data-label="勝率">${escapeHtml(percentage)}</span>
          <span class="standings-recent" role="cell" data-label="近五場">${recent}</span>
        </article>`;
    }).join("");

    standingsBoard.innerHTML = `
      <div class="standings-division-title">
        <img src="${escapeHtml(division.logo)}" alt="${escapeHtml(division.name)} LOGO">
        <div><span>${escapeHtml(division.englishName)}</span><strong>${escapeHtml(division.name)}</strong><small>${escapeHtml(division.tagline)}</small></div>
      </div>
      <div class="standings-table" role="table" aria-label="${escapeHtml(division.name)}戰績排名">
        <div class="standings-table-head" role="row">
          <span role="columnheader">名次</span><span role="columnheader">球隊</span><span role="columnheader">已賽</span>
          <span role="columnheader">勝</span><span role="columnheader">和</span><span role="columnheader">敗</span>
          <span role="columnheader">積分</span><span role="columnheader">得失分</span><span role="columnheader">勝率</span><span role="columnheader">近五場</span>
        </div>
        <div class="standings-table-body" role="rowgroup">${rowMarkup}</div>
      </div>`;
  }

  function setView(view, updateUrl) {
    activeView = view === "standings" ? "standings" : view === "overview" ? "overview" : "schedule";
    viewButtons.forEach((button) => button.setAttribute("aria-selected", String(button.dataset.scheduleView === activeView)));
    schedulePanel.hidden = activeView !== "schedule";
    overviewPanel.hidden = activeView !== "overview";
    standingsPanel.hidden = activeView !== "standings";
    if (activeView === "overview") renderOverview();
    if (activeView === "standings") renderStandings();
    if (updateUrl) syncUrl();
  }

  divisionButtons.forEach((button) => button.addEventListener("click", () => {
    activeDivision = allowedDivisions.has(button.dataset.scheduleDivision) ? button.dataset.scheduleDivision : "all";
    activeTeam = "";
    focusDate = "";
    renderSchedule();
    syncUrl();
  }));

  teamSelect.addEventListener("change", () => {
    activeTeam = league.teams.some((team) => team.id === teamSelect.value) ? teamSelect.value : "";
    activeDivision = "all";
    focusDate = "";
    renderSchedule();
    syncUrl();
  });

  overviewTeamSelect.addEventListener("change", () => {
    activeTeam = league.teams.some((team) => team.id === overviewTeamSelect.value) ? overviewTeamSelect.value : "";
    activeDivision = "all";
    renderOverview();
    syncUrl();
  });

  viewButtons.forEach((button) => button.addEventListener("click", () => setView(button.dataset.scheduleView, true)));

  standingsButtons.forEach((button) => button.addEventListener("click", () => {
    activeStandingsDivision = button.dataset.standingsDivision === "stellar" ? "stellar" : "black-hole";
    renderStandings();
    syncUrl();
  }));

  populateTeamSelect();
  renderVersionNote();
  renderSchedule();
  setView(activeView, false);
  if (activeView === "schedule" && focusDate) {
    requestAnimationFrame(() => document.querySelector(`[data-schedule-date="${focusDate}"]`)?.scrollIntoView({ block: "start" }));
  }
})();
