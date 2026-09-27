import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inventory, sha256} from './deploy-boundary.mjs';
import {validateSource} from './page-sources.mjs';
import {CANONICAL_LOCALES,getSitemapPath,getTopicPath} from './locale-mapping.mjs';

export const PROMOTION_LOCALES = [...CANONICAL_LOCALES];
const digestPattern = /^[0-9a-f]{64}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fail = message => { throw new Error('PROMOTION RELEASE: ' + message); };
const same = (a,b) => a?.sha256 === b?.sha256 && a?.size === b?.size;

export function topicMapping(locale, slug) {
  if (!PROMOTION_LOCALES.includes(locale)) fail('Unknown locale: ' + locale);
  if (!slugPattern.test(slug)) fail('Invalid topic slug: ' + slug);
  const pathname = getTopicPath(locale, slug);
  return {
    locale,
    slug,
    route: `topics/${slug}`,
    source: `content/pages/${locale}/topics/${slug}/page.json`,
    pathname,
    publicUrl: `https://mnp-navi.jp${pathname}`,
    assetPath: `${pathname}index.html`,
    sitemapAssetPath: getSitemapPath(locale),
  };
}

export const manifestSha256 = manifest => sha256(JSON.stringify(manifest));

export async function validatePromotionManifest(manifest, options={}) {
  if (manifest?.schema !== 1) fail('Unknown manifest schema');
  if (Object.keys(manifest).some(key=>!['schema','promotionId','slug','locales'].includes(key))) fail('Unknown manifest field');
  if (!slugPattern.test(manifest.promotionId ?? '')) fail('Invalid promotionId');
  if (!slugPattern.test(manifest.slug ?? '')) fail('Invalid promotion slug');
  const keys = Object.keys(manifest.locales ?? {});
  if (keys.length !== PROMOTION_LOCALES.length || PROMOTION_LOCALES.some(locale => !keys.includes(locale)) || keys.some(locale => !PROMOTION_LOCALES.includes(locale))) fail('Manifest must contain exactly six known locales');
  const pathnames = new Set(), assets = new Set();
  for (const locale of PROMOTION_LOCALES) {
    const item = manifest.locales[locale];
    const itemKeys=['source','pathname','assetPath','sourceSha256','targetSha256','sitemapAssetPath','baselineReceiptSha256','baselineAttestationSha256'];
    if (!item || Object.keys(item).some(key=>!itemKeys.includes(key)) || itemKeys.some(key=>!(key in item))) fail(`${locale} manifest fields mismatch`);
    const expected = topicMapping(locale, manifest.slug);
    for (const key of ['source','pathname','assetPath','sitemapAssetPath']) if (item?.[key] !== expected[key]) fail(`${locale} ${key} mismatch`);
    if (item.source.includes('..') || item.pathname.includes('..') || item.assetPath.includes('..')) fail(`${locale} path traversal`);
    if (!item.pathname.includes('/topics/') || item.pathname.includes('/guide/') || /\/(?:shop|shops)\//.test(item.pathname)) fail(`${locale} target is outside topics namespace`);
    if (pathnames.has(item.pathname) || assets.has(item.assetPath)) fail('Duplicate pathname or assetPath');
    pathnames.add(item.pathname); assets.add(item.assetPath);
    for (const key of ['sourceSha256','targetSha256','baselineReceiptSha256','baselineAttestationSha256']) if (!digestPattern.test(item[key] ?? '')) fail(`${locale} ${key} must be SHA-256`);
    const sourceFile = path.resolve(options.root ?? root, item.source);
    if (!existsSync(sourceFile)) fail(`${locale} source does not exist`);
    const sourceBytes = await readFile(sourceFile);
    if (sha256(sourceBytes) !== item.sourceSha256) fail(`${locale} source SHA-256 mismatch`);
    const source = JSON.parse(sourceBytes);
    if (source.locale !== locale || source.route !== expected.route) fail(`${locale} source locale/slug mismatch`);
    validateSource(source,{isOverride:true});
    if (options.targetFiles?.[locale]) {
      const targetBytes = await readFile(options.targetFiles[locale]);
      if (sha256(targetBytes) !== item.targetSha256) fail(`${locale} target SHA-256 mismatch`);
    }
    const binding = options.baselineBindings?.[locale];
    if (binding && (binding.receiptSha256 !== item.baselineReceiptSha256 || binding.attestationSha256 !== item.baselineAttestationSha256)) fail(`${locale} baseline binding mismatch`);
  }
  const digest = manifestSha256(manifest);
  if (options.approvedManifestSha256 && options.approvedManifestSha256 !== digest) fail('Manifest changed after approval');
  return {manifestSha256:digest, locales:[...PROMOTION_LOCALES]};
}

export function addTopicToSitemap(xml, mapping) {
  if (typeof xml !== 'string' || !/<urlset\b[^>]*>[\s\S]*<\/urlset>\s*$/.test(xml)) fail('Invalid sitemap XML');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (new Set(urls).size !== urls.length) fail('Baseline sitemap contains duplicate URLs');
  if (urls.includes(mapping.publicUrl)) return {xml,changed:false};
  const entry = `<url><loc>${mapping.publicUrl.replaceAll('&','&amp;')}</loc></url>`;
  return {xml:xml.replace(/<\/urlset>\s*$/, `${entry}</urlset>`),changed:true};
}

export function comparePromotionInventory(baseline, candidate, mapping, expected) {
  const changed=[], added=[], deleted=[], unexpected=[];
  for (const key of Object.keys(baseline)) if (!(key in candidate)) deleted.push(key);
  for (const [key,value] of Object.entries(candidate)) {
    if (!(key in baseline)) added.push(key);
    else if (!same(baseline[key],value)) changed.push(key);
  }
  const allowed = new Set([mapping.assetPath]);
  if (expected.sitemapChanged) allowed.add(mapping.sitemapAssetPath);
  for (const key of [...changed,...added]) if (!allowed.has(key)) unexpected.push(key);
  if (deleted.length || unexpected.length) fail(JSON.stringify({deleted,unexpected}));
  const targetChanges=[...changed,...added].filter(key=>key===mapping.assetPath);
  if (targetChanges.length!==1 || candidate[mapping.assetPath]?.sha256!==expected.targetSha256) fail('Expected exactly one approved target Topic HTML change');
  const sitemapDiff=[...changed,...added].filter(key=>key===mapping.sitemapAssetPath);
  if (sitemapDiff.length !== (expected.sitemapChanged?1:0) || candidate[mapping.sitemapAssetPath]?.sha256!==expected.sitemapAfterSha256) fail('Sitemap change does not match plan');
  return {changed,added,deleted,unexpected,targetHtmlChanges:1,sitemapChanges:sitemapDiff.length,otherChanges:0};
}

export const INVENTORY_SCHEMA = 1;
export const INVENTORY_ALGORITHM = 'tree-inventory-sha256-v1';
const compareAssetPath = (a,b) => a < b ? -1 : a > b ? 1 : 0;
export const inventoryCanonicalBytes = files => Buffer.from(JSON.stringify(Object.fromEntries(Object.entries(files).sort(([a],[b])=>compareAssetPath(a,b)).map(([key,value])=>[key,{sha256:value.sha256,size:value.size}]))));
export const inventorySha256 = files => sha256(inventoryCanonicalBytes(files));

export async function buildPromotionCandidate(plan) {
  const mapping=topicMapping(plan.locale,plan.slug);
  for (const key of ['assetPath','sitemapAssetPath','source']) if (plan[key]!==mapping[key]) fail(`${key} does not match locale mapping`);
  if (!digestPattern.test(plan.manifestSha256 ?? '') || !digestPattern.test(plan.sourceSha256 ?? '') || !digestPattern.test(plan.targetSha256 ?? '') || !digestPattern.test(plan.baselineReceiptSha256 ?? '') || !digestPattern.test(plan.baselineAttestationSha256 ?? '')) fail('Plan hashes are incomplete');
  if (!plan.manifestFile || manifestSha256(JSON.parse(await readFile(plan.manifestFile,'utf8')))!==plan.manifestSha256) fail('Promotion manifest hash mismatch');
  const sourceFile=path.resolve(plan.sourceRoot ?? root,plan.source);
  if (sha256(await readFile(sourceFile))!==plan.sourceSha256) fail('Promotion source hash mismatch');
  if (existsSync(plan.candidate)) fail('Candidate directory already exists; stale candidates are forbidden');
  const baseline=await inventory(plan.baseline);
  if (plan.baselineInventorySchema!==INVENTORY_SCHEMA||plan.baselineInventoryAlgorithm!==INVENTORY_ALGORITHM) fail('Baseline inventory algorithm mismatch');
  if (plan.baselineInventorySha256 && inventorySha256(baseline)!==plan.baselineInventorySha256) fail('Baseline inventory mismatch');
  const targetBytes=await readFile(plan.targetFile);
  if (sha256(targetBytes)!==plan.targetSha256) fail('Target HTML hash mismatch');
  await mkdir(plan.candidate,{recursive:false});
  for (const key of Object.keys(baseline)) {
    const destination=path.join(plan.candidate,key.slice(1));
    await mkdir(path.dirname(destination),{recursive:true});
    await cp(path.join(plan.baseline,key.slice(1)),destination);
  }
  const target=path.join(plan.candidate,mapping.assetPath.slice(1));
  await mkdir(path.dirname(target),{recursive:true});await writeFile(target,targetBytes);
  const sitemap=path.join(plan.candidate,mapping.sitemapAssetPath.slice(1));
  const before=await readFile(sitemap,'utf8');
  if (sha256(before)!==plan.sitemapBeforeSha256) fail('Sitemap before hash mismatch');
  const updated=addTopicToSitemap(before,mapping);
  if (sha256(updated.xml)!==plan.sitemapAfterSha256 || updated.changed!==plan.sitemapChanged) fail('Sitemap output differs from plan');
  if (updated.changed) await writeFile(sitemap,updated.xml);
  const candidate=await inventory(plan.candidate);
  const diff=comparePromotionInventory(baseline,candidate,mapping,plan);
  return {...diff,baselineFiles:Object.keys(baseline).length,candidateFiles:Object.keys(candidate).length,candidateInventorySha256:inventorySha256(candidate)};
}

export function createPromotionPlan({manifest,manifestFile,sourceRoot,locale,baseline,candidate,targetFile,baselineInventory,sitemapBefore}) {
  const item=manifest.locales[locale], mapping=topicMapping(locale,manifest.slug);
  const sitemap=addTopicToSitemap(sitemapBefore,mapping);
  const targetExists=Object.hasOwn(baselineInventory,mapping.assetPath),sitemapExists=Object.hasOwn(baselineInventory,mapping.sitemapAssetPath);
  const expectedChangedPaths=[...(targetExists?[mapping.assetPath]:[]),...(sitemap.changed&&sitemapExists?[mapping.sitemapAssetPath]:[])];
  const expectedAddedPaths=[...(!targetExists?[mapping.assetPath]:[]),...(sitemap.changed&&!sitemapExists?[mapping.sitemapAssetPath]:[])];
  return {schema:1,promotionId:manifest.promotionId,manifestFile,manifestSha256:manifestSha256(manifest),sourceRoot,locale,slug:manifest.slug,source:item.source,sourceSha256:item.sourceSha256,
    assetPath:item.assetPath,targetFile,targetSha256:item.targetSha256,sitemapAssetPath:item.sitemapAssetPath,
    baselineReceiptSha256:item.baselineReceiptSha256,baselineAttestationSha256:item.baselineAttestationSha256,
    baseline,candidate,baselineInventorySchema:INVENTORY_SCHEMA,baselineInventoryAlgorithm:INVENTORY_ALGORITHM,baselineInventorySha256:inventorySha256(baselineInventory),sitemapBeforeSha256:sha256(sitemapBefore),sitemapAfterSha256:sha256(sitemap.xml),sitemapChanged:sitemap.changed,
    expectedChangedPaths,expectedAddedPaths,expectedDeletedPaths:[]};
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [mode,file,pinned]=process.argv.slice(2);
  if (!file) fail('Usage: promotion-release.mjs validate|stage <manifest-or-plan.json> [approved-manifest-sha256]');
  if (mode==='validate') console.log(JSON.stringify(await validatePromotionManifest(JSON.parse(await readFile(file)),{approvedManifestSha256:pinned}),null,2));
  else if (mode==='stage') console.log(JSON.stringify(await buildPromotionCandidate(JSON.parse(await readFile(file))),null,2));
  else fail('Usage: promotion-release.mjs validate|stage <manifest-or-plan.json> [approved-manifest-sha256]');
}
