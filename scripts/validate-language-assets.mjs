import {verifyFrozen} from './page-sources.mjs';
import {fingerprint,verifyReceipt} from './prepare-release.mjs';
import {requireLanguage} from './language-config.mjs';
requireLanguage(process.argv[2]);verifyFrozen();await verifyReceipt(await fingerprint());
console.log('Shared release verified: '+process.argv[2]);
