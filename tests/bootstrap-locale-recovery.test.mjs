import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {BOOTSTRAP_LOCALES,parseLocaleArgs,assertLocaleInventory} from '../scripts/bootstrap-locales.mjs';
import {createArtifact} from '../scripts/bootstrap-artifact.mjs';
import {assertNoDrift,offlinePreflight} from '../scripts/bootstrap-guard.mjs';
import {inventory,sha256} from '../scripts/deploy-boundary.mjs';

const digest='a'.repeat(64);
const version='11111111-1111-4111-8111-111111111111';

async function fixture(locale){
 const dir=await mkdtemp(path.join(os.tmpdir(),'bootstrap-locale-')),runtime=BOOTSTRAP_LOCALES[locale],source=path.join(dir,'source');
 const root=locale==='ja'?source:path.join(source,locale);await mkdir(root,{recursive:true});await writeFile(path.join(root,'index.html'),locale);
 const files=await inventory(source),legacy=path.join(dir,'legacy.json');
 await writeFile(legacy,JSON.stringify({files:{[locale]:Object.entries(files).map(([file,value])=>({file:file.slice(1),...value}))}}));
 const artifact=path.join(dir,'artifact.tar'),receipt=path.join(dir,'receipt.json');
 const output=await createArtifact({source,sourceReceipt:legacy,artifact,receipt,createdAt:'2026-09-25T00:00:00Z',locale});
 const sentinel=path.join(dir,'sentinel.json');await writeFile(sentinel,JSON.stringify({verdict:'PASS',results:[{url:runtime.routeNamespace,pass:true}]}));
 const review=path.join(dir,'review.json');await writeFile(review,JSON.stringify({schema:1,locale,artifactSha256:output.artifact.sha256,sourceBindingEvidenceSha256:digest,sourceAttestationSha256:digest,decision:'APPROVED',approvedBy:'reviewer',approvedAt:'2026-09-25T01:00:00Z'}));
 const plan={schema:2,operation:'production-baseline-bootstrap',locale,worker:runtime.worker,config:runtime.bootstrapConfig,artifact,artifactSha256:output.artifact.sha256,receipt,receiptSha256:output.receiptSha256,receiptFileSha256:sha256(await readFile(receipt)),extractedTree:source,sentinelReport:sentinel,sentinelReportSha256:sha256(await readFile(sentinel)),review,expectedCurrentDeployment:'deployment-current',expectedCurrentVersion:version,rollbackVersion:version,otherLocales:[],sourceBinding:{classification:'TRUSTED_CANDIDATE',completeTree:true,provenance:'immutable release artifact tied to current deployment',evidenceSha256:digest,attestationSha256:digest,currentDeployment:'deployment-current',currentVersion:version}};
 const planFile=path.join(dir,'plan.json');await writeFile(planFile,JSON.stringify(plan));
 return {dir,source,plan,planFile,receipt};
}

for(const locale of Object.keys(BOOTSTRAP_LOCALES))test(`${locale} valid locale bootstrap recovery plan`,async t=>{const f=await fixture(locale);t.after(()=>rm(f.dir,{recursive:true,force:true}));const result=await offlinePreflight(f.planFile,locale);assert.equal(result.extractedFiles,1);});

test('locale missing fails',()=>assert.throws(()=>parseLocaleArgs(['plan.json']),/Exactly one/));
test('unknown locale fails',()=>assert.throws(()=>parseLocaleArgs(['--locale','fr','plan.json']),/Unknown/));
test('multiple locale fails',()=>assert.throws(()=>parseLocaleArgs(['--locale','en','--locale','ko','plan.json']),/Exactly one|Multiple/));
test('wrong Worker fails',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));f.plan.worker='rm-referral-ko';await writeFile(f.planFile,JSON.stringify(f.plan));await assert.rejects(offlinePreflight(f.planFile,'en'),/Wrong bootstrap plan/);});
test('wrong config fails',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));f.plan.config='wrangler.ko.jsonc';await writeFile(f.planFile,JSON.stringify(f.plan));await assert.rejects(offlinePreflight(f.planFile,'en'),/config mismatch/);});
test('cross-locale tree fails',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));await mkdir(path.join(f.source,'ko'));await writeFile(path.join(f.source,'ko','index.html'),'ko');await assert.rejects(offlinePreflight(f.planFile,'en'),/Cross-locale/);});
test('same-locale shared includes are allowed inside the foreign route and root-level foreign includes fail',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));await mkdir(path.join(f.source,'en','_includes'),{recursive:true});await writeFile(path.join(f.source,'en','_includes','header.html'),'header');const allowed=await inventory(f.source);assert.doesNotThrow(()=>assertLocaleInventory(allowed,'en'));await mkdir(path.join(f.source,'_includes','en'),{recursive:true});await writeFile(path.join(f.source,'_includes','en','header.html'),'bad');const rejected=await inventory(f.source);assert.throws(()=>assertLocaleInventory(rejected,'en'),/Cross-locale/);});
test('wrong receipt fails',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));f.plan.receiptFileSha256=digest;await writeFile(f.planFile,JSON.stringify(f.plan));await assert.rejects(offlinePreflight(f.planFile,'en'),/Receipt file digest/);});
test('wrong attestation binding fails',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));f.plan.sourceBinding.attestationSha256='bad';await writeFile(f.planFile,JSON.stringify(f.plan));await assert.rejects(offlinePreflight(f.planFile,'en'),/binding required/);});
test('production version drift fails',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));assert.throws(()=>assertNoDrift(f.plan,[{id:'deployment-current',created_on:'2026-09-25T00:00:00Z',versions:[{version_id:'22222222-2222-4222-8222-222222222222',percentage:100}]}]),/drift/);});
test('traffic not 100 fails',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));assert.throws(()=>assertNoDrift(f.plan,[{id:'deployment-current',created_on:'2026-09-25T00:00:00Z',versions:[{version_id:version,percentage:50},{version_id:'22222222-2222-4222-8222-222222222222',percentage:50}]}]),/Ambiguous/);});
test('stale source fails',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));f.plan.sourceBinding.classification='STALE';await writeFile(f.planFile,JSON.stringify(f.plan));await assert.rejects(offlinePreflight(f.planFile,'en'),/binding required/);});
test('unbound source fails',async t=>{const f=await fixture('en');t.after(()=>rm(f.dir,{recursive:true,force:true}));delete f.plan.sourceBinding;await writeFile(f.planFile,JSON.stringify(f.plan));await assert.rejects(offlinePreflight(f.planFile,'en'),/binding required/);});
