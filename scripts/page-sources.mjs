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
 function walk(dir){if(!existsSync(dir))return;for(const e of readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(e.name==='page.json'){const p=JSON.parse(readFileSync(f,'utf8'));validateSource(p);out.set(key(p.locale,p.route),p);}}}
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
export function validateSource(p){
 key(p.locale,p.route);if(!p.title||!p.mainHtml||!/^<main\b/.test(p.mainHtml))throw new Error('Page requires title and mainHtml');
 if(/<(?:html|head|body)\b|class=["'][^"']*\bsite-(?:header|footer)\b/i.test(p.mainHtml))throw new Error('Shared document/header/footer cannot be embedded in page data');
}
export function readSource(locale,route=''){
 const override=overrideFile(locale,route);let p;
 if(existsSync(override)){p=JSON.parse(readFileSync(override,'utf8'));if(key(p.locale,p.route)!==key(locale,route))throw new Error('Source route mismatch');}
 else {byKey??=new Map(inventory().pages.map(p=>[key(p.locale,p.route),p]));const entry=byKey.get(key(locale,route));if(!entry)throw new Error('Unknown page '+key(locale,route));p=extract(readFileSync(path.join(root,entry.file),'utf8'),locale,route);}
 validateSource(p);return {description:'',robots:'index, follow',schemas:[],styles:[],scripts:[],...p,mainHtml:p.mainHtml.replaceAll('https://r10.to/hNearm',REFERRAL_URL)};
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
