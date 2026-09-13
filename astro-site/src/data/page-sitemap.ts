import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {root,routes} from '../../../scripts/page-sources.mjs';
import {getAbsoluteLocaleUrl,type Locale} from '../config/site';
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function pageSitemap(locale:Locale){
 const file=path.join(root,locale==='ja'?'':locale,'sitemap.xml');
 const old=existsSync(file)?readFileSync(file,'utf8'):'';
 const modified=new Map([...old.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m=>[m[1].match(/<loc>(.*?)<\/loc>/)?.[1],m[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1]]));
 const entries=routes().filter(p=>p.locale===locale&&!/noindex/i.test(p.robots||'')).map(p=>{
  const url=getAbsoluteLocaleUrl(locale,'/'+p.route+(p.route?'/':''));
  const date=modified.get(url);
  return `<url><loc>${escape(url)}</loc>${date?`<lastmod>${escape(date)}</lastmod>`:''}</url>`;
 });
 return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('\n')}</urlset>`;
}
