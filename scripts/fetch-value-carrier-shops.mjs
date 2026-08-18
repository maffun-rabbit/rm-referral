import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(root, "data", "value-carrier-shops-geocoded.csv");
const UQ_DATA_URL = "https://www.uqwimax.jp/mobile/shoplist/shoplist.json";
const YMOBILE_API_URL = "https://www.ymobile.jp/shop/api_json.php";
const AEON_DATA_URL = "https://aeonmobile.jp/shoplist/data.json";

const prefectures = ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"];
const regionByPrefecture = new Map(Object.entries({
  北海道: ["北海道"], 東北: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  関東: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  甲信越: ["新潟県", "山梨県", "長野県"], 北陸: ["富山県", "石川県", "福井県"],
  東海: ["岐阜県", "静岡県", "愛知県", "三重県"], 近畿: ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  中国: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"], 四国: ["徳島県", "香川県", "愛媛県", "高知県"],
  九州: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県"], 沖縄: ["沖縄県"],
}).flatMap(([region, values]) => values.map((prefecture) => [prefecture, region])));

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function toCsv(headers, rows) {
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}
function normalizeSpace(value) {
  return String(value ?? "").replace(/[\s　]+/g, " ").trim();
}
function aeonSlug(url) {
  const pathname = new URL(url).pathname.replace(/\/$/, "");
  return `aeon-mobile-${pathname.split("/").at(-1).toLowerCase().replace(/[^a-z0-9-]/g, "")}`;
}
async function getJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

const uqData = await getJson(UQ_DATA_URL);
const uqShops = uqData.filter((shop) => shop.shopcat === "B1").map((shop) => ({
  carrier: "uqmobile", prefecture: shop.pref, name: normalizeSpace(shop.title),
  address: normalizeSpace(shop.address), url: `https://www.uqwimax.jp${shop.url}/`,
  slug: `uq-mobile-${shop.no.toLowerCase()}`, latitude: Number(shop.yaxis), longitude: Number(shop.xaxis),
  source: UQ_DATA_URL,
}));

const ymobileResponses = [];
for (const prefecture of prefectures) {
  const url = `${YMOBILE_API_URL}?pref=${encodeURIComponent(prefecture)}&advanced_search_flag=1`;
  const data = await getJson(url);
  ymobileResponses.push(...data.shop_data.filter((shop) => String(shop.shop_w_code).startsWith("W") || shop.shop_name.startsWith("ワイモバイル")));
}
const ymobileShops = [...new Map(ymobileResponses.map((shop) => [shop.shop_w_code, shop])).values()].map((shop) => ({
  carrier: "ymobile", prefecture: shop.todofuken_j_name, name: normalizeSpace(shop.shop_name),
  address: `${shop.post} ${shop.todofuken_j_name}${normalizeSpace(shop.shi_gun_shima_mei)}${normalizeSpace(shop.other_address)}`,
  url: shop.url || `https://www.ymobile.jp/shop/detail/${shop.shop_w_code}/`,
  slug: `ymobile-${shop.shop_w_code.toLowerCase()}`, latitude: Number(shop.lat), longitude: Number(shop.lon),
  source: YMOBILE_API_URL,
}));

const aeonData = (await getJson(AEON_DATA_URL)).data;
const aeonCandidates = aeonData.filter((shop) => shop.entry === 0 && shop.agency === 0);
let aeonCursor = 0;
const aeonShops = new Array(aeonCandidates.length);
async function aeonWorker() {
  while (aeonCursor < aeonCandidates.length) {
    const index = aeonCursor++;
    const shop = aeonCandidates[index];
    const response = await fetch(shop.link);
    if (!response.ok) throw new Error(`${shop.link} returned ${response.status}`);
    const html = await response.text();
    const coordinates = html.match(/!2d(1[2-5][0-9]\.[0-9]+)!3d([2-4][0-9]\.[0-9]+)/);
    if (!coordinates) throw new Error(`Coordinates missing: ${shop.title}`);
    aeonShops[index] = {
      carrier: "aeonmobile", prefecture: shop.pref, name: normalizeSpace(shop.title),
      address: `${normalizeSpace(shop.postcode).replaceAll(" ", "")} ${normalizeSpace(shop.address)}`,
      url: shop.link, slug: aeonSlug(shop.link), latitude: Number(coordinates[2]), longitude: Number(coordinates[1]),
      source: AEON_DATA_URL,
    };
  }
}
await Promise.all(Array.from({ length: 8 }, aeonWorker));

const allShops = [...uqShops, ...ymobileShops, ...aeonShops]
  .sort((a, b) => a.prefecture.localeCompare(b.prefecture, "ja") || a.carrier.localeCompare(b.carrier) || a.name.localeCompare(b.name, "ja"));
const duplicateSlug = allShops.find((shop, index) => allShops.findIndex((item) => item.slug === shop.slug) !== index);
if (duplicateSlug) throw new Error(`Duplicate slug: ${duplicateSlug.slug}`);
const invalid = allShops.find((shop) => !prefectures.includes(shop.prefecture) || !Number.isFinite(shop.latitude) || !Number.isFinite(shop.longitude));
if (invalid) throw new Error(`Invalid shop record: ${JSON.stringify(invalid)}`);

const fetchedOn = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
const headers = ["キャリア", "地域", "都道府県", "店名", "住所", "URL", "スラッグ", "緯度", "経度", "取得元", "取得日"];
const rows = allShops.map((shop) => [shop.carrier, regionByPrefecture.get(shop.prefecture), shop.prefecture, shop.name, shop.address, shop.url, shop.slug, shop.latitude, shop.longitude, shop.source, fetchedOn]);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, toCsv(headers, rows));
console.log(`Wrote ${allShops.length} shops: UQ mobile ${uqShops.length}, Y!mobile ${ymobileShops.length}, AEON Mobile ${aeonShops.length}.`);
