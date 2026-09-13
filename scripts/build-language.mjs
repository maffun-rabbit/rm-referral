import {requireLanguage} from './language-config.mjs';
import {prepareRelease} from './prepare-release.mjs';
requireLanguage(process.argv[2]);
await prepareRelease();
