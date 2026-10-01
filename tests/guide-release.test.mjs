import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
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

test('six localized sources keep FAQ display/schema and approved referral URLs aligned',async()=>{
  const expectedCta={
    ja:'https://go.mnp-navi.jp/r/switching-guide_ja_guide-replacement-program',
    en:'https://go.mnp-navi.jp/r/switching-guide_en_guide-replacement-program',
    ko:'https://go.mnp-navi.jp/r/switching-guide_ko_topics-replacement',
    pt:'https://go.mnp-navi.jp/r/switching-guide_pt_topics-replacement',
    vi:'https://go.mnp-navi.jp/r/switching-guide_vi_topics-replacement',
    zh:'https://go.mnp-navi.jp/r/switching-guide_zh_topics-replacement',
  };
  for(const locale of Object.keys(expectedCta)){
    const page=JSON.parse(await readFile(new URL(`../content/pages/${locale}/guide/replacement-program/page.json`,import.meta.url),'utf8'));
    const faq=page.schemas.map(JSON.parse).find(value=>value['@type']==='FAQPage');
    assert.equal(page.route,'guide/replacement-program');
    assert.equal(page.canonical,`https://mnp-navi.jp${guideReleaseMapping(locale).pathname}`);
    assert.equal(page.program.ctaHref,expectedCta[locale]);
    assert.equal(page.program.faq.length,5);
    assert.deepEqual(faq.mainEntity.map(item=>({title:item.name,body:item.acceptedAnswer.text})),page.program.faq);
    assert.match(page.program.checked,/2026|2026년/);
    assert.doesNotMatch(JSON.stringify(page),/e36dc612/);
  }
});
