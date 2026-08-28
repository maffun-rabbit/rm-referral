import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { migratedPrefectures, type MigratedPrefectureSlug } from "./load-tokyo-shop-pages.ts";

const legacyRoot = path.resolve(process.cwd(), "..", "vi");
const workerOrigins = {
  "https://rm-referral-vi.maffun.workers.dev": "https://mnp-navi.jp/vi",
  "https://rm-referral-en.maffun.workers.dev": "https://mnp-navi.jp/en",
  "https://rm-referral-zh.maffun.workers.dev": "https://mnp-navi.jp/zh",
  "https://rm-referral-ko.maffun.workers.dev": "https://mnp-navi.jp/ko",
  "https://rm-referral-pt.maffun.workers.dev": "https://mnp-navi.jp/pt",
  "https://rm-referral.maffun.workers.dev": "https://mnp-navi.jp",
} as const;

export type VietnameseLegacyPage = {
  title: string;
  description: string;
  robots: string;
  schemas: string[];
  mainHtml: string;
  localScripts: string[];
};

export type VietnameseShopPage = VietnameseLegacyPage & {
  prefecture: MigratedPrefectureSlug;
  prefectureLabel: string;
  carrier: string;
  slug: string;
  breadcrumbHtml: string;
  hero: { eyebrowHtml: string; headingHtml: string; leadHtml: string; shopCardHtml: string };
  middleHtml: string;
  updated: string;
};

export type VietnameseGuidePage = VietnameseLegacyPage & {
  route: string;
};

export const vietnamesePrefectureSlugs = Object.keys(migratedPrefectures) as MigratedPrefectureSlug[];

function capture(html: string, pattern: RegExp, label: string, sourcePath: string): string {
  const match = html.match(pattern);
  if (!match) throw new Error(`${label} was not found in ${sourcePath}`);
  return match[1].trim();
}

function decodeAttribute(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

export function localizeVietnameseHtml(html: string): string {
  let localized = html;
  for (const [from, to] of Object.entries(workerOrigins)) localized = localized.replaceAll(from, to);
  localized = localized.replace(/((?:href|src)=(["']))\/(?!\/|(?:vi|en|zh|ko|pt)(?:\/|$))([^"']*)/g, "$1/vi/$3");
  return localized
    .replaceAll("通信会社で絞り込む", "Lọc theo nhà mạng")
    .replaceAll(">ドコモ <small>", ">docomo <small>")
    .replaceAll(">ソフトバンク <small>", ">SoftBank <small>")
    .replaceAll(">イオンモバイル <small>", ">AEON Mobile <small>")
    .replaceAll("条件に一致する店舗がありません。検索語または通信会社を変更してください。", "Không tìm thấy cửa hàng phù hợp. Hãy đổi từ khóa hoặc nhà mạng.")
    .replaceAll("オンラインで乗り換えを始める", "Bắt đầu chuyển mạng trực tuyến")
    .replaceAll("紹介キャンペーンの条件を先に確認し、納得してから申し込みへ進んでください。", "Hãy kiểm tra điều kiện chương trình giới thiệu trước khi đăng ký.")
    .replaceAll("紹介キャンペーンを確認する", "Xem điều kiện chương trình giới thiệu")
    .replaceAll("情報確認日：", "Ngày kiểm tra thông tin: ");
}

export function loadVietnameseLegacyPage(relativePath: string): VietnameseLegacyPage {
  const sourcePath = path.join(legacyRoot, relativePath, "index.html");
  const html = readFileSync(sourcePath, "utf8");
  return {
    title: decodeAttribute(capture(html, /<title>([\s\S]*?)<\/title>/i, "title", sourcePath)),
    description: decodeAttribute(capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i, "description", sourcePath)),
    robots: capture(html, /<meta\s+name="robots"\s+content="([^"]*)"/i, "robots", sourcePath),
    schemas: [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      .map((match) => localizeVietnameseHtml(match[1].trim())),
    mainHtml: localizeVietnameseHtml(
      capture(html, /(<main\b[^>]*>[\s\S]*?<\/main>)/i, "main", sourcePath)
        .replace(/\s*<script\b[^>]*src="\/js\/[^"]+"[^>]*><\/script>/gi, ""),
    ),
    localScripts: [...html.matchAll(/<script\b[^>]*src="(\/js\/[^"]+)"[^>]*><\/script>/gi)]
      .map((match) => `/vi${match[1]}`)
      .filter((script) => !script.endsWith("analytics.js")),
  };
}

export function loadVietnameseSitemap(): string {
  return readFileSync(path.join(legacyRoot, "sitemap.xml"), "utf8")
    .replaceAll("https://rm-referral-vi.maffun.workers.dev", "https://mnp-navi.jp/vi");
}

export function loadVietnameseRobots(): string {
  return readFileSync(path.join(legacyRoot, "robots.txt"), "utf8")
    .replaceAll("https://rm-referral-vi.maffun.workers.dev", "https://mnp-navi.jp/vi");
}

function parseVietnameseShop(prefecture: MigratedPrefectureSlug, carrier: string, slug: string): VietnameseShopPage {
  const relativePath = `${prefecture}/${carrier}/${slug}`;
  const page = loadVietnameseLegacyPage(relativePath);
  const mainHtml = page.mainHtml;
  const heroMatch = mainHtml.match(/<section class="shop-hero">([\s\S]*?)<\/section>/i);
  if (!heroMatch || heroMatch.index === undefined) throw new Error(`${relativePath}: shop hero was not found`);
  const finalIndex = mainHtml.indexOf('<section class="final-cta"');
  if (finalIndex < 0) throw new Error(`${relativePath}: final CTA was not found`);
  const heroHtml = heroMatch[1];
  const breadcrumbHtml = capture(mainHtml, /(<nav class="breadcrumb"[\s\S]*?<\/nav>)/i, "breadcrumb", relativePath);
  const breadcrumbLinks = [...breadcrumbHtml.matchAll(/<a\b[^>]*>([^<]+)<\/a>/gi)];
  const prefectureLabel = decodeAttribute(breadcrumbLinks.at(-1)?.[1]?.trim() ?? prefecture);
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
    updated: capture(mainHtml, /<p class="updated">Ngày kiểm tra thông tin:\s*([^<]+)<\/p>/i, "updated date", relativePath),
  };
}

export function loadVietnameseShopPages(): VietnameseShopPage[] {
  return vietnamesePrefectureSlugs.flatMap((prefecture) => {
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
          .map((slug) => parseVietnameseShop(prefecture, carrier, slug));
      });
  });
}

export function loadVietnameseRepresentativeShop(): VietnameseShopPage {
  return parseVietnameseShop("tokyo", "au", "au-shop-narimasu");
}

export function loadVietnameseGuidePages(): VietnameseGuidePage[] {
  const guideRoot = path.join(legacyRoot, "guide");
  const routes: string[] = [];
  const visit = (directory: string, segments: string[]) => {
    if (existsSync(path.join(directory, "index.html"))) routes.push(segments.join("/"));
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) visit(path.join(directory, entry.name), [...segments, entry.name]);
    }
  };
  visit(guideRoot, []);
  return routes
    .filter(Boolean)
    .sort()
    .map((route) => ({ route, ...loadVietnameseLegacyPage(`guide/${route}`) }));
}
