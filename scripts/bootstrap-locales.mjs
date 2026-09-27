import path from 'node:path';
import {getIncludePath} from './locale-mapping.mjs';

export const BOOTSTRAP_LOCALES = Object.freeze({
  ja: {worker:'rm-referral', config:'wrangler.jsonc', bootstrapConfig:'wrangler.bootstrap.jsonc', routeNamespace:'/', baselineNamespace:'release-artifacts/production-baselines/ja', artifactNamespace:'release-artifacts/production-baselines/ja', receiptNamespace:'release-artifacts/production-baselines/ja', attestationNamespace:'release-artifacts/production-baselines/ja', sitemapPath:'/sitemap.xml', topicsNamespace:'/topics/'},
  en: {worker:'rm-referral-en', config:'wrangler.en.jsonc', bootstrapConfig:'wrangler.bootstrap.en.jsonc', routeNamespace:'/en/', baselineNamespace:'release-artifacts/production-baselines/en', artifactNamespace:'release-artifacts/production-baselines/en', receiptNamespace:'release-artifacts/production-baselines/en', attestationNamespace:'release-artifacts/production-baselines/en', sitemapPath:'/en/sitemap.xml', topicsNamespace:'/en/topics/'},
  ko: {worker:'rm-referral-ko', config:'wrangler.ko.jsonc', bootstrapConfig:'wrangler.bootstrap.ko.jsonc', routeNamespace:'/ko/', baselineNamespace:'release-artifacts/production-baselines/ko', artifactNamespace:'release-artifacts/production-baselines/ko', receiptNamespace:'release-artifacts/production-baselines/ko', attestationNamespace:'release-artifacts/production-baselines/ko', sitemapPath:'/ko/sitemap.xml', topicsNamespace:'/ko/topics/'},
  pt: {worker:'rm-referral-pt', config:'wrangler.pt.jsonc', bootstrapConfig:'wrangler.bootstrap.pt.jsonc', routeNamespace:'/pt/', baselineNamespace:'release-artifacts/production-baselines/pt', artifactNamespace:'release-artifacts/production-baselines/pt', receiptNamespace:'release-artifacts/production-baselines/pt', attestationNamespace:'release-artifacts/production-baselines/pt', sitemapPath:'/pt/sitemap.xml', topicsNamespace:'/pt/topics/'},
  vi: {worker:'rm-referral-vi', config:'wrangler.vi.jsonc', bootstrapConfig:'wrangler.bootstrap.vi.jsonc', routeNamespace:'/vi/', baselineNamespace:'release-artifacts/production-baselines/vi', artifactNamespace:'release-artifacts/production-baselines/vi', receiptNamespace:'release-artifacts/production-baselines/vi', attestationNamespace:'release-artifacts/production-baselines/vi', sitemapPath:'/vi/sitemap.xml', topicsNamespace:'/vi/topics/'},
  zh: {worker:'rm-referral-zh', config:'wrangler.zh.jsonc', bootstrapConfig:'wrangler.bootstrap.zh.jsonc', routeNamespace:'/zh/', baselineNamespace:'release-artifacts/production-baselines/zh', artifactNamespace:'release-artifacts/production-baselines/zh', receiptNamespace:'release-artifacts/production-baselines/zh', attestationNamespace:'release-artifacts/production-baselines/zh', sitemapPath:'/zh/sitemap.xml', topicsNamespace:'/zh/topics/'},
});

const fail = message => { throw new Error('BOOTSTRAP LOCALE: ' + message); };
export function requireBootstrapLocale(locale) {
  if (!locale) fail('Explicit locale required');
  if (typeof locale !== 'string' || locale.includes(',') || locale === 'all' || !BOOTSTRAP_LOCALES[locale]) fail('Unknown or multiple locale: ' + locale);
  return BOOTSTRAP_LOCALES[locale];
}

export function parseLocaleArgs(args) {
  const indexes=args.flatMap((value,index)=>value==='--locale'?[index]:[]);
  if(indexes.length!==1||indexes[0]===args.length-1)fail('Exactly one --locale <locale> is required');
  const index=indexes[0], locale=args[index+1];requireBootstrapLocale(locale);
  const rest=args.filter((_,i)=>i!==index&&i!==index+1);
  if(rest.includes('--locale'))fail('Multiple locale values are not allowed');
  return {locale,rest};
}

export function assertLocaleInventory(files, locale) {
  const runtime=requireBootstrapLocale(locale), keys=Object.keys(files);
  if(!keys.length)fail('Empty source tree');
  const root=locale==='ja'?'/index.html':runtime.routeNamespace+'index.html';
  if(!files[root])fail('Locale root missing: '+root);
  const foreign=Object.keys(BOOTSTRAP_LOCALES).filter(x=>x!=='ja');
  const invalid=keys.filter(key=>locale==='ja'
    ? foreign.some(other=>key.startsWith('/'+other+'/'))
    : !key.startsWith(runtime.routeNamespace) && key !== getIncludePath(locale,'header') && key !== getIncludePath(locale,'footer'));
  if(invalid.length)fail('Cross-locale tree: '+JSON.stringify(invalid.slice(0,20)));
  for(const key of keys)if(path.posix.normalize(key)!==key||key.includes('..')||key.includes('\\'))fail('Unsafe locale path: '+key);
  return runtime;
}
