import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const astroRoot = path.resolve(scriptDir, "..");
const distRoot = path.join(astroRoot, "dist", "en");
const legacyEnglishRoot = path.resolve(astroRoot, "..", "en");
const origin = "https://mnp-navi.jp";
const localeOrigin = `${origin}/en`;
const expectedHreflangs = new Map([
  ["ja-JP", ""],
  ["vi-VN", "/vi"],
  ["en", "/en"],
  ["zh-CN", "/zh"],
  ["ko-KR", "/ko"],
  ["pt-BR", "/pt"],
  ["x-default", ""],
]);
const forbiddenJapaneseUi = [
  "通信会社で絞り込む",
  "条件に一致する店舗がありません",
  "オンラインで乗り換えを始める",
  "紹介キャンペーンを確認する",
  "情報確認日：",
  "最新トピック",
  "周辺の楽天モバイル",
  "店舗名から探す理由",
  "北海道・東北",
  "北陸・甲信越",
  "中国・四国",
  "九州・沖縄",
];

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    const info = await stat(fullPath);
    if (info.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function capture(html, pattern) {
  return html.match(pattern)?.[1]?.trim().replaceAll("&amp;", "&") ?? "";
}

function outputPathToRoute(file) {
  const relative = path.relative(distRoot, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  return `/${relative.replace(/\/index\.html$/, "")}/`;
}

function routeToOutput(route) {
  const pathname = route.split(/[?#]/, 1)[0];
  if (!pathname.startsWith("/en/")) return null;
  const relative = pathname.slice(4);
  if (!relative || relative.endsWith("/")) return path.join(distRoot, relative, "index.html");
  if (path.extname(relative)) {
    const astroOutput = path.join(distRoot, relative);
    return existsSync(astroOutput) ? astroOutput : path.join(legacyEnglishRoot, relative);
  }
  return path.join(distRoot, relative, "index.html");
}

function collectJsonUrls(value, urls = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectJsonUrls(item, urls);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (["url", "item", "@id"].includes(key) && typeof item === "string") urls.push(item);
      collectJsonUrls(item, urls);
    }
  }
  return urls;
}

export async function validateEnglishBuild() {
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

  if (htmlFiles.length !== 6835) errors.push(`expected 6,835 English HTML pages, found ${htmlFiles.length}`);
  if (sitemapEntries.length !== 6835) errors.push(`expected 6,835 sitemap URLs, found ${sitemapEntries.length}`);
  if (sitemapUrls.size !== sitemapEntries.length) errors.push("sitemap contains duplicate URLs");
  if (!sitemapEntries.every((url) => url.startsWith(`${localeOrigin}/`))) errors.push("sitemap contains a URL outside /en/");
  if (/workers\.dev/.test(sitemap)) errors.push("sitemap contains a legacy Worker URL");
  const robotsSitemap = robots.match(/^Sitemap:\s*(\S+)$/m)?.[1];
  if (robotsSitemap !== `${localeOrigin}/sitemap.xml`) errors.push("robots.txt has the wrong sitemap URL");
  if (/workers\.dev/.test(robots)) errors.push("robots.txt contains a legacy Worker URL");

  for (const file of htmlFiles) {
    const route = outputPathToRoute(file);
    const pathname = route === "/" ? "/" : route;
    const canonical = `${localeOrigin}${pathname}`;
    expectedUrls.add(canonical);
    const parts = pathname.split("/").filter(Boolean);
    if (!parts.length) routeCounts.home += 1;
    else if (parts[0] === "guide") routeCounts.guide += 1;
    else if (parts.length === 1) routeCounts.prefecture += 1;
    else if (parts[1] === "coverage") routeCounts.coverage += 1;
    else routeCounts.shop += 1;

    const html = await readFile(file, "utf8");
    const label = `/en${pathname}`;
    const title = capture(html, /<title>([\s\S]*?)<\/title>/i);
    const description = capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
    const robotsValue = capture(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
    const canonicalValue = capture(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
    const ogUrl = capture(html, /<meta\s+property="og:url"\s+content="([^"]*)"/i);
    if (!title) errors.push(`${label}: title is empty`);
    if (!description) errors.push(`${label}: description is empty`);
    if (robotsValue !== "index, follow") errors.push(`${label}: robots must be index, follow`);
    if (canonicalValue !== canonical) errors.push(`${label}: canonical mismatch (${canonicalValue})`);
    if (ogUrl !== canonical) errors.push(`${label}: og:url mismatch`);
    if (canonicalUrls.has(canonicalValue)) errors.push(`${label}: duplicate canonical`);
    canonicalUrls.add(canonicalValue);
    if (!/<html lang="en">/.test(html)) errors.push(`${label}: html lang is not en`);
    if (!/<meta property="og:locale" content="en_US">/.test(html)) errors.push(`${label}: og:locale is not en_US`);
    if (/rm-referral(?:-vi|-en|-zh|-ko|-pt)?\.maffun\.workers\.dev/.test(html)) errors.push(`${label}: legacy Worker URL remains`);
    if (!/href="\/en\/css\/style\.css"/.test(html)) errors.push(`${label}: English stylesheet is missing`);
    if (!/src="\/en\/js\/analytics\.js"/.test(html)) errors.push(`${label}: English analytics script is missing`);
    if ((html.match(/class="site-header"/g) ?? []).length !== 1) errors.push(`${label}: expected one site header`);
    if ((html.match(/class="site-footer"/g) ?? []).length !== 1) errors.push(`${label}: expected one site footer`);

    const localizedPath = pathname;
    const alternates = new Map([...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi)]
      .map((match) => [match[1], match[2].replaceAll("&amp;", "&")]));
    const pageExpectedHreflangs = pathname.startsWith("/guide/topics/")
      ? new Map([...expectedHreflangs].filter(([hreflang]) => !["ja-JP", "x-default"].includes(hreflang)))
      : expectedHreflangs;
    if (alternates.size !== pageExpectedHreflangs.size) errors.push(`${label}: expected ${pageExpectedHreflangs.size} hreflang links, found ${alternates.size}`);
    for (const [hreflang, prefix] of pageExpectedHreflangs) {
      const expected = `${origin}${prefix}${localizedPath}`;
      if (alternates.get(hreflang) !== expected) errors.push(`${label}: wrong or missing hreflang ${hreflang}`);
    }

    for (const phrase of forbiddenJapaneseUi) {
      if (html.includes(phrase)) errors.push(`${label}: Japanese UI remains (${phrase})`);
    }
    if (/·\s*(?:ドコモ|ソフトバンク|イオンモバイル)\s+Users/.test(html)) errors.push(`${label}: Japanese carrier remains in eyebrow`);
    if (/<dt>Current Carrier<\/dt><dd>(?:ドコモ|ソフトバンク|イオンモバイル)<\/dd>/.test(html)) errors.push(`${label}: Japanese carrier remains in store details`);
    if (html.includes('href="https://mnp-navi.jp/tokyo/coverage/"')) errors.push(`${label}: Tokyo coverage link is not localized`);
    if (/<strong[^>]*>\d[\d,]*<\/strong>stores shown/.test(html)) errors.push(`${label}: store result count is missing a space`);

    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    structuredDataBlocks += schemas.length;
    for (const schema of schemas) {
      try {
        const parsed = JSON.parse(schema[1]);
        if (collectJsonUrls(parsed).some((url) => /workers\.dev/.test(url))) errors.push(`${label}: structured data contains a Worker URL`);
        if (parsed["@type"] === "WebPage") {
          if (parsed.url !== canonical) errors.push(`${label}: WebPage URL mismatch`);
          if (parsed.inLanguage !== "en") errors.push(`${label}: WebPage language mismatch`);
        }
        if (parsed["@type"] === "BreadcrumbList") {
          const lastItem = parsed.itemListElement?.at(-1)?.item;
          if (lastItem && lastItem !== canonical) errors.push(`${label}: breadcrumb schema does not end at canonical`);
        }
      } catch {
        errors.push(`${label}: invalid JSON-LD`);
      }
    }

    const internalTargets = [...html.matchAll(/<(?:a|link|script|img)\b[^>]*(?:href|src)="([^"]+)"/gi)]
      .map((match) => match[1].replaceAll("&amp;", "&"))
      .filter((target) => target.startsWith("/"));
    for (const target of internalTargets) {
      internalLinksChecked += 1;
      if (!target.startsWith("/en/")) {
        errors.push(`${label}: unprefixed internal target ${target}`);
        continue;
      }
      const output = routeToOutput(target);
      if (output && !existsSync(output)) errors.push(`${label}: broken internal target ${target}`);
    }
  }

  for (const url of expectedUrls) if (!sitemapUrls.has(url)) errors.push(`${url}: missing from sitemap`);
  for (const url of sitemapUrls) if (!expectedUrls.has(url)) errors.push(`${url}: sitemap URL has no HTML output`);
  const expectedRouteCounts = { home: 1, prefecture: 47, shop: 6714, coverage: 53, guide: 20 };
  for (const [family, expected] of Object.entries(expectedRouteCounts)) {
    if (routeCounts[family] !== expected) errors.push(`${family}: expected ${expected}, found ${routeCounts[family]}`);
  }

  return {
    passed: errors.length === 0,
    errors,
    summary: {
      htmlPages: htmlFiles.length,
      sitemapUrls: sitemapEntries.length,
      uniqueCanonicals: canonicalUrls.size,
      routeCounts,
      structuredDataBlocks,
      internalLinksChecked,
      japaneseUiFallbacks: errors.filter((error) => error.includes("Japanese")).length,
      legacyWorkerUrls: errors.filter((error) => error.includes("Worker URL")).length,
      brokenInternalTargets: errors.filter((error) => error.includes("broken internal target")).length,
    },
  };
}

const result = await validateEnglishBuild();
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 1;
