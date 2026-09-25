import {spawnSync} from 'node:child_process';
import {prepareRelease,fingerprint,verifyReceipt} from './prepare-release.mjs';
import {root,verifyFrozen} from './page-sources.mjs';
import {requireLanguage} from './language-config.mjs';
const [mode='build',locale]=process.argv.slice(2);
if(mode==='verify'){verifyFrozen();await verifyReceipt(await fingerprint());console.log('Release integrity verified.');}
else if(mode==='build')await prepareRelease();
else if(mode==='deploy'){const {config}=requireLanguage(locale);if(!process.env.RM_PAGE)throw new Error('Normal deploy requires RM_PAGE=locale/route and uses the single-page path. Use npm run maintenance:full-build only for an explicit full rebuild.');const r=spawnSync('npx',['--no-install','wrangler','deploy','--config',config],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);}
else throw new Error('Usage: release.mjs build | verify | deploy <locale>');
