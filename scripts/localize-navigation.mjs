import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const locales=['en','zh','ko','vi','pt'];
const existsCache=new Map();
export async function localizeNavigation(html, locale, root) {
  const matches=[...html.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)];
  let result=html;
  for(const [tag,quote,href,content] of matches){
    if(!href.startsWith('/') && !/^https?:\/\/(mnp-navi\.jp|rm-referral\.maffun\.workers\.dev)(\/|$)/.test(href)) continue;
    if(href.startsWith('//')) continue;
    const u=new URL(href,'https://mnp-navi.jp');
    if(locales.some(l=>u.pathname==='/'+l || u.pathname.startsWith('/'+l+'/'))) continue;
    if(/\.(css|js|png|jpg|webp|svg|xml|txt|pdf)$/i.test(u.pathname)) continue;
    const target=path.join(root,locale,u.pathname.replace(/^\//,''),u.pathname.endsWith('/')?'index.html':'');
    if(!existsCache.has(target)) { try{await access(target);existsCache.set(target,true);}catch{existsCache.set(target,false);} }
    if(!existsCache.get(target)) {
      result=result.replace(tag,'<span data-translation-pending="'+locale+u.pathname+'">'+content+'</span>');
      continue;
    }
    result=result.replace(tag,tag.replace(quote+href+quote,quote+'/'+locale+u.pathname+u.search+u.hash+quote));
  }
  return result;
}
export async function repairTree(root){
  const counts={};
  async function walk(dir,locale){
    for(const e of await readdir(dir,{withFileTypes:true})){
      const p=path.join(dir,e.name);
      if(e.isDirectory()) await walk(p,locale);
      else if(e.name.endsWith('.html')){
        const before=await readFile(p,'utf8'),after=await localizeNavigation(before,locale,root);
        if(before!==after){await writeFile(p,after);counts[locale]=(counts[locale]||0)+1;}
      }
    }
  }
  for(const l of locales) await walk(path.join(root,l),l);
  console.log(JSON.stringify(counts));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await repairTree(process.cwd());
