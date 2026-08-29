import {
  createLegacyLanguageLoader,
  localizeLegacyHtml,
  type LegacyGuidePage,
  type LegacyLanguagePage,
  type LegacyShopPage,
} from "./load-legacy-language-pages.ts";

const loader = createLegacyLanguageLoader("vi");

export type VietnameseLegacyPage = LegacyLanguagePage;
export type VietnameseShopPage = LegacyShopPage;
export type VietnameseGuidePage = LegacyGuidePage;

export const vietnamesePrefectureSlugs = loader.prefectureSlugs;
export const loadVietnameseLegacyPage = loader.loadLegacyPage;
export const loadVietnameseSitemap = loader.loadSitemap;
export const loadVietnameseRobots = loader.loadRobots;
export const loadVietnameseShopPages = loader.loadShopPages;
export const loadVietnameseGuidePages = loader.loadGuidePages;
export const localizeVietnameseHtml = (html: string) => localizeLegacyHtml(html, "vi");

export function loadVietnameseRepresentativeShop(): VietnameseShopPage {
  return loader.parseShop("tokyo", "au", "au-shop-narimasu");
}
