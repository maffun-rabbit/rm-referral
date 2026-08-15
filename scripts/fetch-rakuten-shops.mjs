import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API_URL = "https://network.mobile.rakuten.co.jp/shopmaster-public/v1/shops";
const SHOP_DETAIL_BASE = "https://network.mobile.rakuten.co.jp/shop-detail";
const root = path.resolve(import.meta.dirname, "..");
const dataDir = path.join(root, "data");
const inputArg = process.argv.find((arg) => arg.startsWith("--input="));

const regionByPrefecture = new Map(
  Object.entries({
    北海道: ["北海道"],
    東北: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
    関東: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
    甲信越: ["新潟県", "山梨県", "長野県"],
    北陸: ["富山県", "石川県", "福井県"],
    東海: ["岐阜県", "静岡県", "愛知県", "三重県"],
    近畿: ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
    中国: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
    四国: ["徳島県", "香川県", "愛媛県", "高知県"],
    九州: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県"],
    沖縄: ["沖縄県"],
  }).flatMap(([region, prefectures]) => prefectures.map((prefecture) => [prefecture, region])),
);

function parseDate(value) {
  if (!value) return null;
  return new Date(value.replace(" ", "T") + "+09:00");
}

function isPublished(shop, now = new Date()) {
  const start = parseDate(shop.announcement_info?.publication_start_datetime);
  const end = parseDate(shop.announcement_info?.publication_end_datetime);
  return Boolean(start && start <= now && (!end || now <= end));
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(headers, rows) {
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function fullAddress(shop) {
  const location = shop.location;
  const street = `${location.prefecture}${location.city}${location.address}`;
  const building = location.building_name ? ` ${location.building_name}` : "";
  return `${location.zip_code} ${street}${building}`.trim();
}

async function loadShops() {
  if (inputArg) {
    const inputPath = inputArg.slice("--input=".length);
    return JSON.parse(await readFile(inputPath, "utf8"));
  }
  const response = await fetch(API_URL, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Rakuten shop API returned ${response.status}`);
  return response.json();
}

const rawShops = await loadShops();
const shops = rawShops
  .filter((shop) => isPublished(shop))
  .sort((a, b) => {
    const prefecture = a.location.prefecture.localeCompare(b.location.prefecture, "ja");
    return prefecture || a.name.localeCompare(b.name, "ja");
  });

const compatibleHeaders = ["キャリア", "地域", "都道府県", "店名", "住所", "URL"];
const compatibleRows = shops.map((shop) => [
  "rakuten",
  regionByPrefecture.get(shop.location.prefecture) ?? "",
  shop.location.prefecture,
  shop.name,
  fullAddress(shop),
  `${SHOP_DETAIL_BASE}/${shop.code}/`,
]);

const geocodedHeaders = [...compatibleHeaders, "店舗コード", "緯度", "経度", "取得元", "取得日"];
const fetchedOn = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
const geocodedRows = shops.map((shop, index) => [
  ...compatibleRows[index],
  shop.code,
  shop.location.latitude,
  shop.location.longitude,
  API_URL,
  fetchedOn,
]);

await mkdir(dataDir, { recursive: true });
await writeFile(path.join(dataDir, "rakuten-shops.csv"), toCsv(compatibleHeaders, compatibleRows));
await writeFile(path.join(dataDir, "rakuten-shops-geocoded.csv"), toCsv(geocodedHeaders, geocodedRows));

console.log(`Wrote ${shops.length} published Rakuten Mobile shops (${rawShops.length} API records).`);
