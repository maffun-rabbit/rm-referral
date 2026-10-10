import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {guideReleaseMapping, verifyExactGuidePath, verifyGuideCandidate, verifyGuidePlan} from '../scripts/guide-release.mjs';
import {sha256} from '../scripts/deploy-boundary.mjs';
import {verifyProductionCandidate} from '../scripts/production-release-guard.mjs';
import {LOCALE_RUNTIME} from '../scripts/promotion-production.mjs';

async function fixture(t, locale='en') {
  const root = await mkdtemp(path.join(tmpdir(), 'guide-release-'));
  const baseline = path.join(root, 'baseline'), candidate = path.join(root, 'candidate');
  const mapping = guideReleaseMapping(locale);
  const paths = [mapping.assetPath, `${locale === 'ja' ? '' : `/${locale}`}/index.html`, `${locale === 'ja' ? '' : `/${locale}`}/styles/site.css`];
  for (const dir of [baseline,candidate]) for (const asset of paths) {
    const file = path.join(dir,asset.slice(1)); await mkdir(path.dirname(file),{recursive:true}); await writeFile(file, asset===mapping.assetPath ? 'old' : asset);
  }
  await writeFile(path.join(candidate,mapping.assetPath.slice(1)),'new');
  t.after(async()=>{const {rm}=await import('node:fs/promises'); await rm(root,{recursive:true,force:true});});
  return {baseline,candidate,mapping};
}

test('canonical six-locale Guide mapping preserves JA empty prefix',()=>{
  assert.deepEqual(['ja','en','ko','pt','vi','zh'].map(locale=>guideReleaseMapping(locale).pathname),[
    '/guide/replacement-program/','/en/guide/replacement-program/','/ko/guide/replacement-program/',
    '/pt/guide/replacement-program/','/vi/guide/replacement-program/','/zh/guide/replacement-program/'
  ]);
});

test('exact Guide guard accepts one changed replacement-program page for every locale',async t=>{
  for(const locale of ['ja','en','ko','pt','vi','zh']){
    const f=await fixture(t,locale); const result=await verifyGuideCandidate({locale,...f,approvedPathname:f.mapping.pathname});
    assert.deepEqual(result.added,[]); assert.deepEqual(result.deleted,[]); assert.deepEqual(result.changed,[f.mapping.assetPath]);
  }
});

test('exact pathname rejects prefix, suffix, slash, encoding, double slash and other Guide',()=>{
  const target='/en/guide/replacement-program/';
  for(const value of ['/en/guide/replacement-program','/en/guide/replacement-program//','/en/guide/replacement-program/extra/',
    '/en/guide/replacement-program-old/','/en/guide/%72eplacement-program/','/en//guide/replacement-program/',
    '/en/guide/other/','/ko/guide/replacement-program/','/ja/guide/replacement-program/'])
    assert.throws(()=>verifyExactGuidePath('en',value));
  assert.equal(verifyExactGuidePath('en',target),target);
});

test('unknown locale fails closed',()=>assert.throws(()=>guideReleaseMapping('xx'),/Unknown locale/));

test('guard rejects added, deleted, unrelated, Foundation and multiple changes',async t=>{
  for(const mutation of ['added','deleted','unrelated','foundation','multiple']){
    const f=await fixture(t,'en');
    if(mutation==='added'){const file=path.join(f.candidate,'en/guide/extra/index.html');await mkdir(path.dirname(file),{recursive:true});await writeFile(file,'x');}
    if(mutation==='deleted'){const {rm}=await import('node:fs/promises');await rm(path.join(f.candidate,'en/index.html'));}
    if(mutation==='unrelated')await writeFile(path.join(f.candidate,'en/styles/site.css'),'changed');
    if(mutation==='foundation') {const file=path.join(f.candidate,'en/_includes/header.html');await mkdir(path.dirname(file),{recursive:true});await writeFile(file,'x');}
    if(mutation==='multiple')await writeFile(path.join(f.candidate,'en/index.html'),'changed');
    await assert.rejects(()=>verifyGuideCandidate({locale:'en',...f,approvedPathname:f.mapping.pathname}),/Diff outside exact Guide allowlist/);
  }
});

test('plan binds exact candidate inventory and diff',async t=>{
  const f=await fixture(t,'ja'); const result=await verifyGuideCandidate({locale:'ja',...f,approvedPathname:f.mapping.pathname});
  const plan={...result}; const approvedPlanSha256=sha256(Buffer.from(JSON.stringify(plan)));
  await assert.doesNotReject(()=>verifyGuidePlan({plan,approvedPlanSha256,baseline:f.baseline,candidate:f.candidate}));
  await assert.rejects(()=>verifyGuidePlan({plan:{...plan,candidateFileCount:99},approvedPlanSha256:sha256(Buffer.from(JSON.stringify({...plan,candidateFileCount:99}))),baseline:f.baseline,candidate:f.candidate}));
});

test('Production guard accepts only the bound Guide candidate',async t=>{
  const f=await fixture(t,'en');
  const result=await verifyGuideCandidate({locale:'en',...f,approvedPathname:f.mapping.pathname});
  const runtime=LOCALE_RUNTIME.en;
  const plan={...result,worker:runtime.worker,config:runtime.config,baselineDirectory:f.baseline,allowedChangedPaths:[f.mapping.assetPath]};
  const approvedPlanSha256=sha256(Buffer.from(JSON.stringify(plan)));
  await assert.doesNotReject(()=>verifyProductionCandidate({plan,approvedPlanSha256,candidate:f.candidate,config:runtime.config,locale:'en'}));
  await assert.rejects(()=>verifyProductionCandidate({plan:{...plan,allowedChangedPaths:['/en/guide/other/index.html']},approvedPlanSha256,candidate:f.candidate,config:runtime.config,locale:'en'}));
});

// Temporary initial-migration evidence, not the normal article quality standard.
// Remove this mode once the separately approved FAQ remediation is complete.
const INITIAL_MIGRATION_MODE = 'initial-production-reproduction';
const initialMigrationMode = process.env.RM_FAQ_VALIDATION_MODE;
if (initialMigrationMode !== undefined && initialMigrationMode !== INITIAL_MIGRATION_MODE) {
  throw new Error('Unknown RM_FAQ_VALIDATION_MODE');
}
const knownProductionFaqSha256 = 'fb7123f0fb2f85a8d942d85fe79582eeab8dd6152cd0f53b3d6e94c6865577cd';
function faqSchema(page) {
  return page.schemas.map(JSON.parse).find(value=>value['@type']==='FAQPage');
}
function assertFaqQuality(page) {
  const faq=faqSchema(page);
  assert.deepEqual(faq.mainEntity.map(item=>({title:item.name,body:item.acceptedAnswer.text})),page.program.faq);
}
function assertKnownInitialProductionFaq(page, mode) {
  assert.equal(mode,INITIAL_MIGRATION_MODE,'FAQ exception requires explicit initial-migration mode');
  assert.equal(page.locale,'ja');
  assert.equal(page.route,'guide/replacement-program');
  assert.equal(page.canonical,'https://mnp-navi.jp/guide/replacement-program/');
  const faq=faqSchema(page);
  assert.equal(page.program.faq.length,5);
  assert.equal(faq.mainEntity.length,4);
  assert.equal(sha256(Buffer.from(JSON.stringify({display:page.program.faq,schema:faq.mainEntity}))),knownProductionFaqSha256,
    'Only the exact recorded Production FAQ discrepancy is accepted');
}

test('six localized sources keep FAQ display/schema aligned',async()=>{
  for(const locale of ['ja','en','ko','pt','vi','zh']){
    const page=JSON.parse(await readFile(new URL(`../content/pages/${locale}/guide/replacement-program/page.json`,import.meta.url),'utf8'));
    const faq=page.schemas.map(JSON.parse).find(value=>value['@type']==='FAQPage');
    assert.equal(page.route,'guide/replacement-program');
    assert.equal(page.canonical,`https://mnp-navi.jp${guideReleaseMapping(locale).pathname}`);
    assert.equal(page.program.faq.length,5);
    if(initialMigrationMode===INITIAL_MIGRATION_MODE && locale==='ja') {
      assertKnownInitialProductionFaq(page,initialMigrationMode);
    } else {
      assertFaqQuality(page);
    }
    assert.match(page.program.checked,/2026|2026년/);
  }
});

const GUIDE_LOCALES = ['ja','en','ko','pt','vi','zh'];
const allowedReferralHosts = new Set(['r10.to','go.mnp-navi.jp']);
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

function assertAllowedReferralHref(href) {
  assert.equal(typeof href, 'string', 'Generated referral CTA must have an href');
  assert.ok(href.trim(), 'Generated referral CTA href must not be empty');
  const url = new URL(href);
  assert.equal(url.protocol, 'https:', 'Referral CTA must use HTTPS');
  assert.ok(allowedReferralHosts.has(url.hostname), 'Referral CTA hostname must be exactly allowed');
}

function attributeValue(attributes, name) {
  const match = attributes.match(new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1', 'i'));
  if (!match) return undefined;
  return match[2].replace(/&(amp|quot|apos|lt|gt|#x[0-9a-f]+|#[0-9]+);/gi, (_, entity) => {
    if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2),16));
    if (entity.startsWith('#')) return String.fromCodePoint(parseInt(entity.slice(1),10));
    return {amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'}[entity.toLowerCase()];
  });
}

function generatedReferralHref(html) {
  const sections = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
    .filter(([, attributes]) => (attributeValue(attributes,'class') || '').split(/\s+/).includes('program-final-cta'));
  assert.equal(sections.length,1,'Expected exactly one generated referral CTA section');
  const anchors = [...sections[0][2].matchAll(/<a\b([^>]*)>/gi)];
  assert.equal(anchors.length,1,'Expected exactly one referral CTA anchor');
  return attributeValue(anchors[0][1],'href');
}

async function buildGuide(t, locale, override) {
  const directory = await mkdtemp(path.join(tmpdir(),'guide-referral-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  const output = path.join(directory,'output');
  const env = {...process.env};
  // Do not let a caller's single-page override select a different test source.
  delete env.RM_PAGE_SOURCE_FILE;
  delete env.RM_PROMOTION_BUILD;
  delete env.RM_PAGE;
  delete env.RM_PAGE_OUTPUT;
  if (override) {
    const sourceFile = path.join(directory,'source.json');
    await writeFile(sourceFile,JSON.stringify(override));
    env.RM_PAGE_SOURCE_FILE=sourceFile;
    env.RM_PROMOTION_BUILD='1';
  }
  const result=spawnSync(process.execPath,['scripts/build-page.mjs',locale+'/guide/replacement-program','--output',output],
    {cwd:repositoryRoot,encoding:'utf8',env,timeout:60000});
  assert.equal(result.status,0,result.stderr || result.stdout || String(result.error));
  const summary=JSON.parse(result.stdout.trim().split('\n').at(-1));
  assert.equal(summary.generatedHtml,1);
  assert.equal(summary.fullBuild,false);
  return readFile(path.join(output,'guide/replacement-program/index.html'),'utf8');
}

test('referral href allows both exact HTTPS hosts regardless of slug or query', async t=>{
  for (const href of [
    'https://r10.to/hNearm','https://r10.to/xxxxxx',
    'https://go.mnp-navi.jp/r/switching-guide_ja_guide-replacement-program',
    'https://go.mnp-navi.jp/r/example',
    'https://go.mnp-navi.jp/r/e36dc612?source=any&campaign=any',
    'https://r10.to/?anything=allowed','https://go.mnp-navi.jp/',
  ]) await t.test(href,()=>assert.doesNotThrow(()=>assertAllowedReferralHref(href)));
});

test('referral href rejects missing, insecure, invalid and deceptive host URLs', async t=>{
  for (const href of [
    'http://r10.to/hNearm','https://example.com/',
    'https://r10.to.example.com/','https://go.mnp-navi.jp.example.com/',
    'https://r10.to@example.com/','javascript:alert(1)',
    '//r10.to/hNearm','',undefined,null,
  ]) await t.test(String(href),()=>assert.throws(()=>assertAllowedReferralHref(href)));
});

test('generated CTA without a usable href fails instead of inheriting an assumed fallback',()=>{
  for (const anchor of ['<a>Apply</a>','<a href="">Apply</a>','<a data-href="https://r10.to/example">Apply</a>']) {
    const html='<section class="final-cta program-final-cta">'+anchor+'</section>';
    assert.throws(()=>assertAllowedReferralHref(generatedReferralHref(html)));
  }
});

test('all six generated Guide referral CTA hrefs use allowed HTTPS hosts', {timeout:240000}, async t=>{
  for(const locale of GUIDE_LOCALES) {
    const html=await buildGuide(t,locale);
    assertAllowedReferralHref(generatedReferralHref(html));
  }
});

test('unset program.ctaHref generates a valid CTA through the shared fallback', {timeout:120000}, async t=>{
  const page=JSON.parse(await readFile(new URL('../content/pages/ja/guide/replacement-program/page.json',import.meta.url),'utf8'));
  delete page.program.ctaHref;
  const html=await buildGuide(t,'ja',page);
  assertAllowedReferralHref(generatedReferralHref(html));
});


test('FAQ migration exception is explicit, exact and limited to the recorded JA guide',async()=>{
  const page=JSON.parse(await readFile(new URL('../content/pages/ja/guide/replacement-program/page.json',import.meta.url),'utf8'));
  // Synthetic known snapshot is evidence only; it never changes article source.
  const known={"display":[{"title":"24\u56de\u6255\u3048\u3070\u30b9\u30de\u30db\u306f\u81ea\u5206\u306e\u3082\u306e\u306b\u306a\u308b\uff1f","body":"\u306a\u3089\u306a\u3044\u3088\u3002\u6b8b\u308a\u306e\u652f\u6255\u3044\u3092\u4e0d\u8981\u306b\u3059\u308b\u306b\u306f\u300125\u30ab\u6708\u76ee\u4ee5\u964d\u306b\u88fd\u54c1\u3092\u8fd4\u5374\u3057\u3066\u67fb\u5b9a\u3092\u53d7\u3051\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002\u8fd4\u5374\u3057\u306a\u3051\u308c\u307048\u56de\u76ee\u307e\u3067\u652f\u6255\u3044\u307e\u3059\u3002"},{"title":"\u697d\u5929\u30ab\u30fc\u30c9\u4ee5\u5916\u3067\u3082\u7533\u3057\u8fbc\u3081\u308b\uff1f","body":"\u7533\u3057\u8fbc\u3081\u307e\u305b\u3093\u3002\u5951\u7d04\u8005\u672c\u4eba\u540d\u7fa9\u306e\u697d\u5929\u30ab\u30fc\u30c9\u304c\u5fc5\u8981\u3067\u3059\u3002"},{"title":"\u30b9\u30de\u30db\u3092\u8cb7\u3063\u305f\u3042\u3068\u304b\u3089\u5165\u308c\u308b\uff1f","body":"\u5165\u308c\u307e\u305b\u3093\u3002\u5bfe\u8c61\u88fd\u54c1\u3092\u8cfc\u5165\u3059\u308b\u3068\u304d\u306b\u30d7\u30ed\u30b0\u30e9\u30e0\u3092\u9078\u3076\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"},{"title":"\u697d\u5929\u30e2\u30d0\u30a4\u30eb\u306e\u56de\u7dda\u3092\u89e3\u7d04\u3057\u305f\u3089\u652f\u6255\u3044\u3082\u7d42\u308f\u308b\uff1f","body":"\u56de\u7dda\u3092\u89e3\u7d04\u3057\u3066\u3082\u3001\u88fd\u54c1\u4ee3\u306e\u652f\u6255\u3044\u306f\u7d9a\u304d\u307e\u3059\u3002\u901a\u4fe1\u5951\u7d04\u3068\u88fd\u54c1\u306e\u5206\u5272\u6255\u3044\u306f\u5225\u306e\u5951\u7d04\u3068\u3057\u3066\u8003\u3048\u307e\u3057\u3087\u3046\u3002"},{"title":"\u8fd4\u5374\u3059\u308c\u3070\u5fc5\u305a\u8ffd\u52a0\u6599\u91d1\u306f\u306a\u3044\uff1f","body":"\u8fd4\u5374\u6642\u306e\u4e8b\u52d9\u624b\u6570\u6599\u304c\u304b\u304b\u308a\u307e\u3059\u3002\u307e\u305f\u3001\u6545\u969c\u3084\u640d\u50b7\u306e\u72b6\u614b\u306b\u3088\u3063\u3066\u8ffd\u52a0\u8cbb\u7528\u304c\u304b\u304b\u3063\u305f\u308a\u3001\u56de\u53ce\u3055\u308c\u306a\u304b\u3063\u305f\u308a\u3059\u308b\u5834\u5408\u304c\u3042\u308a\u307e\u3059\u3002"}],"schema":[{"@type":"Question","name":"24\u56de\u6255\u3048\u3070\u30b9\u30de\u30db\u306f\u81ea\u5206\u306e\u3082\u306e\u306b\u306a\u308a\u307e\u3059\u304b\uff1f","acceptedAnswer":{"@type":"Answer","text":"\u3044\u3044\u3048\u300225\u30ab\u6708\u76ee\u4ee5\u964d\u306b\u6b8b\u308a\u306e\u652f\u6255\u3044\u3092\u4e0d\u8981\u306b\u3059\u308b\u306b\u306f\u3001\u5bfe\u8c61\u88fd\u54c1\u3092\u697d\u5929\u30e2\u30d0\u30a4\u30eb\u3078\u8fd4\u5374\u3057\u3001\u67fb\u5b9a\u3092\u53d7\u3051\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002\u8fd4\u5374\u305b\u305a48\u56de\u307e\u3067\u652f\u6255\u3048\u3070\u3001\u88fd\u54c1\u3092\u305d\u306e\u307e\u307e\u4f7f\u3044\u7d9a\u3051\u3089\u308c\u307e\u3059\u3002"}},{"@type":"Question","name":"\u697d\u5929\u30ab\u30fc\u30c9\u4ee5\u5916\u3067\u3082\u7533\u3057\u8fbc\u3081\u307e\u3059\u304b\uff1f","acceptedAnswer":{"@type":"Answer","text":"\u3044\u3044\u3048\u300248\u56de\u6255\u3044\u306e\u652f\u6255\u3044\u306b\u306f\u3001\u5951\u7d04\u8005\u672c\u4eba\u540d\u7fa9\u306e\u697d\u5929\u30ab\u30fc\u30c9\u304c\u5fc5\u8981\u3067\u3059\u3002"}},{"@type":"Question","name":"\u3042\u3068\u304b\u3089\u30d7\u30ed\u30b0\u30e9\u30e0\u306b\u5165\u308c\u307e\u3059\u304b\uff1f","acceptedAnswer":{"@type":"Answer","text":"\u3044\u3044\u3048\u3002\u5bfe\u8c61\u88fd\u54c1\u3092\u8cfc\u5165\u3059\u308b\u3068\u304d\u306b\u7533\u3057\u8fbc\u3080\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002\u8cfc\u5165\u5f8c\u304b\u3089\u306e\u52a0\u5165\u306f\u3067\u304d\u307e\u305b\u3093\u3002"}},{"@type":"Question","name":"\u8fd4\u5374\u3059\u308c\u3070\u5fc5\u305a\u8ffd\u52a0\u6599\u91d1\u306f\u3042\u308a\u307e\u305b\u3093\u304b\uff1f","acceptedAnswer":{"@type":"Answer","text":"\u3044\u3044\u3048\u3002\u8fd4\u5374\u6642\u306b\u306f\u4e8b\u52d9\u624b\u6570\u6599\u304c\u304b\u304b\u308a\u3001\u88fd\u54c1\u306e\u72b6\u614b\u306b\u3088\u3063\u3066\u6545\u969c\u8cbb\u7528\u304c\u5fc5\u8981\u306b\u306a\u3063\u305f\u308a\u3001\u56de\u53ce\u3055\u308c\u306a\u304b\u3063\u305f\u308a\u3059\u308b\u5834\u5408\u304c\u3042\u308a\u307e\u3059\u3002"}}]};
  const fixture={...page,locale:'ja',route:'guide/replacement-program',canonical:'https://mnp-navi.jp/guide/replacement-program/',
    program:{...page.program,faq:known.display},schemas:[JSON.stringify({'@type':'FAQPage',mainEntity:known.schema})]};
  assert.throws(()=>assertFaqQuality(fixture));
  assert.throws(()=>assertKnownInitialProductionFaq(fixture,undefined));
  assert.doesNotThrow(()=>assertKnownInitialProductionFaq(fixture,INITIAL_MIGRATION_MODE));
  for(const mutation of [
    {...fixture,locale:'en'},
    {...fixture,route:'guide/other'},
    {...fixture,route:'topics/new-article'},
    {...fixture,canonical:'https://mnp-navi.jp/guide/other/'},
    {...fixture,program:{...fixture.program,faq:fixture.program.faq.map((item,i)=>i?item:{...item,body:item.body+' changed'})}},
    {...fixture,schemas:[JSON.stringify({'@type':'FAQPage',mainEntity:known.schema.slice(1)})]}
  ]) assert.throws(()=>assertKnownInitialProductionFaq(mutation,INITIAL_MIGRATION_MODE));
  const aligned={...fixture,schemas:[JSON.stringify({'@type':'FAQPage',mainEntity:known.display.map(item=>({name:item.title,acceptedAnswer:{text:item.body}}))})]};
  assert.doesNotThrow(()=>assertFaqQuality(aligned));
  assert.throws(()=>assertKnownInitialProductionFaq(aligned,INITIAL_MIGRATION_MODE));
});
