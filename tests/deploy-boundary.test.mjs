import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm, symlink} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {inventory, compare, stage, preflight, productionPreflight, validateProductionReceipt, validateCurrentBaseline, activeDeployment, activeVersion, sha256, TARGET, INCLUDES} from '../scripts/deploy-boundary.mjs';

async function fixture(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'rm-boundary-test-'));
  t.after(() => rm(dir,{recursive:true,force:true}));
  const baseline = path.join(dir,'baseline'); await mkdir(baseline);
  for (const [key, body] of Object.entries({[TARGET]:'old article', '/index.html':'home', '/guide/other/index.html':'other', '/topics/demo/index.html':'topic', '/css/style.css':'css', '/js/analytics.js':'js', [INCLUDES[0]]:'header', [INCLUDES[1]]:'footer'})) {
    const f = path.join(baseline,key.slice(1)); await mkdir(path.dirname(f),{recursive:true}); await writeFile(f,body);
  }
  const files = await inventory(baseline);
  const artifact=path.join(dir,'baseline.tar');await writeFile(artifact,'complete artifact');
  const core={schema:2,locale:'ja',worker:'rm-referral',config:'wrangler.jsonc',artifact:{sha256:sha256('complete artifact'),size:17},fileCount:Object.keys(files).length,files};
  const canonical=sha256(JSON.stringify(core));const receiptObject={...core,receiptHashScope:'test canonical JSON',receiptSha256:canonical};
  const receipt = path.join(dir,'receipt.json'); const bytes = JSON.stringify(receiptObject); await writeFile(receipt,bytes);
  const attestationObject={schema:1,artifactSha256:core.artifact.sha256,receiptSha256:canonical,receiptFileSha256:sha256(bytes),worker:'rm-referral',locale:'ja',config:'wrangler.bootstrap.jsonc',deploymentId:'d1',versionId:'v1',traffic:100,verifiedAt:'2026-09-23T12:00:00Z'};
  const attestation=path.join(dir,'attestation.json');const attestationBytes=JSON.stringify(attestationObject);await writeFile(attestation,attestationBytes);
  const source = path.join(dir,'new.html'); await writeFile(source,'new article');
  const plan = {schema:1,locale:'ja',baseline,baselineArtifact:artifact,receipt,receiptSha256:canonical,receiptFileSha256:sha256(bytes),attestation,attestationSha256:sha256(attestationBytes),candidate:path.join(dir,'staging'),overlays:{[TARGET]:{source,sha256:sha256('new article'),reason:'single article pilot'}}};
  const planFile = path.join(dir,'plan.json'); await writeFile(planFile,JSON.stringify(plan));
  return {dir, baseline, files, plan, planFile};
}

test('full staging changes one article and preserves root, guide, topics, includes, CSS/JS bytes', async t => {
  const f = await fixture(t); const result = await stage(f.planFile);
  assert.deepEqual(result.changed,[TARGET]); assert.equal(result.unexpectedArticleChanges,0);
  const after = await inventory(f.plan.candidate);
  for (const key of Object.keys(f.files).filter(k=>k!==TARGET)) assert.deepEqual(after[key],f.files[key]);
  assert.deepEqual(await inventory(f.baseline),f.files);
  await assert.rejects(stage(f.planFile), /EEXIST/);
});
test('unexpected change, addition and deletion each fail closed', async t => {
  const f=await fixture(t); await stage(f.planFile); const valid=await inventory(f.plan.candidate);
  for (const kind of ['change','add','delete']) {
    const candidate=structuredClone(valid);
    if(kind==='change') candidate['/guide/other/index.html'].sha256=sha256('unexpected');
    if(kind==='add') candidate['/surprise.html']={sha256:sha256('new'),size:3};
    if(kind==='delete') delete candidate['/index.html'];
    assert.throws(()=>compare(f.files,candidate,f.plan.overlays),/unexpected|removed/);
  }
});
test('tiny assets tree cannot replace complete baseline',async t=>{
  const f=await fixture(t); assert.throws(()=>compare(f.files,{[TARGET]:{sha256:sha256('new article'),size:11}},f.plan.overlays),/removed/);
});
test('hash pin prevents arbitrary target content',async t=>{
  const f=await fixture(t);await stage(f.planFile);await writeFile(path.join(f.plan.candidate,TARGET.slice(1)),'tampered');
  await assert.rejects(preflight(f.planFile),/mismatched|unexpected/);
});
test('baseline content and receipt drift each fail closed',async t=>{
  const f=await fixture(t);await stage(f.planFile);await writeFile(path.join(f.baseline,'index.html'),'drift');
  await assert.rejects(preflight(f.planFile),/Baseline drift/);
  await writeFile(f.plan.receipt,'{}');await assert.rejects(preflight(f.planFile),/digest mismatch/);
});
test('only exact include paths with hash and reason may be added',async t=>{
  const f=await fixture(t);await stage(f.planFile);const candidate=await inventory(f.plan.candidate);
  candidate[INCLUDES[0]]={sha256:sha256('new header'),size:10};
  assert.throws(()=>compare(f.files,candidate,f.plan.overlays),/unexpected/);
  const approved={...f.plan.overlays,[INCLUDES[0]]:{sha256:sha256('new header'),reason:'required header for pilot'}};
  assert.equal(compare(f.files,candidate,approved).filesChanged,2);
  assert.throws(()=>compare(f.files,candidate,{...approved,'/css/style.css':{sha256:sha256('css'),reason:'not allowed'}}),/Unapproved pathname/);
});
test('symlink and ignore-file bypasses fail',async t=>{
  const f=await fixture(t);await symlink(f.plan.overlays[TARGET].source,path.join(f.baseline,'link.html'));
  await assert.rejects(inventory(f.baseline),/Symlink/);await rm(path.join(f.baseline,'link.html'));
  await writeFile(path.join(f.baseline,'.assetsignore'),'*');await assert.rejects(inventory(f.baseline),/Unsupported asset override/);
});
test('normal deploy fails without independently pinned production baseline',async t=>{
  const f=await fixture(t);await stage(f.planFile);
  await assert.rejects(productionPreflight(f.planFile),/Independently pinned production baseline required/);
});
test('active version rejects mixed traffic',()=>{
  assert.equal(activeVersion([{id:'d1',created_on:'2026-09-23',versions:[{version_id:'v1',percentage:100}]}]),'v1');
  assert.throws(()=>activeVersion([{id:'d1',created_on:'2026-09-23',versions:[{version_id:'v1',percentage:50},{version_id:'v2',percentage:50}]}]),/Ambiguous/);
  assert.equal(activeDeployment([{id:'d1',created_on:'2026-09-23',versions:[{version_id:'v1',percentage:100}]}]).id,'d1');
});
test('production evidence binds complete artifact, worker, deployment and version',async t=>{
  const f=await fixture(t);const receipt=JSON.parse(await readFile(f.plan.receipt));
  assert.equal((await validateProductionReceipt(f.plan,receipt)).versionId,'v1');
  receipt.artifact.sha256=sha256('forged');
  await assert.rejects(validateProductionReceipt(f.plan,receipt),/digest mismatch/);
});
test('attestation modification fails closed',async t=>{
  const f=await fixture(t);await writeFile(f.plan.attestation,JSON.stringify({forged:true}));
  await assert.rejects(validateProductionReceipt(f.plan,JSON.parse(await readFile(f.plan.receipt))),/digest mismatch/);
});
test('current deployment drift fails closed',async t=>{
  const f=await fixture(t);const evidence=JSON.parse(await readFile(f.plan.attestation));
  assert.throws(()=>validateCurrentBaseline(evidence,[{id:'other',created_on:'2026-09-24',versions:[{version_id:'v2',percentage:100}]}]),/version drift/);
});
test('only bootstrap to normal config transition is accepted',async t=>{
  const f=await fixture(t);const evidence=JSON.parse(await readFile(f.plan.attestation));evidence.config='wrangler.en.jsonc';
  const bytes=JSON.stringify(evidence);await writeFile(f.plan.attestation,bytes);f.plan.attestationSha256=sha256(bytes);
  await assert.rejects(validateProductionReceipt(f.plan,JSON.parse(await readFile(f.plan.receipt))),/does not bind/);
});
test('normal production baseline may transition only to the same normal config',async t=>{
  const f=await fixture(t);const evidence=JSON.parse(await readFile(f.plan.attestation));evidence.config='wrangler.jsonc';
  const bytes=JSON.stringify(evidence);await writeFile(f.plan.attestation,bytes);f.plan.attestationSha256=sha256(bytes);
  assert.equal((await validateProductionReceipt(f.plan,JSON.parse(await readFile(f.plan.receipt)))).config,'wrangler.jsonc');
});
