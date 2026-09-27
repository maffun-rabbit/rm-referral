import {CANONICAL_LOCALES,getIncludePath,getPublicPrefix,getTopicPath} from './locale-mapping.mjs';

const visibleStates=new Set(['PRODUCTION_VERIFIED','CURRENT_RELEASE_CANDIDATE']);
const knownStates=new Set([...visibleStates,'UNPUBLISHED','VERSION_UPLOADED','PRODUCTION_FAILED','ROLLED_BACK']);
const fail=message=>{throw new Error('PROMOTION EDGE RESPONSE: '+message);};
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

export function validatePublicationState(state,{promotionId,slug,currentLocale}={}){
  if(state?.schema!==1||state.promotionId!==promotionId||state.slug!==slug||state.currentLocale!==currentLocale)fail('Publication State header mismatch');
  if(!CANONICAL_LOCALES.includes(currentLocale))fail('Unknown current locale');
  const keys=Object.keys(state.locales??{});
  if(keys.length!==CANONICAL_LOCALES.length||CANONICAL_LOCALES.some(locale=>!keys.includes(locale)))fail('Publication State must contain six locales');
  let currentCandidates=0;
  for(const locale of CANONICAL_LOCALES){
    const item=state.locales[locale];
    if(!item||item.locale!==locale||!knownStates.has(item.status)||item.pathname!==getTopicPath(locale,slug)||typeof item.bindingSource!=='string'||!item.bindingSource)fail(`${locale} Publication State mismatch`);
    if(item.status==='CURRENT_RELEASE_CANDIDATE'){currentCandidates++;if(locale!==currentLocale)fail('Current release candidate locale mismatch');}
  }
  if(currentCandidates!==1)fail('Exactly one current release candidate is required');
  return state;
}

export function visiblePromotionLocales(state,options={}){
  validatePublicationState(state,options);
  return CANONICAL_LOCALES.filter(locale=>visibleStates.has(state.locales[locale].status));
}

export function validatePromotionStaticPublication({html,locale,slug,publicationState,promotionId}){
  if(typeof html!=='string')fail('Promotion HTML is required');
  const visible=visiblePromotionLocales(publicationState,{promotionId,slug,currentLocale:locale});
  const headerPath=getIncludePath(locale,'header');
  const header=includeMatch(html,headerPath);
  if(!header)fail('Expected header include wrapper is missing');
  const declared=(header[1].match(/\bdata-locales="([^"]*)"/)?.[1]??'').split(',').filter(Boolean);
  if(new Set(declared).size!==declared.length||declared.length!==visible.length||visible.some(value=>!declared.includes(value)))fail('Static publication locale binding mismatch');
  for(const candidateLocale of CANONICAL_LOCALES){
    const url=`https://mnp-navi.jp${getTopicPath(candidateLocale,slug)}`;
    const present=html.includes(`href="${url}"`);
    if(present!==visible.includes(candidateLocale))fail(`${candidateLocale} hreflang publication mismatch`);
  }
  if(html.includes('/ja/topics/'))fail('/ja/ public migration is forbidden');
  return {publicationLocales:declared,canonicalPublicationLocales:visible};
}

export function transformHeaderInclude({html,locale,pathname,publicationLocales,label}){
  if(typeof html!=='string'||!CANONICAL_LOCALES.includes(locale)||!pathname.startsWith('/'))fail('Invalid header transform input');
  const allowed=new Set(publicationLocales);
  if(!allowed.has(locale)||[...allowed].some(value=>!CANONICAL_LOCALES.includes(value)))fail('Invalid visible locale set');
  const prefix=getPublicPrefix(locale);
  const sharedPath=prefix&&pathname.startsWith(`${prefix}/`)?pathname.slice(prefix.length):pathname;
  return html
    .replace(/<option value="\/(en|zh|ko|vi|pt)\/guide\/replacement-program\/"[^>]*>.*?<\/option>/g,
      (option,targetLocale)=>allowed.has(targetLocale)?option.replace('/guide/replacement-program/',sharedPath):'')
    .replace(/<option value="\/guide\/replacement-program\/"[^>]*>.*?<\/option>/g,
      option=>allowed.has('ja')?option.replace('/guide/replacement-program/',sharedPath):'')
    .replaceAll('/guide/replacement-program/',sharedPath)
    .replace(/(<a class="header-link"[^>]*>).*?(<\/a>)/,
      (match,start,end)=>label?start+escape(label)+end:match);
}

function includeMatch(html,src){
  const escaped=src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return html.match(new RegExp(`<rm-include\\s+src="${escaped}"([^>]*)>([\\s\\S]*?)<\\/rm-include>`));
}

export function transformPromotionEdgeResponse({staticHtml,locale,pathname,headerHtml,footerHtml,publicationState,promotionId,slug}){
  const {publicationLocales:locales}=validatePromotionStaticPublication({html:staticHtml,locale,slug,publicationState,promotionId});
  if(pathname!==getTopicPath(locale,slug))fail('Authorized pathname mismatch');
  const headerPath=getIncludePath(locale,'header'),footerPath=getIncludePath(locale,'footer');
  const header=includeMatch(staticHtml,headerPath),footer=includeMatch(staticHtml,footerPath);
  if(!header||!footer)fail('Expected include wrapper is missing');
  const declared=(header[1].match(/\bdata-locales="([^"]*)"/)?.[1]??'').split(',').filter(Boolean);
  if(JSON.stringify(declared)!==JSON.stringify(locales))fail('Static publication locale binding mismatch');
  const label=(header[1].match(/\bdata-header-label="([^"]*)"/)?.[1]??'').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
  const transformedHeader=transformHeaderInclude({html:headerHtml,locale,pathname,publicationLocales:locales,label});
  return staticHtml.replace(header[0],transformedHeader).replace(footer[0],footerHtml);
}
