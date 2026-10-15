(function () {
  "use strict";

  const body = document.body;
  const dataUrl = body.dataset.source || "assets/data/player-stats.json";
  const playerType = body.dataset.playerType || "hitter";
  const metric = body.dataset.metric;
  const metricLabel = body.dataset.metricLabel;
  const metricAliases = (body.dataset.metricAliases || metricLabel).split("|");
  const secondaryAliases = (body.dataset.secondaryAliases || "").split("|").filter(Boolean);
  const secondaryLabel = body.dataset.secondaryLabel || "出賽";
  const sortDirection = body.dataset.sort === "asc" ? "asc" : "desc";
  const decimals = Number(body.dataset.decimals || 0);
  const minimum = Number(body.dataset.minimum || 0);
  const minimumAliases = (body.dataset.minimumAliases || "").split("|").filter(Boolean);
  const useSecondaryTiebreak = body.dataset.secondaryTiebreak !== "false";
  const ruleText = body.dataset.rule || "第三屆例行賽官方成績";
  const season = "第三屆";
  let currentGroup = "A組";
  let cachedRows = null;
  let cachedHeaders = null;

  const teamLogoRules = [
    ["A", ["戰狼"]],
    ["B", ["神清163", "神清"]],
    ["C", ["遊牧者"]],
    ["D", ["好chill", "好丘"]],
    ["E", ["台中樂天", "樂天"]],
    ["F", ["台中ngu", "ngu"]],
    ["G", ["tcw", "金鋼狼"]],
    ["H", ["創邑", "chungyi"]],
    ["I", ["捷創", "jtron"]],
    ["J", ["安穆"]]
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[\s.．·・_-]/g, "")
      .replace(/棒球隊|科技/g, "");
  }

  function teamLogo(team) {
    const officialTeam = window.CBL_SEASON3?.findTeam(team);
    if (officialTeam) return officialTeam.logo;
    const value = normalize(team);
    const match = teamLogoRules.find((entry) => entry[1].some((alias) => value.includes(normalize(alias))));
    return match ? `assets/teams/${match[0]}.webp` : "assets/season3-main-logo.webp";
  }

  function findKey(headers, aliases, fallback) {
    return aliases.map((alias) => headers.find((header) => header.includes(alias))).find(Boolean) || fallback;
  }

  function normalizeGroup(value) {
    const group = String(value || "").replace(/\s/g, "").toUpperCase();
    if (group === "A" || group === "A組" || group.includes("黑洞")) return "A組";
    if (group === "B" || group === "B組" || group.includes("恆星")) return "B組";
    return "";
  }

  function numeric(value, fallback) {
    const result = Number.parseFloat(String(value || "").replace(/%|,/g, ""));
    return Number.isFinite(result) ? result : fallback;
  }

  function formatValue(value) {
    if (!Number.isFinite(value)) return "-";
    return decimals > 0 ? value.toFixed(decimals) : String(Math.trunc(value));
  }

  function rankRows(rows) {
    let previous = null;
    let currentRank = 0;
    return rows.map((row, index) => {
      if (previous === null || row.__value !== previous) currentRank = index + 1;
      previous = row.__value;
      return { ...row, __rank: currentRank };
    });
  }

  function podiumCard(player, position) {
    if (!player) {
      return `<article class="podium-card rank-${position} is-empty"><span class="podium-position">第 ${position} 名</span><strong class="podium-name">尚待產生</strong><span class="podium-empty">第三屆正式成績發布後自動顯示</span></article>`;
    }
    return `<article class="podium-card rank-${position}">
      <span class="team-logo-medallion"><img src="${teamLogo(player.__team)}" alt="${escapeHtml(player.__team)} LOGO"></span>
      <span class="podium-position">第 ${player.__rank || position} 名</span>
      <strong class="podium-name">${escapeHtml(player.__player)}</strong>
      <span class="podium-team">${escapeHtml(player.__team)}</span>
      <span class="podium-score">${formatValue(player.__value)} <small>${escapeHtml(metric)}</small></span>
    </article>`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showEmpty(title, detail) {
    $("#ranking-podium").innerHTML = [1, 2, 3].map((rank) => podiumCard(null, rank)).join("");
    $("#ranking-table-body").innerHTML = `<tr><td colspan="5"><div class="ranking-empty-state"><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div></div></td></tr>`;
    sendHeight();
  }

  function render() {
    if (!cachedRows || !cachedHeaders) return;
    const headers = cachedHeaders;
    const seasonKey = findKey(headers, ["屆數", "屆別", "賽季"], "屆數");
    const groupKey = findKey(headers, ["組別", "分組"], "");
    const playerKey = findKey(headers, ["姓名"], "背號/姓名");
    const teamKey = findKey(headers, ["隊伍", "球隊"], "隊伍");
    const metricKey = findKey(headers, metricAliases, metricLabel);
    const secondaryKey = findKey(headers, secondaryAliases, "");
    const minimumKey = findKey(headers, minimumAliases, "");
    $("#division-heading").textContent = `${currentGroup === "A組" ? "黑洞組" : "恆星組"}前三名`;

    const seasonRows = cachedRows.filter((row) => String(row[seasonKey] || "").trim() === season);
    if (!seasonRows.length) {
      showEmpty("第三屆成績尚未發布", "資料上線後，黑洞組與恆星組排行榜會在此自動更新。");
      return;
    }
    if (!groupKey) {
      showEmpty("第三屆分組資料尚未完成", "請在官方成績資料中加入「組別」或「分組」欄位後發布。");
      return;
    }

    let rows = seasonRows
      .filter((row) => normalizeGroup(row[groupKey]) === currentGroup)
      .map((row) => ({
        ...row,
        __player: row[playerKey] || "未登錄",
        __team: row[teamKey] || "未登錄球隊",
        __value: numeric(row[metricKey], sortDirection === "asc" ? Number.POSITIVE_INFINITY : 0),
        __secondary: secondaryKey ? row[secondaryKey] : "-",
        __minimum: minimumKey ? numeric(row[minimumKey], 0) : Number.POSITIVE_INFINITY
      }))
      .filter((row) => Number.isFinite(row.__value) && row.__minimum >= minimum);

    if (minimum === 0 && sortDirection === "desc") rows = rows.filter((row) => row.__value > 0);
    rows.sort((a, b) => {
      const difference = sortDirection === "asc" ? a.__value - b.__value : b.__value - a.__value;
      if (difference) return difference;
      if (useSecondaryTiebreak) return numeric(b.__secondary, 0) - numeric(a.__secondary, 0);
      return String(a.__player).localeCompare(String(b.__player), "zh-Hant");
    });
    rows = rankRows(rows).slice(0, 10);

    $("#ranking-podium").innerHTML = [0, 1, 2].map((index) => podiumCard(rows[index], index + 1)).join("");

    if (!rows.length) {
      showEmpty(`${currentGroup === "A組" ? "黑洞組" : "恆星組"}尚無符合資格的成績`, "正式成績達到入選標準後，排行榜將自動產生。");
      return;
    }

    $("#ranking-table-body").innerHTML = rows.map((player) => `<tr class="${player.__rank <= 3 ? `top-row rank-${player.__rank}` : ""}">
      <td>${player.__rank}</td>
      <td>${escapeHtml(player.__player)}</td>
      <td>${escapeHtml(player.__team)}</td>
      <td>${escapeHtml(player.__secondary)}</td>
      <td>${formatValue(player.__value)}</td>
    </tr>`).join("");
    sendHeight();
  }

  async function load() {
    try {
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const officialData = await response.json();
      const dataset = officialData.datasets?.[playerType];
      if (!dataset || !Array.isArray(dataset.rows) || !Array.isArray(dataset.headers)) throw new Error("官網正式資料格式不完整");
      cachedRows = dataset.rows;
      cachedHeaders = dataset.headers;
      const updatedAt = officialData.meta?.generatedAt ? new Date(officialData.meta.generatedAt) : null;
      $("#ranking-updated").textContent = updatedAt && !Number.isNaN(updatedAt.getTime())
        ? `資料更新：${new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }).format(updatedAt)}`
        : "依聯盟公告更新";
      render();
    } catch (error) {
      console.error("CBL leaderboard load failed", error);
      showEmpty("排行榜暫時無法載入", "請稍後重新整理頁面，正式資料仍以聯盟公告為準。");
    }
  }

  function sendHeight() {
    requestAnimationFrame(() => {
      window.parent.postMessage({ type: "cbl-ranking-height", height: document.documentElement.scrollHeight }, "*");
    });
  }

  $$(".division-tab").forEach((button) => {
    button.addEventListener("click", () => {
      currentGroup = button.dataset.group;
      $$(".division-tab").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      body.dataset.division = currentGroup === "B組" ? "stellar" : "black-hole";
      render();
    });
  });

  $("#ranking-rule").textContent = ruleText;
  $("#secondary-heading").textContent = secondaryLabel;
  $("#metric-heading").textContent = metricLabel;
  $("#division-heading").textContent = "黑洞組前三名";
  window.addEventListener("resize", sendHeight);
  load();
  setInterval(load, 300000);
})();
