import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {inventory, activeDeployment, sha256} from './deploy-boundary.mjs';
import {verifyArtifact} from './bootstrap-artifact.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fail = message => { throw new Error('BOOTSTRAP GUARD: ' + message); };
const digest = /^[0-9a-f]{64}$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sameFiles(expected, actual) {
  const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])];
  const mismatch = keys.filter(k => expected[k]?.sha256 !== actual[k]?.sha256 || expected[k]?.size !== actual[k]?.size);
  if (mismatch.length) fail('Extracted tree differs from receipt: ' + JSON.stringify(mismatch.slice(0, 20)));
}

export async function offlinePreflight(planFile) {
  const planBytes = await readFile(planFile);
  const plan = JSON.parse(planBytes);
  if (plan.schema !== 1 || plan.operation !== 'production-baseline-bootstrap' || plan.worker !== 'rm-referral' || plan.locale !== 'ja') fail('Wrong bootstrap plan');
  if (!uuid.test(plan.expectedCurrentVersion ?? '') || !plan.expectedCurrentDeployment) fail('Rollback/current production identity required');
  if (plan.rollbackVersion !== plan.expectedCurrentVersion) fail('Rollback must be the captured current version');
  const receiptBytes = await readFile(plan.receipt);
  if (sha256(receiptBytes) !== plan.receiptFileSha256) fail('Receipt file digest mismatch');
  const verified = await verifyArtifact(plan.receipt, plan.artifact);
  if (verified.artifactSha256 !== plan.artifactSha256 || verified.receiptSha256 !== plan.receiptSha256) fail('Pinned artifact identity mismatch');
  const receipt = JSON.parse(receiptBytes);
  sameFiles(receipt.files, await inventory(plan.extractedTree));
  const sentinelBytes = await readFile(plan.sentinelReport);
  if (sha256(sentinelBytes) !== plan.sentinelReportSha256) fail('Sentinel report digest mismatch');
  const sentinel = JSON.parse(sentinelBytes);
  if (sentinel.verdict !== 'PASS' || !Array.isArray(sentinel.results) || !sentinel.results.length || sentinel.results.some(x => !x.pass)) fail('Sentinel review not PASS');
  const review = JSON.parse(await readFile(plan.review));
  if (review.schema !== 1 || review.artifactSha256 !== plan.artifactSha256 || review.decision !== 'APPROVED' || !review.approvedBy || !review.approvedAt) fail('Independent review approval required');
  if (plan.config !== 'wrangler.bootstrap.jsonc' || plan.otherLocales?.length) fail('Only isolated Japanese bootstrap config is allowed');
  return {planSha256: sha256(planBytes), ...verified, extractedFiles: receipt.fileCount, rollbackVersion: plan.rollbackVersion};
}

export function assertNoDrift(plan, deployments) {
  const active = activeDeployment(deployments);
  if (active.id !== plan.expectedCurrentDeployment || active.versions[0].version_id !== plan.expectedCurrentVersion) fail('Production version drift');
  return {deploymentId: active.id, versionId: active.versions[0].version_id, traffic: 100};
}

export async function livePreflight(planFile, runner = spawnSync) {
  const offline = await offlinePreflight(planFile);
  const plan = JSON.parse(await readFile(planFile));
  if (process.env.RM_BOOTSTRAP_APPROVED_SHA256 !== offline.planSha256) fail('Pinned approved bootstrap plan required');
  const proc = runner(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'), 'deployments', 'list', '--config', path.join(root, plan.config), '--json'], {cwd: root, encoding: 'utf8', timeout: 60000});
  if (proc.status !== 0) fail('Cannot confirm current production; refusing bootstrap');
  return {...offline, current: assertNoDrift(plan, JSON.parse(proc.stdout))};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, planFile] = process.argv.slice(2);
  if (!planFile) fail('Usage: bootstrap-guard.mjs offline|live <plan.json>');
  console.log(JSON.stringify(mode === 'offline' ? await offlinePreflight(planFile) : mode === 'live' ? await livePreflight(planFile) : fail('Unknown mode'), null, 2));
}
