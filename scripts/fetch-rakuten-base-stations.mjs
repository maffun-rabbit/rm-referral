import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourcePage = "https://network.mobile.rakuten.co.jp/area/saikyo-plan-project/";
const html = await fetch(sourcePage).then((response) => {
  if (!response.ok) throw new Error(`Official area page returned ${response.status}`);
  return response.text();
});
const bundlePath = html.match(/src="([^"]*area\.saikyo-plan-project\.bundle\.js\?\d+)"/)?.[1];
if (!bundlePath) throw new Error("Could not locate the official base-station data bundle");
const bundle = await fetch(new URL(bundlePath, sourcePage)).then((response) => response.text());
const jsonPaths = [...bundle.matchAll(/"(\/assets\/json\/area-project-[0-9-]+\.json)"/g)].map((match) => match[1]);
if (jsonPaths.length < 2) throw new Error("Expected at least two official base-station data files");

const periods = [];
for (const jsonPath of jsonPaths.slice(0, 2)) {
  const rows = await fetch(new URL(jsonPath, sourcePage)).then((response) => {
    if (!response.ok) throw new Error(`${jsonPath} returned ${response.status}`);
    return response.json();
  });
  periods.push({ sourceUrl: new URL(jsonPath, sourcePage).href, rows });
}

const latestUpdate = html.match(/(\d{4}年\d{1,2}月\d{1,2}日)更新/)?.[1] ?? "";
const payload = {
  sourcePage,
  sourceName: "楽天モバイル公式「Rakuten最強プランプロジェクト進行中！」",
  fetchedAt: new Date().toISOString(),
  latestUpdate,
  periods,
};
await mkdir(path.join(root, "data"), { recursive: true });
await writeFile(path.join(root, "data", "rakuten-base-stations.json"), `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Saved ${periods.reduce((sum, period) => sum + period.rows.length, 0)} official base-station records from ${periods.length} periods.`);
