import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const context = vm.createContext({ window: {} });

for (const file of ["assets/season3-data.js", "assets/season3-schedule-data.js", "assets/season3-results-data.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const league = context.window.CBL_SEASON3;
const schedule = context.window.CBL_SEASON3_SCHEDULE;
const results = context.window.CBL_SEASON3_RESULTS;
const errors = [];
const expect = (condition, message) => { if (!condition) errors.push(message); };

expect(league?.teams?.length === 12, `第三屆正式球隊應為 12 隊，目前為 ${league?.teams?.length ?? 0} 隊。`);
expect(schedule?.games?.length === 36, `上半季賽程應為 36 場，目前為 ${schedule?.games?.length ?? 0} 場。`);

const teamIds = new Set(league.teams.map((team) => team.id));
const gameIds = new Set();
const dates = new Map();
const divisionCounts = { "black-hole": 0, stellar: 0, crossover: 0 };
const regularCounts = Object.fromEntries(league.teams.map((team) => [team.id, 0]));

for (const game of schedule.games) {
  expect(/^S3-\d{3}$/.test(game.id), `場次 ID 格式錯誤：${game.id}`);
  expect(!gameIds.has(game.id), `場次 ID 重複：${game.id}`);
  gameIds.add(game.id);
  expect(/^\d{4}-\d{2}-\d{2}$/.test(game.date), `${game.id} 日期格式錯誤。`);
  expect(/^\d{2}:\d{2}$/.test(game.time), `${game.id} 時間格式錯誤。`);
  expect([1, 2, 3].includes(Number(game.slot)), `${game.id} 場次序號錯誤。`);
  expect(Object.hasOwn(divisionCounts, game.division), `${game.id} 組別錯誤。`);
  if (Object.hasOwn(divisionCounts, game.division)) divisionCounts[game.division] += 1;
  const day = dates.get(game.date) || [];
  day.push(game);
  dates.set(game.date, day);

  if (game.division === "crossover") {
    expect(Boolean(game.leftSeed && game.rightSeed), `${game.id} 跨組交流席位未定義。`);
  } else {
    expect(teamIds.has(game.away), `${game.id} 客隊不在正式名單。`);
    expect(teamIds.has(game.home), `${game.id} 主隊不在正式名單。`);
    if (teamIds.has(game.away)) regularCounts[game.away] += 1;
    if (teamIds.has(game.home)) regularCounts[game.home] += 1;
  }
}

expect(divisionCounts["black-hole"] === 15, `黑洞組應為 15 場，目前為 ${divisionCounts["black-hole"]} 場。`);
expect(divisionCounts.stellar === 15, `恆星組應為 15 場，目前為 ${divisionCounts.stellar} 場。`);
expect(divisionCounts.crossover === 6, `跨組交流應為 6 場，目前為 ${divisionCounts.crossover} 場。`);
expect(dates.size === 12, `比賽日應為 12 日，目前為 ${dates.size} 日。`);

for (const [date, games] of dates) {
  expect(games.length === 3, `${date} 應為 3 場，目前為 ${games.length} 場。`);
  expect(new Set(games.map((game) => game.id)).size === games.length, `${date} 含重複場次。`);
  expect(new Set(games.map((game) => game.slot)).size === games.length, `${date} 場次序號重複。`);
  expect(new Set(games.map((game) => game.time)).size === games.length, `${date} 開賽時間重複。`);
}

for (const [teamId, count] of Object.entries(regularCounts)) {
  expect(count === 5, `${teamId} 分組循環賽應為 5 場，目前為 ${count} 場。`);
}

for (const resultId of Object.keys(results.gameResults || {})) {
  expect(gameIds.has(resultId), `賽果包含不存在的場次：${resultId}`);
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  teams: league.teams.length,
  games: schedule.games.length,
  dates: dates.size,
  divisions: divisionCounts,
  confirmedResults: Number(results.confirmedGames || 0),
  scheduleUpdatedAt: schedule.updatedAt
}, null, 2));
