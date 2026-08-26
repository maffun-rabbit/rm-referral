import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const legacyRoot = path.resolve(process.cwd(), "..");
const excludedDirectories = new Set(["coverage"]);

export const kantoPrefectures = {
  ibaraki: "茨城",
  tochigi: "栃木",
  gunma: "群馬",
  saitama: "埼玉",
  chiba: "千葉",
  tokyo: "東京",
  kanagawa: "神奈川",
} as const;

export type KantoPrefectureSlug = keyof typeof kantoPrefectures;

export type LegacyShopPage = {
  prefectureSlug: KantoPrefectureSlug;
  prefectureLabel: string;
  carrier: string;
  slug: string;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  schemas: string[];
  breadcrumbHtml: string;
  hero: {
    eyebrowHtml: string;
    headingHtml: string;
    leadHtml: string;
    shopCardHtml: string;
  };
  middleHtml: string;
  updated: string;
};

function capture(html: string, pattern: RegExp, label: string, sourcePath: string): string {
  const match = html.match(pattern);
  if (!match) throw new Error(`${label} was not found in ${sourcePath}`);
  return match[1].trim();
}

function decodeAttribute(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

function parseLegacyPage(sourcePath: string, prefectureSlug: KantoPrefectureSlug, carrier: string, slug: string): LegacyShopPage {
  const html = readFileSync(sourcePath, "utf8");
  const mainHtml = capture(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i, "main", sourcePath);
  const heroMatch = mainHtml.match(/<section class="shop-hero">([\s\S]*?)<\/section>/i);
  if (!heroMatch || heroMatch.index === undefined) throw new Error(`shop hero was not found in ${sourcePath}`);
  const heroHtml = heroMatch[1];
  const finalIndex = mainHtml.indexOf('<section class="final-cta"');
  if (finalIndex < 0) throw new Error(`final CTA was not found in ${sourcePath}`);
  const middleStart = heroMatch.index + heroMatch[0].length;

  return {
    prefectureSlug,
    prefectureLabel: kantoPrefectures[prefectureSlug],
    carrier,
    slug,
    title: decodeAttribute(capture(html, /<title>([\s\S]*?)<\/title>/i, "title", sourcePath)),
    description: decodeAttribute(capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i, "description", sourcePath)),
    canonical: decodeAttribute(capture(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i, "canonical", sourcePath)),
    robots: capture(html, /<meta\s+name="robots"\s+content="([^"]*)"/i, "robots", sourcePath),
    schemas: [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1].trim()),
    breadcrumbHtml: capture(mainHtml, /(<nav class="breadcrumb"[\s\S]*?<\/nav>)/i, "breadcrumb", sourcePath),
    hero: {
      eyebrowHtml: capture(heroHtml, /<p class="eyebrow">([\s\S]*?)<\/p>/i, "hero eyebrow", sourcePath),
      headingHtml: capture(heroHtml, /<h1>([\s\S]*?)<\/h1>/i, "hero heading", sourcePath),
      leadHtml: capture(heroHtml, /<p class="lead">([\s\S]*?)<\/p>/i, "hero lead", sourcePath),
      shopCardHtml: capture(heroHtml, /<aside class="shop-card">([\s\S]*?)<\/aside>/i, "shop card", sourcePath),
    },
    middleHtml: mainHtml.slice(middleStart, finalIndex).trim(),
    updated: capture(mainHtml, /<p class="updated">情報確認日：([^<]+)<\/p>/i, "updated date", sourcePath),
  };
}

export function loadPrefectureShopPages(prefectureSlug: KantoPrefectureSlug): LegacyShopPage[] {
  const prefectureRoot = path.join(legacyRoot, prefectureSlug);
  const carriers = readdirSync(prefectureRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !excludedDirectories.has(entry.name))
    .map((entry) => entry.name)
    .sort();

  return carriers.flatMap((carrier) => {
    const carrierRoot = path.join(prefectureRoot, carrier);
    return readdirSync(carrierRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
      .filter((slug) => existsSync(path.join(carrierRoot, slug, "index.html")))
      .map((slug) => parseLegacyPage(path.join(carrierRoot, slug, "index.html"), prefectureSlug, carrier, slug));
  });
}

export function loadKantoShopPages(): LegacyShopPage[] {
  return (Object.keys(kantoPrefectures) as KantoPrefectureSlug[])
    .flatMap((prefectureSlug) => loadPrefectureShopPages(prefectureSlug));
}

export function loadTokyoShopPages(): LegacyShopPage[] {
  return loadPrefectureShopPages("tokyo");
}
