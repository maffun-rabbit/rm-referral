import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inventory,sha256} from './deploy-boundary.mjs';
import {INVENTORY_SCHEMA,INVENTORY_ALGORITHM,inventorySha256} from './promotion-release.mjs';

const fail=message=>{throw new Error('KNOWN PATH VERIFICATION: '+message);};
const transient=new Set([429,500,502,503,504]);
export const DEFAULT_CONCURRENCY=12;
export const DEFAULT_ATTEMPTS=3;
export const DEFAULT_TIMEOUT_MS=30000;

export function productionPath(assetPath){
  if(!assetPath.startsWith('/')||assetPath.includes('..')||assetPath.includes('//'))fail('Unsafe asset path');
  if(assetPath.endsWith('/index.html'))return assetPath.slice(0,-'index.html'.length);
  if(assetPath.endsWith('.html'))return assetPath.slice(0,-'.html'.length);
  return assetPath;
}
export function category(assetPath){
  const value=assetPath.toLowerCase();
  if(value.endsWith('.html'))return 'HTML';
  if(value.endsWith('.css'))return 'CSS';
  if(value.endsWith('.js')||value.endsWith('.mjs'))return 'JavaScript';
  if(/\.(png|jpe?g|gif|webp|svg|ico|avif)$/.test(value))return 'Image';
  if(/\.(woff2?|ttf|otf|eot)$/.test(value))return 'Font';
  if(value.endsWith('/robots.txt'))return 'robots';
  if(value.endsWith('/sitemap.xml'))return 'sitemap';
  return 'Other';
}
export function stableProduction(before,after){
  return before?.deployment===after?.deployment&&before?.version===after?.version&&before?.traffic===100&&after?.traffic===100;
}
export function sameCandidate(before,after){
  return before.fileCount===after.fileCount&&before.totalBytes===after.totalBytes&&before.inventorySha256===after.inventorySha256&&after.receiptMissing===0&&after.receiptExtra===0&&after.receiptMismatch===0;
}
export async function candidateGate({candidate,receiptFile,locale,expected}){
  const files=await inventory(candidate),receiptBytes=await readFile(receiptFile),receipt=JSON.parse(receiptBytes);
  const listed=Array.isArray(receipt.files?.[locale])?receipt.files[locale]:null;
  const receiptMap=listed?new Map(listed.map(item=>['/'+item.file,{sha256:item.sha256,size:item.size}])):new Map(Object.entries(receipt.files??{}));
  const keys=[...new Set([...Object.keys(files),...receiptMap.keys()])];
  const result={fileCount:Object.keys(files).length,totalBytes:Object.values(files).reduce((sum,item)=>sum+item.size,0),receiptEntries:receiptMap.size,
    receiptMissing:keys.filter(key=>!files[key]).length,receiptExtra:keys.filter(key=>!receiptMap.has(key)).length,
    receiptMismatch:keys.filter(key=>files[key]&&receiptMap.has(key)&&(files[key].sha256!==receiptMap.get(key).sha256||(receiptMap.get(key).size!==undefined&&files[key].size!==receiptMap.get(key).size))).length,
    inventorySchema:INVENTORY_SCHEMA,inventoryAlgorithm:INVENTORY_ALGORITHM,inventorySha256:inventorySha256(files),receiptFileSha256:sha256(receiptBytes)};
  for(const key of ['fileCount','totalBytes','inventorySha256'])if(result[key]!==expected[key])fail(`Candidate ${key} mismatch`);
  if(result.receiptEntries!==expected.fileCount||result.receiptMissing||result.receiptExtra||result.receiptMismatch)fail('Candidate receipt mismatch');
  return {files,result};
}
async function requestOnce(url,fetchImpl,timeoutMs){
  const redirects=[];let current=url,response;
  for(let count=0;count<6;count++){
    response=await fetchImpl(current,{redirect:'manual',headers:{'user-agent':'RM-HTMLRewriter-5D3-Gate1/1.0','accept-encoding':'identity'},signal:AbortSignal.timeout(timeoutMs)});
    if(response.status<300||response.status>=400)break;
    const location=response.headers.get('location');redirects.push({status:response.status,location,from:current});
    if(!location)break;
    const next=new URL(location,current);
    if(next.origin!==new URL(url).origin)return {response,redirects,crossOrigin:true,finalUrl:next.href};
    current=next.href;
  }
  return {response,redirects,crossOrigin:false,finalUrl:response.url||current};
}
export async function verifyAsset({assetPath,expected,expectedResponse,baseUrl,fetchImpl=fetch,attempts=DEFAULT_ATTEMPTS,timeoutMs=DEFAULT_TIMEOUT_MS}){
  const responseExpected=expectedResponse?.bytes?{size:expectedResponse.bytes.length,sha256:sha256(expectedResponse.bytes)}:expected;
  if(expectedResponse?.bytes&&((expectedResponse.size!==undefined&&expectedResponse.size!==responseExpected.size)||(expectedResponse.sha256!==undefined&&expectedResponse.sha256!==responseExpected.sha256)))fail('Transformed expected response identity mismatch');
  const requestUrl=new URL(productionPath(assetPath),baseUrl).href,attemptLog=[];
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const fetched=await requestOnce(requestUrl,fetchImpl,timeoutMs),status=fetched.response.status;
      if(transient.has(status)&&attempt<attempts){attemptLog.push({attempt,status,retry:true});continue;}
      const body=Buffer.from(await fetched.response.arrayBuffer()),actualSha256=sha256(body),redirectCount=fetched.redirects.length;
      const bytesMatch=body.length===responseExpected.size&&actualSha256===responseExpected.sha256;
      const redirectValid=redirectCount===0&&!fetched.crossOrigin;
      const matched=status===200&&bytesMatch&&redirectValid;
      let result=matched?'MATCH':status===404?'NOT_FOUND':redirectValid&&status===200?'MISMATCH':'UNEXPECTED_REDIRECT';
      if(transient.has(status))result='FAILED';
      return {assetPath,requestUrl,category:category(assetPath),staticExpectedSize:expected.size,staticExpectedSha256:expected.sha256,expectedSize:responseExpected.size,actualSize:body.length,expectedSha256:responseExpected.sha256,actualSha256,transformation:expectedResponse?.transformation??'STATIC',
        initialStatus:fetched.redirects[0]?.status??status,location:fetched.redirects[0]?.location??null,finalUrl:fetched.finalUrl,finalStatus:status,redirectCount,
        contentType:fetched.response.headers.get('content-type'),etag:fetched.response.headers.get('etag'),lastModified:fetched.response.headers.get('last-modified'),
        cacheControl:fetched.response.headers.get('cache-control'),cfCacheStatus:fetched.response.headers.get('cf-cache-status'),attempts:[...attemptLog,{attempt,status,retry:false}],result};
    }catch(error){
      attemptLog.push({attempt,error:String(error?.message??error),retry:attempt<attempts});
      if(attempt===attempts)return {assetPath,requestUrl,category:category(assetPath),expectedSize:expected.size,actualSize:null,expectedSha256:expected.sha256,actualSha256:null,
        initialStatus:null,location:null,finalUrl:null,finalStatus:null,redirectCount:0,contentType:null,etag:null,lastModified:null,cacheControl:null,cfCacheStatus:null,attempts:attemptLog,result:'UNRESOLVED'};
    }
  }
}
export async function verifyInventory({files,baseUrl,edgeResponses={},fetchImpl=fetch,concurrency=DEFAULT_CONCURRENCY,onProgress=()=>{}}){
  const entries=Object.entries(files).sort(([a],[b])=>a<b?-1:a>b?1:0),results=new Array(entries.length);let cursor=0,completed=0;
  async function worker(){while(true){const index=cursor++;if(index>=entries.length)return;const [assetPath,expected]=entries[index];results[index]=await verifyAsset({assetPath,expected,expectedResponse:edgeResponses[assetPath],baseUrl,fetchImpl});completed++;onProgress(completed,entries.length);}}
  await Promise.all(Array.from({length:Math.min(concurrency,entries.length)},()=>worker()));return results;
}
export function summarize(results){
  const summary={expected:results.length,attempted:results.length,matched:0,mismatched:0,unresolved:0,failed:0,notStarted:0,redirects:0,unexpectedRedirects:0},categories={};
  for(const name of ['HTML','CSS','JavaScript','Image','Font','robots','sitemap','Other'])categories[name]={expected:0,attempted:0,matched:0,mismatched:0,unresolved:0,failed:0,redirects:0};
  for(const item of results){const row=categories[item.category];row.expected++;row.attempted++;row.redirects+=item.redirectCount;summary.redirects+=item.redirectCount;
    if(item.result==='MATCH'){summary.matched++;row.matched++;}else if(item.result==='UNRESOLVED'){summary.unresolved++;row.unresolved++;}
    else if(item.result==='FAILED'){summary.failed++;row.failed++;}else{summary.mismatched++;row.mismatched++;if(item.result==='UNEXPECTED_REDIRECT')summary.unexpectedRedirects++;}}
  return {summary,categories};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=Object.fromEntries(process.argv.slice(2).map(value=>{const i=value.indexOf('=');if(i<1)fail('Arguments must use --name=value');return[value.slice(2,i),value.slice(i+1)];}));
  for(const key of ['candidate','receipt','locale','base-url','output','expected-files','expected-bytes','expected-inventory'])if(!args[key])fail('Missing --'+key);
  const expected={fileCount:Number(args['expected-files']),totalBytes:Number(args['expected-bytes']),inventorySha256:args['expected-inventory']};
  const start=await candidateGate({candidate:args.candidate,receiptFile:args.receipt,locale:args.locale,expected});
  const startedAt=new Date().toISOString();console.log(JSON.stringify({candidate:start.result,startedAt}));
  const results=await verifyInventory({files:start.files,baseUrl:args['base-url'],onProgress:(done,total)=>{if(done%250===0||done===total)console.log(`progress ${done}/${total}`);}});
  const end=await candidateGate({candidate:args.candidate,receiptFile:args.receipt,locale:args.locale,expected}),aggregate=summarize(results);
  const evidence={schema:1,operation:'zh-known-production-paths-gate1',locale:args.locale,baseUrl:args['base-url'],startedAt,completedAt:new Date().toISOString(),retryPolicy:{attempts:DEFAULT_ATTEMPTS,timeoutMs:DEFAULT_TIMEOUT_MS,concurrency:DEFAULT_CONCURRENCY},candidateBefore:start.result,candidateAfter:end.result,candidateStable:sameCandidate(start.result,end.result),...aggregate,
    unknownAssetUncertainty:'Exhaustive verification covers all 6,851 known candidate paths. It does not prove cryptographic complete identity of the entire Cloudflare asset namespace or absence of additional unknown assets.',results};
  await writeFile(args.output,JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({output:args.output,evidenceSha256:sha256(await readFile(args.output)),summary:aggregate.summary,candidateStable:evidence.candidateStable,categories:aggregate.categories}));
  if(!evidence.candidateStable||aggregate.summary.matched!==results.length)process.exitCode=2;
}
