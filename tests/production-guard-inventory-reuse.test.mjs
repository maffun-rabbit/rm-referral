import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,stat,utimes} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {inventory,sha256} from '../scripts/deploy-boundary.mjs';
import {inventorySha256} from '../scripts/promotion-release.mjs';
import {verifyGuideCandidate,verifyGuidePlan} from '../scripts/guide-release.mjs';
import {verifyProductionCandidate} from '../scripts/production-release-guard.mjs';
import {assertNoDrift} from '../scripts/bootstrap-guard.mjs';
const digest=p=>sha256(JSON.stringify(p));
async function fixture(t){
 const root=await mkdtemp(path.join(tmpdir(),'guard-reuse-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const baseline=path.join(root,'baseline'),candidate=path.join(root,'candidate');
 const target='/guide/replacement-program/index.html';
 const other=Array.from({length:17},(_,i)=>`/topics/unapproved-${i}/index.html`);
 const includes=['/_includes/ja/header.html','/_includes/ja/footer.html'];
 for(const dir of [baseline,candidate])for(const asset of [target,...other,...includes]){
  const f=path.join(dir,asset.slice(1));await mkdir(path.dirname(f),{recursive:true});await writeFile(f,'old');
 }
 await writeFile(path.join(candidate,target.slice(1)),'new');
 const result=await verifyGuideCandidate({locale:'ja',baseline,candidate,approvedPathname:'/guide/replacement-program/'});
 const plan={...result,worker:'rm-referral',config:'wrangler.jsonc',baselineDirectory:baseline,allowedChangedPaths:[target]};
 const args={plan,approvedPlanSha256:digest(plan),candidate,config:plan.config,locale:'ja'};
 return {root,baseline,candidate,target,other,includes,plan,args};
}
// Reference the previous Guide path: a candidate inventory followed by the
// unchanged full Guide plan verifier. Compare verdicts rather than error order.
async function previousGuideGuard(f){
 const files=await inventory(f.candidate);
 if(inventorySha256(files)!==f.plan.candidateInventorySha256)throw Error('Candidate inventory mismatch');
 return verifyGuidePlan({plan:f.plan,approvedPlanSha256:digest(f.plan),baseline:f.baseline,candidate:f.candidate});
}
test('fresh Guide result matches the previously verified candidate; default API shape is unchanged',async t=>{
 const f=await fixture(t),old=await previousGuideGuard(f),now=await verifyProductionCandidate(f.args);
 assert.equal(now.inventorySha256,old.candidateInventorySha256);
 assert.deepEqual(now.files,await inventory(f.candidate));assert.equal(Object.hasOwn(old,'files'),false);
});
test('approval and baseline manifest bindings reject tampering, missing and malformed hashes',async t=>{
 for(const field of ['candidateInventorySha256','baselineInventorySha256'])for(const value of [undefined,'broken','0'.repeat(64)]){
  const f=await fixture(t);f.plan[field]=value;
  await assert.rejects(()=>verifyProductionCandidate({...f.args,approvedPlanSha256:digest(f.plan)}));
 }
 const f=await fixture(t);f.plan.changed.push('/topics/unapproved-0/index.html');
 await assert.rejects(()=>verifyProductionCandidate(f.args),/Plan hash mismatch/);
});
test('same-size contents with restored mtime are detected in baseline and candidate',async t=>{
 for(const tree of ['baseline','candidate']){
  const f=await fixture(t),file=path.join(f[tree],f.other[0].slice(1)),s=await stat(file);
  await writeFile(file,'BAD');await utimes(file,s.atime,s.mtime);
  await assert.rejects(()=>previousGuideGuard(f));await assert.rejects(()=>verifyProductionCandidate(f.args));
 }
});
test('no cached snapshot survives verification; post-verification target and baseline mutations fail',async t=>{
 for(const tree of ['baseline','candidate']){
  const f=await fixture(t),cached=await verifyProductionCandidate(f.args);
  // Altering the returned snapshot cannot supply trusted input to a later call.
  cached.files[f.target].sha256='0'.repeat(64);
  await writeFile(path.join(f[tree],f.target.slice(1)),'BAD');
  await assert.rejects(()=>verifyProductionCandidate({...f.args,files:cached.files,baselineManifest:cached.files}));
 }
});
test('17 unrelated articles plus two shared includes are rejected, individually and together',async t=>{
 const sets=[['other'],['includes'],['other','includes']];
 for(const set of sets){const f=await fixture(t);for(const kind of set)for(const asset of f[kind])await writeFile(path.join(f.candidate,asset.slice(1)),'BAD');
  await assert.rejects(()=>previousGuideGuard(f));await assert.rejects(()=>verifyProductionCandidate(f.args));
  // Even a re-hashed candidate and expanded plan cannot turn extra articles
  // or shared includes into an authorized single-Guide release.
  f.plan.candidateInventorySha256=inventorySha256(await inventory(f.candidate));
  f.plan.changed=[f.target,...set.flatMap(kind=>f[kind])];
  f.plan.allowedChangedPaths=[...f.plan.changed];
  await assert.rejects(()=>previousGuideGuard(f));
  await assert.rejects(()=>verifyProductionCandidate({...f.args,approvedPlanSha256:digest(f.plan)}));
 }
});
test('unapproved additions, deletions and missing baseline fail with identical old/new verdicts',async t=>{
 for(const mode of ['add','delete','missing-baseline']){
  const f=await fixture(t);
  if(mode==='add')await writeFile(path.join(f.candidate,'unapproved.html'),'BAD');
  if(mode==='delete')await rm(path.join(f.candidate,f.other[0].slice(1)));
  if(mode==='missing-baseline')await rm(f.baseline,{recursive:true});
  await assert.rejects(()=>previousGuideGuard(f));await assert.rejects(()=>verifyProductionCandidate(f.args));
 }
});
test('wrong locale, Worker, config and exact pathname are refused',async t=>{
 for(const [field,value] of [['locale','en'],['worker','rm-referral-en'],['config','wrangler.en.jsonc'],['approvedPathname','/guide/other/']]){
  const f=await fixture(t);f.plan[field]=value;await assert.rejects(()=>verifyProductionCandidate({...f.args,approvedPlanSha256:digest(f.plan)}));
 }
});
test('existing live Production version drift boundary is retained',()=>{
 const plan={expectedCurrentDeployment:'current',expectedCurrentVersion:'v1'};
 assert.throws(()=>assertNoDrift(plan,[{id:'current',created_on:'2026-10-11T00:00:00Z',versions:[{version_id:'v2',percentage:100}]}]),/drift/);
 assert.deepEqual(assertNoDrift(plan,[{id:'current',created_on:'2026-10-11T00:00:00Z',versions:[{version_id:'v1',percentage:100}]}]),{deploymentId:'current',versionId:'v1',traffic:100});
});
