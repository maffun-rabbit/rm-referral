import {
  createLegacyLanguageLoader,
  type LegacyCoveragePage,
  type LegacyGuidePage,
  type LegacyLanguagePage,
  type LegacyShopPage,
} from "./load-legacy-language-pages.ts";

const loader = createLegacyLanguageLoader("pt");

export type PortugueseLegacyPage = LegacyLanguagePage;
export type PortugueseShopPage = LegacyShopPage;
export type PortugueseGuidePage = LegacyGuidePage;
export type PortugueseCoveragePage = LegacyCoveragePage;

export const portuguesePrefectureSlugs = loader.prefectureSlugs;
export const loadPortugueseLegacyPage = loader.loadLegacyPage;
export const loadPortugueseSitemap = loader.loadSitemap;
export const loadPortugueseRobots = loader.loadRobots;
export const loadPortugueseShopPages = loader.loadShopPages;
export const loadPortugueseGuidePages = loader.loadGuidePages;
export const loadPortugueseCoveragePages = loader.loadCoveragePages;
