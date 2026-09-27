import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createArtifact,verifyArtifact} from './bootstrap-artifact.mjs';
import {inventory,sha256} from './deploy-boundary.mjs';
import {INVENTORY_SCHEMA,INVENTORY_ALGORITHM,inventorySha256} from './promotion-release.mjs';
import {candidateGate} from './verify-known-production-paths.mjs';

const fail=message=>{throw new Error('INITIAL MIGRATION GATE: '+message);};
export const RESIDUAL_UNCERTAINTY='All 6,851 known candidate paths were exhaustively verified against the current Production version. This does not prove the absence of Cloudflare-only assets outside the known candidate path set.';
const canonical=value=>Buffer.from(JSON.stringify(value));
async function writeBound(file,core,label){const canonicalSha256=sha256(canonical(core)),output={...core,[label]:canonicalSha256,hashScope:`SHA-256 of compact JSON with ${label} and hashScope omitted`};await writeFile(file,JSON.stringify(output,null,2)+'\n',{flag:'wx'});return{output,canonicalSha256,fileSha256:sha256(await readFile(file))};}
export async function validateGate1(file,expectedSha256,locale='zh',expectedKnownPaths=6851){
  const bytes=await readFile(file);if(sha256(bytes)!==expectedSha256)fail('Gate 1 evidence hash mismatch');const value=JSON.parse(bytes);
  if(value.locale!==locale||value.summary?.expected!==expectedKnownPaths||value.summary?.attempted!==expectedKnownPaths||value.summary?.matched!==expectedKnownPaths||value.summary?.mismatched||value.summary?.unresolved||value.summary?.failed||value.summary?.unexpectedRedirects||value.candidateBefore?.inventorySchema!==INVENTORY_SCHEMA||value.candidateBefore?.inventoryAlgorithm!==INVENTORY_ALGORITHM)fail('Gate 1 evidence is not PASS');
  return value;
}
export function assertProduction(expected,actual){if(expected.deployment!==actual.deployment||expected.version!==actual.version||expected.traffic!==100||actual.traffic!==100)fail('Production version drift');return true;}
export async function createInitialMigrationBundle(options){
  const gate=await validateGate1(options.gate1Evidence,options.gate1EvidenceSha256,options.locale,options.expected.fileCount),candidate=await candidateGate({candidate:options.candidate,receiptFile:options.releaseReceipt,locale:options.locale,expected:options.expected});
  await mkdir(options.outputDir,{recursive:true});
  const sourceEvidence={type:'human-approved-known-path-production-reconstruction',gate1Evidence:path.resolve(options.gate1Evidence),gate1EvidenceSha256:options.gate1EvidenceSha256,releaseReceipt:path.resolve(options.releaseReceipt),releaseReceiptSha256:candidate.result.receiptFileSha256,currentProduction:options.currentProduction,residualUncertainty:RESIDUAL_UNCERTAINTY};
  const receipt=await createArtifact({source:options.candidate,sourceEvidence,artifact:options.artifact,receipt:options.receipt,createdAt:options.createdAt,locale:options.locale,config:options.config});
  await verifyArtifact(options.receipt,options.artifact,options.locale);
  await rm(options.extracted,{recursive:true,force:true});await mkdir(options.extracted,{recursive:true});const proc=spawnSync('tar',['-xf',options.artifact,'-C',options.extracted],{encoding:'utf8'});if(proc.status!==0)fail('Artifact extraction failed');
  const extracted=await inventory(options.extracted),roundTrip={fileCount:Object.keys(extracted).length,totalBytes:Object.values(extracted).reduce((sum,item)=>sum+item.size,0),inventorySha256:inventorySha256(extracted)};
  if(roundTrip.fileCount!==options.expected.fileCount||roundTrip.totalBytes!==options.expected.totalBytes||roundTrip.inventorySha256!==options.expected.inventorySha256)fail('Artifact round-trip mismatch');
  const receiptBytes=await readFile(options.receipt),migrationCore={schema:1,type:'initial-migration-evidence',locale:options.locale,worker:receipt.worker,gate1EvidenceSha256:options.gate1EvidenceSha256,candidateInventorySchema:INVENTORY_SCHEMA,candidateInventoryAlgorithm:INVENTORY_ALGORITHM,candidateInventorySha256:options.expected.inventorySha256,artifactSha256:receipt.artifact.sha256,receiptCanonicalSha256:receipt.receiptSha256,receiptFileSha256:sha256(receiptBytes),gate1Production:options.currentProduction,knownPathCount:gate.summary.expected,knownPathMatchCount:gate.summary.matched,residualUncertainty:RESIDUAL_UNCERTAINTY,createdAt:options.createdAt};
  const migration=await writeBound(options.migrationEvidence,migrationCore,'migrationEvidenceSha256');
  const preUploadCore={schema:1,type:'INITIAL_MIGRATION_PRE_UPLOAD_ATTESTATION',status:'PENDING_GATE_2_UPLOAD_APPROVAL',locale:options.locale,worker:receipt.worker,config:options.config,artifactSha256:receipt.artifact.sha256,receiptCanonicalSha256:receipt.receiptSha256,receiptFileSha256:sha256(receiptBytes),gate1EvidenceSha256:options.gate1EvidenceSha256,migrationEvidenceSha256:migration.canonicalSha256,currentProduction:options.currentProduction,inventorySchema:INVENTORY_SCHEMA,inventoryAlgorithm:INVENTORY_ALGORITHM,inventorySha256:options.expected.inventorySha256,migrationStrategy:'human-approved-known-path-production-reconstruction',residualUncertainty:RESIDUAL_UNCERTAINTY,createdAt:options.createdAt};
  const preUpload=await writeBound(options.preUploadAttestation,preUploadCore,'preUploadAttestationSha256');
  return{receipt,receiptFileSha256:sha256(receiptBytes),roundTrip,migration,preUpload,candidate:candidate.result};
}
export async function verifyInitialMigrationBundle({artifact,receipt,gate1Evidence,gate1EvidenceSha256,migrationEvidence,preUploadAttestation,locale='zh'}){
  const receiptValue=JSON.parse(await readFile(receipt));await validateGate1(gate1Evidence,gate1EvidenceSha256,locale,receiptValue.fileCount);const verified=await verifyArtifact(receipt,artifact,locale),migration=JSON.parse(await readFile(migrationEvidence)),pre=JSON.parse(await readFile(preUploadAttestation));
  if(migration.gate1EvidenceSha256!==gate1EvidenceSha256||migration.artifactSha256!==verified.artifactSha256||migration.receiptCanonicalSha256!==verified.receiptSha256)fail('Migration evidence binding mismatch');
  if(pre.type!=='INITIAL_MIGRATION_PRE_UPLOAD_ATTESTATION'||pre.status!=='PENDING_GATE_2_UPLOAD_APPROVAL'||pre.artifactSha256!==verified.artifactSha256||pre.receiptCanonicalSha256!==verified.receiptSha256||pre.gate1EvidenceSha256!==gate1EvidenceSha256)fail('Pre-upload attestation binding mismatch');
  if(receiptValue.source?.type!=='human-approved-known-path-production-reconstruction')fail('Wrong source classification');return{...verified,migrationEvidenceSha256:migration.migrationEvidenceSha256,preUploadAttestationSha256:pre.preUploadAttestationSha256};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))fail('Use the exported functions from a reviewed execution script; no implicit CLI defaults are allowed');
