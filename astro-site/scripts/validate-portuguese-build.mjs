import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const astroRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(astroRoot, "dist", "pt");
const legacyRoot = path.resolve(astroRoot, "..", "pt");
const origin = "https://mnp-navi.jp";
const localeOrigin = `${origin}/pt`;
const expectedHreflangs = new Map([
  ["ja-JP", ""], ["vi-VN", "/vi"], ["en", "/en"], ["zh-CN", "/zh"],
  ["ko-KR", "/ko"], ["pt-BR", "/pt"], ["x-default", ""],
]);
const forbiddenJapaneseUi = [
  "通信会社で絞り込む", "条件に一致する店舗がありません", "オンラインで乗り換えを始める",
  "紹介キャンペーンの条件を確認する", "情報確認日：", "楽天モバイル電波状況",
  "公式の基地局設置発表をもとに", "現在の確認目安", "公式エリアマップで地点を確認する",
  "契約前に確認したい3つの場所", "家族の年代に合わせて使える割引", "利用する方を選択",
  "離れて暮らす家庭も対象", "電波状況と家庭向け割引", "エリアと割引を確認できたら",
  "当サイトは個人が運営しており", "掲載情報は公式発表をもとに整理しています",
  "公式エリア情報と直近の基地局設置発表から確認", "こども・青春・シニア向け特典",
];

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function capture(html, pattern) { return html.match(pattern)?.[1]?.trim().replaceAll("&amp;", "&") ?? ""; }
function outputPathToRoute(file) {
  const relative = path.relative(distRoot, file).split(path.sep).join("/");
  return relative === "index.html" ? "/" : `/${relative.replace(/\/index\.html$/, "")}/`;
}
function routeToOutput(target) {
  const pathname = target.split(/[?#]/, 1)[0];
  if (!pathname.startsWith("/pt/")) return null;
  const relative = pathname.slice(4);
  if (!relative || relative.endsWith("/")) return path.join(distRoot, relative, "index.html");
  if (path.extname(relative)) {
    const generated = path.join(distRoot, relative);
    return existsSync(generated) ? generated : path.join(legacyRoot, relative);
  }
  return path.join(distRoot, relative, "index.html");
}
function collectJsonUrls(value, urls = []) {
  if (Array.isArray(value)) for (const item of value) collectJsonUrls(item, urls);
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) {
    if (["url", "item", "@id"].includes(key) && typeof item === "string") urls.push(item);
    collectJsonUrls(item, urls);
  }
  return urls;
}

export async function validatePortugueseBuild() {
  const errors = [];
  const htmlFiles = (await walk(distRoot)).filter((file) => file.endsWith(".html"));
  const sitemap = await readFile(path.join(distRoot, "sitemap.xml"), "utf8");
  const robots = await readFile(path.join(distRoot, "robots.txt"), "utf8");
  const sitemapEntries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replaceAll("&amp;", "&"));
  const sitemapUrls = new Set(sitemapEntries);
  const expectedUrls = new Set();
  const canonicalUrls = new Set();
  const routeCounts = { home: 0, prefecture: 0, shop: 0, coverage: 0, guide: 0 };
  let structuredDataBlocks = 0;
  let internalLinksChecked = 0;

  if (htmlFiles.length !== 6835) errors.push(`expected 6,835 Portuguese HTML pages, found ${htmlFiles.length}`);
  if (sitemapEntries.length !== 6835) errors.push(`expected 6,835 sitemap URLs, found ${sitemapEntries.length}`);
  if (sitemapUrls.size !== sitemapEntries.length) errors.push("sitemap contains duplicate URLs");
  if (!sitemapEntries.every((url) => url.startsWith(`${localeOrigin}/`))) errors.push("sitemap contains a URL outside /pt/");
  if (/workers\.dev/.test(sitemap) || /workers\.dev/.test(robots)) errors.push("sitemap or robots contains a legacy Worker URL");
  if (robots.match(/^Sitemap:\s*(\S+)$/m)?.[1] !== `${localeOrigin}/sitemap.xml`) errors.push("robots.txt has the wrong sitemap URL");

  for (const file of htmlFiles) {
    const pathname = outputPathToRoute(file);
    const canonical = `${localeOrigin}${pathname}`;
    const label = `/pt${pathname}`;
    expectedUrls.add(canonical);
    const parts = pathname.split("/").filter(Boolean);
    if (!parts.length) routeCounts.home += 1;
    else if (parts[0] === "guide") routeCounts.guide += 1;
    else if (parts.length === 1) routeCounts.prefecture += 1;
    else if (parts[1] === "coverage") routeCounts.coverage += 1;
    else routeCounts.shop += 1;
    const html = await readFile(file, "utf8");
    const title = capture(html, /<title>([\s\S]*?)<\/title>/i);
    const description = capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
    const robotsValue = capture(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
    const canonicalValue = capture(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
    const ogUrl = capture(html, /<meta\s+property="og:url"\s+content="([^"]*)"/i);
    if (!title || !description) errors.push(`${label}: title or description is empty`);
    if (/Tóquiode|cobertura da Rakuten Mobileを/.test(`${title} ${description}`)) errors.push(`${label}: malformed Portuguese coverage SEO text`);
    if (robotsValue !== "index, follow") errors.push(`${label}: robots must be index, follow`);
    if (canonicalValue !== canonical || ogUrl !== canonical) errors.push(`${label}: canonical or og:url mismatch`);
    if (canonicalUrls.has(canonicalValue)) errors.push(`${label}: duplicate canonical`);
    canonicalUrls.add(canonicalValue);
    if (!/<html lang="pt-BR">/.test(html)) errors.push(`${label}: html lang is not pt-BR`);
    if (!/<meta property="og:locale" content="pt_BR">/.test(html)) errors.push(`${label}: og:locale is not pt_BR`);
    if (/rm-referral(?:-vi|-en|-zh|-ko|-pt)?\.maffun\.workers\.dev/.test(html)) errors.push(`${label}: legacy Worker URL remains`);
    if (!/href="\/pt\/css\/style\.css"/.test(html) || !/src="\/pt\/js\/analytics\.js"/.test(html)) errors.push(`${label}: Portuguese static assets are missing`);
    if ((html.match(/class="site-header"/g) ?? []).length !== 1 || (html.match(/class="site-footer"/g) ?? []).length !== 1) errors.push(`${label}: shared header or footer count mismatch`);
    const alternates = new Map([...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi)].map((match) => [match[1], match[2].replaceAll("&amp;", "&")]));
    const pageExpectedHreflangs = pathname.startsWith("/guide/topics/")
      ? new Map([...expectedHreflangs].filter(([hreflang]) => !["ja-JP", "x-default"].includes(hreflang)))
      : expectedHreflangs;
    if (alternates.size !== pageExpectedHreflangs.size) errors.push(`${label}: expected ${pageExpectedHreflangs.size} hreflang links, found ${alternates.size}`);
    for (const [hreflang, prefix] of pageExpectedHreflangs) if (alternates.get(hreflang) !== `${origin}${prefix}${pathname}`) errors.push(`${label}: wrong or missing hreflang ${hreflang}`);
    const uiHtml = html.replace(/<small[^>]*lang="ja"[\s\S]*?<\/small>/gi, "").replace(/<ul class="coverage-shop-list"[\s\S]*?<\/ul>/gi, "").replace(/Fonte: Rakuten Mobile[^<]+/g, "");
    for (const phrase of forbiddenJapaneseUi) if (uiHtml.includes(phrase)) errors.push(`${label}: Japanese UI remains (${phrase})`);
    if (/<dt>Operadora Atual<\/dt><dd>(?:ドコモ|ソフトバンク|イオンモバイル)<\/dd>/.test(uiHtml)) errors.push(`${label}: Japanese carrier remains in details`);
    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    structuredDataBlocks += schemas.length;
    for (const schema of schemas) try {
      const parsed = JSON.parse(schema[1]);
      if (collectJsonUrls(parsed).some((url) => /workers\.dev/.test(url))) errors.push(`${label}: structured data contains a Worker URL`);
      if (parsed["@type"] === "WebPage" && (parsed.url !== canonical || parsed.inLanguage !== "pt-BR")) errors.push(`${label}: WebPage schema mismatch`);
    } catch { errors.push(`${label}: invalid JSON-LD`); }
    for (const target of [...html.matchAll(/<(?:a|link|script|img)\b[^>]*(?:href|src)="([^"]+)"/gi)].map((match) => match[1].replaceAll("&amp;", "&")).filter((target) => target.startsWith("/"))) {
      internalLinksChecked += 1;
      if (!target.startsWith("/pt/")) { errors.push(`${label}: unprefixed internal target ${target}`); continue; }
      const output = routeToOutput(target);
      if (output && !existsSync(output)) errors.push(`${label}: broken internal target ${target}`);
    }
  }
  for (const url of expectedUrls) if (!sitemapUrls.has(url)) errors.push(`${url}: missing from sitemap`);
  for (const url of sitemapUrls) if (!expectedUrls.has(url)) errors.push(`${url}: sitemap URL has no HTML output`);
  const expectedCounts = { home: 1, prefecture: 47, shop: 6714, coverage: 53, guide: 20 };
  for (const [family, expected] of Object.entries(expectedCounts)) if (routeCounts[family] !== expected) errors.push(`${family}: expected ${expected}, found ${routeCounts[family]}`);
  return { passed: errors.length === 0, errors, summary: { htmlPages: htmlFiles.length, sitemapUrls: sitemapEntries.length, uniqueCanonicals: canonicalUrls.size, routeCounts, structuredDataBlocks, internalLinksChecked, japaneseUiFallbacks: errors.filter((error) => error.includes("Japanese")).length, legacyWorkerUrls: errors.filter((error) => error.includes("Worker URL")).length, brokenInternalTargets: errors.filter((error) => error.includes("broken internal target")).length } };
}

const result = await validatePortugueseBuild();
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 1;
