# HTMLRewriter 工程5-E.1 New Topic Promotion Guard Correction 監査

## A. Conclusion

**PASS — NEW TOPIC PROMOTION GUARD CORRECTED**

**REAL SIX-LOCALE VALIDATION CANDIDATES ACCEPTED**

**NORMAL PROMOTION BOUNDARY PRESERVED**

Cloudflare / Production side effects: 0。commit / pushは未実施。

## B. Git identity

- branch: `main`
- HEAD / origin/main / merge-base: `7011f91bfdc9b01aabc8a761124f7af98e934790`
- ahead / behind: `0 / 0`
- 開始時 staged: 0
- tracked deletion: 0

## C. Root cause

旧guardは`plan.changed.filter(p => p.endsWith('/index.html')).length === 1`を要求していた。新規Topicのtruthful diffはTopic=`added`、sitemap=`changed`なので、正常candidateを拒否した。

## D. Truthful new Topic diff

- added: canonical target Topic asset exactly 1
- changed: canonical locale sitemap exactly 0/1
- deleted: 0
- unexpected: 0

## E. Old guard behavior

ZH実candidateを変更前guardへ渡すと、`PRODUCTION RELEASE GUARD: Promotion diff exceeds Topic 1 + sitemap 0/1`でREJECTした。

## F. New invariant

- canonical `topicMapping(locale, plan.slug)`からpathname / assetPath / sitemapAssetPathを導出
- target Topicが`added`または`changed`のどちらか一方にexactly 1件
- sitemapはcanonical locale sitemapが`changed`に0/1件のみ
- added/changed間のduplicate、unexpected、deleted、総変更3件以上を拒否
- allowlistはtarget Topicと、変更時のみcanonical sitemapのexact set

## G. Code changes

- `scripts/production-release-guard.mjs`: suffix判定を廃止し、canonical exact mappingとtruthful added/changed unionを検証
- `tests/foundation-migration.test.mjs`: ALLOW 6 / REJECT 22のguard matrixを追加
- Worker / Wrangler / schema / Foundation implementation変更: 0

## H. Exact pathname validation

target pathname、asset path、sitemap pathは`topicMapping`とのexact equalityを要求。prefix、suffix、missing index、wrong locale、encoded collisionを拒否。

## I. JA mapping

JAはpublic prefix空文字、Topic=`/topics/<slug>/`、asset=`/topics/<slug>/index.html`、sitemap=`/sitemap.xml`を維持。`/ja/`は拒否。

## J. Sitemap rule

JA `/sitemap.xml`、foreign `/<locale>/sitemap.xml`のみ。added/deleted/wrong locale/multiple sitemapを拒否。

## K. Added tests

ALLOW:

1. new Topic added only
2. new Topic added + sitemap changed
3. existing Topic changed only
4. existing Topic changed + sitemap changed
5. JA new Topic + canonical sitemap
6. foreign new Topic + locale sitemap

REJECT 22 cases: duplicate target、two/other Topics、Topics index、include、shop、guide、CSS、JavaScript、image、font、robots、root、deletion、wrong/two sitemaps、prefix/suffix、missing index、wrong locale、`/ja/`、encoded collision。

## L. Regression tests

- Promotion: 17/17
- Shared: 15/15
- Deploy boundary: 14/14
- Bootstrap / Recovery: 27/27
- Foundation / canonical mapping + new guard matrix: 36/36
- Gate helpers: 13/13
- Total: **122/122 PASS**
- existing 93 tests removed: 0

## M. Real six-locale candidate regression

工程5-Eで生成済みcandidateを変更せず検証した。

| Locale | Added | Changed | Deleted | Unexpected | Guard |
|---|---|---|---:|---:|---|
| ja | `/topics/promotion-release-validation/index.html` | `/sitemap.xml` | 0 | 0 | PASS |
| en | `/en/topics/promotion-release-validation/index.html` | `/en/sitemap.xml` | 0 | 0 | PASS |
| ko | `/ko/topics/promotion-release-validation/index.html` | `/ko/sitemap.xml` | 0 | 0 | PASS |
| pt | `/pt/topics/promotion-release-validation/index.html` | `/pt/sitemap.xml` | 0 | 0 | PASS |
| vi | `/vi/topics/promotion-release-validation/index.html` | `/vi/sitemap.xml` | 0 | 0 | PASS |
| zh | `/zh/topics/promotion-release-validation/index.html` | `/zh/sitemap.xml` | 0 | 0 | PASS |

## N. Foundation boundary regression

Topics index、shared include、shop、guide、other Topic、root、CSS/JS/image/font/robots、deletionはnormal Promotionで引き続き拒否。Foundation専用logicは未変更。

## O. Worker boundary regression

`worker/index.mjs`は未変更。既存exact `APPROVED_PROMOTION_PATHNAME` testsを含む全suite PASS。

## P. Schema compatibility

Manifest / Release Plan / receipt / attestation schema変更不要。schema変更0、JSON parse PASS。

## Q. Security and contamination

- secrets / token / password / private key: 0
- Production codeのabsolute local dependency: 0
- baseline artifact / `.deploy` / `node_modules` / archive / binary / generated mass HTML: 0
- transient evidence JSONをcommit候補へ含めない

## R. Commit candidate inventory

対象は次の3ファイルのみ。

- `scripts/production-release-guard.mjs` — required Production guard correction
- `tests/foundation-migration.test.mjs` — direct regression matrix
- `docs/audits/htmlrewriter-5e1-new-topic-guard-correction-chatgpt-audit.md` — durable audit

bytes / SHA-256はHuman Gate提示時のfilesystem inventoryを正とする。

## S. Do-not-commit inventory

- 既存38 JSON evidence / plan: local untrackedのまま
- 5-E Validation source 6件、Manifest、5-E Resume audit: 本commit対象外
- `/tmp` candidate / plans / generated HTML: repository外、commit対象外
- UNKNOWN: 0

## T. Side effects

- Cloudflare Version Upload / deployment / traffic / rollback / settings / route write: 0
- Production Baseline change: 0
- Validation Promotion publication: 0
- full build / `maintenance:full-build` / `prepare-release.mjs`: 0

## U. Human Gate status

**READY TO COMMIT 5-E.1 — WAITING FOR HUMAN APPROVAL**
