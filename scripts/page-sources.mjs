import {readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {REFERRAL_URL} from '../astro-site/src/config/site.ts';
export const root=process.env.RM_SITE_ROOT || (path.basename(process.cwd())==='astro-site'?path.resolve(process.cwd(),'..'):process.cwd());
export const locales=['ja','en','zh','ko','vi','pt'];
const manifestPath=path.join(root,'content/legacy-pages.json');
export const hash=b=>createHash('sha256').update(b).digest('hex');
export function key(locale,route=''){
 if(!locales.includes(locale))throw new Error('Unsupported locale');
 route=route.replace(/^\/+|\/+$/g,'');
 if(route.split('/').some(s=>s==='.'||s==='..')||/[\\?#]/.test(route))throw new Error('Invalid route');
 return locale+'/'+route;
}
export function overrideFile(locale,route=''){return path.join(root,'content/pages',key(locale,route),'page.json');}
let manifest,byKey;
let localeIndex;
export function routeLocales(route=''){
 if(!localeIndex){localeIndex=new Map();for(const p of routes()){const list=localeIndex.get(p.route)||[];list.push(p.locale);localeIndex.set(p.route,list);}}
 return localeIndex.get(route)||[];
}
export function inventory(){return manifest??=JSON.parse(readFileSync(manifestPath,'utf8'));}
export function routes(){
 const out=new Map(inventory().pages.map(p=>[key(p.locale,p.route),p]));
 for(const locale of locales.filter(l=>l!=='ja')){const route='guide/topics/create-rakuten-id-step-by-step';if(!out.has(key(locale,route)))out.set(key(locale,route),{locale,route,native:true});}
 function walk(dir){if(!existsSync(dir))return;for(const e of readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(e.name==='page.json'){const p=JSON.parse(readFileSync(f,'utf8'));validateSource(p,{isOverride:true});out.set(key(p.locale,p.route),p);}}}
 walk(path.join(root,'content/pages'));return [...out.values()];
}
function capture(html,re,fallback=''){return html.match(re)?.[1]?.trim()??fallback;}
export function extract(html,locale,route){
 const main=capture(html,/(<main\b[^>]*>[\s\S]*?<\/main>)/i);
 if(!main)throw new Error('Missing main: '+key(locale,route));
 const head=capture(html,/<head\b[^>]*>([\s\S]*?)<\/head>/i);
 const after=html.slice(html.toLowerCase().indexOf('</main>')+7);
 const scripts=[...head.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi),...after.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)].map(m=>m[0]).filter(s=>!/application\/ld\+json|googletagmanager|analytics\.js/.test(s));
 return {locale,route,title:capture(head,/<title>([\s\S]*?)<\/title>/i),description:capture(head,/<meta\s+name="description"\s+content="([^"]*)"/i),robots:capture(head,/<meta\s+name="robots"\s+content="([^"]*)"/i,'index, follow'),canonical:capture(head,/<link\s+rel="canonical"\s+href="([^"]*)"/i),schemas:[...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]),styles:[...head.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map(m=>m[0]),scripts,mainHtml:main};
}
const guideTopicTypes=new Set(['prose','steps','comparison','cards','warning','faq','table','media']);
const filled=value=>typeof value==='string'&&value.trim().length>0;
const list=value=>Array.isArray(value)&&value.length>0;
const assert=(condition,message)=>{if(!condition)throw new Error('Guide topic regulation: '+message);};
export function validateGuideTopicSource(p){
 const t=p.topic;
 assert(p.pageType==='guide-topic-v1','pageType must be guide-topic-v1');
 assert(p.route.startsWith('topics/'),'route must be under topics/');
 assert(t&&typeof t==='object','topic data is required');
 assert(t.breadcrumb&&filled(t.breadcrumb.ariaLabel)&&filled(t.breadcrumb.home)&&filled(t.breadcrumb.topics)&&filled(t.breadcrumb.current),'breadcrumb labels are required');
 assert(t.hero&&filled(t.hero.eyebrow)&&filled(t.hero.heading)&&filled(t.hero.lead),'hero copy is required');
 assert(filled(t.hero.primaryActionLabel)&&filled(t.hero.sourceActionLabel)&&filled(t.hero.summaryLabel),'hero action and summary labels are required');
 assert(Array.isArray(t.hero.points)&&t.hero.points.length===3&&t.hero.points.every(filled),'hero must contain exactly three summary points');
 assert(list(t.sections),'at least one content section is required');
 const ids=new Set();
 for(const section of t.sections){
  assert(filled(section.id)&&/^[a-z][a-z0-9-]*$/.test(section.id),'section ids must be lowercase ASCII slugs');
  assert(!ids.has(section.id),'section ids must be unique');ids.add(section.id);
  assert(guideTopicTypes.has(section.type),'unsupported section type: '+section.type);
  assert(filled(section.heading),'every section requires a heading');
  if(section.type==='prose')assert(list(section.paragraphs)&&section.paragraphs.every(filled),'prose requires paragraphs');
  if(section.type==='steps'||section.type==='cards')assert(list(section.items)&&section.items.every(item=>filled(item.title)&&filled(item.body)),'steps/cards require title and body items');
  if(section.type==='comparison')assert(Array.isArray(section.columns)&&section.columns.length===2&&section.columns.every(column=>filled(column.label)&&filled(column.title)&&list(column.items)&&column.items.every(filled)),'comparison requires exactly two complete columns');
  if(section.type==='warning')assert(filled(section.label)&&list(section.paragraphs)&&section.paragraphs.every(filled),'warning requires label and paragraphs');
  if(section.type==='faq')assert(list(section.items)&&section.items.every(item=>filled(item.question)&&filled(item.answer)),'faq requires question and answer items');
  if(section.type==='table'){assert(list(section.columns)&&section.columns.every(filled)&&list(section.rows),'table requires columns and rows');assert(section.rows.every(row=>Array.isArray(row)&&row.length===section.columns.length&&row.every(filled)),'table rows must match column count');}
  if(section.type==='media')assert(section.image&&filled(section.image.src)&&filled(section.image.alt),'media requires image src and alt');
 }
 assert(t.sources&&filled(t.sources.eyebrow)&&filled(t.sources.heading)&&filled(t.sources.description)&&filled(t.sources.updatedLabel),'source panel copy is required');
 assert(list(t.sources.items)&&t.sources.items.every(item=>filled(item.label)&&filled(item.href)),'at least one source link is required');
 assert(/^\d{4}-\d{2}-\d{2}$/.test(t.updatedAt),'updatedAt must use YYYY-MM-DD');
 assert(t.cta&&filled(t.cta.eyebrow)&&filled(t.cta.heading)&&filled(t.cta.body)&&t.cta.link&&filled(t.cta.link.label)&&filled(t.cta.link.href),'CTA copy and link are required');
 assert(t.related&&filled(t.related.eyebrow)&&filled(t.related.heading)&&filled(t.related.linkLabel),'related section copy is required');
 assert(list(t.related.items)&&t.related.items.every(item=>filled(item.title)&&filled(item.href)),'at least one related link is required');
 assert(!p.mainHtml,'guide-topic-v1 cannot define mainHtml');
 assert(!list(p.styles)&&!list(p.scripts),'guide-topic-v1 cannot define page-local styles or scripts');
}
export function validateSource(p,{isOverride=false}={}){
 key(p.locale,p.route);if(!p.title)throw new Error('Page requires title');
 if(isOverride&&p.route.startsWith('topics/')&&p.pageType!=='guide-topic-v1')throw new Error('New topics overrides must use pageType guide-topic-v1');
 if(p.pageType==='guide-topic-v1')validateGuideTopicSource(p);
 else {
  if(!p.mainHtml||!/^<main\b/.test(p.mainHtml))throw new Error('Page requires mainHtml');
  if(/<(?:html|head|body)\b|class=["'][^"']*\bsite-(?:header|footer)\b/i.test(p.mainHtml))throw new Error('Shared document/header/footer cannot be embedded in page data');
 }
}
export function readSource(locale,route=''){
 const override=overrideFile(locale,route);let p;
 if(existsSync(override)){p=JSON.parse(readFileSync(override,'utf8'));if(key(p.locale,p.route)!==key(locale,route))throw new Error('Source route mismatch');validateSource(p,{isOverride:true});}
 else {byKey??=new Map(inventory().pages.map(p=>[key(p.locale,p.route),p]));const entry=byKey.get(key(locale,route));if(!entry)throw new Error('Unknown page '+key(locale,route));p=extract(readFileSync(path.join(root,entry.file),'utf8'),locale,route);}
 validateSource(p);const normalized={description:'',robots:'index, follow',schemas:[],styles:[],scripts:[],...p};if(typeof normalized.mainHtml==='string')normalized.mainHtml=normalized.mainHtml.replaceAll('https://r10.to/hNearm',REFERRAL_URL);return normalized;
}
// Compatibility adapter for existing shop parsers: no document/header/footer is returned.
export function sourceMarkup(locale,route=''){
 const p=readSource(locale,route);return `<title>${p.title}</title><meta name="description" content="${p.description}"><meta name="robots" content="${p.robots}"><link rel="canonical" href="${p.canonical}">${p.schemas.map(s=>`<script type="application/ld+json">${s}</script>`).join('')}${p.scripts.join('')}${p.mainHtml}`;
}
export function verifyFrozen(){const errors=[];for(const p of inventory().pages){if(hash(readFileSync(path.join(root,p.file)))!==p.sha256)errors.push(p.file);}if(errors.length)throw new Error('Frozen HTML changed. Edit content/pages via npm run page:edit instead: '+errors.slice(0,8).join(', '));return inventory().pages.length;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [mode,locale,route='']=process.argv.slice(2);
 if(mode==='bootstrap'){
  if(existsSync(manifestPath))throw new Error('Inventory exists: never reset the frozen baseline during routine work');
  const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).split('\0');
  const pages=[];
  for(const file of files){if(!/(^|\/)index\.html$/.test(file)||/^(astro-site|docs|scripts|\.deploy)\//.test(file))continue;
   const html=readFileSync(path.join(root,file),'utf8');if(!/<main\b/.test(html))throw new Error('Missing main in '+file);
   const first=file.split('/')[0],locale=locales.includes(first)?first:'ja';
   const route=file.replace(locale==='ja'?'':locale+'/','').replace(/(^|\/)index\.html$/,'');
   pages.push({locale,route,file,sha256:hash(html)});
  }
  mkdirSync(path.dirname(manifestPath),{recursive:true});writeFileSync(manifestPath,JSON.stringify({version:1,pages},null,2)+'\n');console.log('Frozen '+pages.length+' page sources');
 }else if(mode==='edit'){
  const file=overrideFile(locale,route);if(existsSync(file))console.log(file);else{const p=readSource(locale,route);mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(p,null,2)+'\n');console.log(file);}
 }else if(mode==='check'){console.log('Frozen sources verified: '+verifyFrozen());for(const p of routes())if(existsSync(overrideFile(p.locale,p.route)))readSource(p.locale,p.route);}
 else throw new Error('Usage: page-sources.mjs edit <locale> <route> | check');
}
