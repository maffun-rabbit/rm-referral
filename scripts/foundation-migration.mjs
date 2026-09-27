import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {inventory,sha256} from './deploy-boundary.mjs';
import {inventorySha256} from './promotion-release.mjs';
import {LOCALE_RUNTIME} from './promotion-production.mjs';
import {CANONICAL_LOCALES,getIncludePath,getPublicPrefix,getSitemapPath,getTopicsIndexAssetPath,getTopicsIndexPath} from './locale-mapping.mjs';

export const FOUNDATION_LOCALES=[...CANONICAL_LOCALES];
export const TOPICS_COPY={
 ja:{lang:'ja',title:'トピック',description:'携帯電話と通信サービスに関するトピックを掲載します。',home:'ホーム',heading:'トピック',body:'公開済みのトピックを順次掲載します。'},
 en:{lang:'en',title:'Topics',description:'Topics about mobile phones and communication services.',home:'Home',heading:'Topics',body:'Published topics will appear here.'},
 ko:{lang:'ko',title:'토픽',description:'휴대전화와 통신 서비스에 관한 토픽입니다.',home:'홈',heading:'토픽',body:'공개된 토픽을 순차적으로 안내합니다.'},
 pt:{lang:'pt-BR',title:'Tópicos',description:'Tópicos sobre celulares e serviços de comunicação.',home:'Início',heading:'Tópicos',body:'Os tópicos publicados serão exibidos aqui.'},
 vi:{lang:'vi',title:'Chủ đề',description:'Các chủ đề về điện thoại di động và dịch vụ viễn thông.',home:'Trang chủ',heading:'Chủ đề',body:'Các chủ đề đã xuất bản sẽ được hiển thị tại đây.'},
 zh:{lang:'zh-CN',title:'主题',description:'有关手机和通信服务的主题。',home:'首页',heading:'主题',body:'已发布的主题将显示在这里。'}
};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const topicsPath=getTopicsIndexAssetPath;
export const sitemapPath=getSitemapPath;
export const includePaths=locale=>[getIncludePath(locale,'header'),getIncludePath(locale,'footer')];
export const foundationAllowlist=locale=>locale==='ja'?[]:[topicsPath(locale),...includePaths(locale),sitemapPath(locale)];
export function foundationDiff(before,after,allowedPaths){const allowed=new Set(allowedPaths),added=[],changed=[],deleted=[],unexpected=[];for(const key of Object.keys(before))if(!after[key])deleted.push(key);for(const [key,value] of Object.entries(after)){if(!before[key])added.push(key);else if(before[key].sha256!==value.sha256||before[key].size!==value.size)changed.push(key);}for(const key of [...added,...changed])if(!allowed.has(key))unexpected.push(key);if(deleted.length||unexpected.length)throw new Error(JSON.stringify({deleted,unexpected}));return {added,changed,deleted,unexpected,unchanged:Object.keys(after).length-added.length-changed.length};}
export function renderTopicsIndex(locale,header,footer){const c=TOPICS_COPY[locale],prefix=getPublicPrefix(locale),canonical=`https://mnp-navi.jp${getTopicsIndexPath(locale)}`;return `<!doctype html><html lang="${c.lang}"><head><meta charset="UTF-8"><meta name="rm-layout" content="shared-v1"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(c.title)}</title><meta name="description" content="${esc(c.description)}"><meta name="robots" content="index, follow"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(c.title)}"><meta property="og:description" content="${esc(c.description)}"><meta property="og:url" content="${canonical}"><link rel="stylesheet" href="${prefix}/css/style.css"></head><body>${header}<main><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}/">${esc(c.home)}</a><span aria-hidden="true">›</span><span aria-current="page">${esc(c.heading)}</span></nav><section class="guide-topic"><h1>${esc(c.heading)}</h1><p>${esc(c.body)}</p></section></main>${footer}</body></html>\n`;}
export function extractShared(html,tag){const match=html.match(new RegExp(`<${tag} class="site-${tag}"[\\s\\S]*?</${tag}>`));if(!match)throw new Error(`Missing ${tag}`);return match[0]+'\n';}
export function addSitemapUrl(xml,url){if(xml.includes(`<loc>${url}</loc>`))return xml;const entry=`  <url><loc>${url}</loc></url>\n`;if(!xml.includes('</urlset>'))throw new Error('Invalid sitemap');return xml.replace('</urlset>',entry+'</urlset>');}
export async function stageFoundation({locale,baseline,output,planFile,baselineAttestationSha256,current}){
 if(!FOUNDATION_LOCALES.includes(locale))throw new Error('Unknown locale');await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
 const tar=spawnSync('tar',['-xf',baseline,'-C',output],{encoding:'utf8'});if(tar.status!==0)throw new Error(tar.stderr);
 const before=await inventory(output),allowed=foundationAllowlist(locale);
 if(locale!=='ja'){
  const sourcePath=path.join(output,locale,'guide','replacement-program','index.html'),source=await readFile(sourcePath,'utf8');
  const header=extractShared(source,'header'),footer=extractShared(source,'footer');
  for(const [asset,body] of [[includePaths(locale)[0],header],[includePaths(locale)[1],footer],[topicsPath(locale),renderTopicsIndex(locale,header.trim(),footer.trim())]]){const file=path.join(output,asset.slice(1));await mkdir(path.dirname(file),{recursive:true});await writeFile(file,body);}
  const sm=sitemapPath(locale),smFile=path.join(output,sm.slice(1)),xml=await readFile(smFile,'utf8');await writeFile(smFile,addSitemapUrl(xml,`https://mnp-navi.jp${getTopicsIndexPath(locale)}`));
 }
 const after=await inventory(output),diff=foundationDiff(before,after,allowed);
 const plan={schema:1,kind:'foundation',locale,worker:LOCALE_RUNTIME[locale].worker,config:LOCALE_RUNTIME[locale].config,createdAt:new Date().toISOString(),baselineArtifact:path.resolve(baseline),baselineAttestationSha256,current,candidateFileCount:Object.keys(after).length,candidateTotalBytes:Object.values(after).reduce((s,v)=>s+v.size,0),candidateInventorySha256:inventorySha256(after),allowedChangedPaths:allowed,added:diff.added,changed:diff.changed,deleted:diff.deleted,unexpected:diff.unexpected,unchanged:diff.unchanged,approvedPathname:null};
 await writeFile(planFile,JSON.stringify(plan,null,2)+'\n');return {plan,planSha256:sha256(Buffer.from(JSON.stringify(plan))),before,after};
}
