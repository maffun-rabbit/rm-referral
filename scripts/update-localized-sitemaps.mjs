import {readFile,writeFile,access} from 'node:fs/promises';
for(const l of ['en','zh','ko','vi','pt']){
 const file=l+'/sitemap.xml';let xml=await readFile(file,'utf8');
 for(const route of ['guide/replacement-program/','tokyo/coverage/']){
  await access(l+'/'+route+'index.html');
  if(!xml.includes('/'+route+'</loc>'))xml=xml.replace('</urlset>','<url><loc>https://mnp-navi.jp/'+l+'/'+route+'</loc><lastmod>2026-09-13</lastmod></url>\n</urlset>');
 }
 await writeFile(file,xml);
}
