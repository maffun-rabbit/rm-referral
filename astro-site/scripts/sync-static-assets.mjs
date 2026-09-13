import {cp,rm,copyFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const publicRoot=path.join(root,'astro-site/public');
const locales=['en','zh','ko','vi','pt'];
for(const dir of ['css','js','images']){
 try{await cp(path.join(root,dir),path.join(publicRoot,dir),{recursive:true,filter:src=>!src.endsWith('.html')});}catch(e){if(e.code!=='ENOENT')throw e;}
 for(const l of locales){try{await cp(path.join(root,dir),path.join(publicRoot,l,dir),{recursive:true,filter:src=>!src.endsWith('.html')});}catch(e){if(e.code!=='ENOENT')throw e;}}
}
// The sitemap is generated from the same route inventory as the pages.
await rm(path.join(publicRoot,'sitemap.xml'),{force:true});
for(const f of ['robots.txt','google55b1c42743aa7ee2.html'])await copyFile(path.join(root,f),path.join(publicRoot,f));
for(const l of locales)await copyFile(path.join(root,l,'google55b1c42743aa7ee2.html'),path.join(publicRoot,l,'google55b1c42743aa7ee2.html'));
console.log('Synced shared assets (no legacy page HTML).');
