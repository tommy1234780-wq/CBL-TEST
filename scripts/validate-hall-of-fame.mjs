import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "assets", "hall-of-fame-data.js");
const htmlPath = path.join(root, "CBL名人堂.html");
const publicFiles = [
  dataPath,
  htmlPath,
  path.join(root, "assets", "hall-of-fame.js"),
  path.join(root, "assets", "hall-of-fame.css")
];
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(dataPath, "utf8"), context, { filename: dataPath });

const hall = context.window.CBL_HALL_OF_FAME;
const errors = [];
const expect = (condition, message) => { if (!condition) errors.push(message); };
const season1 = hall?.seasons?.["1"];
const season2 = hall?.seasons?.["2"];

expect(hall?.defaultSeason === "2", "名人堂預設屆別必須為第二屆。");
expect(Boolean(season1), "第一屆歷史資料不可遺失。");
expect(Boolean(season2), "第二屆正式資料尚未建立。");
expect(season2?.awardCount === 12, `第二屆應有 12 項獎項，目前為 ${season2?.awardCount ?? 0}。`);
expect(season2?.playerCount === 11, `第二屆應有 11 位得獎球員，目前為 ${season2?.playerCount ?? 0}。`);
expect(season2?.highlights?.length === 2, `第二屆年度榮耀應有 2 項，目前為 ${season2?.highlights?.length ?? 0}。`);
expect(season2?.hitting?.length === 7, `第二屆打者得獎紀錄應有 7 筆，目前為 ${season2?.hitting?.length ?? 0}。`);
expect(season2?.pitching?.length === 5, `第二屆投手得獎紀錄應有 5 筆，目前為 ${season2?.pitching?.length ?? 0}。`);

const highlights = season2?.highlights || [];
expect(highlights.some((item) => item.award === "年度 MVP" && item.player === "林銘孝" && item.team === "安穆科技"), "年度 MVP 資料不正確。");
expect(highlights.some((item) => item.award === "人氣王" && item.player === "張智翔" && item.team === "樂天"), "人氣王資料不正確。");

const secondSeasonRecords = [
  ...(season2?.highlights || []),
  ...(season2?.hitting || []).flatMap((item) => item.winners || []),
  ...(season2?.pitching || []).flatMap((item) => item.winners || [])
];
const uniquePlayers = new Set(secondSeasonRecords.map((item) => item.player || item.name));
expect(uniquePlayers.size === 11, `第二屆得獎球員去重後應為 11 位，目前為 ${uniquePlayers.size} 位。`);

for (const record of secondSeasonRecords) {
  for (const key of ["photo", "logo"]) {
    const asset = record[key];
    expect(Boolean(asset), `${record.player || record.name} 缺少 ${key}。`);
    if (asset) expect(fs.existsSync(path.join(root, asset)), `${record.player || record.name} 的 ${asset} 不存在。`);
  }
}

const publicText = publicFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const forbidden of ["71.12", "34張", "34 張", "第一名票", "待聯盟核准"]) {
  expect(!publicText.includes(forbidden), `公開名人堂不可包含「${forbidden}」。`);
}

const html = fs.readFileSync(htmlPath, "utf8");
expect(html.includes('data-season="1"'), "第一屆切換按鈕遺失。");
expect(html.includes('data-season="2"'), "第二屆切換按鈕遺失。");
expect(html.includes("hall-of-fame-data.js?v=20261014-s2hof1"), "名人堂資料版本未鎖定。");

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  defaultSeason: hall.defaultSeason,
  season1Awards: season1.awardCount,
  season2Awards: season2.awardCount,
  season2WinnerRecords: secondSeasonRecords.length,
  season2UniquePlayers: uniquePlayers.size,
  privateVoteDetailsExposed: false
}, null, 2));
