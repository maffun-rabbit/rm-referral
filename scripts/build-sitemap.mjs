import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://rm-referral.maffun.workers.dev";
const today = "2026-08-21";

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory)) {
    if (entry === ".git") continue;
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

const previous = await readFile(path.join(root, "sitemap.xml"), "utf8");
const previousDates = new Map(
  [...previous.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g)]
    .map((match) => [match[1], match[2]]),
);
const files = (await walk(root))
  .filter((file) => file.endsWith(".html") && !/^google[\w-]+\.html$/.test(path.relative(root, file)));
const urls = files.map((file) => {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const publishedPath = relative === "index.html" ? "/" : `/${relative.replace(/index\.html$/, "")}`;
  return `${siteUrl}${publishedPath}`;
}).sort();

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((url) => `  <url><loc>${url}</loc><lastmod>${previousDates.get(url) ?? today}</lastmod></url>`)
  .join("\n")}\n</urlset>\n`;
await writeFile(path.join(root, "sitemap.xml"), xml, "utf8");
console.log(`Wrote ${urls.length} URLs to sitemap.xml.`);
