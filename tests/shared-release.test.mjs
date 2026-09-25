import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {assertShared,writeEdgeIncludes} from '../scripts/prepare-release.mjs';
import {validateSource,key,readSource,verifyFrozen,locales} from '../scripts/page-sources.mjs';
import {mkdtempSync,mkdirSync,readFileSync as readText,writeFileSync as writeText,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import worker,{IncludeHandler,PILOT_PATHNAME} from '../worker/index.mjs';
test('raw HTML cannot pass the shared-layout gate',()=>{
 assert.throws(()=>assertShared('<html><main>copied</main></html>','fixture'));
 const h='<meta name="rm-layout" content="shared-v1"><header class="site-header"><div class="site-header-actions"></div></header><main>content</main><footer class="site-footer"></footer>';
 assert.doesNotThrow(()=>assertShared(h,'fixture'));assert.throws(()=>assertShared(h+'<header class="site-header"></header>','duplicate'));
});
test('page data cannot redefine document/header/footer',()=>{
 const p={locale:'en',route:'guide/demo',title:'Demo',mainHtml:'<main><p>Hello</p></main>'};validateSource(p);
 assert.throws(()=>validateSource({...p,mainHtml:'<main><header class="site-header">Duplicate</header></main>'}));
 assert.throws(()=>key('en','../../secret'));assert.throws(()=>key('xx','guide'));
});
test('all language entrypoints use the guarded shared build',()=>{
 for(const l of locales){const c=JSON.parse(readFileSync(new URL('../wrangler'+(l==='ja'?'':'.'+l)+'.jsonc',import.meta.url),'utf8'));if(l==='ja'){assert.equal(c.build.command,'node scripts/deploy-boundary.mjs --wrangler');assert.equal(c.assets.directory,'.deploy/pilot-ja');}else{assert.equal(c.build.command,'node scripts/prepare-release.mjs');assert.equal(c.assets.directory,'.deploy/'+l);}}
});
test('Japanese guide requests alone run through the include Worker',()=>{
 const c=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
 assert.equal(c.main,'worker/index.mjs');
 assert.equal(c.assets.binding,'ASSETS');
 assert.deepEqual(c.assets.run_worker_first,['/guide/rakuten-mobile-three-features/']);
 for(const l of locales.filter(l=>l!=='ja')){
  const other=JSON.parse(readFileSync(new URL('../wrangler.'+l+'.jsonc',import.meta.url),'utf8'));
  assert.equal(other.main,undefined);assert.equal(other.assets.run_worker_first,undefined);
 }
});
test('normal Wrangler build has no implicit full-release fallback',async()=>{
 const packageJson=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
 assert.equal(packageJson.scripts['build:page'],'node scripts/build-page.mjs');
 assert.equal(packageJson.scripts['maintenance:full-build'],'node scripts/release.mjs build');
 const source=await readFile(new URL('../scripts/build-page.mjs',import.meta.url),'utf8');
 assert.match(source,/RM_PAGE is required/);
 assert.doesNotMatch(source,/prepare-release\.mjs/);
 assert.equal(packageJson.scripts.deploy,'node scripts/single-article-deploy.mjs');
 const deploy=await readFile(new URL('../scripts/single-article-deploy.mjs',import.meta.url),'utf8');
 assert.match(deploy,/productionPreflight/);assert.match(deploy,/versions','upload/);assert.doesNotMatch(deploy,/wrangler','deploy|maintenance:full-build|release\.mjs/);
});
test('normal deploy config is exact Japanese guarded pilot and other languages cannot substitute',async()=>{
 const ja=JSON.parse(await readFile(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
 assert.equal(ja.name,'rm-referral');assert.equal(ja.main,'worker/index.mjs');assert.equal(ja.assets.directory,'.deploy/pilot-ja');
 assert.equal(ja.assets.binding,'ASSETS');assert.deepEqual(ja.assets.run_worker_first,['/guide/rakuten-mobile-three-features/']);
 for(const locale of locales.filter(x=>x!=='ja')){const c=JSON.parse(await readFile(new URL('../wrangler.'+locale+'.jsonc',import.meta.url),'utf8'));assert.notEqual(c.name,ja.name);assert.notEqual(c.assets.directory,ja.assets.directory);}
});
test('include replacement keeps fallback when the shared asset fails',async()=>{
 let replaced='';const element={getAttribute:()=> '/_includes/ja/header.html',replace:value=>{replaced=value;}};
 await new IncludeHandler(new Request('https://mnp-navi.jp/guide/test/'),{fetch:async()=>new Response('missing',{status:404})}).element(element);
 assert.equal(replaced,'');
 await new IncludeHandler(new Request('https://mnp-navi.jp/guide/test/'),{fetch:async()=>new Response('<header>shared</header>',{status:200})}).element(element);
 assert.equal(replaced,'<header>shared</header>');
});
test('HTMLRewriter pilot is limited to the exact Japanese pathname',async()=>{
 const original=globalThis.HTMLRewriter;let transforms=0;let includeHandlers=0;
 globalThis.HTMLRewriter=class{
  on(selector,handler){if(selector==='rm-include[src]')includeHandlers++;return this;}
  transform(response){transforms++;return response;}
 };
 const calls=[];const env={ASSETS:{fetch:async request=>{calls.push(new URL(request.url).pathname);return new Response('<html><rm-include src="/_includes/ja/header.html"></rm-include></html>',{headers:{'content-type':'text/html'}});}}};
 try{
  for(const pathname of [PILOT_PATHNAME,'/guide/rakuten-mobile-three-features','/guide/another-guide/','/topics/example/','/','/does-not-exist/']){
   transforms=0;includeHandlers=0;calls.length=0;
   const response=await worker.fetch(new Request('https://mnp-navi.jp'+pathname),env);
   assert.equal(response.status,200,pathname);
   if(pathname===PILOT_PATHNAME){assert.equal(transforms,1);assert.equal(includeHandlers,1);assert.deepEqual(calls,[pathname]);}
   else {assert.equal(transforms,0,pathname);assert.equal(includeHandlers,0,pathname);assert.deepEqual(calls,[pathname],pathname);}
  }
 }finally{globalThis.HTMLRewriter=original;}
});
test('pilot pathname uses canonical trailing slash only',()=>{
 assert.equal(PILOT_PATHNAME,'/guide/rakuten-mobile-three-features/');
 assert.notEqual('/guide/rakuten-mobile-three-features',PILOT_PATHNAME);
});
test('edge include assets are extracted from generated fallback markup',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'rm-includes-'));try{
  const source=path.join(dir,'guide','replacement-program');mkdirSync(source,{recursive:true});
  writeText(path.join(source,'index.html'),'<rm-include src="/_includes/ja/header.html"><header>H</header></rm-include><main>M</main><rm-include src="/_includes/ja/footer.html"><footer>F</footer></rm-include>');
  await writeEdgeIncludes(dir);
  assert.equal(readText(path.join(dir,'_includes','ja','header.html'),'utf8'),'<header>H</header>\n');
  assert.equal(readText(path.join(dir,'_includes','ja','footer.html'),'utf8'),'<footer>F</footer>\n');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('frozen inputs and per-language program sources are valid',()=>{
 assert.ok(verifyFrozen()>40000);for(const l of locales)assert.ok(readSource(l,'guide/replacement-program').mainHtml.includes('<h1'));
});
