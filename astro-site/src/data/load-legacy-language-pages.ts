import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { getAbsoluteLocaleUrl, LOCALE_CONFIG, type Locale } from "../config/site.ts";
import { legacyLanguageConfig, type ForeignLocale } from "../i18n/legacy.ts";
import { migratedPrefectures, type MigratedPrefectureSlug } from "./load-tokyo-shop-pages.ts";

const workerOrigins: Record<string, string> = {
  "https://rm-referral-vi.maffun.workers.dev": "https://mnp-navi.jp/vi",
  "https://rm-referral-en.maffun.workers.dev": "https://mnp-navi.jp/en",
  "https://rm-referral-zh.maffun.workers.dev": "https://mnp-navi.jp/zh",
  "https://rm-referral-ko.maffun.workers.dev": "https://mnp-navi.jp/ko",
  "https://rm-referral-pt.maffun.workers.dev": "https://mnp-navi.jp/pt",
  "https://rm-referral.maffun.workers.dev": "https://mnp-navi.jp",
};

export type LegacyLanguagePage = {
  title: string;
  description: string;
  robots: string;
  schemas: string[];
  mainHtml: string;
  localScripts: string[];
};

export type LegacyShopPage = LegacyLanguagePage & {
  prefecture: MigratedPrefectureSlug;
  prefectureLabel: string;
  carrier: string;
  slug: string;
  breadcrumbHtml: string;
  hero: { eyebrowHtml: string; headingHtml: string; leadHtml: string; shopCardHtml: string };
  middleHtml: string;
  updated: string;
};

export type LegacyGuidePage = LegacyLanguagePage & { route: string };
export type LegacyCoveragePage = LegacyLanguagePage & {
  prefecture: MigratedPrefectureSlug;
  slug: string;
};

function capture(html: string, pattern: RegExp, label: string, sourcePath: string): string {
  const match = html.match(pattern);
  if (!match) throw new Error(`${label} was not found in ${sourcePath}`);
  return match[1].trim();
}

function decodeAttribute(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

export function localizeLegacyHtml(html: string, locale: ForeignLocale): string {
  let localized = html;
  for (const [from, to] of Object.entries(workerOrigins)) localized = localized.replaceAll(from, to);
  const localePrefixes = Object.values(LOCALE_CONFIG)
    .map((config) => config.pathPrefix.replace(/^\//, ""))
    .filter(Boolean)
    .join("|");
  localized = localized.replace(
    new RegExp(`((?:href|src)=(["']))\\/(?!\\/|(?:${localePrefixes})(?:\\/|$))([^"']*)`, "g"),
    `$1/${locale}/$3`,
  );
  for (const [from, to] of legacyLanguageConfig[locale].replacements) localized = localized.replaceAll(from, to);
  return localized;
}

function localizeLegacySchema(schema: string, locale: ForeignLocale, relativePath: string): string {
  const localized = localizeLegacyHtml(schema, locale);
  try {
    const parsed = JSON.parse(localized) as Record<string, unknown>;
    if (parsed["@type"] === "WebPage") {
      parsed.url = getAbsoluteLocaleUrl(locale, `/${relativePath}/`);
      parsed.inLanguage = LOCALE_CONFIG[locale].inLanguage;
    }
    return JSON.stringify(parsed);
  } catch {
    return localized;
  }
}

export function createLegacyLanguageLoader(locale: ForeignLocale) {
  const legacyRoot = path.resolve(process.cwd(), "..", locale);
  const prefectureSlugs = Object.keys(migratedPrefectures) as MigratedPrefectureSlug[];

  function loadLegacyPage(relativePath: string): LegacyLanguagePage {
    const sourcePath = path.join(legacyRoot, relativePath, "index.html");
    const html = readFileSync(sourcePath, "utf8");
    return {
      title: decodeAttribute(capture(html, /<title>([\s\S]*?)<\/title>/i, "title", sourcePath)),
      description: decodeAttribute(capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i, "description", sourcePath)),
      robots: capture(html, /<meta\s+name="robots"\s+content="([^"]*)"/i, "robots", sourcePath),
      schemas: [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
        .map((match) => localizeLegacySchema(match[1].trim(), locale, relativePath)),
      mainHtml: localizeLegacyHtml(
        capture(html, /(<main\b[^>]*>[\s\S]*?<\/main>)/i, "main", sourcePath)
          .replace(/\s*<script\b[^>]*src="\/js\/[^"]+"[^>]*><\/script>/gi, ""),
        locale,
      ),
      localScripts: [...html.matchAll(/<script\b[^>]*src="(\/js\/[^"]+)"[^>]*><\/script>/gi)]
        .map((match) => `/${locale}${match[1]}`)
        .filter((script) => !script.endsWith("analytics.js")),
    };
  }

  function loadSitemap(): string {
    let sitemap = readFileSync(path.join(legacyRoot, "sitemap.xml"), "utf8");
    for (const [from, to] of Object.entries(workerOrigins)) sitemap = sitemap.replaceAll(from, to);
    return sitemap;
  }

  function loadRobots(): string {
    let robots = readFileSync(path.join(legacyRoot, "robots.txt"), "utf8");
    for (const [from, to] of Object.entries(workerOrigins)) robots = robots.replaceAll(from, to);
    return robots.replace(/^Sitemap:\s*.*$/m, `Sitemap: ${getAbsoluteLocaleUrl(locale, "/sitemap.xml").replace(/\/$/, "")}`);
  }

  function parseShop(prefecture: MigratedPrefectureSlug, carrier: string, slug: string): LegacyShopPage {
    const relativePath = `${prefecture}/${carrier}/${slug}`;
    const page = loadLegacyPage(relativePath);
    const mainHtml = page.mainHtml;
    const heroMatch = mainHtml.match(/<section class="shop-hero">([\s\S]*?)<\/section>/i);
    if (!heroMatch || heroMatch.index === undefined) throw new Error(`${relativePath}: shop hero was not found`);
    const finalIndex = mainHtml.indexOf('<section class="final-cta"');
    if (finalIndex < 0) throw new Error(`${relativePath}: final CTA was not found`);
    const heroHtml = heroMatch[1];
    const breadcrumbHtml = capture(mainHtml, /(<nav class="breadcrumb"[\s\S]*?<\/nav>)/i, "breadcrumb", relativePath);
    const breadcrumbLinks = [...breadcrumbHtml.matchAll(/<a\b[^>]*>([^<]+)<\/a>/gi)];
    const prefectureLabel = decodeAttribute(breadcrumbLinks.at(-1)?.[1]?.trim() ?? prefecture);
    const updatedHtml = capture(mainHtml, /<p class="updated">([\s\S]*?)<\/p>/i, "updated date", relativePath);
    return {
      ...page,
      prefecture,
      prefectureLabel,
      carrier,
      slug,
      breadcrumbHtml,
      hero: {
        eyebrowHtml: capture(heroHtml, /<p class="eyebrow">([\s\S]*?)<\/p>/i, "hero eyebrow", relativePath),
        headingHtml: capture(heroHtml, /<h1>([\s\S]*?)<\/h1>/i, "hero heading", relativePath),
        leadHtml: capture(heroHtml, /<p class="lead">([\s\S]*?)<\/p>/i, "hero lead", relativePath),
        shopCardHtml: capture(heroHtml, /<aside class="shop-card">([\s\S]*?)<\/aside>/i, "shop card", relativePath),
      },
      middleHtml: mainHtml.slice(heroMatch.index + heroMatch[0].length, finalIndex).trim(),
      updated: decodeAttribute(updatedHtml.replace(/^[^:：]*[:：]\s*/, "").trim()),
    };
  }

  function loadShopPages(): LegacyShopPage[] {
    return prefectureSlugs.flatMap((prefecture) => {
      const prefectureRoot = path.join(legacyRoot, prefecture);
      return readdirSync(prefectureRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name !== "coverage")
        .map((entry) => entry.name)
        .sort()
        .flatMap((carrier) => {
          const carrierRoot = path.join(prefectureRoot, carrier);
          return readdirSync(carrierRoot, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort()
            .filter((slug) => existsSync(path.join(carrierRoot, slug, "index.html")))
            .map((slug) => parseShop(prefecture, carrier, slug));
        });
    });
  }

  function loadGuidePages(): LegacyGuidePage[] {
    const guideRoot = path.join(legacyRoot, "guide");
    const routes: string[] = [];
    const visit = (directory: string, segments: string[]) => {
      if (existsSync(path.join(directory, "index.html"))) routes.push(segments.join("/"));
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) visit(path.join(directory, entry.name), [...segments, entry.name]);
      }
    };
    visit(guideRoot, []);
    return routes.filter(Boolean).sort().map((route) => ({ route, ...loadLegacyPage(`guide/${route}`) }));
  }

  function loadCoveragePages(): LegacyCoveragePage[] {
    return prefectureSlugs.flatMap((prefecture) => {
      const coverageRoot = path.join(legacyRoot, prefecture, "coverage");
      if (!existsSync(coverageRoot)) return [];
      return readdirSync(coverageRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(path.join(coverageRoot, entry.name, "index.html")))
        .map((entry) => entry.name)
        .sort()
        .map((slug) => ({ prefecture, slug, ...loadLegacyPage(`${prefecture}/coverage/${slug}`) }));
    });
  }

  return {
    locale,
    legacyRoot,
    prefectureSlugs,
    shopListLabel: legacyLanguageConfig[locale].shopListLabel,
    loadLegacyPage,
    loadSitemap,
    loadRobots,
    parseShop,
    loadShopPages,
    loadGuidePages,
    loadCoveragePages,
  };
}
