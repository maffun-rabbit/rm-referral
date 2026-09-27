import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {inventory,sha256} from './deploy-boundary.mjs';
import {inventorySha256} from './promotion-release.mjs';
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
    if(plan.changed.filter(p=>p.endsWith('/index.html')).length!==1||plan.changed.length+plan.added.length>2)fail('Promotion diff exceeds Topic 1 + sitemap 0/1');
    if(!plan.approvedPathname)fail('Promotion exact pathname missing');
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
