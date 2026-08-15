import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = path.resolve(root, "..", "キャリアショップ一覧_マージ済み.csv");
const nationwideCoordinatesPath = path.join(root, "data", "carrier-shops-geocoded.csv");

const prefectures = {
  青森県: { slug: "aomori", region: "東北", auRegionPage: "tohoku" },
  岩手県: { slug: "iwate", region: "東北", auRegionPage: "tohoku" },
  宮城県: { slug: "miyagi", region: "東北", auRegionPage: "tohoku" },
};

const prefectureArg = process.argv.find((arg) => arg.startsWith("--prefecture="));
const prefecture = prefectureArg?.slice("--prefecture=".length);
const config = prefectures[prefecture];
if (!config) throw new Error(`Unsupported prefecture: ${prefecture ?? "not specified"}`);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
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

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function fetchAuShops() {
  const listUrl = `https://www.au.com/storelocator/${config.auRegionPage}/`;
  const response = await fetch(listUrl);
  if (!response.ok) throw new Error(`au list returned ${response.status}`);
  const html = await response.text();
  const heading = `<h3 class="heading-ttl">${prefecture}</h3>`;
  const start = html.indexOf(heading);
  if (start < 0) throw new Error(`${prefecture} section was not found on ${listUrl}`);
  const end = html.indexOf('<h3 class="heading-ttl">', start + heading.length);
  const section = html.slice(start, end < 0 ? undefined : end);
  const links = [...section.matchAll(/href="(https:\/\/www\.au\.com\/storelocator\/detail\/\?shopId=([^"]+))"[^>]*>([^<]+)<\/a>/g)]
    .map((match) => ({ url: decodeHtml(match[1]), shopId: match[2], name: decodeHtml(match[3]).trim() }))
    .filter((shop) => shop.name.startsWith("au Style") || shop.name.startsWith("ａｕショップ"));
  if (!links.length) throw new Error(`No au Style/au shop links found for ${prefecture}`);

  return Promise.all(links.map(async (shop) => {
    const detailUrl = `https://www.au.com/bin/wcm/au-com/storelocator.json?shopId=${encodeURIComponent(shop.shopId)}&locale=ja`;
    const detailResponse = await fetch(detailUrl);
    if (!detailResponse.ok) throw new Error(`${shop.name}: au API returned ${detailResponse.status}`);
    const detail = await detailResponse.json();
    return {
      キャリア: "au",
      地域: config.region,
      都道府県: prefecture,
      店名: detail.storeNameDisp || shop.name.replace(/^ａｕ/, "au"),
      住所: `${detail.zipCode} ${detail.address1}${detail.address2}${detail.address3}`,
      URL: shop.url,
      緯度: detail.latitude,
      経度: detail.longitude,
      取得結果: "ok",
    };
  }));
}

const [sourceText, coordinateText, auShops] = await Promise.all([
  readFile(sourcePath, "utf8"),
  readFile(nationwideCoordinatesPath, "utf8"),
  fetchAuShops(),
]);
const coordinatesByUrl = new Map(parseCsv(coordinateText).map((shop) => [shop.URL, shop]));
const otherShops = parseCsv(sourceText)
  .filter((shop) => shop.都道府県 === prefecture && ["docomo", "softbank"].includes(shop.キャリア))
  .map((shop) => {
    const coordinates = coordinatesByUrl.get(shop.URL);
    if (!coordinates || coordinates.取得結果 !== "ok") throw new Error(`Coordinates missing for ${shop.店名}`);
    return { ...shop, 緯度: coordinates.緯度, 経度: coordinates.経度, 取得結果: "ok" };
  });

const carrierOrder = { au: 0, docomo: 1, softbank: 2 };
const shops = [...auShops, ...otherShops].sort((a, b) =>
  carrierOrder[a.キャリア] - carrierOrder[b.キャリア] || a.店名.localeCompare(b.店名, "ja"));
const baseHeaders = ["キャリア", "地域", "都道府県", "店名", "住所", "URL"];
const geocodedHeaders = [...baseHeaders, "緯度", "経度", "取得結果"];

await writeFile(path.join(root, "data", `${config.slug}-shops.csv`), toCsv(baseHeaders, shops.map((shop) => baseHeaders.map((header) => shop[header]))));
await writeFile(path.join(root, "data", `${config.slug}-carrier-shops-geocoded.csv`), toCsv(geocodedHeaders, shops.map((shop) => geocodedHeaders.map((header) => shop[header]))));

const counts = Object.fromEntries(Object.keys(carrierOrder).map((carrier) => [carrier, shops.filter((shop) => shop.キャリア === carrier).length]));
console.log(`Wrote ${shops.length} ${prefecture} shops: ${JSON.stringify(counts)}`);
