import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {assertShared,writeEdgeIncludes} from '../scripts/prepare-release.mjs';
import {validateSource,key,readSource,verifyFrozen,locales} from '../scripts/page-sources.mjs';
import {mkdtempSync,mkdirSync,readFileSync as readText,writeFileSync as writeText,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {IncludeHandler} from '../worker/index.mjs';
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
 for(const l of locales){const c=JSON.parse(readFileSync(new URL('../wrangler'+(l==='ja'?'':'.'+l)+'.jsonc',import.meta.url),'utf8'));assert.equal(c.build.command,'node scripts/prepare-release.mjs');assert.equal(c.assets.directory,'.deploy/'+l);}
});
test('Japanese guide requests alone run through the include Worker',()=>{
 const c=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
 assert.equal(c.main,'worker/index.mjs');
 assert.equal(c.assets.binding,'ASSETS');
 assert.deepEqual(c.assets.run_worker_first,['/guide/*']);
 for(const l of locales.filter(l=>l!=='ja')){
  const other=JSON.parse(readFileSync(new URL('../wrangler.'+l+'.jsonc',import.meta.url),'utf8'));
  assert.equal(other.main,undefined);assert.equal(other.assets.run_worker_first,undefined);
 }
});
test('include replacement keeps fallback when the shared asset fails',async()=>{
 let replaced='';const element={getAttribute:()=> '/_includes/ja/header.html',replace:value=>{replaced=value;}};
 await new IncludeHandler(new Request('https://mnp-navi.jp/guide/test/'),{fetch:async()=>new Response('missing',{status:404})}).element(element);
 assert.equal(replaced,'');
 await new IncludeHandler(new Request('https://mnp-navi.jp/guide/test/'),{fetch:async()=>new Response('<header>shared</header>',{status:200})}).element(element);
 assert.equal(replaced,'<header>shared</header>');
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
