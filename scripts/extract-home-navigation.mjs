import {readFileSync,writeFileSync} from 'node:fs';
import {root,locales} from './page-sources.mjs';
import path from 'node:path';
const labels={ja:'🇯🇵 日本語',en:'🇺🇸 English',zh:'🇨🇳 中文',ko:'🇰🇷 한국어',vi:'🇻🇳 Tiếng Việt',pt:'🇧🇷 Português'};
const data={};
for(const l of locales){const html=readFileSync(path.join(root,l==='ja'?'':l,'index.html'),'utf8');const header=html.match(/<header\b[\s\S]*?<\/header>/)[0];const nav=header.match(/<nav\b[\s\S]*?<\/nav>/)[0];data[l]={name:header.match(/class="site-name"[^>]*>(.*?)<\/a>/)[1],label:nav.match(/aria-label="([^"]+)"/)[1],language:labels[l],links:[...nav.matchAll(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(([,href,text])=>({href:href.startsWith('#')?href:new URL(href,'https://mnp-navi.jp').pathname.replace(new RegExp('^/'+l+'(?=/)'),''),text}))};}
writeFileSync(path.join(root,'astro-site/src/i18n/home-navigation.json'),JSON.stringify(data,null,2)+'\n');
