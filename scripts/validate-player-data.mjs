import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "assets", "data", "player-stats.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

check(data.meta?.schemaVersion === 1, "schemaVersion must be 1");
check(Array.isArray(data.players), "players must be an array");
check(data.datasets?.hitter && data.datasets?.pitcher, "hitter and pitcher datasets are required");

const playerIds = data.players.map((player) => player.id);
const playerIdSet = new Set(playerIds);
check(playerIds.length === playerIdSet.size, "permanent player IDs must be unique");
check(data.meta?.counts?.players === playerIds.length, "player count does not match metadata");

for (const type of ["hitter", "pitcher"]) {
  const dataset = data.datasets[type];
  check(Array.isArray(dataset.headers), `${type} headers must be an array`);
  check(Array.isArray(dataset.rows), `${type} rows must be an array`);
  check(Array.isArray(dataset.careerRows), `${type} careerRows must be an array`);
  check(dataset.headers.includes("球員ID"), `${type} headers must include permanent player ID`);
  check(dataset.headers.includes("姓名"), `${type} headers must include player name`);
  if (type === "hitter") check(dataset.headers.includes("捕手阻殺"), "hitter headers must include catcher caught-stealing totals");
  if (type === "pitcher") check(dataset.headers.includes("投球數"), "pitcher headers must include pitch totals");

  const seasonKeys = new Set();
  for (const row of dataset.rows) {
    check(playerIdSet.has(row["球員ID"]), `${type} row uses unknown player ID: ${row["球員ID"]}`);
    const player = data.players.find((item) => item.id === row["球員ID"]);
    check(player?.name === row["姓名"], `${type} row name does not match master: ${row["球員ID"]}`);
    const key = `${row["屆數"]}|${row["隊伍"]}|${row["球員ID"]}`;
    check(!seasonKeys.has(key), `${type} duplicate season row: ${key}`);
    seasonKeys.add(key);
  }

  const careerIds = dataset.careerRows.map((row) => row["球員ID"]);
  check(careerIds.length === new Set(careerIds).size, `${type} career rows must be unique by player ID`);
  check(data.meta.counts[`${type}SeasonRows`] === dataset.rows.length, `${type} season count does not match metadata`);
  check(data.meta.counts[`${type}CareerRows`] === dataset.careerRows.length, `${type} career count does not match metadata`);
}

const sameNamePlayers = data.players.filter((player) => player.name === "林威廷");
check(sameNamePlayers.length === 3, "same-name regression fixture must contain three 林威廷 records");
check(new Set(sameNamePlayers.map((player) => player.id)).size === 3, "same-name players must retain distinct permanent IDs");

const deprecatedGoodChillNames = new Set(["好丘", "好丘棒球隊", "好CHILL棒球隊", "好Chill", "好chill"]);
const teamValues = data.players.flatMap((player) => [
  player.currentTeam,
  ...Object.values(player.teams || {}),
]);
for (const type of ["hitter", "pitcher"]) {
  for (const row of [...data.datasets[type].rows, ...data.datasets[type].careerRows]) {
    teamValues.push(row["隊伍"]);
  }
}
check(!teamValues.some((team) => deprecatedGoodChillNames.has(String(team || ""))), "好丘／好CHILL legacy team names must be canonicalized");
check(teamValues.some((team) => team === "好CHILL"), "canonical 好CHILL team data must be present");

const sourceFiles = [
  "assets/player-data-shell.js",
  "assets/leaderboard.js",
  "數據統計.html",
  "打擊率排行榜.html",
  "全壘打排行榜.html",
  "打點排行榜.html",
  "安打排行榜.html",
  "盜壘排行榜.html",
  "阻殺王排行榜.html",
  "防禦率排行榜.html",
  "勝投排行榜.html",
  "三振排行榜.html",
  "中繼排行榜.html",
  "救援排行榜.html",
  "金臂王排行榜.html",
];
for (const relative of sourceFiles) {
  const contents = fs.readFileSync(path.join(root, relative), "utf8");
  check(!contents.includes("docs.google.com/spreadsheets"), `${relative} still reads a published Google Sheet directly`);
}

const hitterRankingShell = fs.readFileSync(path.join(root, "打者排行榜.html"), "utf8");
const pitcherRankingShell = fs.readFileSync(path.join(root, "投手排行榜.html"), "utf8");
check(hitterRankingShell.includes('data-ranking-page="阻殺王排行榜.html"'), "hitter ranking shell must include 阻殺王");
check(pitcherRankingShell.includes('data-ranking-page="金臂王排行榜.html"'), "pitcher ranking shell must include 金臂王");

const catcherAwardPage = fs.readFileSync(path.join(root, "阻殺王排行榜.html"), "utf8");
const goldenArmPage = fs.readFileSync(path.join(root, "金臂王排行榜.html"), "utf8");
check(catcherAwardPage.includes('data-player-type="hitter"'), "阻殺王 must use hitter/fielding data");
check(catcherAwardPage.includes('data-metric-aliases="捕手阻殺|阻殺"'), "阻殺王 must rank by 捕手阻殺");
check(goldenArmPage.includes('data-player-type="pitcher"'), "金臂王 must use pitcher data");
check(goldenArmPage.includes('data-metric-aliases="投球數|用球數|PITCHES"'), "金臂王 must rank by 投球數");
check(catcherAwardPage.includes('data-secondary-tiebreak="false"'), "阻殺王 must not invent a secondary award tiebreak");
check(goldenArmPage.includes('data-secondary-tiebreak="false"'), "金臂王 must not invent a secondary award tiebreak");

if (failures.length) {
  console.error(`Player data validation failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "PASS",
  generatedAt: data.meta.generatedAt,
  counts: data.meta.counts,
  sameNameRegression: sameNamePlayers.map((player) => ({ id: player.id, name: player.name, team: player.currentTeam })),
}, null, 2));
