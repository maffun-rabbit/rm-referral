import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const toolsRoot = process.env.RM_SLUG_TOOLS ?? "/private/tmp/rm-slug-tools/node_modules";
const { default: kuroshiroModule } = await import(path.join(toolsRoot, "kuroshiro/lib/index.js"));
const { default: KuromojiAnalyzer } = await import(path.join(toolsRoot, "kuroshiro-analyzer-kuromoji/lib/index.js"));
const Kuroshiro = kuroshiroModule.default ?? kuroshiroModule;
const converter = new Kuroshiro();
await converter.init(new KuromojiAnalyzer({ dictPath: path.join(toolsRoot, "kuromoji/dict") }));

function parseCsvRows(text) {
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
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function shopId(shop) {
  try {
    const url = new URL(shop.URL);
    const queryId = url.searchParams.get("shopId");
    if (queryId) return queryId.toLowerCase();
    const detail = url.pathname.match(/shop_detail\/([^/]+)/);
    if (detail) return detail[1].toLowerCase();
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length) return segments.at(-1).replace(/\.html$/, "").toLowerCase();
  } catch {}
  return createHash("sha1").update(`${shop.店名}|${shop.住所}`).digest("hex").slice(0, 8);
}

function localityFrom(shop) {
  const address = shop.住所.replace(/^\d{3}-\d{4}\s*/, "").replace(shop.都道府県, "");
  const designatedCity = address.match(/^(.+?市[一-龯々ぁ-んァ-ヶー]{1,8}区)/);
  const city = address.match(/^(.+?市)/);
  const tokyoWard = shop.都道府県 === "東京都" ? address.match(/^([^0-9０-９\s]+?区)/) : null;
  const district = address.match(/^(.+?郡.+?[町村])/);
  const townOrVillage = address.match(/^(.+?[町村])/);
  return designatedCity?.[1] ?? tokyoWard?.[1] ?? city?.[1] ?? district?.[1] ?? townOrVillage?.[1] ?? shop.都道府県;
}

function asciiSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

async function romanize(value) {
  return asciiSlug(await converter.convert(value, { to: "romaji", mode: "spaced", romajiSystem: "hepburn" }));
}

function localityBase(locality) {
  const pieces = locality.match(/[一-龯々ぁ-んァ-ヶー]+?(?:市|区|郡|町|村)/g) ?? [locality];
  return pieces.at(-1).replace(/[市区町村]$/, "");
}

function localityUnit(locality) {
  const pieces = locality.match(/[一-龯々ぁ-んァ-ヶー]+?(?:市|区|郡|町|村)/g) ?? [locality];
  return pieces.at(-1);
}

async function readableSlug(shop) {
  const locality = localityFrom(shop);
  const localitySlug = (await romanize(localityUnit(locality)))
    .replace(/-(?:shi|ku|gun|cho|machi|mura)(?=-|$)/g, "")
    .replace(/^-+|-+$/g, "");
  const base = localityBase(locality);
  let name = shop.店名
    .normalize("NFKC")
    .replace(/[（(][^）)]*[）)]/g, " ")
    .replaceAll("ドコモショップ", " docomo shop ")
    .replaceAll("ドコモ", " docomo ")
    .replaceAll("ソフトバンク", " softbank ")
    .replaceAll("auショップ", " au shop ")
    .replaceAll("ショップ", " shop ")
    .replaceAll("ららぽーと", " lalaport ")
    .replaceAll("イオンモール", " aeon mall ")
    .replaceAll("イオン", " aeon ")
    .replace(/店\s*$/, "")
    .trim();
  if (base.length >= 2 && name.includes(base)) name = name.replaceAll(base, ` ${localitySlug} `);
  let slug = await romanize(name);
  slug = slug
    .replace(/(^|-)dokomo-shoppu(?=-|$)/g, "$1docomo-shop")
    .replace(/(^|-)sofutobanku(?=-|$)/g, "$1softbank")
    .replace(/(^|-)au-shoppu(?=-|$)/g, "$1au-shop")
    .replace(/(^|-)shoppu(?=-|$)/g, "$1shop")
    .replace(/^au-style-/, "au-style-")
    .replace(/(^|-)rarapoto(?=-|$)/g, "$1lalaport")
    .replace(/(^|-)inta(?=-|$)/g, "$1inter")
    .replace(/-ten$/, "")
    .replace(/-+$/g, "");
  return { slug, localitySlug };
}

const dataFiles = (await readdir(path.join(root, "data")))
  .filter((name) => name.endsWith("-shops.csv") && !name.includes("rakuten") && !name.includes("carrier"))
  .sort();
const shops = [];
for (const file of dataFiles) {
  const rows = parseCsvRows(await readFile(path.join(root, "data", file), "utf8"));
  shops.push(...rows.map((row) => ({ ...row, source: file })));
}

for (const shop of shops) Object.assign(shop, await readableSlug(shop));

const groups = new Map();
for (const shop of shops) {
  const key = `${shop.都道府県}|${shop.キャリア}|${shop.slug}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(shop);
}
let localityDisambiguations = 0;
for (const duplicates of groups.values()) {
  if (duplicates.length < 2) continue;
  for (const shop of duplicates) {
    shop.slug = `${shop.slug}-${shop.localitySlug}`;
    localityDisambiguations += 1;
  }
}

const finalKeys = new Set();
let idDisambiguations = 0;
for (const shop of shops) {
  let key = `${shop.都道府県}|${shop.キャリア}|${shop.slug}`;
  if (finalKeys.has(key)) {
    shop.slug = `${shop.slug}-${shopId(shop)}`;
    idDisambiguations += 1;
    key = `${shop.都道府県}|${shop.キャリア}|${shop.slug}`;
  }
  if (!shop.slug || finalKeys.has(key)) throw new Error(`Could not create a unique slug for ${shop.店名}`);
  finalKeys.add(key);
}

shops.sort((a, b) => a.URL.localeCompare(b.URL, "ja"));
const output = ["URL,slug,name,locality", ...shops.map((shop) => [shop.URL, shop.slug, shop.店名, localityFrom(shop)].map(csvCell).join(","))].join("\n") + "\n";
await writeFile(path.join(root, "data", "shop-slugs.csv"), output);
console.log(`Generated ${shops.length} stable ASCII shop slugs from ${dataFiles.length} prefecture files.`);
console.log(`Disambiguated ${localityDisambiguations} with locality and ${idDisambiguations} with a short official shop ID.`);
