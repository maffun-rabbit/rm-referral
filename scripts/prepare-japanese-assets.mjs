import { cp, readdir, rm } from "node:fs/promises";
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
];
const excluded = new Set([
  ".git", ".deploy", ".wrangler", "scripts", "data", "astro-site", "docs", "en", "zh", "ko", "vi", "pt",
  "DESIGN_GUIDELINES.md", "wrangler.jsonc", "wrangler.en.jsonc", "wrangler.zh.jsonc",
  "wrangler.ko.jsonc", "wrangler.vi.jsonc", "wrangler.pt.jsonc",
]);

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

console.log("Prepared the Japanese Worker asset directory with the migrated Astro shop overlay.");
