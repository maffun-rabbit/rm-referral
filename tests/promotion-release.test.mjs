import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {inventory,sha256} from '../scripts/deploy-boundary.mjs';
import {PROMOTION_LOCALES,INVENTORY_SCHEMA,INVENTORY_ALGORITHM,topicMapping,manifestSha256,validatePromotionManifest,addTopicToSitemap,comparePromotionInventory,inventoryCanonicalBytes,inventorySha256,createPromotionPlan,buildPromotionCandidate} from '../scripts/promotion-release.mjs';

const digest=value=>sha256(String(value));
function source(locale,slug='promotion-demo') { return {locale,route:`topics/${slug}`,pageType:'guide-topic-v1',title:`${locale} title`,description:`${locale} description`,robots:'index, follow',schemas:['{"@context":"https://schema.org"}'],styles:[],scripts:[],topic:{breadcrumb:{ariaLabel:'Breadcrumb',home:'Home',topics:'Topics',current:'Demo'},hero:{eyebrow:'GUIDE',heading:'Heading',lead:'Lead',primaryActionLabel:'Read',sourceActionLabel:'Sources',summaryLabel:'Summary',points:['One','Two','Three']},sections:[{id:'answer',type:'prose',heading:'Answer',paragraphs:['Server-rendered body']}],sources:{eyebrow:'SOURCES',heading:'Sources',description:'Official information',updatedLabel:'Checked',items:[{label:'Official',href:'https://example.com/',external:true}]},updatedAt:'2026-09-25',cta:{eyebrow:'NEXT',heading:'Apply',body:'Continue',link:{label:'Open',href:'https://example.com/',external:true}},related:{eyebrow:'RELATED',heading:'Related',linkLabel:'Read',items:[{title:'Guide',href:'/guide/'}]}}}; }

async function manifestFixture(t) {
  const dir=await mkdtemp(path.join(tmpdir(),'promotion-manifest-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const targets={},locales={};
  for(const locale of PROMOTION_LOCALES){
    const mapping=topicMapping(locale,'promotion-demo');
    const file=path.join(dir,mapping.source);await mkdir(path.dirname(file),{recursive:true});const bytes=JSON.stringify(source(locale));await writeFile(file,bytes);
    const target=path.join(dir,'targets',locale+'.html');await mkdir(path.dirname(target),{recursive:true});await writeFile(target,`<!doctype html><html lang="${locale}"><main>${locale}</main></html>`);targets[locale]=target;
    locales[locale]={source:mapping.source,pathname:mapping.pathname,assetPath:mapping.assetPath,sitemapAssetPath:mapping.sitemapAssetPath,sourceSha256:sha256(bytes),targetSha256:sha256(await readFile(target)),baselineReceiptSha256:digest(locale+' receipt'),baselineAttestationSha256:digest(locale+' attestation')};
  }
  return {dir,targets,manifest:{schema:1,promotionId:'promotion-demo',slug:'promotion-demo',locales}};
}

test('six-locale mapping is deterministic and prefix-safe',()=>{
  for(const locale of PROMOTION_LOCALES){const m=topicMapping(locale,'demo');const prefix=locale==='ja'?'':`/${locale}`;assert.equal(m.pathname,`${prefix}/topics/demo/`);assert.equal(m.assetPath,`${prefix}/topics/demo/index.html`);assert.equal(m.sitemapAssetPath,locale==='ja'?'/sitemap.xml':`/${locale}/sitemap.xml`);assert.equal(m.source,`content/pages/${locale}/topics/demo/page.json`);}
  assert.throws(()=>topicMapping('xx','demo'),/Unknown locale/);assert.throws(()=>topicMapping('ja','../shop'),/Invalid/);
});

test('valid manifest binds all sources, targets, baselines and approval hash',async t=>{
  const f=await manifestFixture(t);const approved=manifestSha256(f.manifest);const bindings=Object.fromEntries(PROMOTION_LOCALES.map(locale=>[locale,{receiptSha256:f.manifest.locales[locale].baselineReceiptSha256,attestationSha256:f.manifest.locales[locale].baselineAttestationSha256}]));
  assert.equal((await validatePromotionManifest(f.manifest,{root:f.dir,targetFiles:f.targets,baselineBindings:bindings,approvedManifestSha256:approved})).manifestSha256,approved);
});

test('manifest validator fails closed for schema, locale, slug, path, hash, duplicate and mutation errors',async t=>{
  const f=await manifestFixture(t), valid=f.manifest;
  const cases=[];
  const add=(change,re)=>{const m=structuredClone(valid);change(m);cases.push([m,re]);};
  add(m=>m.schema=2,/schema/);add(m=>delete m.locales.zh,/six/);add(m=>{m.locales.xx=m.locales.zh;delete m.locales.zh;},/six/);add(m=>m.slug='../shop',/slug/);
  add(m=>m.locales.en.source='content/pages/ja/topics/promotion-demo/page.json',/source mismatch/);add(m=>m.locales.en.pathname='/en/guide/promotion-demo/',/pathname mismatch/);add(m=>m.locales.en.assetPath='/en/shop/demo/index.html',/assetPath mismatch/);add(m=>m.locales.en.sitemapAssetPath='/sitemap.xml',/sitemapAssetPath mismatch/);
  add(m=>m.locales.en.sourceSha256=digest('wrong'),/source SHA/);add(m=>m.locales.en.targetSha256=digest('wrong'),/target SHA/);add(m=>m.locales.en.baselineReceiptSha256='bad',/baselineReceipt/);add(m=>m.locales.en.baselineAttestationSha256='bad',/baselineAttestation/);
  add(m=>m.extra=true,/Unknown manifest field/);add(m=>m.locales.en.extra=true,/manifest fields/);
  for(const [manifest,re] of cases) await assert.rejects(validatePromotionManifest(manifest,{root:f.dir,targetFiles:f.targets}),re);
  await assert.rejects(validatePromotionManifest(valid,{root:f.dir,approvedManifestSha256:digest('old')}),/changed after approval/);
  await assert.rejects(validatePromotionManifest(valid,{root:f.dir,baselineBindings:{en:{receiptSha256:digest('wrong'),attestationSha256:valid.locales.en.baselineAttestationSha256}}}),/baseline binding mismatch/);
});

test('sitemap adds only the canonical target once and is deterministic',()=>{
  const mapping=topicMapping('en','promotion-demo'), before='<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://mnp-navi.jp/en/</loc></url></urlset>';
  const first=addTopicToSitemap(before,mapping),second=addTopicToSitemap(first.xml,mapping);
  assert.equal(first.changed,true);assert.equal(second.changed,false);assert.equal(second.xml,first.xml);assert.equal((first.xml.match(/promotion-demo/g)||[]).length,1);assert.match(first.xml,/<\/urlset>$/);
  assert.throws(()=>addTopicToSitemap('<html/>',mapping),/Invalid sitemap/);
});

async function candidateFixture(t,{existingTarget=false,existingSitemapUrl=false}={}){
  const dir=await mkdtemp(path.join(tmpdir(),'promotion-candidate-'));t.after(()=>rm(dir,{recursive:true,force:true}));const baseline=path.join(dir,'baseline');await mkdir(baseline);
  const files={'/index.html':'root','/guide/other/index.html':'guide','/topics/other/index.html':'other topic','/shop/demo/index.html':'shop','/css/style.css':'css','/js/app.js':'js','/images/a.webp':'image','/fonts/a.woff2':'font','/robots.txt':'robots','/_includes/ja/header.html':'header'};
  for(let i=0;i<300;i++)files[`/prefecture/carrier/shop-${i}/index.html`]='shop '+i;
  const mapping=topicMapping('ja','promotion-demo');if(existingTarget)files[mapping.assetPath]='old target';
  files[mapping.sitemapAssetPath]=`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://mnp-navi.jp/</loc></url>${existingSitemapUrl?`<url><loc>${mapping.publicUrl}</loc></url>`:''}</urlset>`;
  for(const [key,body] of Object.entries(files)){const f=path.join(baseline,key.slice(1));await mkdir(path.dirname(f),{recursive:true});await writeFile(f,body);}
  const targetFile=path.join(dir,'target.html');await writeFile(targetFile,'new topic');const baselineInventory=await inventory(baseline);
  const sources={};for(const locale of PROMOTION_LOCALES){const m=topicMapping(locale,'promotion-demo'),file=path.join(dir,m.source);await mkdir(path.dirname(file),{recursive:true});const bytes=JSON.stringify(source(locale));await writeFile(file,bytes);sources[locale]=sha256(bytes);}
  const manifest={schema:1,promotionId:'promotion-demo',slug:'promotion-demo',locales:Object.fromEntries(PROMOTION_LOCALES.map(locale=>{const m=topicMapping(locale,'promotion-demo');return [locale,{source:m.source,pathname:m.pathname,assetPath:m.assetPath,sitemapAssetPath:m.sitemapAssetPath,sourceSha256:sources[locale],targetSha256:locale==='ja'?digest('new topic'):digest(locale+' target'),baselineReceiptSha256:digest(locale+' receipt'),baselineAttestationSha256:digest(locale+' attestation')}];}))};
  const manifestFile=path.join(dir,'manifest.json');await writeFile(manifestFile,JSON.stringify(manifest));
  const plan=createPromotionPlan({manifest,manifestFile,sourceRoot:dir,locale:'ja',baseline,candidate:path.join(dir,'candidate'),targetFile,baselineInventory,sitemapBefore:files[mapping.sitemapAssetPath]});
  return {dir,baseline,mapping,targetFile,baselineInventory,plan};
}

test('candidate copies a large baseline and changes only target plus required sitemap',async t=>{
  const f=await candidateFixture(t);const result=await buildPromotionCandidate(f.plan);assert.equal(result.baselineFiles,311);assert.equal(result.targetHtmlChanges,1);assert.equal(result.sitemapChanges,1);assert.equal(result.otherChanges,0);assert.deepEqual(result.deleted,[]);assert.deepEqual(await inventory(f.baseline),f.baselineInventory);await assert.rejects(buildPromotionCandidate(f.plan),/already exists/);
});

test('existing sitemap URL produces target-only candidate',async t=>{
  const f=await candidateFixture(t,{existingTarget:true,existingSitemapUrl:true});const result=await buildPromotionCandidate(f.plan);assert.equal(result.targetHtmlChanges,1);assert.equal(result.sitemapChanges,0);assert.deepEqual(result.changed,[f.mapping.assetPath]);
});

test('inventory guard rejects shop, other topic, guide, CSS, JS, image, font, robots, include, addition and deletion',async t=>{
  const f=await candidateFixture(t,{existingTarget:true,existingSitemapUrl:true});await buildPromotionCandidate(f.plan);const valid=await inventory(f.plan.candidate);
  const mutations=[['/shop/demo/index.html','change'],['/topics/other/index.html','change'],['/guide/other/index.html','change'],['/css/style.css','change'],['/js/app.js','change'],['/images/a.webp','change'],['/fonts/a.woff2','change'],['/robots.txt','change'],['/_includes/ja/header.html','change'],['/surprise.bin','add'],['/index.html','delete']];
  for(const [key,kind] of mutations){const candidate=structuredClone(valid);if(kind==='delete')delete candidate[key];else candidate[key]={sha256:digest(key),size:99};assert.throws(()=>comparePromotionInventory(f.baselineInventory,candidate,f.mapping,f.plan),/deleted|unexpected/);}
});

test('plan fixes manifest, source, target, baseline, candidate and sitemap hashes separately',async t=>{
  const f=await candidateFixture(t);assert.match(f.plan.manifestSha256,/^[0-9a-f]{64}$/);assert.equal(f.plan.baselineInventorySchema,INVENTORY_SCHEMA);assert.equal(f.plan.baselineInventoryAlgorithm,INVENTORY_ALGORITHM);assert.equal(f.plan.baselineInventorySha256,inventorySha256(f.baselineInventory));assert.deepEqual(f.plan.expectedDeletedPaths,[]);assert.deepEqual(f.plan.expectedChangedPaths,[f.mapping.sitemapAssetPath]);assert.deepEqual(f.plan.expectedAddedPaths,[f.mapping.assetPath]);
});

test('versioned inventory hash is canonical, deterministic and content/path sensitive',()=>{
  const a={'/zh/b/index.html':{sha256:digest('b'),size:1},'/zh/a/index.html':{sha256:digest('a'),size:1}};
  const reordered={'/zh/a/index.html':{size:a['/zh/a/index.html'].size,sha256:a['/zh/a/index.html'].sha256},'/zh/b/index.html':{size:a['/zh/b/index.html'].size,sha256:a['/zh/b/index.html'].sha256}};
  assert.equal(INVENTORY_SCHEMA,1);assert.equal(INVENTORY_ALGORITHM,'tree-inventory-sha256-v1');
  assert.equal(inventorySha256(a),inventorySha256(reordered));assert.deepEqual(inventoryCanonicalBytes(a),inventoryCanonicalBytes(reordered));
  for(const changed of [
    {...reordered,'/zh/a/index.html':{sha256:digest('changed'),size:1}},
    {...reordered,'/zh/c/index.html':{sha256:digest('c'),size:1}},
    {'/zh/a/index.html':reordered['/zh/a/index.html']},
    {'/zh/a-renamed/index.html':reordered['/zh/a/index.html'],'/zh/b/index.html':reordered['/zh/b/index.html']},
  ]) assert.notEqual(inventorySha256(changed),inventorySha256(reordered));
});

test('candidate rejects missing or unrecognized inventory algorithm metadata',async t=>{
  const missing=await candidateFixture(t);delete missing.plan.baselineInventoryAlgorithm;await assert.rejects(buildPromotionCandidate(missing.plan),/inventory algorithm/);
  const wrong=await candidateFixture(t);wrong.plan.baselineInventoryAlgorithm='tree-inventory-sha256-v2';await assert.rejects(buildPromotionCandidate(wrong.plan),/inventory algorithm/);
});

test('candidate refuses manifest and source changes after the plan is fixed',async t=>{
  const a=await candidateFixture(t);await writeFile(a.plan.manifestFile,'{}');await assert.rejects(buildPromotionCandidate(a.plan),/manifest hash mismatch/);
  const b=await candidateFixture(t);await writeFile(path.join(b.plan.sourceRoot,b.plan.source),'{}');await assert.rejects(buildPromotionCandidate(b.plan),/source hash mismatch/);
});
