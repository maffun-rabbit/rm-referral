import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://rm-referral.maffun.workers.dev";
const areaSlugs = ["hokkaido", "aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima", "niigata", "tochigi", "gunma", "ibaraki", "saitama", "chiba", "tokyo", "kanagawa", "nagano", "yamanashi", "toyama", "ishikawa", "fukui", "shizuoka", "aichi", "gifu", "mie", "shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama", "tottori", "shimane", "okayama", "hiroshima", "yamaguchi", "tokushima", "kagawa", "ehime", "kochi", "fukuoka", "saga", "nagasaki", "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa"];

async function walk(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    if (entry === ".git") continue;
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function pageTarget(href) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || !clean.startsWith("/")) return null;
  if (clean === "/") return path.join(root, "index.html");
  if (path.extname(clean)) return path.join(root, clean);
  return path.join(root, clean, "index.html");
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const titles = new Map();
const canonicals = new Map();
const errors = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relativePath = path.relative(root, file).split(path.sep).join("/");
  const publishedPath = relativePath === "index.html" ? "/" : `/${relativePath.replace(/index\.html$/, "")}`;
  const pathParts = relativePath.split("/");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (!title) errors.push(`${file}: title is missing`);
  if (areaSlugs.includes(pathParts[0]) && !canonical) errors.push(`${file}: canonical is missing`);
  if (canonical && canonical !== `${siteUrl}${publishedPath}`) errors.push(`${file}: canonical does not match its published path`);
  if (areaSlugs.includes(pathParts[0]) && pathParts.length === 4 && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathParts[2])) {
    errors.push(`${file}: shop URL slug must contain ASCII lowercase letters, numbers, and hyphens only`);
  }
  if (title) {
    if (titles.has(title)) errors.push(`${file}: duplicate title with ${titles.get(title)}`);
    titles.set(title, file);
  }
  if (canonical) {
    if (canonicals.has(canonical)) errors.push(`${file}: duplicate canonical with ${canonicals.get(canonical)}`);
    canonicals.set(canonical, file);
  }

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const target = pageTarget(match[1]);
    if (!target) continue;
    try {
      await stat(target);
    } catch {
      errors.push(`${file}: missing internal target ${match[1]}`);
    }
  }
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
for (const file of htmlFiles) {
  const relativePath = path.relative(root, file).split(path.sep).join("/");
  const publishedPath = relativePath === "index.html" ? "/" : `/${relativePath.replace(/index\.html$/, "")}`;
  if (!sitemapUrls.has(`${siteUrl}${publishedPath}`)) errors.push(`${file}: published URL is missing from sitemap.xml`);
}
if (sitemapUrls.size !== htmlFiles.length) errors.push(`Expected ${htmlFiles.length} unique sitemap URLs, received ${sitemapUrls.size}`);

const expectedByArea = { hokkaido: 309, aomori: 57, iwate: 62, miyagi: 123, akita: 46, yamagata: 59, fukushima: 98, niigata: 94, tochigi: 78, gunma: 83, ibaraki: 118, saitama: 253, chiba: 227, tokyo: 539, kanagawa: 296, nagano: 89, yamanashi: 42, toyama: 56, ishikawa: 68, fukui: 41, shizuoka: 177, aichi: 428, gifu: 115, mie: 104, shiga: 69, kyoto: 127, osaka: 421, hyogo: 265, nara: 67, wakayama: 54, tottori: 31, shimane: 43, okayama: 110, hiroshima: 163, yamaguchi: 78, tokushima: 48, kagawa: 65, ehime: 86, kochi: 49, fukuoka: 304, saga: 45, nagasaki: 83, kumamoto: 94, oita: 67, miyazaki: 63, kagoshima: 91, okinawa: 123 };
const shopPages = [];
for (const [area, expected] of Object.entries(expectedByArea)) {
  const areaPages = htmlFiles.filter((file) => file.includes(`${path.sep}${area}${path.sep}`) && !file.endsWith(`${path.sep}${area}${path.sep}index.html`));
  shopPages.push(...areaPages);
  if (areaPages.length !== expected) errors.push(`Expected ${expected} ${area} shop pages, received ${areaPages.length}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML files, including ${shopPages.length} shop pages.`);
}
