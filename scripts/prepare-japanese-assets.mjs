import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".deploy", "ja");
const migratedPrefectures = [
  "hokkaido", "aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima",
  "niigata", "toyama", "ishikawa", "fukui", "yamanashi", "nagano",
  "ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa",
  "gifu", "shizuoka", "aichi", "mie",
  "shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama",
  "tottori", "shimane", "okayama", "hiroshima", "yamaguchi",
  "tokushima", "kagawa", "ehime", "kochi",
  "fukuoka", "saga", "nagasaki", "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa",
];
const excluded = new Set([
  ".git", ".deploy", ".wrangler", "scripts", "data", "astro-site", "docs", "en", "zh", "ko", "vi", "pt",
  "DESIGN_GUIDELINES.md", "wrangler.jsonc", "wrangler.en.jsonc", "wrangler.zh.jsonc",
  "wrangler.ko.jsonc", "wrangler.vi.jsonc", "wrangler.pt.jsonc",
]);
const productionOrigins = new Map([
  ["https://rm-referral-vi.maffun.workers.dev", "https://mnp-navi.jp/vi"],
  ["https://rm-referral-en.maffun.workers.dev", "https://mnp-navi.jp/en"],
  ["https://rm-referral-zh.maffun.workers.dev", "https://mnp-navi.jp/zh"],
  ["https://rm-referral-ko.maffun.workers.dev", "https://mnp-navi.jp/ko"],
  ["https://rm-referral-pt.maffun.workers.dev", "https://mnp-navi.jp/pt"],
  ["https://rm-referral.maffun.workers.dev", "https://mnp-navi.jp"],
]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

async function rewriteLegacyOrigins(directory) {
  const textExtensions = new Set([".html", ".xml", ".txt", ".js", ".json"]);
  for (const file of await walk(directory)) {
    if (!textExtensions.has(path.extname(file))) continue;
    const original = await readFile(file, "utf8");
    let rewritten = original;
    for (const [legacy, production] of productionOrigins) rewritten = rewritten.replaceAll(legacy, production);
    if (rewritten !== original) await writeFile(file, rewritten, "utf8");
  }
}

await rm(output, { recursive: true, force: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  await cp(path.join(root, entry.name), path.join(output, entry.name), { recursive: true });
}

for (const prefecture of migratedPrefectures) {
  const astroPrefecture = path.join(root, "astro-site", "dist", prefecture);
  const outputPrefecture = path.join(output, prefecture);
  for (const entry of await readdir(astroPrefecture, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const destination = path.join(outputPrefecture, entry.name);
    await rm(destination, { recursive: true, force: true });
    await cp(path.join(astroPrefecture, entry.name), destination, { recursive: true });
  }
}

await rewriteLegacyOrigins(output);

console.log("Prepared the Japanese Worker asset directory and rewrote legacy Worker origins to mnp-navi.jp.");
