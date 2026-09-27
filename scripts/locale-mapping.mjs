export const CANONICAL_LOCALES = Object.freeze(['ja', 'en', 'ko', 'pt', 'vi', 'zh']);

const PUBLIC_PREFIX = Object.freeze({
  ja: '',
  en: '/en',
  ko: '/ko',
  pt: '/pt',
  vi: '/vi',
  zh: '/zh',
});

function requireLocale(locale) {
  if (!CANONICAL_LOCALES.includes(locale)) throw new Error(`Unknown locale: ${locale}`);
  return locale;
}

function requireSlug(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid topic slug: ${slug}`);
  return slug;
}

export function getPublicPrefix(locale) {
  return PUBLIC_PREFIX[requireLocale(locale)];
}

export function getTopicPath(locale, slug) {
  return `${getPublicPrefix(locale)}/topics/${requireSlug(slug)}/`;
}

export function getTopicsIndexPath(locale) {
  return `${getPublicPrefix(locale)}/topics/`;
}

export function getTopicsIndexAssetPath(locale) {
  return `${getTopicsIndexPath(locale)}index.html`;
}

export function getIncludePath(locale, type) {
  requireLocale(locale);
  if (type !== 'header' && type !== 'footer') throw new Error(`Unknown include type: ${type}`);
  return locale === 'ja' ? `/_includes/ja/${type}.html` : `/${locale}/_includes/${type}.html`;
}

export function getSitemapPath(locale) {
  return `${getPublicPrefix(locale)}/sitemap.xml`;
}

export function getRouteNamespace(locale) {
  const prefix = getPublicPrefix(locale);
  return prefix ? `${prefix}/` : '/';
}

export function isInsideProductionRoute(locale, pathname) {
  const namespace = getRouteNamespace(locale);
  return namespace === '/' ? pathname.startsWith('/') : pathname.startsWith(namespace);
}

export function usesEdgeIncludes(locale, canonicalPath) {
  requireLocale(locale);
  return canonicalPath?.startsWith('/topics/') || (getPublicPrefix(locale) === '' && canonicalPath?.startsWith('/guide/')) || false;
}
