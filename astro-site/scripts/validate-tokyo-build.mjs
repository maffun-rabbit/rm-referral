import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadTokyoShopPages } from "../src/data/load-tokyo-shop-pages.ts";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const astroRoot = path.resolve(scriptDir, "..");
const legacyRoot = path.resolve(astroRoot, "..");
const distRoot = path.join(astroRoot, "dist");
const siteOrigin = "https://rm-referral.maffun.workers.dev";
const sharedRoutesOutsideSlice = new Set(["/", "/tokyo/"]);

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

function capture(html, pattern, label, pagePath, errors) {
  const match = html.match(pattern);
  if (!match) {
    errors.push(`${pagePath}: ${label} is missing`);
    return "";
  }
  return match[1].trim().replace(/&amp;/g, "&");
}

function validatePage(html, page, sitemapUrls, errors) {
  const pagePath = `/tokyo/${page.carrier}/${page.slug}/`;
  const expectedCanonical = `${siteOrigin}${pagePath}`;
  const title = capture(html, /<title>([\s\S]*?)<\/title>/i, "title", pagePath, errors);
  const description = capture(html, /<meta\s+name="description"\s+content="([^"]+)"/i, "description", pagePath, errors);
  const canonical = capture(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i, "canonical", pagePath, errors);
  const robots = capture(html, /<meta\s+name="robots"\s+content="([^"]+)"/i, "robots", pagePath, errors);
  if (!title) errors.push(`${pagePath}: title is empty`);
  if (!description) errors.push(`${pagePath}: description is empty`);
  if (canonical !== expectedCanonical) errors.push(`${pagePath}: canonical does not match its output path`);
  if (robots !== "index, follow") errors.push(`${pagePath}: robots must be index, follow`);
  if (!sitemapUrls.has(expectedCanonical)) errors.push(`${pagePath}: canonical is absent from sitemap.xml`);
  if (!/<html lang="ja">/.test(html)) errors.push(`${pagePath}: lang=ja is missing`);

  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (schemas.length !== 2) errors.push(`${pagePath}: expected 2 JSON-LD blocks, found ${schemas.length}`);
  const parsedSchemas = [];
  for (const schema of schemas) {
    try { parsedSchemas.push(JSON.parse(schema[1])); }
    catch { errors.push(`${pagePath}: invalid JSON-LD`); }
  }
  const webPage = parsedSchemas.find((schema) => schema["@type"] === "WebPage");
  const breadcrumb = parsedSchemas.find((schema) => schema["@type"] === "BreadcrumbList");
  if (!webPage || webPage.url !== expectedCanonical || webPage.inLanguage !== "ja-JP") errors.push(`${pagePath}: WebPage schema does not match canonical/language`);
  const lastCrumb = breadcrumb?.itemListElement?.at(-1);
  if (!breadcrumb || lastCrumb?.item !== expectedCanonical) errors.push(`${pagePath}: BreadcrumbList does not end at canonical`);

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const idSet = new Set(ids);
  if (idSet.size !== ids.length) errors.push(`${pagePath}: duplicate id attribute detected`);
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1].replace(/&amp;/g, "&"));
  for (const href of hrefs) {
    if (href.startsWith("#") && !idSet.has(href.slice(1))) errors.push(`${pagePath}: missing fragment target ${href}`);
    if (href.startsWith("/") && !sharedRoutesOutsideSlice.has(href) && !href.startsWith(`${pagePath}#`)) errors.push(`${pagePath}: unexpected internal route ${href}`);
  }

  const referralLinks = hrefs.filter((href) => href === "https://r10.to/hNearm");
  if (referralLinks.length !== 3) errors.push(`${pagePath}: expected 3 referral CTAs, found ${referralLinks.length}`);
  if ((html.match(/class="site-header"/g) ?? []).length !== 1) errors.push(`${pagePath}: expected one site header`);
  if ((html.match(/class="site-footer"/g) ?? []).length !== 1) errors.push(`${pagePath}: expected one site footer`);
}

export async function validateTokyoBuild() {
  const errors = [];
  const pages = loadTokyoShopPages();
  const sitemap = await readFile(path.join(legacyRoot, "sitemap.xml"), "utf8");
  const sitemapEntries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, "&"));
  const sitemapUrls = new Set(sitemapEntries);
  if (sitemapUrls.size !== sitemapEntries.length) errors.push("sitemap.xml contains duplicate URLs");

  const generatedTokyoFiles = (await walk(path.join(distRoot, "tokyo"))).filter((file) => file.endsWith("index.html"));
  if (generatedTokyoFiles.length !== pages.length) errors.push(`expected ${pages.length} Tokyo outputs, found ${generatedTokyoFiles.length}`);

  const canonicalSet = new Set();
  for (const page of pages) {
    const outputPath = path.join(distRoot, "tokyo", page.carrier, page.slug, "index.html");
    const html = await readFile(outputPath, "utf8");
    validatePage(html, page, sitemapUrls, errors);
    const canonical = `${siteOrigin}/tokyo/${page.carrier}/${page.slug}/`;
    if (canonicalSet.has(canonical)) errors.push(`${canonical}: duplicate generated canonical`);
    canonicalSet.add(canonical);
  }

  const previewUrls = [...sitemapUrls].filter((url) => url.includes("component-preview") || url.includes("migration"));
  if (previewUrls.length) errors.push(`preview URLs found in sitemap: ${previewUrls.join(", ")}`);

  return {
    passed: errors.length === 0,
    errors,
    summary: {
      shopPages: pages.length,
      generatedTokyoFiles: generatedTokyoFiles.length,
      uniqueCanonicals: canonicalSet.size,
      sitemapUrls: sitemapUrls.size,
      sitemapCoveredShopPages: pages.filter((page) => sitemapUrls.has(`${siteOrigin}/tokyo/${page.carrier}/${page.slug}/`)).length,
      sharedRoutesOutsideSlice: [...sharedRoutesOutsideSlice],
      previewUrlsInSitemap: previewUrls.length,
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await validateTokyoBuild();
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}
