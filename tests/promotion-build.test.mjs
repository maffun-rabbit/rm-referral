import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {PROMOTION_LOCALES,topicMapping} from '../scripts/promotion-release.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=locale=>({locale,route:'topics/promotion-demo',pageType:'guide-topic-v1',title:`${locale} Promotion title`,description:`${locale} Promotion description`,robots:'index, follow',schemas:['{"@context":"https://schema.org","@type":"Article"}'],styles:[],scripts:[],topic:{breadcrumb:{ariaLabel:'Breadcrumb',home:'Home',topics:'Topics',current:'Promotion'},hero:{eyebrow:'GUIDE',heading:`${locale} Promotion heading`,lead:'Answer first',primaryActionLabel:'Read',sourceActionLabel:'Sources',summaryLabel:'Summary',points:['One','Two','Three']},sections:[{id:'answer',type:'prose',heading:'Answer',paragraphs:['Server-rendered topic body']}],sources:{eyebrow:'SOURCES',heading:'Sources',description:'Official information',updatedLabel:'Checked',items:[{label:'Official source',href:'https://example.com/',external:true}]},updatedAt:'2026-09-25',cta:{eyebrow:'NEXT',heading:'Apply now',body:'Continue to official information',link:{label:'Open official site',href:'https://example.com/',external:true}},related:{eyebrow:'RELATED',heading:'Related guides',linkLabel:'Read',items:[{title:'Related',href:'/guide/'}]}}});

test('each locale generates exactly one server-rendered Topic HTML at its mapped asset path', {timeout:120000}, async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'promotion-build-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  for(const locale of PROMOTION_LOCALES){
    const sourceFile=path.join(dir,locale+'.json'),output=path.join(dir,'output-'+locale);await writeFile(sourceFile,JSON.stringify(source(locale)));
    const result=spawnSync(process.execPath,['scripts/build-page.mjs',`${locale}/topics/promotion-demo`,'--output',output],{cwd:root,encoding:'utf8',env:{...process.env,RM_PAGE_SOURCE_FILE:sourceFile,RM_PROMOTION_BUILD:'1'}});
    assert.equal(result.status,0,result.stderr||result.stdout);const summary=JSON.parse(result.stdout.trim().split('\n').at(-1));assert.equal(summary.generatedHtml,1);assert.equal(summary.fullBuild,false);
    const mapping=topicMapping(locale,'promotion-demo'),target=path.join(output,mapping.assetPath.slice(1));const html=await readFile(target,'utf8');
    assert.match(html,new RegExp(`<html lang="${locale==='zh'?'zh-CN':locale==='pt'?'pt-BR':locale==='vi'?'vi':locale==='ko'?'ko':locale==='en'?'en':'ja'}"`));assert.match(html,new RegExp(`<title>${locale} Promotion title</title>`));assert.match(html,new RegExp(`content="${locale} Promotion description"`));assert.match(html,new RegExp(`rel="canonical" href="${mapping.publicUrl.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"`));
    assert.match(html,/application\/ld\+json/);assert.match(html,new RegExp(`<h1>${locale} Promotion heading</h1>`));assert.match(html,/Server-rendered topic body/);assert.match(html,/site-header/);assert.match(html,/site-footer/);assert.match(html,/Open official site/);assert.match(html,/href="[^\"]+"/);assert.doesNotMatch(html,/rel="alternate"/);
  }
});
