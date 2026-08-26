import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const overlay = path.join(root, ".deploy", "ja");
const astroDist = path.join(root, "astro-site", "dist");

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

const [productionHome, productionTokyo, sitemap, robots] = await Promise.all([
  readFile(path.join(overlay, "index.html"), "utf8"),
  readFile(path.join(overlay, "tokyo", "index.html"), "utf8"),
  readFile(path.join(overlay, "sitemap.xml"), "utf8"),
  readFile(path.join(overlay, "robots.txt"), "utf8"),
]);
if (productionHome.includes("Astro共通パーツ検証")) errors.push("migration preview replaced the production home page");
if (!productionTokyo.includes("東京")) errors.push("Tokyo prefecture hub was not preserved");
if (!sitemap.includes("https://rm-referral.maffun.workers.dev/tokyo/au/au-shop-narimasu/")) errors.push("sitemap was not preserved");
if (!robots.includes("Sitemap: https://rm-referral.maffun.workers.dev/sitemap.xml")) errors.push("robots.txt was not preserved");

const astroTokyoFiles = (await walk(path.join(astroDist, "tokyo"))).filter((file) => file.endsWith("index.html"));
if (astroTokyoFiles.length !== 587) errors.push(`expected 587 Astro Tokyo pages, found ${astroTokyoFiles.length}`);
for (const astroFile of astroTokyoFiles) {
  const relative = path.relative(astroDist, astroFile);
  const overlayFile = path.join(overlay, relative);
  const [astroHtml, overlayHtml] = await Promise.all([readFile(astroFile, "utf8"), readFile(overlayFile, "utf8")]);
  if (astroHtml !== overlayHtml) errors.push(`${relative}: overlay differs from Astro output`);
}

const coverageFiles = htmlFiles.filter((file) => file.includes(`${path.sep}tokyo${path.sep}coverage${path.sep}`));
if (coverageFiles.length !== 54) errors.push(`expected 54 preserved Tokyo coverage pages including the coverage index, found ${coverageFiles.length}`);

const summary = {
  passed: errors.length === 0,
  errors,
  htmlFiles: htmlFiles.length,
  astroTokyoShopPages: astroTokyoFiles.length,
  preservedTokyoCoveragePages: coverageFiles.length,
  productionHomePreserved: !productionHome.includes("Astro共通パーツ検証"),
  sitemapPreserved: sitemap.includes("https://rm-referral.maffun.workers.dev/tokyo/au/au-shop-narimasu/"),
};
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
