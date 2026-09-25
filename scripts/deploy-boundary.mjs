import {readdir, readFile, mkdir, copyFile, lstat} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

export const TARGET = '/guide/rakuten-mobile-three-features/index.html';
export const INCLUDES = ['/_includes/ja/header.html', '/_includes/ja/footer.html'];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error('DEPLOY BOUNDARY: ' + message); };
const digestPattern = /^[0-9a-f]{64}$/;
const own = (o, k) => Object.hasOwn(o, k);
const inside = (parent, child) => child === parent || child.startsWith(parent + path.sep);
function assetPath(key) {
  if (!/^\/[A-Za-z0-9_./-]+$/.test(key) || key.includes('//') || key.split('/').some(p => p === '..' || p === '.')) fail('Unsafe asset path: ' + key);
  return key.slice(1);
}

// Include every regular file. Reject links and ignore/routing overrides rather than
// silently giving Wrangler a different effective manifest than the guard checked.
export async function inventory(directory) {
  const files = {};
  async function walk(dir) {
    if (!(await lstat(dir)).isDirectory() || (await lstat(dir)).isSymbolicLink()) fail('Not a real directory: ' + dir);
    for (const entry of (await readdir(dir, {withFileTypes: true})).sort((a,b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) fail('Symlink: ' + file);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) {
        const key = '/' + path.relative(directory, file).split(path.sep).join('/');
        assetPath(key);
        if (['.assetsignore', '_worker.js'].includes(entry.name)) fail('Unsupported asset override: ' + key);
        const bytes = await readFile(file);
        files[key] = {sha256: sha256(bytes), size: bytes.length};
      } else fail('Non-regular file: ' + file);
    }
  }
  await walk(path.resolve(directory));
  return files;
}

export function compare(baseline, candidate, approved) {
  const changed = [], removed = [], unexpected = [];
  for (const key of Object.keys(approved)) {
    if (![TARGET, ...INCLUDES].includes(key)) fail('Unapproved pathname: ' + key);
    if (!digestPattern.test(approved[key]?.sha256 ?? '') || !approved[key]?.reason) fail('Approval needs exact hash and reason: ' + key);
  }
  if (!own(approved, TARGET)) fail('Target approval missing');
  for (const key of Object.keys(baseline)) if (!own(candidate, key)) removed.push(key);
  for (const [key, value] of Object.entries(candidate)) {
    if (baseline[key]?.sha256 !== value.sha256 || baseline[key]?.size !== value.size) {
      changed.push(key);
      if (!own(approved, key) || approved[key].sha256 !== value.sha256) unexpected.push(key);
    }
  }
  for (const [key, approval] of Object.entries(approved)) {
    if (candidate[key]?.sha256 !== approval.sha256) fail('Approved bytes missing/mismatched: ' + key);
  }
  if (removed.length || unexpected.length) fail(JSON.stringify({removed, unexpected}));
  if (!changed.includes(TARGET)) fail('Expected exactly one changed target article');
  return {baselineFiles: Object.keys(baseline).length, candidateFiles: Object.keys(candidate).length,
    filesChanged: changed.length, changed, removed, unexpected,
    targetArticleChanges: 1, unexpectedArticleChanges: 0, filesUploaded: 0};
}

async function loadPlan(planFile) {
  const plan = JSON.parse(await readFile(planFile, 'utf8'));
  if (plan.schema !== 1 || plan.locale !== 'ja') fail('Only Japanese pilot schema 1 supported');
  const receiptBytes = await readFile(plan.receipt);
  if (!digestPattern.test(plan.receiptFileSha256 ?? '') || sha256(receiptBytes) !== plan.receiptFileSha256) fail('Baseline receipt file digest mismatch');
  const receipt = JSON.parse(receiptBytes);
  if (receipt.schema !== 2 || receipt.locale !== 'ja' || receipt.receiptSha256 !== plan.receiptSha256 || !receipt.files || Object.keys(receipt.files).length === 0) fail('Invalid baseline receipt');
  const {receiptSha256,receiptHashScope,...receiptCore}=receipt;
  if (!digestPattern.test(receiptSha256 ?? '') || sha256(JSON.stringify(receiptCore)) !== receiptSha256) fail('Baseline canonical receipt digest mismatch');
  for (const [key, value] of Object.entries(receipt.files)) {
    assetPath(key);
    if (!digestPattern.test(value.sha256 ?? '') || !Number.isSafeInteger(value.size) || value.size < 0) fail('Invalid baseline entry');
  }
  for (const key of Object.keys(plan.overlays ?? {})) assetPath(key);
  return {plan, receipt};
}

function requireSameInventory(expected, actual) {
  const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])];
  const mismatch = keys.filter(k => expected[k]?.sha256 !== actual[k]?.sha256 || expected[k]?.size !== actual[k]?.size);
  if (mismatch.length) fail('Baseline drift/missing files: ' + JSON.stringify(mismatch));
}

export async function stage(planFile) {
  const {plan, receipt} = await loadPlan(planFile);
  const baseline = path.resolve(plan.baseline), candidate = path.resolve(plan.candidate);
  if (inside(baseline, candidate) || inside(candidate, baseline)) fail('Baseline and staging must be disjoint');
  const before = await inventory(baseline);
  requireSameInventory(receipt.files, before);
  const expected = {...before};
  for (const [key, item] of Object.entries(plan.overlays)) {
    const bytes = await readFile(item.source);
    if (sha256(bytes) !== item.sha256) fail('Overlay digest mismatch: ' + key);
    expected[key] = {sha256: item.sha256, size: bytes.length};
  }
  compare(before, expected, plan.overlays);
  // Never overwrite an existing staging tree or the user's .deploy/ja work.
  await mkdir(candidate, {recursive: false});
  for (const key of Object.keys(before)) {
    const to = path.join(candidate, assetPath(key));
    await mkdir(path.dirname(to), {recursive: true});
    await copyFile(path.join(baseline, assetPath(key)), to);
  }
  for (const [key, item] of Object.entries(plan.overlays)) {
    const to = path.join(candidate, assetPath(key));
    await mkdir(path.dirname(to), {recursive: true});
    await copyFile(item.source, to);
  }
  return preflight(planFile);
}

export async function preflight(planFile) {
  const {plan, receipt} = await loadPlan(planFile);
  requireSameInventory(receipt.files, await inventory(plan.baseline));
  const candidate = await inventory(plan.candidate);
  const result = compare(receipt.files, candidate, plan.overlays);
  return {...result, productionEvidence: receipt.productionEvidence ?? null};
}

export function activeVersion(deployments) {
  return activeDeployment(deployments).versions[0].version_id;
}

export function activeDeployment(deployments) {
  const latest = [...deployments].sort((a,b) => a.created_on.localeCompare(b.created_on)).at(-1);
  if (latest?.versions?.length !== 1 || latest.versions[0].percentage !== 100) fail('Ambiguous active deployment');
  if (!latest.id || !latest.created_on) fail('Incomplete active deployment');
  return latest;
}

export async function validateProductionReceipt(plan, receipt) {
  if (receipt.worker !== 'rm-referral' || receipt.locale !== 'ja' || receipt.fileCount !== Object.keys(receipt.files).length ||
      !digestPattern.test(receipt.artifact?.sha256 ?? '') || !Number.isSafeInteger(receipt.artifact?.size) || receipt.artifact.size <= 0)
    fail('Verified production artifact receipt required');
  if (!plan.baselineArtifact || !plan.attestation || !digestPattern.test(plan.attestationSha256 ?? '')) fail('Baseline artifact and attestation required');
  const artifact = await readFile(plan.baselineArtifact);
  if (artifact.length !== receipt.artifact.size || sha256(artifact) !== receipt.artifact.sha256)
    fail('Baseline artifact digest mismatch');
  const attestationBytes = await readFile(plan.attestation);
  if (sha256(attestationBytes) !== plan.attestationSha256) fail('Attestation file digest mismatch');
  const evidence = JSON.parse(attestationBytes);
  const allowedSourceConfigs=new Set(['wrangler.bootstrap.jsonc','wrangler.jsonc']);
  if (evidence.schema !== 1 || evidence.artifactSha256 !== receipt.artifact.sha256 || evidence.receiptSha256 !== receipt.receiptSha256 ||
      evidence.receiptFileSha256 !== plan.receiptFileSha256 || evidence.worker !== receipt.worker || evidence.locale !== receipt.locale ||
      !allowedSourceConfigs.has(evidence.config) || receipt.config !== 'wrangler.jsonc' || evidence.traffic !== 100 ||
      !evidence.versionId || !evidence.deploymentId || !Number.isFinite(Date.parse(evidence.verifiedAt ?? '')))
    fail('Attestation does not bind baseline receipt and production');
  return evidence;
}

export function validateCurrentBaseline(evidence, deployments) {
  const active=activeDeployment(deployments);
  if(active.id!==evidence.deploymentId||active.versions[0].version_id!==evidence.versionId||active.versions[0].percentage!==evidence.traffic)
    fail('Production version drift; rebuild staging from new baseline');
  return active;
}

export async function productionPreflight(planFile) {
  const {plan, receipt} = await loadPlan(planFile);
  // A locally-created snapshot, HTTP sample, or handwritten version ID is not proof.
  const evidence = await validateProductionReceipt(plan, receipt);
  if (process.env.RM_APPROVED_BASELINE_SHA256 !== plan.receiptSha256 || process.env.RM_APPROVED_ATTESTATION_SHA256 !== plan.attestationSha256) fail('Independently pinned production baseline required');
  const config = JSON.parse(await readFile(path.join(root, 'wrangler.jsonc'), 'utf8'));
  if (config.name !== 'rm-referral' || config.main !== 'worker/index.mjs' || config.build?.command !== 'node scripts/deploy-boundary.mjs --wrangler' ||
      config.assets?.directory !== '.deploy/pilot-ja' || config.assets?.binding !== 'ASSETS' ||
      JSON.stringify(config.assets?.run_worker_first)!==JSON.stringify(['/guide/rakuten-mobile-three-features/']) ||
      path.resolve(plan.candidate) !== path.join(root, '.deploy/pilot-ja')) fail('Wrong deploy destination');
  if (process.env.RM_PAGE !== 'ja/guide/rakuten-mobile-three-features') fail('Wrong pilot page');
  const result = await preflight(planFile);
  const proc = spawnSync(process.execPath, [path.join(root,'node_modules/wrangler/bin/wrangler.js'),
    'deployments','list','--config',path.join(root,'wrangler.jsonc'),'--json'], {cwd: root, encoding:'utf8', timeout:60000});
  if (proc.status !== 0) fail('Cannot confirm active version; refusing upload');
  validateCurrentBaseline(evidence, JSON.parse(proc.stdout));
  return {...result, productionEvidence:evidence};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, argument] = process.argv.slice(2);
  const planFile = argument || process.env.RM_DEPLOY_PLAN;
  if (!planFile) fail('RM_DEPLOY_PLAN or plan file required; no build fallback');
  const result = mode === 'stage' ? await stage(planFile) : mode === 'check' ? await preflight(planFile)
    : mode === '--wrangler' ? await productionPreflight(planFile) : fail('Usage: deploy-boundary.mjs stage|check|--wrangler <plan.json>');
  console.log(JSON.stringify(result, null, 2));
}
