(function () {
  "use strict";

  const CONFIG = {
    hitter: {
      label: "打者",
      role: "打者檔案",
      updateIndex: 28,
      url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_X5jYPR24dk5oqUSr1py8glTu-jHZJwuzhyJN7RrjMkgkXjwv0hVgmn7KlieQy_-CZEn6UQofqTbz/pub?gid=546432089&single=true&output=csv"
    },
    pitcher: {
      label: "投手",
      role: "投手檔案",
      updateIndex: 26,
      url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnSzqJij7qN0DkHrUHSTUbQv609l1OkQU-1BlZqO2t2Jry0zvcMyQa1DpbGKYSXtF94pg2CU-I3X8/pub?gid=1969750057&single=true&output=csv"
    }
  };

  const elements = {
    tabs: Array.from(document.querySelectorAll("[data-player-type]")),
    search: document.getElementById("player-search"),
    team: document.getElementById("player-team"),
    season: document.getElementById("player-season"),
    career: document.getElementById("career-view-button"),
    simple: document.getElementById("simple-view-button"),
    full: document.getElementById("full-view-button"),
    reset: document.getElementById("reset-data-button"),
    mode: document.getElementById("data-mode-label"),
    count: document.getElementById("data-result-count"),
    updated: document.getElementById("data-updated-time"),
    header: document.getElementById("integrated-header-row"),
    body: document.getElementById("integrated-table-body"),
    table: document.getElementById("integrated-player-table"),
    tableWrap: document.querySelector(".integrated-table-wrap"),
    floatingHeader: document.getElementById("data-floating-header"),
    floatingTable: document.querySelector(".data-floating-table"),
    floatingRow: document.getElementById("data-floating-header-row"),
    mobile: document.getElementById("integrated-mobile-list"),
    loading: document.getElementById("data-loading"),
    error: document.getElementById("data-error")
  };

  const cache = {};
  const state = {
    type: "hitter",
    career: false,
    full: false,
    sortKey: "",
    sortOrder: "none",
    selectedProfile: ""
  };

  async function initialize() {
    bindEvents();
    await activateType("hitter");
  }

  async function activateType(type) {
    state.type = type;
    state.career = false;
    state.full = false;
    state.sortKey = "";
    state.sortOrder = "none";
    state.selectedProfile = "";
    elements.search.value = "";
    setLoading(true);
    setError("");
    updateTypeControls();

    try {
      if (!cache[type]) cache[type] = await loadDataset(type);
      populateFilters();
      render();
    } catch (error) {
      setError(`正式數據讀取失敗：${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadDataset(type) {
    const response = await fetch(CONFIG[type].url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = parseCSV(await response.text());
    const dataset = {
      type,
      headers: parsed.headers,
      originalRows: parsed.rows,
      careerRows: [],
      keys: null,
      updateText: parsed.headers[CONFIG[type].updateIndex] || "依聯盟公告"
    };
    dataset.keys = resolveKeys(dataset);
    dataset.originalRows = dataset.originalRows.filter((row) => String(row[dataset.keys.name] || "").trim());
    dataset.careerRows = type === "hitter" ? calculateHitterCareer(dataset) : calculatePitcherCareer(dataset);
    return dataset;
  }

  function parseCSV(text) {
    const lines = text.replace(/\r/g, "").split("\n").filter((line) => line.trim());
    if (!lines.length) throw new Error("資料表沒有內容");
    const headers = splitCSVLine(lines[0]).map((header) => header.trim());
    const rows = lines.slice(1).map((line) => {
      const cells = splitCSVLine(line);
      return headers.reduce((row, header, index) => {
        row[header] = (cells[index] || "").trim();
        return row;
      }, {});
    });
    return { headers, rows };
  }

  function resolveKeys(dataset) {
    const headers = dataset.headers;
    const find = (candidates, fallback = "") => findKey(headers, candidates) || fallback;
    const common = {
      name: headers.find((header) => header.includes("姓名")) || "背號/姓名",
      team: headers.find((header) => header.includes("隊")) || "隊伍",
      season: headers.find((header) => /屆數|屆別|賽季/.test(header)) || "屆數",
      update: headers[CONFIG[dataset.type].updateIndex]
    };

    if (dataset.type === "hitter") {
      return {
        ...common,
        pa: find(["PA", /打席/]),
        ab: find(["AB", /打數/]),
        avg: headers.find((header) => /AVG|打擊率/i.test(header)),
        h: find(["H", /^安打$/, /安打總數/]),
        hr: find(["HR", /^全壘打$/]),
        bb: find(["BB", /^四壞$/, /^保送$/]),
        sb: find(["SB", /^盜壘$/]),
        hbp: find(["HBP", /觸身/]),
        sf: find(["SF", /犧牲/]),
        tb: find(["TB", /壘打數/]),
        so: find(["SO", /^三振$/]),
        obp: headers.find((header) => /OBP|上壘率/i.test(header)),
        slg: headers.find((header) => /SLG|長打率/i.test(header)),
        ops: headers.find((header) => /OPS|攻擊指數/i.test(header))
      };
    }

    return {
      ...common,
      ip: find(["IP", /局數/]),
      w: find(["W", /^勝投$/]),
      l: find(["L", /^敗投$/]),
      sv: find(["SV", /^救援$/, /^救援成功$/]),
      hld: find(["HLD", /^中繼$/, /^中繼成功$/]),
      so: find(["SO", "K", /^三振$/]),
      bb: find(["BB", /^四壞$/, /^保送$/]),
      hbp: find(["HBP", /觸身/]),
      h: headers.find((header) => header === "H" || header.includes("被安打")),
      er: headers.find((header) => header === "ER" || header.includes("自責分")),
      era: headers.find((header) => /ERA|防禦率/i.test(header)),
      whip: headers.find((header) => /WHIP/i.test(header))
    };
  }

  function calculateHitterCareer(dataset) {
    const { headers, originalRows, keys } = dataset;
    const nonStats = new Set([keys.name, keys.team, keys.season, keys.update]);
    const players = new Map();

    originalRows.forEach((row) => {
      const name = row[keys.name].trim();
      if (!players.has(name)) {
        const career = { [keys.name]: name, [keys.team]: row[keys.team], [keys.season]: "生涯累計", _latestSeason: row[keys.season] };
        headers.forEach((header) => { if (!nonStats.has(header)) career[header] = Number(row[header]) || 0; });
        players.set(name, career);
      } else {
        const career = players.get(name);
        if (compareSeason(row[keys.season], career._latestSeason) > 0) {
          career._latestSeason = row[keys.season];
          career[keys.team] = row[keys.team];
        }
        headers.forEach((header) => { if (!nonStats.has(header)) career[header] += Number(row[header]) || 0; });
      }
    });

    return Array.from(players.values()).map((career) => {
      const ab = numeric(career[keys.ab]);
      const h = numeric(career[keys.h]);
      const bb = numeric(career[keys.bb]);
      const hbp = numeric(career[keys.hbp]);
      const sf = numeric(career[keys.sf]);
      const tb = numeric(career[keys.tb]);
      const pa = numeric(career[keys.pa]);
      const so = numeric(career[keys.so]);
      if (keys.avg) career[keys.avg] = ab ? (h / ab).toFixed(3) : ".000";
      if (keys.obp) career[keys.obp] = ab + bb + hbp + sf ? ((h + bb + hbp) / (ab + bb + hbp + sf)).toFixed(3) : ".000";
      if (keys.slg) career[keys.slg] = ab ? (tb / ab).toFixed(3) : ".000";
      if (keys.ops) career[keys.ops] = (numeric(career[keys.obp]) + numeric(career[keys.slg])).toFixed(3);
      const strikeoutRate = headers.find((header) => /^(K%|三振率|被三振率)$/i.test(header));
      if (strikeoutRate) career[strikeoutRate] = pa ? `${((so / pa) * 100).toFixed(1)}%` : "0.0%";
      return career;
    });
  }

  function calculatePitcherCareer(dataset) {
    const { headers, originalRows, keys } = dataset;
    const nonStats = new Set([keys.name, keys.team, keys.season, keys.update]);
    const players = new Map();

    originalRows.forEach((row) => {
      const name = row[keys.name].trim();
      if (!players.has(name)) {
        const career = { [keys.name]: name, [keys.team]: row[keys.team], [keys.season]: "生涯累計", _latestSeason: row[keys.season] };
        headers.forEach((header) => {
          if (!nonStats.has(header)) career[header] = header === keys.ip ? ipToDecimal(row[header]) : Number(row[header]) || 0;
        });
        players.set(name, career);
      } else {
        const career = players.get(name);
        if (compareSeason(row[keys.season], career._latestSeason) > 0) {
          career._latestSeason = row[keys.season];
          career[keys.team] = row[keys.team];
        }
        headers.forEach((header) => {
          if (!nonStats.has(header)) career[header] += header === keys.ip ? ipToDecimal(row[header]) : Number(row[header]) || 0;
        });
      }
    });

    return Array.from(players.values()).map((career) => {
      const innings = numeric(career[keys.ip]);
      if (keys.era) career[keys.era] = innings ? ((numeric(career[keys.er]) / innings) * 9).toFixed(2) : "0.00";
      if (keys.whip) career[keys.whip] = innings ? ((numeric(career[keys.h]) + numeric(career[keys.bb]) + numeric(career[keys.hbp])) / innings).toFixed(2) : "0.00";
      if (keys.ip) career[keys.ip] = decimalToIp(innings);
      return career;
    });
  }

  function populateFilters() {
    const dataset = currentDataset();
    const { keys } = dataset;
    const teams = unique(dataset.originalRows.map((row) => row[keys.team]).filter(Boolean)).sort((a, b) => a.localeCompare(b, "zh-Hant"));
    const seasons = unique(dataset.originalRows.map((row) => row[keys.season]).filter(Boolean)).sort((a, b) => compareSeason(b, a));
    elements.team.innerHTML = '<option value="">全部球隊</option>' + teams.map((team) => `<option value="${escapeAttr(team)}">${escapeHtml(team)}</option>`).join("");
    elements.season.innerHTML = '<option value="">全部屆數</option>' + seasons.map((season) => `<option value="${escapeAttr(season)}">${escapeHtml(season)}</option>`).join("");
    elements.team.value = "";
    elements.season.value = seasons[0] || "";
    elements.updated.textContent = dataset.updateText;
  }

  function render() {
    const rows = filteredRows();
    const displayHeaders = getDisplayHeaders();
    elements.count.textContent = String(rows.length);
    elements.mode.textContent = `${CONFIG[state.type].label} · ${state.career ? "生涯累計" : state.full ? "完整檢視" : "精簡檢視"}`;
    renderHeaders(displayHeaders);
    renderTable(rows, displayHeaders);
    renderMobile(rows);
    updateStickyColumns();
    syncFloatingHeaderStructure();
    syncFloatingHeaderPosition();
  }

  function filteredRows() {
    const dataset = currentDataset();
    const { keys } = dataset;
    const source = state.career ? dataset.careerRows : dataset.originalRows;
    const keyword = elements.search.value.trim().toLowerCase();
    const team = elements.team.value;
    const season = elements.season.value;
    const rows = source.filter((row) => {
      const nameValue = String(row[keys.name] || "").toLowerCase();
      const teamValue = String(row[keys.team] || "").toLowerCase();
      return (!keyword || nameValue.includes(keyword) || teamValue.includes(keyword)) &&
        (!team || row[keys.team] === team) &&
        (state.career || !season || row[keys.season] === season);
    });

    if (state.sortKey && state.sortOrder !== "none") {
      rows.sort((a, b) => compareValues(a[state.sortKey], b[state.sortKey], state.sortKey) * (state.sortOrder === "asc" ? 1 : -1));
    }
    return rows;
  }

  function getDisplayHeaders() {
    const dataset = currentDataset();
    const { headers, keys } = dataset;
    const base = headers.filter((header) => header !== keys.update && !(state.career && header === keys.season));
    if (state.full) return base;
    const preferred = state.type === "hitter"
      ? [keys.season, keys.team, keys.name, keys.avg, keys.h, keys.hr, keys.bb, keys.sb, keys.ops]
      : [keys.season, keys.team, keys.name, keys.ip, keys.w, keys.l, keys.sv, keys.hld, keys.so, keys.bb, keys.era, keys.whip];
    return preferred.filter((header, index) => header && base.includes(header) && preferred.indexOf(header) === index);
  }

  function renderHeaders(displayHeaders) {
    let previousGroup = "";
    elements.header.innerHTML = displayHeaders.map((header, index) => {
      const group = classifyHeader(header);
      const groupStart = previousGroup && group !== previousGroup ? " group-start" : "";
      previousGroup = group;
      const sortedClass = state.sortKey === header ? (state.sortOrder === "asc" ? " sorted-asc" : " sorted-desc") : "";
      const ariaSort = state.sortKey === header ? (state.sortOrder === "asc" ? "ascending" : "descending") : "none";
      const stickyClass = index < 3 ? ` sticky-column sticky-column-${index + 1}` : "";
      return `<th class="${sortedClass}${groupStart}${stickyClass}" data-sort-key="${escapeAttr(header)}" aria-sort="${ariaSort}" title="點擊切換排序方向">${escapeHtml(displayLabel(header))}<span class="sort-icon"></span></th>`;
    }).join("");
  }

  function renderTable(rows, displayHeaders) {
    const dataset = currentDataset();
    const { keys } = dataset;
    if (!rows.length) {
      elements.body.innerHTML = `<tr><td class="data-empty" colspan="${Math.max(displayHeaders.length, 1)}">查無符合條件的球員</td></tr>`;
      return;
    }

    elements.body.innerHTML = rows.map((row) => {
      const profileKey = `${row[keys.name] || ""}|||${row[keys.season] || "生涯累計"}`;
      let previousGroup = "";
      const cells = displayHeaders.map((header, index) => {
        const group = classifyHeader(header);
        const groupStart = previousGroup && group !== previousGroup ? " group-start" : "";
        previousGroup = group;
        const primary = header === primaryKey() ? " highlight-primary" : "";
        const secondary = header === secondaryKey() ? " highlight-secondary" : "";
        const value = row[header] ?? "";
        const content = header === keys.team
          ? `<span class="team-cell"><img src="${teamLogo(value)}" alt=""><span>${escapeHtml(value)}</span></span>`
          : escapeHtml(value);
        const stickyClass = index < 3 ? ` sticky-column sticky-column-${index + 1}` : "";
        return `<td class="${groupStart}${primary}${secondary}${stickyClass}">${content}</td>`;
      }).join("");
      const dataRow = `<tr class="player-data-row" data-profile-key="${escapeAttr(profileKey)}" tabindex="0" aria-expanded="${state.selectedProfile === profileKey}">${cells}</tr>`;
      const profileRow = state.selectedProfile === profileKey
        ? `<tr class="player-profile-row"><td colspan="${displayHeaders.length}">${buildPlayerProfile(row, false)}</td></tr>`
        : "";
      return dataRow + profileRow;
    }).join("");
  }

  function renderMobile(rows) {
    if (!rows.length) {
      elements.mobile.innerHTML = '<div class="data-empty">查無符合條件的球員</div>';
      return;
    }
    const dataset = currentDataset();
    const { keys } = dataset;

    elements.mobile.innerHTML = rows.map((row, index) => {
      const hitter = state.type === "hitter";
      const primary = hitter ? keys.avg : keys.era;
      const summaryKeys = hitter
        ? [keys.h, keys.hr, keys.bb, keys.sb, keys.ops]
        : [keys.ip, keys.w, keys.l, keys.sv, keys.so, keys.whip];
      const summaries = summaryKeys.filter(Boolean).map((key) => `<div class="mobile-summary-stat"><span>${escapeHtml(displayLabel(key))}</span><b>${escapeHtml(row[key] ?? "")}</b></div>`).join("");
      const detailHeaders = dataset.headers.filter((header) => header !== keys.update && header !== keys.name && header !== keys.team && header !== keys.season && header !== primary && !summaryKeys.includes(header));
      const details = detailHeaders.map((header) => `<div class="detail-stat"><span>${escapeHtml(displayLabel(header))}</span><b>${escapeHtml(row[header] ?? "")}</b></div>`).join("");
      const primaryValue = hitter ? formatRate(row[primary]) : (row[primary] || "0.00");
      const openLabel = state.career ? "查看歷屆與完整數據" : "查看生涯與完整數據";
      return `<article class="mobile-player-card" data-mobile-index="${index}">
        <div class="mobile-card-head">
          <div class="mobile-player-identity"><img src="${teamLogo(row[keys.team])}" alt="${escapeHtml(row[keys.team])} LOGO"><div class="mobile-player-meta"><strong>${escapeHtml(row[keys.name] || "未命名球員")}</strong><small>${escapeHtml(row[keys.team] || "")} · ${escapeHtml(row[keys.season] || "")}</small></div></div>
          <div class="mobile-primary-stat"><small>${hitter ? "打擊率" : displayLabel(primary)}</small><strong>${escapeHtml(primaryValue)}</strong></div>
        </div>
        <div class="mobile-summary">${summaries}</div>
        <button class="mobile-toggle" type="button" data-toggle-mobile="${index}"><span class="open-label">${openLabel} ▼</span><span class="close-label">收合球員數據 ▲</span></button>
        <div class="mobile-details">${buildPlayerProfile(row, true)}<section class="profile-section"><div class="profile-section-heading"><strong>完整單季數據</strong><span>${escapeHtml(row[keys.season] || "")}</span></div><div class="mobile-detail-grid">${details}</div></section></div>
      </article>`;
    }).join("");
  }

  function buildPlayerProfile(row, mobile) {
    const dataset = currentDataset();
    const { keys } = dataset;
    const name = row[keys.name] || "未命名球員";
    const team = row[keys.team] || "";
    const career = dataset.careerRows.find((item) => item[keys.name] === name) || row;
    const history = dataset.originalRows.filter((item) => item[keys.name] === name).sort((a, b) => compareSeason(b[keys.season], a[keys.season]));
    const core = state.type === "hitter"
      ? [keys.avg, keys.h, keys.hr, keys.bb, keys.sb, keys.ops]
      : [keys.ip, keys.w, keys.l, keys.sv, keys.hld, keys.so, keys.era, keys.whip];
    const validCore = core.filter((key, index) => key && core.indexOf(key) === index);
    const historyCore = state.type === "hitter" ? validCore : [keys.ip, keys.w, keys.l, keys.so, keys.era, keys.whip].filter(Boolean);
    const stats = (source) => validCore.map((key) => `<div class="profile-stat${key === primaryKey() ? " primary" : ""}"><span>${escapeHtml(displayLabel(key))}</span><strong>${escapeHtml(key === keys.avg ? formatRate(source[key]) : (source[key] ?? ""))}</strong></div>`).join("");
    const historyRows = history.map((item) => `<tr>${[keys.season, ...historyCore].map((key) => `<td>${escapeHtml(key === keys.avg ? formatRate(item[key]) : (item[key] ?? ""))}</td>`).join("")}</tr>`).join("");
    const header = mobile ? "" : `<div class="profile-head"><img src="${teamLogo(team)}" alt="${escapeHtml(team)} LOGO"><div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(team)} · ${escapeHtml(row[keys.season] || "生涯累計")}</p></div><span class="profile-role">${CONFIG[state.type].role}</span></div>`;
    return `<div class="player-profile-inline${mobile ? " mobile-profile-inline" : ""}" style="--profile-columns:${Math.min(validCore.length, 8)}">${header}
      <section class="profile-section"><div class="profile-section-heading"><strong>${state.career ? "生涯核心成績" : "當屆核心成績"}</strong><span>${escapeHtml(row[keys.season] || "生涯累計")}</span></div><div class="profile-stats">${stats(row)}</div></section>
      ${state.career ? "" : `<section class="profile-section"><div class="profile-section-heading"><strong>生涯累計</strong><span>${unique(history.map((item) => item[keys.season])).length} 屆正式紀錄</span></div><div class="profile-stats">${stats(career)}</div></section>`}
      <section class="profile-section"><div class="profile-section-heading"><strong>歷屆紀錄</strong><span>${history.length} 筆賽季資料</span></div><div class="profile-history-wrap"><table class="profile-history"><thead><tr>${[keys.season, ...historyCore].map((key) => `<th>${escapeHtml(key === keys.season ? "屆數" : displayLabel(key))}</th>`).join("")}</tr></thead><tbody>${historyRows}</tbody></table></div></section>
    </div>`;
  }

  function bindEvents() {
    elements.tabs.forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.playerType !== state.type) activateType(button.dataset.playerType);
    }));

    elements.search.addEventListener("input", resetProfileAndRender);
    elements.team.addEventListener("change", resetProfileAndRender);
    elements.season.addEventListener("change", resetProfileAndRender);
    elements.reset.addEventListener("click", () => {
      elements.search.value = "";
      elements.team.value = "";
      elements.season.value = elements.season.options[1]?.value || "";
      state.selectedProfile = "";
      render();
    });

    elements.career.addEventListener("click", () => {
      state.career = !state.career;
      state.selectedProfile = "";
      state.sortKey = "";
      state.sortOrder = "none";
      elements.season.disabled = state.career;
      elements.career.textContent = state.career ? "返回賽季成績" : "查看生涯成績";
      render();
    });

    elements.simple.addEventListener("click", () => setFullView(false));
    elements.full.addEventListener("click", () => setFullView(true));

    elements.header.addEventListener("click", handleSortClick);
    elements.floatingRow.addEventListener("click", handleSortClick);

    elements.body.addEventListener("click", (event) => toggleDesktopProfile(event.target.closest(".player-data-row")));
    elements.body.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const row = event.target.closest(".player-data-row");
      if (!row) return;
      event.preventDefault();
      toggleDesktopProfile(row);
    });

    elements.mobile.addEventListener("click", (event) => {
      const button = event.target.closest("[data-toggle-mobile]");
      if (!button) return;
      const card = button.closest(".mobile-player-card");
      if (card) card.classList.toggle("expanded");
    });

    elements.tableWrap.addEventListener("scroll", syncFloatingHorizontal, { passive: true });
    elements.table.addEventListener("load", () => {
      updateStickyColumns();
      syncFloatingHeaderStructure();
    }, true);
    window.addEventListener("scroll", syncFloatingHeaderPosition, { passive: true });
    window.addEventListener("resize", () => {
      updateStickyColumns();
      syncFloatingHeaderStructure();
      syncFloatingHeaderPosition();
    });
  }

  function handleSortClick(event) {
    const header = event.target.closest("[data-sort-key]");
    if (!header) return;
    const key = header.dataset.sortKey;
    const defaultAscending = state.type === "pitcher" && /ERA|WHIP|防禦率/i.test(key);
    if (state.sortKey === key) {
      state.sortOrder = state.sortOrder === "asc" ? "desc" : state.sortOrder === "desc" ? "none" : (defaultAscending ? "asc" : "desc");
    } else {
      state.sortKey = key;
      state.sortOrder = defaultAscending ? "asc" : "desc";
    }
    render();
  }

  function updateTypeControls() {
    elements.tabs.forEach((button) => {
      const active = button.dataset.playerType === state.type;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    elements.career.textContent = "查看生涯成績";
    elements.season.disabled = false;
    elements.simple.classList.add("active");
    elements.full.classList.remove("active");
  }

  function setFullView(full) {
    state.full = full;
    state.selectedProfile = "";
    elements.simple.classList.toggle("active", !full);
    elements.full.classList.toggle("active", full);
    render();
  }

  function resetProfileAndRender() {
    state.selectedProfile = "";
    render();
  }

  function toggleDesktopProfile(row) {
    if (!row) return;
    state.selectedProfile = state.selectedProfile === row.dataset.profileKey ? "" : row.dataset.profileKey;
    render();
  }

  function updateStickyColumns() {
    const headers = elements.header.querySelectorAll("th");
    if (headers.length < 3 || window.innerWidth <= 760) return;
    const widths = [headers[0].getBoundingClientRect().width, headers[1].getBoundingClientRect().width, headers[2].getBoundingClientRect().width];
    const offsets = [0, widths[0], widths[0] + widths[1]];
    offsets.forEach((offset, index) => {
      elements.table.querySelectorAll(`.sticky-column-${index + 1}`).forEach((cell) => {
        cell.style.left = `${offset}px`;
      });
    });
  }

  function syncFloatingHeaderStructure() {
    if (window.innerWidth <= 760 || !elements.header.children.length) {
      elements.floatingHeader.hidden = true;
      return;
    }
    const sourceHeaders = Array.from(elements.header.children);
    elements.floatingRow.innerHTML = elements.header.innerHTML;
    const clonedHeaders = Array.from(elements.floatingRow.children);
    sourceHeaders.forEach((header, index) => {
      const width = header.getBoundingClientRect().width;
      clonedHeaders[index].style.width = `${width}px`;
      clonedHeaders[index].style.minWidth = `${width}px`;
      clonedHeaders[index].style.maxWidth = `${width}px`;
    });
    elements.floatingTable.style.width = `${elements.table.scrollWidth}px`;
    syncFloatingHorizontal();
  }

  function syncFloatingHeaderPosition() {
    if (window.innerWidth <= 760 || !elements.header.children.length) {
      elements.floatingHeader.hidden = true;
      return;
    }
    const wrapRect = elements.tableWrap.getBoundingClientRect();
    const originalHeaderRect = elements.header.getBoundingClientRect();
    const navbar = document.querySelector(".navbar");
    const navbarRect = navbar ? navbar.getBoundingClientRect() : { bottom: 0 };
    const stickyTop = Math.max(0, navbarRect.bottom);
    const headerHeight = originalHeaderRect.height;
    const visible = originalHeaderRect.bottom <= stickyTop && wrapRect.bottom > stickyTop + headerHeight;
    elements.floatingHeader.hidden = !visible;
    if (!visible) return;
    elements.floatingHeader.style.top = `${stickyTop}px`;
    elements.floatingHeader.style.left = `${wrapRect.left}px`;
    elements.floatingHeader.style.width = `${wrapRect.width}px`;
    elements.floatingHeader.style.height = `${headerHeight}px`;
    syncFloatingHorizontal();
  }

  function syncFloatingHorizontal() {
    if (!elements.floatingRow.children.length) return;
    const scrollLeft = elements.tableWrap.scrollLeft;
    elements.floatingTable.style.transform = `translateX(${-scrollLeft}px)`;
    elements.floatingRow.querySelectorAll(".sticky-column").forEach((header) => {
      header.style.transform = `translateX(${scrollLeft}px)`;
    });
  }

  function classifyHeader(header) {
    if (/AVG|打擊率|OBP|上壘率|SLG|長打率|OPS|攻擊指數|ERA|防禦率|WHIP/i.test(header)) return "rate";
    if (/^(2B|3B|HR|全壘打|二壘打|三壘打)$/i.test(header)) return "power";
    if (/^(W|L|SV|HLD|勝投|敗投|救援|救援成功|中繼|中繼成功)$/i.test(header)) return "result";
    if (/^(BB|SO|K|K%|HBP|四壞|保送|三振|三振率|被三振率|觸身)$/i.test(header)) return "discipline";
    if (/^(SB|CS|盜壘|盜壘刺)$/i.test(header)) return "running";
    if (/^(IP|局數|ER|R|H|被安打|自責分)$/i.test(header)) return "pitching";
    return "basic";
  }

  function displayLabel(header) {
    if (!header) return "";
    if (/AVG|打擊率/i.test(header)) return "打擊率";
    if (/^(H|安打|安打總數)$/i.test(header) && state.type === "hitter") return "安打";
    if (/^(HR|全壘打)$/i.test(header)) return "全壘打";
    if (/^(BB|四壞|保送)$/i.test(header)) return "保送";
    if (/^(SB|盜壘)$/i.test(header)) return "盜壘";
    if (/OPS|攻擊指數/i.test(header)) return "OPS";
    return header;
  }

  function primaryKey() {
    const keys = currentDataset().keys;
    return state.type === "hitter" ? keys.avg : keys.era;
  }

  function secondaryKey() {
    const keys = currentDataset().keys;
    return state.type === "hitter" ? keys.ops : keys.whip;
  }

  function currentDataset() {
    return cache[state.type];
  }

  function teamLogo(team) {
    const value = normalizeTeam(team);
    const rules = [
      ["A", ["戰狼"]], ["B", ["神清163", "神清"]], ["C", ["遊牧者"]],
      ["D", ["好chill", "好丘"]], ["E", ["台中樂天", "樂天"]],
      ["F", ["台中ngu", "ngu"]], ["G", ["tcw", "金鋼狼"]],
      ["H", ["創邑", "chungyi"]], ["I", ["捷創", "jtron"]], ["J", ["安穆"]]
    ];
    const match = rules.find((entry) => entry[1].some((alias) => value.includes(normalizeTeam(alias))));
    return match ? `assets/teams/${match[0]}.webp` : "assets/season3-main-logo.webp";
  }

  function normalizeTeam(value) {
    return String(value || "").toLowerCase().replace(/[\s.．·・_-]/g, "").replace(/棒球隊|科技/g, "");
  }

  function findKey(headers, candidates) {
    return headers.find((header) => candidates.some((candidate) => typeof candidate === "string" ? header.toUpperCase() === candidate.toUpperCase() : candidate.test(header)));
  }

  function compareValues(a, b, key) {
    if (/IP|局數/i.test(key)) return ipToDecimal(a) - ipToDecimal(b);
    const numberA = Number.parseFloat(a);
    const numberB = Number.parseFloat(b);
    if (Number.isFinite(numberA) && Number.isFinite(numberB)) return numberA - numberB;
    return String(a ?? "").localeCompare(String(b ?? ""), "zh-Hant", { numeric: true });
  }

  function compareSeason(a, b) {
    return String(a || "").localeCompare(String(b || ""), "zh-Hant", { numeric: true });
  }

  function ipToDecimal(value) {
    if (!value) return 0;
    const [innings, outs] = String(value).split(".");
    return (Number.parseInt(innings || "0", 10) || 0) + ((Number.parseInt(outs || "0", 10) || 0) / 3);
  }

  function decimalToIp(value) {
    const innings = Math.floor(value);
    const outs = Math.round((value - innings) * 3);
    return `${innings}.${outs}`;
  }

  function formatRate(value) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number.toFixed(3) : (value || "0.000");
  }

  function numeric(value) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  }

  function unique(values) {
    return Array.from(new Set(values));
  }

  function splitCSVLine(line) {
    const output = [];
    let current = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      const next = line[index + 1];
      if (character === '"' && quoted && next === '"') {
        current += '"';
        index += 1;
      } else if (character === '"') {
        quoted = !quoted;
      } else if (character === "," && !quoted) {
        output.push(current);
        current = "";
      } else {
        current += character;
      }
    }
    output.push(current);
    return output;
  }

  function setLoading(loading) {
    elements.loading.hidden = !loading;
  }

  function setError(message) {
    elements.error.hidden = !message;
    elements.error.textContent = message;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  initialize();
})();
