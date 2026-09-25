import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error('BOOTSTRAP SENTINEL: ' + message); };
const htmlValue = (text, re) => text.match(re)?.[1]?.trim() ?? null;
export const SENTINELS = [
  '/', '/guide/', '/guide/rakuten-mobile-three-features/', '/guide/monthly-cost/',
  '/guide/rakuten-link/', '/guide/replacement-program/', '/topics/replacement-program-disadvantages/',
  '/css/style.css', '/js/analytics.js', '/images/guides/rakuten-id/step-1-account-fields.png',
  '/robots.txt', '/sitemap.xml',
];

export async function compareSentinels({tree, origin='https://mnp-navi.jp', fetcher=fetch}) {
  const results=[];
  for (const url of SENTINELS) {
    const localPath = url.endsWith('/') ? url + 'index.html' : url;
    const local = await readFile(path.join(tree, localPath.slice(1)));
    const response = await fetcher(origin + url, {redirect:'follow', headers:{'user-agent':'rm-bootstrap-sentinel/1'}});
    const live = Buffer.from(await response.arrayBuffer());
    const type = response.headers.get('content-type') ?? '';
    const isHtml = localPath.endsWith('.html');
    const localText=isHtml?local.toString('utf8'):''; const liveText=isHtml?live.toString('utf8'):'';
    const localCanonical=isHtml?htmlValue(localText,/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i):null;
    const liveCanonical=isHtml?htmlValue(liveText,/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i):null;
    const localTitle=isHtml?htmlValue(localText,/<title[^>]*>([\s\S]*?)<\/title>/i):null;
    const liveTitle=isHtml?htmlValue(liveText,/<title[^>]*>([\s\S]*?)<\/title>/i):null;
    const byteEqual=local.equals(live);
    const pass=response.status===200 && (!isHtml || (localCanonical===liveCanonical && localTitle===liveTitle)) && byteEqual;
    results.push({url,status:response.status,contentType:type,localBytes:local.length,liveBytes:live.length,localSha256:sha256(local),liveSha256:sha256(live),byteEqual,canonical:isHtml?{local:localCanonical,live:liveCanonical,equal:localCanonical===liveCanonical}:null,title:isHtml?{local:localTitle,live:liveTitle,equal:localTitle===liveTitle}:null,pass});
  }
  return {schema:1,origin,limitation:'Sentinel equality does not prove equality of the complete production asset set.',verdict:results.every(x=>x.pass)?'PASS':'FAIL',results};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [tree,output]=process.argv.slice(2); if(!tree||!output||!process.env.RM_CAPTURED_AT)fail('Usage: bootstrap-sentinel.mjs <tree> <output>; RM_CAPTURED_AT required');
  const report={...(await compareSentinels({tree})),capturedAt:process.env.RM_CAPTURED_AT};
  await writeFile(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'}); console.log(JSON.stringify({verdict:report.verdict,results:report.results.length,output},null,2));
}
