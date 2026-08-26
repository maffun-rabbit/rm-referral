import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const overlay = path.join(root, ".deploy", "ja");
const astroDist = path.join(root, "astro-site", "dist");
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

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory)) {
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

const errors = [];
const overlayFiles = await walk(overlay);
const htmlFiles = overlayFiles.filter((file) => file.endsWith(".html"));
if (htmlFiles.length !== 7955) errors.push(`expected 7955 production HTML files including one Google verification file, found ${htmlFiles.length}`);

for (const forbidden of [".wrangler", "astro-site", "docs", "vi-component-preview"]) {
  if (overlayFiles.some((file) => file.includes(`${path.sep}${forbidden}${path.sep}`) || file.endsWith(`${path.sep}${forbidden}`))) {
    errors.push(`forbidden migration artifact found: ${forbidden}`);
  }
}

const [productionHome, sitemap, robots] = await Promise.all([
  readFile(path.join(overlay, "index.html"), "utf8"),
  readFile(path.join(overlay, "sitemap.xml"), "utf8"),
  readFile(path.join(overlay, "robots.txt"), "utf8"),
]);
if (productionHome.includes("Astro共通パーツ検証")) errors.push("migration preview replaced the production home page");
if (!sitemap.includes("https://rm-referral.maffun.workers.dev/tokyo/au/au-shop-narimasu/")) errors.push("sitemap was not preserved");
if (!robots.includes("Sitemap: https://rm-referral.maffun.workers.dev/sitemap.xml")) errors.push("robots.txt was not preserved");

const astroMigratedFiles = (await Promise.all(migratedPrefectures.map((prefecture) => walk(path.join(astroDist, prefecture)))))
  .flat()
  .filter((file) => file.endsWith("index.html"));
if (astroMigratedFiles.length !== 6714) errors.push(`expected 6714 migrated Astro pages, found ${astroMigratedFiles.length}`);
for (const astroFile of astroMigratedFiles) {
  const relative = path.relative(astroDist, astroFile);
  const overlayFile = path.join(overlay, relative);
  const [astroHtml, overlayHtml] = await Promise.all([readFile(astroFile, "utf8"), readFile(overlayFile, "utf8")]);
  if (astroHtml !== overlayHtml) errors.push(`${relative}: overlay differs from Astro output`);
}

const preservedCoveragePages = {};
for (const prefecture of migratedPrefectures) {
  const [legacyHub, overlayHub] = await Promise.all([
    readFile(path.join(root, prefecture, "index.html"), "utf8"),
    readFile(path.join(overlay, prefecture, "index.html"), "utf8"),
  ]);
  if (legacyHub !== overlayHub) errors.push(`${prefecture}: prefecture hub was not preserved`);

  const legacyCoverage = (await walk(path.join(root, prefecture, "coverage"))).filter((file) => file.endsWith("index.html"));
  const overlayCoverage = htmlFiles.filter((file) => file.includes(`${path.sep}${prefecture}${path.sep}coverage${path.sep}`));
  preservedCoveragePages[prefecture] = overlayCoverage.length;
  if (overlayCoverage.length !== legacyCoverage.length) {
    errors.push(`${prefecture}: expected ${legacyCoverage.length} preserved coverage pages, found ${overlayCoverage.length}`);
  }
}

const summary = {
  passed: errors.length === 0,
  errors,
  htmlFiles: htmlFiles.length,
  astroMigratedShopPages: astroMigratedFiles.length,
  preservedCoveragePages,
  productionHomePreserved: !productionHome.includes("Astro共通パーツ検証"),
  sitemapPreserved: sitemap.includes("https://rm-referral.maffun.workers.dev/tokyo/au/au-shop-narimasu/"),
};
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
