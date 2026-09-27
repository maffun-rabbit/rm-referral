# HTMLRewriter 工程5-D.5a Shared Include Route Boundary Correction 監査

## A. 結論

**PASS — SHARED INCLUDE ROUTE BOUNDARY CORRECTED / ZH FOUNDATION BASELINE ESTABLISHED**

Architecture normalization、6-locale fixture、zh clean candidate、Version 68 upload、Version URL 6,854/6,854検証、Production route pre-switch Gate、人間承認後のProduction switch、Production 6,854/6,854検証、新Baseline bindingをすべてPASSした。

## B. 開始時Git

- branch: `main`
- HEAD / origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: 0
- tracked deletion: 0
- 5-B〜5-D.5の既知差分を維持
- `git diff --check`: PASS
- commit / merge / push / stash / revert: 0

## C. Root cause

旧foreign include mapping `/_includes/<locale>/*`が、zh Production custom route `mnp-navi.jp/zh/*`の外側だった。Version URLはWorker固有hostのasset namespaceを検証できたが、custom domain Production routeでは2 includeだけが404となった。

## D. Architecture Decision

公開URLはJA prefixなし、foreign locale prefixありを維持する。JAを`/ja/`へ移行せず、JA例外はcanonical mapping moduleに隔離した。foreign includeは必ず`/<locale>/_includes/*`に置く。

## E. Canonical Locale Mapping

正本: `scripts/locale-mapping.mjs`

- `getPublicPrefix(locale)`
- `getTopicPath(locale, slug)`
- `getTopicsIndexPath(locale)`
- `getIncludePath(locale, type)`
- `getSitemapPath(locale)`
- route boundary / edge include helpers

Mapping: `ja=""`, `en=/en`, `ko=/ko`, `pt=/pt`, `vi=/vi`, `zh=/zh`。

## F. JA compatibility mapping

- Topic: `/topics/<slug>/`
- Topics index: `/topics/`
- Includes: `/_includes/ja/header.html`, `/_includes/ja/footer.html`
- Sitemap: `/sitemap.xml`
- `/ja/` migration: 0
- JA Production write: 0

## G. Foreign include mapping

- zh header: `/zh/_includes/header.html`
- zh footer: `/zh/_includes/footer.html`
- old `/_includes/zh/*`生成: 0

## H. hard-coded locale exception scan

対象mapping/Worker/Layout/candidate/release modulesをscanし、JA public-prefix例外はcanonical mapping module内へ隔離した。テストfixtureの期待値表現を除き、旧foreign root-level include mappingは残存しない。

## I. Worker mapping

Workerはcanonical `getIncludePath`によるheader/footer exact matchだけを処理する。Promotion route authorizationは`APPROVED_PROMOTION_PATHNAME` exact matchを維持し、prefix/suffix/slash/query collisionを許可しない。

## J. BaseLayout mapping

`BaseLayout.astro`はcanonical `getIncludePath`を使用する。foreign Topic fallback markerはlocale route内includeを参照し、JA P0 mappingを維持する。

## K. Manifest / Release Plan binding

Promotion `topicMapping`はcanonical topic/sitemap mappingへ接続。Foundation plan canonical hash: `ab3e417e8b2d4f0f6c627681b44e15599159a6efd2138be9024b63a4f960a0eb`。Plan file SHA-256: `27f5934242ca7a67ca7dc7b387358d95b026eeec03f26bf73104466c8f052735`。

## L. Foundation allowlist

zh exact allowlist:

- `/zh/topics/index.html`
- `/zh/_includes/header.html`
- `/zh/_includes/footer.html`
- `/zh/sitemap.xml`

Directory wildcardなし。

## M. Normal Promotion allowlist

Topic HTML 1件＋sitemap 0/1を上限とする既存guardを維持。shared include、Topics index、shop、guide、other Topic、shared assetは通常Promotionで拒否する。

## N. Topics index

`/zh/topics/index.html`をone-time foundation assetとして生成。未公開Promotion link 0。title / description / canonical / robots / lang / h1 / breadcrumb / navigation / header / footerを保持。

## O. sitemap

`/zh/topics/`をzh sitemapへ1件追加。Promotion URL追加0。全sitemap再生成0。

## P. hreflang

未公開Promotion URL追加0。Production公開済みlocaleだけを使用する5-C方針を変更していない。

## Q. Wrangler route boundary

zh custom routeは`mnp-navi.jp/zh/*`。新include 2件はいずれも`/zh/` namespace内。`workers_dev=false`、`preview_urls=true`を維持。

## R. Version URL / Production route distinction

Version URL PASSだけをProduction到達性の証明に使用せず、candidate pathとWrangler custom route patternを独立照合した。`/zh/_includes/*`はProduction route内、旧`/_includes/zh/*`はroute外。

## S. zh candidate diff

- baseline: verified Initial Migration artifact
- files: 6,854
- bytes: 111,638,512
- inventory: `1b7a7b3fa1b5f0557006d461221002cccb3f2655ac26bcdcb0e151f8cffb6a10`
- added: 3（Topics index、header include、footer include）
- changed: 1（sitemap）
- deleted: 0
- unexpected: 0
- unchanged: 6,850
- shop / guide / other Topic / CSS / JS / image / font / robots changed: 0

## T. zh Version Upload

- Version ID: `c30186cb-6ba9-4242-9a3e-1319ab5e8c75`
- Version number: 68
- createdAt: `2026-09-26T08:22:48.025626Z`
- Version Preview URL: `https://c30186cb-rm-referral-zh.maffun.workers.dev`
- Version Upload: 1
- Production traffic change: 0
- Wrangler: 4.131.1

## U. zh Version URL verification

- evidence: `docs/audits/htmlrewriter-5d5a-zh-version-url-evidence.json`
- evidence SHA-256: `ec2056eb4efa5f9313a654e35062adb1c81212943fe501b436fe54b4bbd80cc7`
- expected / attempted / matched: 6,854 / 6,854 / 6,854
- mismatched / unresolved / failed / unexpected redirects: 0 / 0 / 0 / 0
- `/zh/_includes/header.html`: 200, byte/hash MATCH
- `/zh/_includes/footer.html`: 200, byte/hash MATCH

## V. Production route pre-switch Gate

**PASS**。両includeは`/zh/*` namespace内。current Productionはrollback deployment `d72186de-e03c-4d5d-9b16-73aa3457cbd5`、Version `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`、traffic 100%を維持。

## W. Production switch

- human approval: received
- previous deployment: `d72186de-e03c-4d5d-9b16-73aa3457cbd5`
- previous Version: `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`（66）
- new deployment: `4d7b6255-63de-49bf-93cb-b54f2506ee1d`
- new Version: `c30186cb-6ba9-4242-9a3e-1319ab5e8c75`（68）
- traffic: 100%
- mixed traffic: NO
- deployedAt: `2026-09-26T09:14:30.109641Z`

## X. Production verification

- immediate sentinel: 10/10 PASS
- evidence: `docs/audits/htmlrewriter-5d5a-zh-production-evidence.json`
- evidence SHA-256: `6c2884d98c347e34815962e16d4d0b4a5d7b1b44c36eca0e2e13e33bc3d67e36`
- expected / attempted / matched: 6,854 / 6,854 / 6,854
- mismatched / unresolved / failed / unexpected redirects: 0 / 0 / 0 / 0
- candidate drift: NO
- Production drift: NO
- `/zh/_includes/header.html`, `/zh/_includes/footer.html`, `/zh/topics/`, `/zh/sitemap.xml`: HTTP 200 and byte/SHA-256 MATCH

## Y. rollback

NOT REQUIRED。旧Version `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`をrollback targetとして記録。

## Z. New Production Baseline

**ESTABLISHED**

- storage: `../release-artifacts/production-baselines/zh/foundation-20260926-v2/`
- artifact SHA-256: `02c2bec73ac03da6fea58f272874990c3399ec63caa650f94a3e5e17f16b4d70`
- artifact size: 116,893,696 bytes
- canonical receipt SHA-256: `8a9c8c187d3dd663beb00280503675688e51c1ccd542d489780f5569c400c124`
- receipt file SHA-256: `faba5d0ad7845d4d1cb402465a3c3d5b9ce67b7b252eb52c1340ce40aa8e44f9`
- attestation SHA-256: `fbf752a64572da656a613e17c7bb094b1f60bcf2f7c75011bdc6abd9d22cf2b2`
- round-trip: 6,854 files / 111,638,512 bytes / inventory MATCH
- Production deployment/version/trafficとartifact/receipt/evidenceをattestationへbinding済み

## AA. Tests

- Promotion: 17/17 PASS
- Shared: 15/15 PASS
- Deploy boundary: 14/14 PASS
- Bootstrap / Recovery: 27/27 PASS
- Gate helpers: 13/13 PASS
- Foundation / canonical mapping: 7/7 PASS
- total: 93/93 PASS
- JavaScript syntax: PASS
- `git diff --check`: PASS
- tracked deletion: 0

## AB–AD. Build counts

- Astro full build: 0
- `maintenance:full-build`: 0
- `prepare-release.mjs`: 0
- 約60,000ページ再生成: 0

## AE. Cloudflare writes

- zh Version Upload: 1
- zh Production switch: 1
- rollback: 0
- other write: 0

## AF. Other locale side effects

- ja / en / ko / pt / vi Cloudflare write: 0
- Promotion公開: 0

## AG. Git state

commit / merge / push / stash / stage 0。既知差分にcanonical mapping、関連tests、zh plan/evidence、本監査を未commitで追加。tracked deletion 0。

## AH. Remaining risks

- Cloudflare-only unknown asset非存在は証明していない。
- JavaScript-disabled実ブラウザー確認は未実施。
- en / ko / pt / viのFoundation Migrationは5-D.5bでlocale-serialに実施する必要がある。

## AI. 5-D.5b readiness

**YES**

## 最終判定（承認待ち時点）

- CANONICAL 6-LOCALE MAPPING ESTABLISHED: **YES**
- JA PUBLIC URL MIGRATION REQUIRED: **NO**
- SHARED INCLUDE ROUTE BOUNDARY CORRECTED: **YES**
- ZH FOUNDATION MIGRATION COMPLETE: **YES**
- READY FOR 5-D.5b: **YES**
