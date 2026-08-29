import {
  createLegacyLanguageLoader,
  type LegacyCoveragePage,
  type LegacyGuidePage,
  type LegacyLanguagePage,
  type LegacyShopPage,
} from "./load-legacy-language-pages.ts";

const loader = createLegacyLanguageLoader("ko");

export type KoreanLegacyPage = LegacyLanguagePage;
export type KoreanShopPage = LegacyShopPage;
export type KoreanGuidePage = LegacyGuidePage;
export type KoreanCoveragePage = LegacyCoveragePage;

export const koreanPrefectureSlugs = loader.prefectureSlugs;
export const loadKoreanLegacyPage = loader.loadLegacyPage;
export const loadKoreanSitemap = loader.loadSitemap;
export const loadKoreanRobots = loader.loadRobots;
export const loadKoreanShopPages = loader.loadShopPages;
export const loadKoreanGuidePages = loader.loadGuidePages;
export const loadKoreanCoveragePages = loader.loadCoveragePages;
