import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {inventory, activeDeployment, sha256} from './deploy-boundary.mjs';
import {verifyArtifact} from './bootstrap-artifact.mjs';
import {assertLocaleInventory, parseLocaleArgs, requireBootstrapLocale} from './bootstrap-locales.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fail = message => { throw new Error('BOOTSTRAP GUARD: ' + message); };
const digest = /^[0-9a-f]{64}$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sameFiles(expected, actual) {
  const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])];
  const mismatch = keys.filter(k => expected[k]?.sha256 !== actual[k]?.sha256 || expected[k]?.size !== actual[k]?.size);
  if (mismatch.length) fail('Extracted tree differs from receipt: ' + JSON.stringify(mismatch.slice(0, 20)));
}

export async function offlinePreflight(planFile, explicitLocale) {
  const planBytes = await readFile(planFile);
  const plan = JSON.parse(planBytes);
  const locale=explicitLocale??plan.locale,runtime=requireBootstrapLocale(locale);
  if(plan.locale!==locale)fail('Explicit locale does not match plan');
  if (![1,2].includes(plan.schema) || plan.operation !== 'production-baseline-bootstrap' || plan.worker !== runtime.worker) fail('Wrong bootstrap plan');
  if(plan.schema===1&&plan.locale!=='ja')fail('Legacy schema is Japanese-only');
  if(plan.config!==runtime.bootstrapConfig||plan.otherLocales?.length)fail('Locale bootstrap config mismatch');
  if (!uuid.test(plan.expectedCurrentVersion ?? '') || !plan.expectedCurrentDeployment) fail('Rollback/current production identity required');
  if (plan.rollbackVersion !== plan.expectedCurrentVersion) fail('Rollback must be the captured current version');
  const receiptBytes = await readFile(plan.receipt);
  if (sha256(receiptBytes) !== plan.receiptFileSha256) fail('Receipt file digest mismatch');
  const verified = await verifyArtifact(plan.receipt, plan.artifact);
  if (verified.artifactSha256 !== plan.artifactSha256 || verified.receiptSha256 !== plan.receiptSha256) fail('Pinned artifact identity mismatch');
  const receipt = JSON.parse(receiptBytes);
  if(receipt.locale!==plan.locale||receipt.worker!==runtime.worker||![runtime.config,runtime.bootstrapConfig].includes(receipt.config))fail('Receipt locale/worker/config mismatch');
  const actual=await inventory(plan.extractedTree);assertLocaleInventory(actual,plan.locale);sameFiles(receipt.files,actual);
  const sentinelBytes = await readFile(plan.sentinelReport);
  if (sha256(sentinelBytes) !== plan.sentinelReportSha256) fail('Sentinel report digest mismatch');
  const sentinel = JSON.parse(sentinelBytes);
  if (sentinel.verdict !== 'PASS' || !Array.isArray(sentinel.results) || !sentinel.results.length || sentinel.results.some(x => !x.pass)) fail('Sentinel review not PASS');
  const review = JSON.parse(await readFile(plan.review));
  if (review.schema !== 1 || review.artifactSha256 !== plan.artifactSha256 || review.decision !== 'APPROVED' || !review.approvedBy || !review.approvedAt) fail('Independent review approval required');
  if(plan.schema===2){
    const binding=plan.sourceBinding;
    if(binding?.classification!=='TRUSTED_CANDIDATE'||binding.completeTree!==true||typeof binding.provenance!=='string'||!binding.provenance.trim()||
      !digest.test(binding.evidenceSha256??'')||!digest.test(binding.attestationSha256??'')||binding.currentDeployment!==plan.expectedCurrentDeployment||binding.currentVersion!==plan.expectedCurrentVersion)
      fail('Trusted source/current Production binding required');
    if(review.locale!==plan.locale||review.sourceBindingEvidenceSha256!==binding.evidenceSha256||review.sourceAttestationSha256!==binding.attestationSha256)fail('Review does not approve source binding');
  }
  return {planSha256: sha256(planBytes), ...verified, extractedFiles: receipt.fileCount, rollbackVersion: plan.rollbackVersion};
}

export function assertNoDrift(plan, deployments) {
  const active = activeDeployment(deployments);
  if (active.id !== plan.expectedCurrentDeployment || active.versions[0].version_id !== plan.expectedCurrentVersion) fail('Production version drift');
  return {deploymentId: active.id, versionId: active.versions[0].version_id, traffic: 100};
}

export async function livePreflight(planFile, explicitLocale, runner = spawnSync) {
  const offline = await offlinePreflight(planFile,explicitLocale);
  const plan = JSON.parse(await readFile(planFile));
  if (process.env.RM_BOOTSTRAP_APPROVED_SHA256 !== offline.planSha256) fail('Pinned approved bootstrap plan required');
  const proc = runner(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'), 'deployments', 'list', '--config', path.join(root, plan.config), '--json'], {cwd: root, encoding: 'utf8', timeout: 60000});
  if (proc.status !== 0) fail('Cannot confirm current production; refusing bootstrap');
  return {...offline, current: assertNoDrift(plan, JSON.parse(proc.stdout))};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode,...raw]=process.argv.slice(2);const {locale,rest}=parseLocaleArgs(raw),planFile=rest[0];
  if (!planFile) fail('Usage: bootstrap-guard.mjs offline|live <plan.json>');
  console.log(JSON.stringify(mode === 'offline' ? await offlinePreflight(planFile,locale) : mode === 'live' ? await livePreflight(planFile,locale) : fail('Unknown mode'), null, 2));
}
