import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

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
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (!title) errors.push(`${file}: title is missing`);
  if (["hokkaido", "aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima", "niigata", "tochigi", "gunma", "ibaraki", "saitama", "chiba", "tokyo", "kanagawa", "nagano", "yamanashi", "toyama", "ishikawa", "fukui", "shizuoka", "aichi", "gifu", "mie", "shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama"].some((area) => file.includes(`${path.sep}${area}${path.sep}`)) && !canonical) errors.push(`${file}: canonical is missing`);
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

const expectedByArea = { hokkaido: 309, aomori: 57, iwate: 62, miyagi: 123, akita: 46, yamagata: 59, fukushima: 98, niigata: 94, tochigi: 78, gunma: 83, ibaraki: 118, saitama: 253, chiba: 227, tokyo: 539, kanagawa: 296, nagano: 89, yamanashi: 42, toyama: 56, ishikawa: 68, fukui: 41, shizuoka: 177, aichi: 428, gifu: 115, mie: 104, shiga: 69, kyoto: 127, osaka: 421, hyogo: 265, nara: 67, wakayama: 54 };
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
