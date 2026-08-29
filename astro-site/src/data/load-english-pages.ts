import {
  createLegacyLanguageLoader,
  type LegacyCoveragePage,
  type LegacyGuidePage,
  type LegacyLanguagePage,
  type LegacyShopPage,
} from "./load-legacy-language-pages.ts";

const loader = createLegacyLanguageLoader("en");

export type EnglishLegacyPage = LegacyLanguagePage;
export type EnglishShopPage = LegacyShopPage;
export type EnglishGuidePage = LegacyGuidePage;
export type EnglishCoveragePage = LegacyCoveragePage;

export const englishPrefectureSlugs = loader.prefectureSlugs;
export const loadEnglishLegacyPage = loader.loadLegacyPage;
export const loadEnglishSitemap = loader.loadSitemap;
export const loadEnglishRobots = loader.loadRobots;
export const loadEnglishShopPages = loader.loadShopPages;
export const loadEnglishGuidePages = loader.loadGuidePages;
export const loadEnglishCoveragePages = loader.loadCoveragePages;
