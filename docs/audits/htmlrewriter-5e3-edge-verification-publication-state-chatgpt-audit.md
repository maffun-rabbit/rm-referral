# HTMLRewriter 工程5-E.3 Edge Verification / Publication State 監査

## A. Conclusion

**PASS — NEW ARCHITECTURE READY FOR GIT INTEGRATION**

Candidate/asset identityとedge response identityを分離し、exact authorized Promotion route 1件だけをdeterministic transformed bytes/SHA-256で検証する二層modelを実装した。Publication StateはRelease Planに明示的に格納しhash bindingする。Version 69はcompatibility oracleとしてのみ使用し、Production昇格対象としない。

## B. Git identity

- branch: `main`
- HEAD / origin/main / merge-base: `255eb9ba90eb30060a5f29a58b63d5dfee8124f8`
- ahead / behind: `0 / 0`
- staged: 0
- tracked deletion: 0

## C. Root cause carried from 5-E.2

Version 69の5,195-byte static TopicはHTMLRewriterにより5,221-byte edge responseへdeterministically変換される。従来verifierはそのexact authorized routeもstatic bytesと比較していたため、正しいedge responseをmismatchと評価した。またstatic HTMLとselectorは全6 localeを出力し、未公開Promotion URLを先行表示していた。

## D. Two-layer verification architecture

1. Candidate / Asset Identity: canonical inventory、Manifest/Plan/baseline binding、Topic 1 + sitemap 0/1 allowlist、deletion/unexpected 0を維持。
2. Edge Response Identity: non-targetはstatic byte/SHA一致、exact targetはshared pure transformationで作るexpected edge byte/SHA一致を要求。semantic-only fallbackはない。

## E. Shared transformation source

`scripts/promotion-edge-response.mjs`にPublication State validation、selector transformation、static HTMLからedge responseへの変換を集約した。Workerは同じ`transformHeaderInclude`を利用する。Node固有のSHA計算は`scripts/publication-state-node.mjs`へ分離し、Worker browser bundleを維持した。

## F. Candidate / Asset Identity layer

5-E.1のPromotion guard invariantを維持。target Topicはadded/changedのどちらかexactly 1、locale sitemapはchanged 0/1、total max 2、deleted/unexpected 0。Foundation-only assetは依然拒否する。

## G. Edge Response Identity layer

`verify-known-production-paths.mjs` はasset path exact-keyed `edgeResponses` mapを受け取る。mapにないpathは従来のstatic exact comparison。exact targetはstatic identityとtransformed identityを別々記録し、declared transformed size/SHAの自己不整合も拒否する。

## H. Exact authorized route handling

transformationはcanonical `getTopicPath(locale, slug)`とrequest pathnameのexact equalityを要求。既存Worker exact-path security testsとprefix/suffix/encoded/double-slash negative testsは維持した。

## I. Non-target static identity

non-target control testはstatic expected bytes/SHAとHTTP bytes/SHAの完全一致を要求しPASS。広いHTML例外は導入していない。

## J. Publication State model

status: `UNPUBLISHED`, `VERSION_UPLOADED`, `CURRENT_RELEASE_CANDIDATE`, `PRODUCTION_VERIFIED`, `PRODUCTION_FAILED`, `ROLLED_BACK`。表示可能なのは`CURRENT_RELEASE_CANDIDATE`と`PRODUCTION_VERIFIED`のみ。全6 localeの`locale`, canonical `pathname`, `bindingSource`とexactly one current candidateを必須とする。

## K. Publication State source of truth

Promotion Release Plan schemaに`publicationState` / `publicationStateSha256`を必須化し、Production plan validatorとProduction guardの両方で検証する。candidate Topic HTMLの`data-locales`とhreflangも同じstateに完全一致することをUpload前guardで要求する。

## L. Serial release progression

current candidate + `PRODUCTION_VERIFIED` localesだけをcanonical orderで導出する。ZH→EN→KO→PT→VI→JAの進行を0、1、2、partial、6 locale testsで固定した。

## M. Failure / rollback semantics

`VERSION_UPLOADED`, `PRODUCTION_FAILED`, `ROLLED_BACK`はvisible/published集合から除外される。Version URL PASSだけでpublishedにはならない。

## N. Locale selector behavior

Promotion routeではcurrent + Production-verified localeのみsame-Promotion pathへ変換する。未公開locale optionは削除する。corrected ZH modeでoptionはZH 1件、未公開Promotion hrefは0。

## O. hreflang behavior

single-page buildへPublication State由来locale集合を渡す。corrected ZH static HTMLはZH hreflangのみを含み、未公開5 localeは0。candidate guardがこの集合を再検証する。

## P. JA compatibility

canonical mapping moduleを使用。JA pathは`/topics/<slug>/`であり`/ja/`は拒否。

## Q. Version 69 compatibility regression

- live read-only response: 5,221 bytes
- live SHA-256: `65b52904be2ef6586e0694058e028277deb9e2f202d407ee8d69a673669f5548`
- compatibility transformed output: 5,221 bytes / same SHA-256
- byte-for-byte equality: PASS
- Version 69 identity: `b288a450-df60-426e-a89c-2a3224cbc2d3`, traffic 0%

## R. Corrected Publication State regression

- ZH-only static output: 4,308 bytes / `6e37bffcc11d1426e8cb0efedcc6888ef851084f1aab29c0842871839fb0bdc4`
- ZH-only expected edge output: 4,169 bytes / `8703f167cf1fbb2f3abd93bfbe90a950669a3d574b15f049b72675d92968c6eb`
- selector options: 1
- unpublished hreflang: 0
- unpublished Promotion href: 0
- deterministic single-page reproduction: PASS

Corrected outputはstatic Topic HTMLも変更するため、既存6 candidatesは本工程では変更せず、5-E再開時にPublication State-bound single-page generationからcandidateを再構築する必要がある。Version 69はProductionへ昇格しない。

## S. Security boundary

exact route、canonical locale/path、Publication State hash、static HTML publication binding、Promotion/Foundation allowlist分離をfail-closedで検証。Worker browser-target bundle PASS。secret、absolute production dependency、artifact/binary contaminationは0。

## T. Guard regression

new/update Topic、sitemap 0/1を受理。multiple Topic、Topics index、include、shop、guide、CSS/JS/image/font/robots/root、deletion、wrong sitemap、collisionをすべて拒否。

## U. Tests

- Promotion: 17/17
- Shared: 15/15
- Deploy boundary: 14/14
- Bootstrap / Recovery: 27/27
- Foundation / guard: 36/36
- Gate helpers: 13/13
- New edge/publication-state: 28/28
- total: 150/150 PASS
- JavaScript syntax: PASS
- Worker browser bundle: PASS
- schema/package JSON parse: PASS
- `git diff --check`: PASS
- tracked deletion: 0

## V. Candidate impact

- existing six candidates modified: NO
- corrected candidate regeneration required before next upload: YES
- site-wide/full build: NO
- single Topic validation build in temporary output: 2 deterministic runs + final confirmation

## W. Cloudflare side effects

- Version Upload: 0
- Production switch / traffic / rollback: 0
- settings / route write: 0
- baseline change: 0
- Version 69 read-only GET only

## X. Git side effects

- commit: 0
- push: 0
- staged: 0
- tracked deletion: 0
- existing DO NOT COMMIT evidence retained

## Y. Commit candidate inventory

- `astro-site/src/components/ContentPage.astro`
- `package.json`
- `schemas/promotion-release-plan.schema.json`
- `scripts/build-page.mjs`
- `scripts/production-release-guard.mjs`
- `scripts/promotion-edge-response.mjs`
- `scripts/promotion-production.mjs`
- `scripts/publication-state-node.mjs`
- `scripts/verify-known-production-paths.mjs`
- `tests/foundation-migration.test.mjs`
- `tests/promotion-edge-response.test.mjs`
- `tests/promotion-production.test.mjs`
- `tests/shared-release.test.mjs`
- `worker/index.mjs`
- `docs/audits/htmlrewriter-5e3-edge-verification-publication-state-chatgpt-audit.md`

Do not commit: existing Validation sources/Manifest/Release Plans/evidence JSON/candidates/artifacts. UNKNOWN commit files: 0.

## Z. Human Gate status

**READY TO COMMIT 5-E.3 — WAITING FOR HUMAN APPROVAL**

Production switch readiness remains NO. Git integration and corrected candidate regeneration/new Version verification require later approvals.

## Required Yes / No

- TWO-LAYER VERIFICATION IMPLEMENTED: YES
- STATIC NON-TARGET BYTE GATE PRESERVED: YES
- EXACT TARGET EDGE BYTE GATE IMPLEMENTED: YES
- SEMANTIC-ONLY FALLBACK INTRODUCED: NO
- SHARED TRANSFORMATION SOURCE ESTABLISHED: YES
- VERSION 69 COMPATIBILITY SHA REPRODUCED: YES
- PUBLICATION STATE MODEL IMPLEMENTED: YES
- PUBLICATION STATE SOURCE EXPLICIT: YES
- VERSION-UPLOAD-ONLY LOCALE EXCLUDED FROM PUBLISHED STATE: YES
- FAILED LOCALE EXCLUDED: YES
- ROLLED-BACK LOCALE EXCLUDED: YES
- UNPUBLISHED PROMOTION URL IN SELECTOR: NO
- UNPUBLISHED PROMOTION URL IN HREFLANG: NO
- JA EMPTY PREFIX PRESERVED: YES
- `/ja/` MIGRATION INTRODUCED: NO
- NORMAL PROMOTION GUARD PRESERVED: YES
- FOUNDATION BOUNDARY PRESERVED: YES
- EXISTING 122 TESTS REMOVED: 0
- ALL TESTS PASS: YES
- EXISTING SIX CANDIDATES MODIFIED: NO
- VERSION 69 REUPLOADED: NO
- NEW VERSION UPLOADED: NO
- PRODUCTION SWITCH: NO
- TRAFFIC CHANGE: NO
- BASELINE CHANGE: NO
- FULL BUILD: NO
- PREPARE-RELEASE: NO
- COMMIT EXECUTED: NO
- PUSH EXECUTED: NO
- READY TO COMMIT 5-E.3: YES
- READY FOR PRODUCTION SWITCH: NO
