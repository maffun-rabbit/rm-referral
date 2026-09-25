import {createHash} from 'node:crypto';
import {open, readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inventory, sha256} from './deploy-boundary.mjs';

const fail = message => { throw new Error('BOOTSTRAP ARTIFACT: ' + message); };
const digestPattern = /^[0-9a-f]{64}$/;
const pad = size => Buffer.alloc(size, 0);
const octal = (value, size) => Buffer.from(value.toString(8).padStart(size - 1, '0') + '\0');
function put(header, offset, size, value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
  if (bytes.length > size) fail('Tar field too long: ' + value);
  bytes.copy(header, offset);
}
function splitTarPath(name) {
  const bytes = Buffer.byteLength(name);
  if (bytes <= 100) return {name, prefix: ''};
  for (let i = name.lastIndexOf('/'); i > 0; i = name.lastIndexOf('/', i - 1)) {
    const prefix = name.slice(0, i), tail = name.slice(i + 1);
    if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(tail) <= 100) return {name: tail, prefix};
  }
  fail('Path cannot be represented in ustar: ' + name);
}
function tarHeader(name, size) {
  const parts = splitTarPath(name), h = pad(512);
  put(h, 0, 100, parts.name); put(h, 100, 8, octal(0o644, 8)); put(h, 108, 8, octal(0, 8)); put(h, 116, 8, octal(0, 8));
  put(h, 124, 12, octal(size, 12)); put(h, 136, 12, octal(0, 12)); h.fill(0x20, 148, 156); h[156] = '0'.charCodeAt(0);
  put(h, 257, 6, Buffer.from('ustar\0')); put(h, 263, 2, Buffer.from('00')); put(h, 345, 155, parts.prefix);
  const sum = h.reduce((total, byte) => total + byte, 0); put(h, 148, 8, Buffer.from(sum.toString(8).padStart(6, '0') + '\0 '));
  return h;
}
async function append(handle, hash, bytes, state) {
  hash.update(bytes); await handle.write(bytes, 0, bytes.length, state.offset); state.offset += bytes.length;
}
export function categories(files) {
  const counts = {root:0,guide:0,topics:0,css:0,js:0,images:0,fonts:0,redirects:0,headers:0,robots:0,sitemap:0,otherHtml:0,other:0};
  for (const key of Object.keys(files)) {
    let type='other';
    if (key==='/index.html') type='root'; else if (key.startsWith('/guide/')&&key.endsWith('.html')) type='guide';
    else if (key.startsWith('/topics/')&&key.endsWith('.html')) type='topics'; else if (key.startsWith('/css/')) type='css'; else if (key.startsWith('/js/')) type='js';
    else if (/\.(png|jpe?g|gif|webp|svg|ico|avif)$/i.test(key)) type='images'; else if (/\.(woff2?|ttf|otf|eot)$/i.test(key)) type='fonts';
    else if (key==='/_redirects') type='redirects'; else if (key==='/_headers') type='headers'; else if (key==='/robots.txt') type='robots';
    else if (key==='/sitemap.xml') type='sitemap'; else if (key.endsWith('.html')) type='otherHtml';
    counts[type]++;
  }
  return counts;
}
export async function createArtifact({source, sourceReceipt, sourceEvidence, artifact, receipt, createdAt, config='wrangler.jsonc'}) {
  const files = await inventory(source);
  let sourceInfo;
  if(sourceReceipt){
    const sourceBytes = await readFile(sourceReceipt), legacy = JSON.parse(sourceBytes);
    const expected = Object.fromEntries((legacy.files?.ja ?? []).map(x=>['/'+x.file,{sha256:x.sha256,size:x.size}]));
    const keys=[...new Set([...Object.keys(files),...Object.keys(expected)])];
    const mismatch=keys.filter(key=>files[key]?.sha256!==expected[key]?.sha256||(expected[key]?.size!==undefined&&files[key]?.size!==expected[key].size));
    if (!Object.keys(expected).length || mismatch.length) fail('Source tree does not match verified release receipt: '+JSON.stringify(mismatch.slice(0,20)));
    sourceInfo={type:'verified-release-tree',receipt:path.resolve(sourceReceipt),receiptSha256:sha256(sourceBytes)};
  }else{
    if(sourceEvidence?.type!=='verified-single-article-candidate'||!digestPattern.test(sourceEvidence.planSha256??'')||sourceEvidence.fileCount!==Object.keys(files).length)fail('Verified candidate evidence required');
    sourceInfo=sourceEvidence;
  }
  await mkdir(path.dirname(artifact), {recursive:true});
  const handle = await open(artifact, 'wx'), artifactHash = createHash('sha256'), state={offset:0};
  try {
    for (const key of Object.keys(files).sort()) {
      const bytes = await readFile(path.join(source,key.slice(1)));
      await append(handle,artifactHash,tarHeader(key.slice(1),bytes.length),state); await append(handle,artifactHash,bytes,state);
      const remainder=bytes.length%512;if(remainder)await append(handle,artifactHash,pad(512-remainder),state);
    }
    await append(handle,artifactHash,pad(1024),state);
  } finally { await handle.close(); }
  const artifactSha256=artifactHash.digest('hex');
  const core={schema:2,locale:'ja',worker:'rm-referral',config,createdAt,source:sourceInfo,artifact:{format:'ustar',reference:path.resolve(artifact),sha256:artifactSha256,size:state.offset},fileCount:Object.keys(files).length,categories:categories(files),files};
  const receiptSha256=sha256(JSON.stringify(core));
  const output={...core,receiptHashScope:'SHA-256 of canonical JSON.stringify(receipt with receiptSha256 and receiptHashScope omitted)',receiptSha256};
  await writeFile(receipt,JSON.stringify(output,null,2)+'\n',{flag:'wx'});
  return output;
}
export async function verifyArtifact(receiptFile, artifactFile) {
  const receipt=JSON.parse(await readFile(receiptFile));
  const {receiptSha256,receiptHashScope,...withScope}=receipt; delete withScope.receiptHashScope;
  if (!digestPattern.test(receiptSha256??'') || sha256(JSON.stringify(withScope))!==receiptSha256) fail('Receipt digest mismatch');
  const bytes=await readFile(artifactFile);
  if (bytes.length!==receipt.artifact.size||sha256(bytes)!==receipt.artifact.sha256)fail('Artifact digest mismatch');
  return {artifactSha256:receipt.artifact.sha256,receiptSha256,fileCount:receipt.fileCount};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [mode,...args]=process.argv.slice(2);
  if(mode==='create'){
    const result=await createArtifact({source:args[0],sourceReceipt:args[1],artifact:args[2],receipt:args[3],createdAt:process.env.RM_CAPTURED_AT});
    console.log(JSON.stringify({artifactSha256:result.artifact.sha256,artifactSize:result.artifact.size,receiptSha256:result.receiptSha256,fileCount:result.fileCount},null,2));
  }
  else if(mode==='verify')console.log(JSON.stringify(await verifyArtifact(args[0],args[1]),null,2));
  else fail('Usage: bootstrap-artifact.mjs create <tree> <release.json> <artifact.tar> <receipt.json> | verify <receipt.json> <artifact.tar>');
}
