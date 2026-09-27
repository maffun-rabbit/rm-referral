import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {inventory,sha256} from './deploy-boundary.mjs';
import {inventorySha256,topicMapping} from './promotion-release.mjs';
import {LOCALE_RUNTIME} from './promotion-production.mjs';

const fail=message=>{throw new Error('PRODUCTION RELEASE GUARD: '+message);};
export async function verifyProductionCandidate({plan,approvedPlanSha256,candidate,config,locale}){
  if(!plan||!['foundation','promotion'].includes(plan.kind))fail('Unknown release kind');
  if(sha256(Buffer.from(JSON.stringify(plan)))!==approvedPlanSha256)fail('Plan hash mismatch');
  const runtime=LOCALE_RUNTIME[locale];
  if(!runtime||plan.locale!==locale||plan.worker!==runtime.worker||plan.config!==config)fail('Locale/Worker/config mismatch');
  const files=await inventory(candidate),hash=inventorySha256(files);
  if(hash!==plan.candidateInventorySha256||Object.keys(files).length!==plan.candidateFileCount)fail('Candidate inventory mismatch');
  if(plan.deleted?.length)fail('Deleted assets are forbidden');
  const allowed=new Set(plan.allowedChangedPaths??[]);
  if((plan.changed??[]).some(p=>!allowed.has(p))||(plan.added??[]).some(p=>!allowed.has(p)))fail('Allowlist mismatch');
  if(plan.kind==='promotion'){
    if(!plan.approvedPathname||!plan.slug)fail('Promotion exact pathname missing');
    const mapping=topicMapping(locale,plan.slug),added=plan.added??[],changed=plan.changed??[],unexpected=plan.unexpected??[];
    if(plan.approvedPathname!==mapping.pathname||plan.assetPath!==mapping.assetPath||plan.sitemapAssetPath!==mapping.sitemapAssetPath)fail('Promotion mapping mismatch');
    if(new Set(added).size!==added.length||new Set(changed).size!==changed.length||added.some(p=>changed.includes(p)))fail('Promotion diff contains duplicate paths');
    const targetCount=Number(added.includes(mapping.assetPath))+Number(changed.includes(mapping.assetPath));
    const sitemapCount=Number(changed.includes(mapping.sitemapAssetPath));
    const expectedAllowed=[mapping.assetPath,...(sitemapCount?[mapping.sitemapAssetPath]:[])];
    if(targetCount!==1||added.includes(mapping.sitemapAssetPath)||unexpected.length||added.length+changed.length!==1+sitemapCount||added.length+changed.length>2)fail('Promotion diff exceeds exact Topic 1 + sitemap 0/1');
    if(allowed.size!==expectedAllowed.length||expectedAllowed.some(p=>!allowed.has(p)))fail('Promotion allowlist mismatch');
  }else if(plan.approvedPathname)fail('Foundation cannot activate a Promotion route');
  return {files,inventorySha256:hash};
}

if(process.argv.includes('--wrangler')){
  const file=process.env.RM_RELEASE_PLAN,approved=process.env.RM_RELEASE_PLAN_SHA256,locale=process.env.RM_RELEASE_LOCALE;
  if(!file||!approved||!locale)fail('RM_RELEASE_PLAN, RM_RELEASE_PLAN_SHA256 and RM_RELEASE_LOCALE are required');
  const plan=JSON.parse(await readFile(path.resolve(file),'utf8'));
  const config=process.env.WRANGLER_CONFIG_PATH ? path.basename(process.env.WRANGLER_CONFIG_PATH) : LOCALE_RUNTIME[locale]?.config;
  const candidate=path.resolve(process.env.RM_RELEASE_CANDIDATE??`.deploy/candidate-${locale}`);
  await verifyProductionCandidate({plan,approvedPlanSha256:approved,candidate,config,locale});
}
