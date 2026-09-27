import {createHash} from 'node:crypto';
import {PROMOTION_LOCALES,manifestSha256,topicMapping} from './promotion-release.mjs';
import {validatePublicationState} from './promotion-edge-response.mjs';
import {publicationStateSha256} from './publication-state-node.mjs';

const fail=message=>{throw new Error('PROMOTION PRODUCTION: '+message);};
const digest=/^[0-9a-f]{64}$/;
const id=/^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
export const LOCALE_RUNTIME={
 ja:{worker:'rm-referral',config:'wrangler.jsonc'},en:{worker:'rm-referral-en',config:'wrangler.en.jsonc'},ko:{worker:'rm-referral-ko',config:'wrangler.ko.jsonc'},
 pt:{worker:'rm-referral-pt',config:'wrangler.pt.jsonc'},vi:{worker:'rm-referral-vi',config:'wrangler.vi.jsonc'},zh:{worker:'rm-referral-zh',config:'wrangler.zh.jsonc'},
};
export const productionPlanSha256=plan=>createHash('sha256').update(JSON.stringify(plan)).digest('hex');

export function validateProductionReleasePlan(plan,manifest,{approvedPlanSha256}={}){
 if(plan?.schema!==1||plan.promotionId!==manifest.promotionId||plan.manifestSha256!==manifestSha256(manifest)||!Number.isFinite(Date.parse(plan.createdAt??'')))fail('Plan header does not bind manifest');
 validatePublicationState(plan.publicationState,{promotionId:manifest.promotionId,slug:manifest.slug,currentLocale:plan.publicationState?.currentLocale});
 if(plan.publicationStateSha256!==publicationStateSha256(plan.publicationState))fail('Publication State hash mismatch');
 if(Object.keys(plan.locales??{}).length!==PROMOTION_LOCALES.length||PROMOTION_LOCALES.some(locale=>!plan.locales[locale]))fail('Plan must contain six locales');
 for(const locale of PROMOTION_LOCALES){
  const item=plan.locales[locale],mapping=topicMapping(locale,manifest.slug),runtime=LOCALE_RUNTIME[locale],source=manifest.locales[locale];
  if(item.pathname!==mapping.pathname||item.assetPath!==mapping.assetPath||item.sitemapPath!==mapping.sitemapAssetPath||item.worker!==runtime.worker||item.config!==runtime.config)fail(`${locale} runtime mapping mismatch`);
  if(item.targetSha256!==source.targetSha256||item.baselineReceiptSha256!==source.baselineReceiptSha256||item.baselineAttestationSha256!==source.baselineAttestationSha256)fail(`${locale} manifest binding mismatch`);
  for(const key of ['baselineArtifactSha256','baselineReceiptSha256','baselineAttestationSha256','candidateInventorySha256','targetSha256','sitemapBeforeSha256','sitemapAfterSha256'])if(!digest.test(item[key]??''))fail(`${locale} ${key} is not SHA-256`);
  for(const key of ['expectedCurrentVersionId','rollbackVersionId'])if(!id.test(item[key]??''))fail(`${locale} ${key} missing`);
  const expected=[mapping.assetPath,...(item.sitemapBeforeSha256===item.sitemapAfterSha256?[]:[mapping.sitemapAssetPath])];
  if(JSON.stringify(item.allowedChangedPaths)!==JSON.stringify(expected)||item.allowedDeletedPaths?.length!==0)fail(`${locale} allowlist mismatch`);
 }
 const hash=productionPlanSha256(plan);if(approvedPlanSha256&&approvedPlanSha256!==hash)fail('Release Plan changed after approval');return {releasePlanSha256:hash};
}

export function compileApprovedPromotionRoutes(manifest,plan){
 validateProductionReleasePlan(plan,manifest);return new Map(PROMOTION_LOCALES.map(locale=>[locale,topicMapping(locale,manifest.slug).pathname]));
}

export function isApprovedPromotionRequest(input,locale,routes){
 if(!PROMOTION_LOCALES.includes(locale)||!routes.has(locale))return false;
 const original=String(input);if(original.includes('%')||original.includes('\\'))return false;
 let url;try{url=new URL(input);}catch{return false;}
 const raw=url.pathname;
 if(raw.includes('%')||raw.includes('\\')||raw.includes('//')||raw.includes('/./')||raw.includes('/../'))return false;
 return raw===routes.get(locale);
}

const states=new Set(['PLANNED','VERSION_UPLOADED','VERSION_VERIFIED','PRODUCTION_VERIFIED','FAILED_BEFORE_PRODUCTION','FAILED_AFTER_PRODUCTION']);
export function evaluatePromotionState(localeStates,{crossLocaleSemanticFailure=false}={}){
 for(const locale of PROMOTION_LOCALES)if(!states.has(localeStates[locale]))fail(`Unknown release state for ${locale}`);
 const failedBefore=PROMOTION_LOCALES.filter(locale=>localeStates[locale]==='FAILED_BEFORE_PRODUCTION');
 const failedAfter=PROMOTION_LOCALES.filter(locale=>localeStates[locale]==='FAILED_AFTER_PRODUCTION');
 if(crossLocaleSemanticFailure)return {continueRelease:false,automaticRollback:[],coordinatorDecisionRequired:true};
 return {continueRelease:failedBefore.length===0&&failedAfter.length===0,automaticRollback:failedAfter,blockedLocales:failedBefore,coordinatorDecisionRequired:false};
}
