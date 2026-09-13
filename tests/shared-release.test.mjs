import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {assertShared} from '../scripts/prepare-release.mjs';
import {validateSource,key,readSource,verifyFrozen,locales} from '../scripts/page-sources.mjs';
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
test('frozen inputs and per-language program sources are valid',()=>{
 assert.ok(verifyFrozen()>40000);for(const l of locales)assert.ok(readSource(l,'guide/replacement-program').mainHtml.includes('<h1'));
});
