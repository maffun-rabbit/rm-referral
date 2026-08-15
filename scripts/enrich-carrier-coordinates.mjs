import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = path.resolve(root, "..", "キャリアショップ一覧_マージ済み.csv");
const outputPath = path.join(root, "data", "carrier-shops-geocoded.csv");
const prefectureArg = process.argv.find((arg) => arg.startsWith("--prefecture="));
const prefectureFilter = prefectureArg?.slice("--prefecture=".length) ?? null;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift().map((value) => value.replace(/^\uFEFF/, ""));
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(headers, rows) {
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function valueFrom(text, pattern, label) {
  const match = text.match(pattern);
  if (!match) throw new Error(`${label} was not found`);
  return match[1];
}

async function fetchCoordinates(shop) {
  if (shop.キャリア === "au") {
    const shopId = new URL(shop.URL).searchParams.get("shopId");
    const url = `https://www.au.com/bin/wcm/au-com/storelocator.json?shopId=${encodeURIComponent(shopId)}&locale=ja`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`au API ${response.status}`);
    const data = await response.json();
    return { latitude: data.latitude, longitude: data.longitude };
  }

  let html;
  if (shop.キャリア === "docomo") {
    // The Docomo endpoint still requires TLS legacy renegotiation, which
    // Node's built-in fetch rejects. curl supports the endpoint safely here.
    const result = await execFileAsync("curl", ["-L", "--silent", "--show-error", shop.URL], {
      maxBuffer: 2 * 1024 * 1024,
    });
    html = result.stdout;
  } else {
    const response = await fetch(shop.URL);
    if (!response.ok) throw new Error(`${shop.キャリア} page ${response.status}`);
    html = await response.text();
  }
  if (shop.キャリア === "docomo") {
    return {
      latitude: valueFrom(html, /data-lat="([0-9.]+)"/, "docomo latitude"),
      longitude: valueFrom(html, /data-lng="([0-9.]+)"/, "docomo longitude"),
    };
  }
  return {
    latitude: valueFrom(html, /place:location:latitude"\s+content="([0-9.]+)"/, "SoftBank latitude"),
    longitude: valueFrom(html, /place:location:longitude"\s+content="([0-9.]+)"/, "SoftBank longitude"),
  };
}

const shops = parseCsv(await readFile(sourcePath, "utf8"))
  .filter((shop) => !prefectureFilter || shop.都道府県 === prefectureFilter);
const results = new Array(shops.length);
let cursor = 0;
let completed = 0;

async function worker() {
  while (cursor < shops.length) {
    const index = cursor;
    cursor += 1;
    const shop = shops[index];
    try {
      const coordinates = await fetchCoordinates(shop);
      results[index] = { ...shop, ...coordinates, status: "ok" };
    } catch (error) {
      results[index] = { ...shop, latitude: "", longitude: "", status: error.message };
    }
    completed += 1;
    if (completed % 50 === 0 || completed === shops.length) {
      console.log(`${completed}/${shops.length}`);
    }
  }
}

await Promise.all(Array.from({ length: 6 }, worker));
const headers = ["キャリア", "地域", "都道府県", "店名", "住所", "URL", "緯度", "経度", "取得結果"];
const rows = results.map((shop) => [
  shop.キャリア,
  shop.地域,
  shop.都道府県,
  shop.店名,
  shop.住所,
  shop.URL,
  shop.latitude,
  shop.longitude,
  shop.status,
]);
await writeFile(outputPath, toCsv(headers, rows));

const failed = results.filter((shop) => shop.status !== "ok");
console.log(`Wrote ${results.length} shops to ${outputPath}; ${failed.length} failed.`);
