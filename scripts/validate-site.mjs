import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://rm-referral.maffun.workers.dev";
const areaSlugs = ["hokkaido", "aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima", "niigata", "tochigi", "gunma", "ibaraki", "saitama", "chiba", "tokyo", "kanagawa", "nagano", "yamanashi", "toyama", "ishikawa", "fukui", "shizuoka", "aichi", "gifu", "mie", "shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama", "tottori", "shimane", "okayama", "hiroshima", "yamaguchi", "tokushima", "kagawa", "ehime", "kochi", "fukuoka", "saga", "nagasaki", "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa"];
const languageSlugs = new Set(["en", "zh", "ko", "vi", "pt"]);

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
const htmlFiles = files.filter((file) => file.endsWith(".html")
  && !/^google[\w-]+\.html$/.test(path.relative(root, file)));
const titles = new Map();
const canonicals = new Map();
const errors = [];
const localTopicsData = JSON.parse(await readFile(path.join(root, "data", "local-topics.json"), "utf8"));

for (const topic of localTopicsData.topics ?? []) {
  for (const field of ["id", "category", "title", "summary", "publishedAt", "expiresAt", "mediaName", "sourceTitle", "sourceUrl"]) {
    if (!topic[field]) errors.push(`data/local-topics.json: ${topic.id ?? "unnamed topic"} is missing ${field}`);
  }
  if (!Array.isArray(topic.targets) || !topic.targets.length) errors.push(`data/local-topics.json: ${topic.id ?? "unnamed topic"} has no targets`);
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relativePath = path.relative(root, file).split(path.sep).join("/");
  const publishedPath = relativePath === "index.html" ? "/" : `/${relativePath.replace(/index\.html$/, "")}`;
  const pathParts = relativePath.split("/");
  const isJapaneseAreaPage = areaSlugs.includes(pathParts[0]);
  const isMultilingualPage = languageSlugs.has(pathParts[0]);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (!title) errors.push(`${file}: title is missing`);
  if (isJapaneseAreaPage && !canonical) errors.push(`${file}: canonical is missing`);
  if (canonical && !isMultilingualPage && canonical !== `${siteUrl}${publishedPath}`) errors.push(`${file}: canonical does not match its published path`);
  if (isJapaneseAreaPage && pathParts.length === 4 && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathParts[2])) {
    errors.push(`${file}: shop URL slug must contain ASCII lowercase letters, numbers, and hyphens only`);
  }
  if (isJapaneseAreaPage && pathParts.length === 4 && pathParts[1] !== "coverage") {
    if (!html.includes("他社から乗り換えなら</span><strong>14,000")) errors.push(`${file}: primary 14,000-point CTA is missing`);
    if (!html.includes('data-floating-cta')) errors.push(`${file}: floating CTA is missing`);
  }
  if (title && !isMultilingualPage) {
    if (titles.has(title)) errors.push(`${file}: duplicate title with ${titles.get(title)}`);
    titles.set(title, file);
  }
  if (canonical && !isMultilingualPage) {
    if (canonicals.has(canonical)) errors.push(`${file}: duplicate canonical with ${canonicals.get(canonical)}`);
    canonicals.set(canonical, file);
  }

  for (const section of isJapaneseAreaPage ? html.matchAll(/<section class="local-topics-section"[\s\S]*?<\/section>/g) : []) {
    if (/\bhref\s*=/.test(section[0])) errors.push(`${file}: local topics section must not contain external or internal links`);
    if (!/元記事：[^<]+<br>媒体：[^<]+<br>公開日：/.test(section[0])) errors.push(`${file}: local topics source metadata is incomplete`);
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
const areaByPrefecture = new Map([
  ["北海道", "hokkaido"], ["青森県", "aomori"], ["岩手県", "iwate"], ["宮城県", "miyagi"], ["秋田県", "akita"], ["山形県", "yamagata"], ["福島県", "fukushima"], ["茨城県", "ibaraki"], ["栃木県", "tochigi"], ["群馬県", "gunma"], ["埼玉県", "saitama"], ["千葉県", "chiba"], ["東京都", "tokyo"], ["神奈川県", "kanagawa"], ["新潟県", "niigata"], ["富山県", "toyama"], ["石川県", "ishikawa"], ["福井県", "fukui"], ["山梨県", "yamanashi"], ["長野県", "nagano"], ["岐阜県", "gifu"], ["静岡県", "shizuoka"], ["愛知県", "aichi"], ["三重県", "mie"], ["滋賀県", "shiga"], ["京都府", "kyoto"], ["大阪府", "osaka"], ["兵庫県", "hyogo"], ["奈良県", "nara"], ["和歌山県", "wakayama"], ["鳥取県", "tottori"], ["島根県", "shimane"], ["岡山県", "okayama"], ["広島県", "hiroshima"], ["山口県", "yamaguchi"], ["徳島県", "tokushima"], ["香川県", "kagawa"], ["愛媛県", "ehime"], ["高知県", "kochi"], ["福岡県", "fukuoka"], ["佐賀県", "saga"], ["長崎県", "nagasaki"], ["熊本県", "kumamoto"], ["大分県", "oita"], ["宮崎県", "miyazaki"], ["鹿児島県", "kagoshima"], ["沖縄県", "okinawa"],
]);
const valueCarrierCsv = await readFile(path.join(root, "data", "value-carrier-shops-geocoded.csv"), "utf8");
for (const line of valueCarrierCsv.split(/\r?\n/).slice(1)) {
  const match = line.match(/^(?:uqmobile|ymobile|aeonmobile),[^,]*,([^,]+),/);
  if (!match) continue;
  const area = areaByPrefecture.get(match[1]);
  expectedByArea[area] += 1;
}
const shopPages = [];
for (const [area, expected] of Object.entries(expectedByArea)) {
  const areaPages = htmlFiles.filter((file) => {
    const relativeParts = path.relative(root, file).split(path.sep);
    return relativeParts[0] === area
      && relativeParts[1] !== "coverage"
      && !(relativeParts.length === 2 && relativeParts[1] === "index.html");
  });
  shopPages.push(...areaPages);
  if (areaPages.length !== expected) errors.push(`Expected ${expected} ${area} shop pages, received ${areaPages.length}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML files, including ${shopPages.length} shop pages.`);
}
