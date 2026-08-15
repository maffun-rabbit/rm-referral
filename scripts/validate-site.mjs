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
  if (file.includes(`${path.sep}hokkaido${path.sep}`) && !canonical) errors.push(`${file}: canonical is missing`);
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

const shopPages = htmlFiles.filter((file) => file.includes(`${path.sep}hokkaido${path.sep}`) && !file.endsWith(`${path.sep}hokkaido${path.sep}index.html`));
if (shopPages.length !== 309) errors.push(`Expected 309 shop pages, received ${shopPages.length}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML files, including ${shopPages.length} shop pages.`);
}
