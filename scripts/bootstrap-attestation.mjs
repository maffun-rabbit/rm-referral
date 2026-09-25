import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {activeDeployment, sha256} from './deploy-boundary.mjs';
import {verifyArtifact} from './bootstrap-artifact.mjs';

const fail = message => { throw new Error('BOOTSTRAP ATTESTATION: ' + message); };

export async function createAttestation({receiptFile, artifactFile, deploymentsFile, versionFile, planFile, output, verifiedAt}) {
  const receiptBytes = await readFile(receiptFile);
  const receipt = JSON.parse(receiptBytes);
  const verified = await verifyArtifact(receiptFile, artifactFile);
  const deployment = activeDeployment(JSON.parse(await readFile(deploymentsFile)));
  const version = JSON.parse(await readFile(versionFile));
  const planBytes = planFile ? await readFile(planFile) : null;
  const plan = planBytes ? JSON.parse(planBytes) : null;
  if (plan && (plan.artifact !== artifactFile || plan.receipt !== receiptFile || plan.worker !== receipt.worker || plan.locale !== receipt.locale ||
      !((plan.operation==='production-baseline-bootstrap'&&plan.config==='wrangler.bootstrap.jsonc')||(plan.operation==='single-article-production-baseline'&&plan.config==='wrangler.jsonc')))) fail('Production baseline plan mismatch');
  const versionId = version.id ?? version.result?.id;
  if (!versionId || versionId !== deployment.versions[0].version_id) fail('Cloudflare version/deployment mismatch');
  if (!Number.isFinite(Date.parse(deployment.created_on)) || !Number.isFinite(Date.parse(verifiedAt))) fail('Invalid timestamp');
  const attestation = {
    schema: 1,
    artifactSha256: verified.artifactSha256,
    receiptSha256: verified.receiptSha256,
    receiptFileSha256: sha256(receiptBytes),
    worker: receipt.worker,
    locale: receipt.locale,
    config: plan?.config ?? receipt.config,
    planSha256: planBytes ? sha256(planBytes) : null,
    deploymentId: deployment.id,
    versionId,
    traffic: deployment.versions[0].percentage,
    deployedAt: deployment.created_on,
    verifiedAt,
  };
  if (attestation.traffic !== 100 || attestation.worker !== 'rm-referral' || attestation.locale !== 'ja') fail('Unexpected production target');
  await writeFile(output, JSON.stringify(attestation, null, 2) + '\n', {flag: 'wx'});
  return attestation;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [receiptFile, artifactFile, deploymentsFile, versionFile, planFile, output] = process.argv.slice(2);
  if (!output || !process.env.RM_CAPTURED_AT) fail('Usage: bootstrap-attestation.mjs <receipt> <artifact> <deployments.json> <version.json> <plan.json> <output>; RM_CAPTURED_AT required');
  console.log(JSON.stringify(await createAttestation({receiptFile, artifactFile, deploymentsFile, versionFile, planFile, output, verifiedAt: process.env.RM_CAPTURED_AT}), null, 2));
}
