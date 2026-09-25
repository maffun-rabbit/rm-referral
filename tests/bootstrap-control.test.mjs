import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createArtifact} from '../scripts/bootstrap-artifact.mjs';
import {offlinePreflight, assertNoDrift} from '../scripts/bootstrap-guard.mjs';
import {createAttestation} from '../scripts/bootstrap-attestation.mjs';
import {sha256} from '../scripts/deploy-boundary.mjs';

async function fixture() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'bootstrap-control-'));
  const source = path.join(dir, 'source'); await mkdir(source); await writeFile(path.join(source, 'index.html'), 'stable');
  const legacy = path.join(dir, 'legacy.json'); await writeFile(legacy, JSON.stringify({files:{ja:[{file:'index.html',sha256:sha256(Buffer.from('stable')),size:6}]}}));
  const artifact = path.join(dir, 'baseline.tar'), receipt = path.join(dir, 'receipt.json');
  const r = await createArtifact({source, sourceReceipt:legacy, artifact, receipt, createdAt:'2026-09-23T00:00:00Z'});
  const sentinel = path.join(dir, 'sentinel.json'); await writeFile(sentinel, JSON.stringify({verdict:'PASS',results:[{url:'/',pass:true}]}));
  const review = path.join(dir, 'review.json'); await writeFile(review, JSON.stringify({schema:1,artifactSha256:r.artifact.sha256,decision:'APPROVED',approvedBy:'reviewer',approvedAt:'2026-09-23T01:00:00Z'}));
  const plan = {schema:1,operation:'production-baseline-bootstrap',worker:'rm-referral',locale:'ja',config:'wrangler.bootstrap.jsonc',artifact,artifactSha256:r.artifact.sha256,receipt,receiptSha256:r.receiptSha256,receiptFileSha256:sha256(await readFile(receipt)),extractedTree:source,sentinelReport:sentinel,sentinelReportSha256:sha256(await readFile(sentinel)),review,expectedCurrentDeployment:'dep-old',expectedCurrentVersion:'11111111-1111-4111-8111-111111111111',rollbackVersion:'11111111-1111-4111-8111-111111111111',otherLocales:[]};
  const planFile=path.join(dir,'plan.json');await writeFile(planFile,JSON.stringify(plan));
  return {dir,artifact,receipt,plan,planFile};
}

test('bootstrap preflight binds artifact, receipt, extracted tree, sentinel and approval', async()=>{ const f=await fixture(); const x=await offlinePreflight(f.planFile); assert.equal(x.extractedFiles,1); });
test('bootstrap preflight rejects missing independent approval', async()=>{ const f=await fixture(); const review=JSON.parse(await readFile(f.plan.review)); review.decision='PENDING'; await writeFile(f.plan.review,JSON.stringify(review)); await assert.rejects(offlinePreflight(f.planFile),/approval/); });
test('version drift stops bootstrap', async()=>{ const f=await fixture(); assert.throws(()=>assertNoDrift(f.plan,[{id:'other',created_on:'2026-09-23T00:00:00Z',versions:[{version_id:f.plan.expectedCurrentVersion,percentage:100}]}]),/drift/); });
test('attestation uses matching Cloudflare output only', async()=>{ const f=await fixture(); const deployments=path.join(f.dir,'deployments.json'), version=path.join(f.dir,'version.json'), output=path.join(f.dir,'attestation.json'); await writeFile(deployments,JSON.stringify([{id:'dep-new',created_on:'2026-09-23T02:00:00Z',versions:[{version_id:'22222222-2222-4222-8222-222222222222',percentage:100}]}])); await writeFile(version,JSON.stringify({id:'22222222-2222-4222-8222-222222222222'})); const a=await createAttestation({receiptFile:f.receipt,artifactFile:f.artifact,deploymentsFile:deployments,versionFile:version,planFile:f.planFile,output,verifiedAt:'2026-09-23T02:05:00Z'}); assert.equal(a.versionId,'22222222-2222-4222-8222-222222222222'); assert.equal(a.traffic,100); assert.equal(a.config,'wrangler.bootstrap.jsonc'); });
test('attestation rejects a version not in the active deployment', async()=>{ const f=await fixture(); const deployments=path.join(f.dir,'deployments.json'), version=path.join(f.dir,'version.json'), output=path.join(f.dir,'attestation.json'); await writeFile(deployments,JSON.stringify([{id:'dep-new',created_on:'2026-09-23T02:00:00Z',versions:[{version_id:'22222222-2222-4222-8222-222222222222',percentage:100}]}])); await writeFile(version,JSON.stringify({id:'33333333-3333-4333-8333-333333333333'})); await assert.rejects(createAttestation({receiptFile:f.receipt,artifactFile:f.artifact,deploymentsFile:deployments,versionFile:version,output,verifiedAt:'2026-09-23T02:05:00Z'}),/mismatch/); });
test('bootstrap config is isolated, guarded, Japanese-only assets and not HTMLRewriter', async()=>{
  const config=JSON.parse(await readFile(new URL('../wrangler.bootstrap.jsonc',import.meta.url)));
  assert.equal(config.name,'rm-referral');
  assert.equal(config.assets.directory,'.deploy/bootstrap-ja');
  assert.match(config.build.command,/bootstrap-guard\.mjs live/);
  assert.equal(config.main,undefined);
  assert.equal(config.assets.binding,undefined);
  assert.equal(config.assets.run_worker_first,undefined);
  assert.doesNotMatch(config.build.command,/full-build|release\.mjs/);
});
