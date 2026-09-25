import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {stage, productionPreflight, sha256} from './deploy-boundary.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const fail=message=>{throw new Error('SINGLE ARTICLE DEPLOY: '+message);};
const run=(command,args,options={})=>{const r=spawnSync(command,args,{cwd:root,encoding:'utf8',env:process.env,...options});if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);if(r.status!==0)fail(`${command} failed (${r.status})`);return r;};
const [locale]=process.argv.slice(2);
if(locale!=='ja'||process.env.RM_PAGE!=='ja/guide/rakuten-mobile-three-features'||!process.env.RM_DEPLOY_PLAN)fail('Only approved Japanese pilot via RM_PAGE and RM_DEPLOY_PLAN is allowed');
const planFile=path.resolve(process.env.RM_DEPLOY_PLAN),plan=JSON.parse(await readFile(planFile));
if(path.resolve(plan.candidate)!==path.join(root,'.deploy/pilot-ja')||path.resolve(plan.generated)!==path.join(root,'.deploy/pilot-overlays'))fail('Unexpected staging paths');
if(!process.env.RM_APPROVED_BASELINE_SHA256||!process.env.RM_APPROVED_ATTESTATION_SHA256)fail('Pinned baseline approval required');
if(existsSync(plan.generated)||existsSync(plan.candidate))fail('Generated and candidate directories must not exist; refusing reuse');

run(process.execPath,[path.join(root,'scripts/build-page.mjs'),process.env.RM_PAGE,'--output',plan.generated]);
for(const [key,item] of Object.entries(plan.overlays)){
  const bytes=await readFile(item.source);if(sha256(bytes)!==item.sha256)fail('Generated overlay differs from approved hash: '+key);
}
const staged=await stage(planFile);
const checked=await productionPreflight(planFile);
if(JSON.stringify(staged.changed)!==JSON.stringify(checked.changed))fail('Preflight result changed after staging');
const alias=process.env.RM_VERSION_ALIAS||'single-page-pilot-4b4';
const upload=run('npx',['--no-install','wrangler','versions','upload','--config','wrangler.jsonc','--preview-alias',alias]);
console.log(JSON.stringify({operation:'single-article-version-upload',generatedHtml:1,fullBuilds:0,maintenanceFullBuilds:0,...checked},null,2));
