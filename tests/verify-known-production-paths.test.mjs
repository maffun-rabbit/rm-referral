import test from 'node:test';
import assert from 'node:assert/strict';
import {sha256} from '../scripts/deploy-boundary.mjs';
import {productionPath,category,stableProduction,sameCandidate,verifyAsset,verifyInventory,summarize} from '../scripts/verify-known-production-paths.mjs';

const entry=value=>({size:Buffer.byteLength(value),sha256:sha256(value)});
const response=(body,status=200,headers={})=>new Response(body,{status,headers});

test('path mapping is deterministic for locale root, HTML index, non-index HTML and static assets',()=>{
  assert.equal(productionPath('/zh/index.html'),'/zh/');assert.equal(productionPath('/zh/guide/demo/index.html'),'/zh/guide/demo/');assert.equal(productionPath('/zh/google-verification.html'),'/zh/google-verification');assert.equal(productionPath('/zh/css/style.css'),'/zh/css/style.css');
  assert.throws(()=>productionPath('/zh/../ja/index.html'),/Unsafe/);
});
test('categories cover HTML, CSS, JavaScript, image, font, robots, sitemap and other',()=>{
  assert.deepEqual(['/zh/index.html','/zh/a.css','/zh/a.js','/zh/a.webp','/zh/a.woff2','/zh/robots.txt','/zh/sitemap.xml','/zh/a.bin'].map(category),['HTML','CSS','JavaScript','Image','Font','robots','sitemap','Other']);
});
test('matching decoded body passes and mismatch or 404 fails',async()=>{
  const expected=entry('same');assert.equal((await verifyAsset({assetPath:'/zh/a.txt',expected,baseUrl:'https://example.com',fetchImpl:async()=>response('same')})).result,'MATCH');
  assert.equal((await verifyAsset({assetPath:'/zh/a.txt',expected,baseUrl:'https://example.com',fetchImpl:async()=>response('other')})).result,'MISMATCH');
  assert.equal((await verifyAsset({assetPath:'/zh/a.txt',expected,baseUrl:'https://example.com',fetchImpl:async()=>response('no',404)})).result,'NOT_FOUND');
});
test('redirects are recorded and rejected, including cross-origin redirects',async()=>{
  const expected=entry('same'),local=await verifyAsset({assetPath:'/zh/a.txt',expected,baseUrl:'https://example.com',fetchImpl:async(url)=>url.endsWith('/a.txt')?response('',301,{location:'/zh/b.txt'}):response('same')});
  assert.equal(local.result,'UNEXPECTED_REDIRECT');assert.equal(local.redirectCount,1);
  const cross=await verifyAsset({assetPath:'/zh/a.txt',expected,baseUrl:'https://example.com',fetchImpl:async()=>response('',302,{location:'https://other.example/a'})});assert.equal(cross.result,'UNEXPECTED_REDIRECT');
});
test('transient response retries and exhaustion is failed',async()=>{
  let calls=0;const expected=entry('ok'),pass=await verifyAsset({assetPath:'/zh/a.txt',expected,baseUrl:'https://example.com',fetchImpl:async()=>++calls<3?response('retry',503):response('ok')});
  assert.equal(pass.result,'MATCH');assert.equal(calls,3);
  const failed=await verifyAsset({assetPath:'/zh/a.txt',expected,baseUrl:'https://example.com',fetchImpl:async()=>response('retry',503)});assert.equal(failed.result,'FAILED');
});
test('network retry exhaustion remains unresolved',async()=>{
  const item=await verifyAsset({assetPath:'/zh/a.txt',expected:entry('ok'),baseUrl:'https://example.com',fetchImpl:async()=>{throw new Error('network')}});assert.equal(item.result,'UNRESOLVED');assert.equal(item.attempts.length,3);
});
test('bounded concurrency never exceeds the configured limit',async()=>{
  const files=Object.fromEntries(Array.from({length:20},(_,i)=>[`/zh/${i}.txt`,entry(String(i))]));let active=0,max=0;
  const results=await verifyInventory({files,baseUrl:'https://example.com',concurrency:4,fetchImpl:async url=>{active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,2));active--;return response(url.match(/\/(\d+)\.txt$/)[1]);}});
  assert.equal(results.length,20);assert.equal(max,4);assert.equal(summarize(results).summary.matched,20);
});
test('production and candidate drift detection fail closed',()=>{
  assert.equal(stableProduction({deployment:'d',version:'v',traffic:100},{deployment:'d',version:'v',traffic:100}),true);assert.equal(stableProduction({deployment:'d',version:'v',traffic:100},{deployment:'d2',version:'v',traffic:100}),false);
  const candidate={fileCount:1,totalBytes:1,inventorySha256:'a',receiptMissing:0,receiptExtra:0,receiptMismatch:0};assert.equal(sameCandidate(candidate,{...candidate}),true);assert.equal(sameCandidate(candidate,{...candidate,inventorySha256:'b'}),false);
});
