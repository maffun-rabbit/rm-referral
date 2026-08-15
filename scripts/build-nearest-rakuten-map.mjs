import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

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

function radians(value) {
  return value * Math.PI / 180;
}

function distanceKm(from, to) {
  const deltaLatitude = radians(to.latitude - from.latitude);
  const deltaLongitude = radians(to.longitude - from.longitude);
  const a = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const [carrierText, rakutenText] = await Promise.all([
  readFile(path.join(root, "data", "carrier-shops-geocoded.csv"), "utf8"),
  readFile(path.join(root, "data", "rakuten-shops-geocoded.csv"), "utf8"),
]);
const carrierShops = parseCsv(carrierText);
const rakutenShops = parseCsv(rakutenText).map((shop) => ({
  ...shop,
  latitude: Number(shop.緯度),
  longitude: Number(shop.経度),
}));

const headers = [
  "キャリア", "地域", "都道府県", "店名", "住所", "URL", "緯度", "経度",
  "最寄り楽天店舗", "楽天店舗住所", "楽天店舗URL", "楽天店舗コード", "楽天店舗緯度", "楽天店舗経度",
  "直線距離km", "Googleマップ経路URL", "地図埋め込みURL", "取得結果",
];

const rows = carrierShops.map((shop) => {
  const source = { latitude: Number(shop.緯度), longitude: Number(shop.経度) };
  if (shop.取得結果 !== "ok" || !shop.緯度 || !shop.経度
    || !Number.isFinite(source.latitude) || !Number.isFinite(source.longitude)) {
    return [shop.キャリア, shop.地域, shop.都道府県, shop.店名, shop.住所, shop.URL, shop.緯度, shop.経度,
      "", "", "", "", "", "", "", "", "", shop.取得結果 === "ok" ? "coordinates missing" : shop.取得結果];
  }
  const nearest = rakutenShops
    .map((candidate) => ({ ...candidate, distance: distanceKm(source, candidate) }))
    .sort((a, b) => a.distance - b.distance)[0];
  const destination = `${nearest.latitude},${nearest.longitude}`;
  const directions = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(shop.住所)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&z=15&output=embed`;
  return [
    shop.キャリア, shop.地域, shop.都道府県, shop.店名, shop.住所, shop.URL, shop.緯度, shop.経度,
    nearest.店名, nearest.住所, nearest.URL, nearest.店舗コード, nearest.緯度, nearest.経度,
    nearest.distance.toFixed(3), directions, embed, "ok",
  ];
});

await writeFile(path.join(root, "data", "carrier-to-nearest-rakuten.csv"), toCsv(headers, rows));
console.log(`Mapped ${rows.filter((row) => row.at(-1) === "ok").length}/${rows.length} carrier shops.`);
