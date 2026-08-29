import {
  createLegacyLanguageLoader,
  type LegacyCoveragePage,
  type LegacyGuidePage,
  type LegacyLanguagePage,
  type LegacyShopPage,
} from "./load-legacy-language-pages.ts";

const loader = createLegacyLanguageLoader("zh");

export type ChineseLegacyPage = LegacyLanguagePage;
export type ChineseShopPage = LegacyShopPage;
export type ChineseGuidePage = LegacyGuidePage;
export type ChineseCoveragePage = LegacyCoveragePage;

export const chinesePrefectureSlugs = loader.prefectureSlugs;
export const loadChineseLegacyPage = loader.loadLegacyPage;
export const loadChineseSitemap = loader.loadSitemap;
export const loadChineseRobots = loader.loadRobots;
export const loadChineseShopPages = loader.loadShopPages;
export const loadChineseGuidePages = loader.loadGuidePages;
export const loadChineseCoveragePages = loader.loadCoveragePages;
