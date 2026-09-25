import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {preflight,sha256} from './deploy-boundary.mjs';
import {createArtifact} from './bootstrap-artifact.mjs';
const fail=m=>{throw new Error('PROMOTE BASELINE: '+m);};
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [planFile,artifact,receipt]=process.argv.slice(2);if(!receipt||!process.env.RM_CAPTURED_AT)fail('plan, artifact, receipt and RM_CAPTURED_AT required');
 const result=await preflight(planFile);if(result.candidateFiles!==7979||result.targetArticleChanges!==1||result.changed.length!==3||result.unexpected.length||result.removed.length)fail('Candidate is not approved 4-B.4 scope');
 const planBytes=await readFile(planFile);const plan=JSON.parse(planBytes);
 const output=await createArtifact({source:plan.candidate,sourceEvidence:{type:'verified-single-article-candidate',planSha256:sha256(planBytes),fileCount:result.candidateFiles,changed:result.changed},artifact,receipt,createdAt:process.env.RM_CAPTURED_AT,config:'wrangler.jsonc'});
 console.log(JSON.stringify({artifactSha256:output.artifact.sha256,artifactSize:output.artifact.size,receiptSha256:output.receiptSha256,fileCount:output.fileCount},null,2));
}
