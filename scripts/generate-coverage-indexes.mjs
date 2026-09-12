import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const words={en:['Coverage guides','Home'],zh:['网络覆盖指南','首页'],ko:['통신 지역 안내','홈'],vi:['Hướng dẫn vùng phủ sóng','Trang chủ'],pt:['Guias de cobertura','Início']};
for(const [l,[label,home]] of Object.entries(words)){
 for(const pref of await readdir(l,{withFileTypes:true})){
  if(!pref.isDirectory())continue;
  const dir=path.join(l,pref.name,'coverage');
  let cities;try{cities=await readdir(dir,{withFileTypes:true});}catch{continue;}
  const links=[];
  for(const city of cities){
   if(!city.isDirectory())continue;
   const html=await readFile(path.join(dir,city.name,'index.html'),'utf8');
   const title=(html.match(/<title>(.*?)<\/title>/s)?.[1]||city.name).split(' | ')[0];
   links.push('<li><a href="/'+l+'/'+pref.name+'/coverage/'+city.name+'/">'+title+'</a></li>');
  }
  const prefHtml=await readFile(path.join(l,pref.name,'index.html'),'utf8');
  const title=(prefHtml.match(/<title>(.*?)<\/title>/s)?.[1]||pref.name).split(' | ')[0];
  await writeFile(path.join(dir,'index.html'),`<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${label} — ${title}</title><link rel="canonical" href="https://mnp-navi.jp/${l}/${pref.name}/coverage/"><link rel="stylesheet" href="/${l}/css/style.css"></head><body><main style="max-width:900px;margin:auto;padding:32px 24px;line-height:1.75;font-size:17px"><a href="/${l}/">${home}</a><h1>${label}</h1><p>${title}</p><ul>${links.join('')}</ul></main></body></html>`);
 }
}
