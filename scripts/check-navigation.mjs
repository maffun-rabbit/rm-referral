import assert from 'node:assert/strict';
import {localizeNavigation} from './localize-navigation.mjs';
const root=process.cwd();
for(const l of ['en','zh','ko','vi','pt']){
 assert.equal(await localizeNavigation('<a href="https://mnp-navi.jp/guide/replacement-program/">Guide</a>',l,root),'<a href="/'+l+'/guide/replacement-program/">Guide</a>');
 assert.equal(await localizeNavigation('<a href="/not-translated/">Missing</a>',l,root),'<span data-translation-pending="'+l+'/not-translated/">Missing</span>');
 assert.equal(await localizeNavigation('<a href="https://example.com/">External</a>',l,root),'<a href="https://example.com/">External</a>');
}
console.log('Navigation regression checks passed for five languages.');
