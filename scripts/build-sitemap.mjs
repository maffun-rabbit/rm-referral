import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const today = new Date().toISOString().slice(0, 10);
const languages = {
  en: "https://mnp-navi.jp/en",
  zh: "https://mnp-navi.jp/zh",
  ko: "https://mnp-navi.jp/ko",
  vi: "https://mnp-navi.jp/vi",
  pt: "https://mnp-navi.jp/pt",
};
const japaneseHost = "https://mnp-navi.jp";

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory)) {
    if (entry === ".git" || entry === ".deploy") continue;
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

async function writeSitemap(directory, host, excludeLanguageRoots = false) {
  const sitemapPath = path.join(directory, "sitemap.xml");
  let previous = "";
  try { previous = await readFile(sitemapPath, "utf8"); } catch {}
  const previousDates = new Map(
    [...previous.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g)]
      .map((match) => [match[1], match[2]]),
  );
  const languageRoots = new Set(Object.keys(languages));
  const files = (await walk(directory)).filter((file) => {
    if (!file.endsWith(".html")) return false;
    const relative = path.relative(directory, file).split(path.sep).join("/");
    if (/^google[\w-]+\.html$/.test(relative)) return false;
    if (excludeLanguageRoots && languageRoots.has(relative.split("/")[0])) return false;
    return true;
  });
  const urls = files.map((file) => {
    const relative = path.relative(directory, file).split(path.sep).join("/");
    const publishedPath = relative === "index.html" ? "/" : `/${relative.replace(/index\.html$/, "")}`;
    return `${host}${publishedPath}`;
  }).sort();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc><lastmod>${previousDates.get(url) ?? today}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`;
  await writeFile(sitemapPath, xml, "utf8");
  await writeFile(path.join(directory, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${host}/sitemap.xml\n`, "utf8");
  console.log(`Wrote ${urls.length} URLs to ${path.relative(root, sitemapPath) || "sitemap.xml"}.`);
}

await writeSitemap(root, japaneseHost, true);
for (const [language, host] of Object.entries(languages)) {
  await writeSitemap(path.join(root, language), host);
}
