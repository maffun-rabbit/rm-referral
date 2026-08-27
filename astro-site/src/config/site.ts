export const SITE_ORIGIN = "https://mnp-navi.jp";

export const LOCALE_CONFIG = {
  ja: { pathPrefix: "", htmlLang: "ja", ogLocale: "ja_JP", inLanguage: "ja-JP", worker: "rm-referral" },
  vi: { pathPrefix: "/vi", htmlLang: "vi", ogLocale: "vi_VN", inLanguage: "vi-VN", worker: "rm-referral-vi" },
  en: { pathPrefix: "/en", htmlLang: "en", ogLocale: "en_US", inLanguage: "en", worker: "rm-referral-en" },
  zh: { pathPrefix: "/zh", htmlLang: "zh-CN", ogLocale: "zh_CN", inLanguage: "zh-CN", worker: "rm-referral-zh" },
  ko: { pathPrefix: "/ko", htmlLang: "ko", ogLocale: "ko_KR", inLanguage: "ko-KR", worker: "rm-referral-ko" },
  pt: { pathPrefix: "/pt", htmlLang: "pt-BR", ogLocale: "pt_BR", inLanguage: "pt-BR", worker: "rm-referral-pt" },
} as const;

export const REFERRAL_URL = "https://r10.to/hNearm";

export type Locale = keyof typeof LOCALE_CONFIG;
export const SUPPORTED_LOCALES = Object.keys(LOCALE_CONFIG) as Locale[];

function normalizePathname(pathname: string): string {
  const path = `/${pathname}`.replace(/\/{2,}/g, "/");
  return path === "/" ? path : `${path.replace(/^\/+|\/+$/g, "")}/`.replace(/^/, "/");
}

export function getLocalePath(locale: Locale, pathname = "/"): string {
  const normalized = normalizePathname(pathname);
  const prefix = LOCALE_CONFIG[locale].pathPrefix;
  return prefix ? `${prefix}${normalized}` : normalized;
}

export function getAbsoluteLocaleUrl(locale: Locale, pathname = "/"): string {
  return `${SITE_ORIGIN}${getLocalePath(locale, pathname)}`;
}

export type AlternateLink = { hreflang: string; href: string };

export function getAlternateLinks(pathname: string, locales: readonly Locale[]): AlternateLink[] {
  const links: AlternateLink[] = locales.map((locale) => ({
    hreflang: LOCALE_CONFIG[locale].inLanguage,
    href: getAbsoluteLocaleUrl(locale, pathname),
  }));
  if (locales.includes("ja")) {
    links.push({ hreflang: "x-default", href: getAbsoluteLocaleUrl("ja", pathname) });
  }
  return links;
}
