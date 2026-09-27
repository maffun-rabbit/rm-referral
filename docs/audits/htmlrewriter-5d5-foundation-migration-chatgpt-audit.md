# HTMLRewriter 工程5-D.5 Foundation Migration 監査

## A. 結論

**PARTIAL — zh ROLLED BACK / GLOBAL EXECUTION STOPPED**

最初のlocaleであるzhはVersion URL 6,854/6,854 PASS後にProductionへ切り替えたが、Production全件検証で`/_includes/zh/header.html`と`footer.html`が404となった。6,852/6,854のため直前Versionへrollbackし、共通architecture問題としてen以降を開始しなかった。

## B. 開始時Git

- branch: `main`
- HEAD / origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: 0
- tracked deletion: 0
- 5-B〜5-D.4bの既知差分を維持
- commit / merge / push / stash: 0

## C. 開始時6 locale Production

| Locale | Deployment | Version | Traffic |
|---|---|---|---:|
| ja | `1e0187ef-d4c4-4b08-beca-f02d576f0b5e` | `a47da27c-ebcb-474e-b357-9ec31602a35a` | 100% |
| zh | `66c650f7-e7ca-418a-bbfc-80588dee79a8` | `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d` | 100% |
| en | `a15d9156-fc04-4418-b89b-fcc7e4676725` | `a4b09119-41b7-467e-bb0f-708ac2d0011d` | 100% |
| ko | `19ea4419-a08a-4a74-8276-0463380ab57e` | `34af8581-59bc-4a51-baa1-347f8c4b62d8` | 100% |
| pt | `75df1dd9-05fa-4fdf-9a29-7d717ae18fa5` | `0b6968b1-e5ef-4324-9e8c-481177932f94` | 100% |
| vi | `e6135318-9997-4d4b-9eee-227484918d69` | `a6752de5-fa9f-4821-b2ad-581683328b44` | 100% |

## D. 開始時Baseline

全6 localeは工程5-D.4bまでのartifact / receipt / attestationと上表のcurrent Production bindingが一致し、ESTABLISHEDだった。

## E. Foundation architecture

- verified baseline artifactからのみclean candidateを構築
- foundation専用exact allowlistとnormal Promotion guardを分離
- normal Promotion guardはTopic HTML 1＋sitemap 0/1を上限とする
- `prepare-release.mjs`、full buildへのfallbackなし
- Workerはtransport上のTopic namespaceを受けても、`APPROVED_PROMOTION_PATHNAME`とのexact matchだけをHTMLRewriter対象にする
- Foundation時のactive unpublished Promotion routeは0

## F. Topics index

外国語5 locale用にlocale別title / description / canonical / lang / h1 / breadcrumb / navigation / header / footerを持つone-time index生成を実装。未公開Promotionリンクは0。実Productionへ到達したのはzhの一時切替だけで、rollback済み。

## G. shared include

verified baseline内のlocale固有header/footerからexact bytesを抽出し、`/_includes/<locale>/header.html`と`footer.html`を作る設計を実装。zh Production custom routeが`/zh/*`のみのため、root-level `/_includes/zh/*`は公開URLで404となることが判明した。

## H. Worker exact route

exact pathname enforcementを実装。query、slash variant、prefix/suffix collision、double slash等は許可しない。日本語P0 exact routeを維持。

## I. Manifest binding

`Promotion Manifest → Release Plan → APPROVED_PROMOTION_PATHNAME`を一意にするguardを追加。Foundation planではapproved pathnameを禁止。

## J. hreflang

未公開Promotion URL追加0。5-CのProduction公開済みlocaleだけを対象にする方針を維持。

## K. sitemap

zh candidateでは`/zh/topics/`を1件だけ追加。全sitemap再生成なし。rollbackによりProductionは旧bytesへ復帰。

## L. preview_urls

repository configは全localeで`workers_dev=false`、`preview_urls=true`へ統一する変更を未commitで保持。Production workers.dev公開は行っていない。

## M. Wrangler guard migration

全6 configをplan/hash必須の`production-release-guard.mjs`へ変更する実装とテストを完了したが、Production migrationはzh rollbackにより未完了。旧`prepare-release.mjs`を通常hookから除外するコード差分は未commit。

## N. Locale別candidate diff

| Locale | added | changed | deleted | unchanged | unexpected |
|---|---:|---:|---:|---:|---:|
| zh | 3 | 1 | 0 | 6,850 | 0 |
| en | NOT STARTED | | | | |
| ko | NOT STARTED | | | | |
| pt | NOT STARTED | | | | |
| vi | NOT STARTED | | | | |
| ja | NOT STARTED | | | | |

zh added: Topics index、header include、footer include。changed: sitemap。shop / guide / other Topic / CSS / JS / image / font / robots変更0。

## O. Locale別Version Upload

- zh: 1。Version `bf67787a-b283-4405-a7ad-9e865fa667c9`
- en / ko / pt / vi / ja: 0

## P. Locale別Version URL検証

- zh: 6,854/6,854 PASS、mismatch / unresolved / failed / redirect 0
- remaining locales: NOT STARTED

## Q. Locale別Production switch

- zh: foundation Versionへ1回切替、その後旧Versionへrollback
- remaining locales: 0

## R. Locale別Production verification

- zh: expected 6,854; attempted 6,854; matched 6,852; mismatched 2; unresolved 0; failed 0; redirects 0
- mismatch: `/_includes/zh/header.html`、`/_includes/zh/footer.html`（404）
- remaining locales: NOT STARTED

## S. Locale別rollback

- zh: executed。rollback deployment `d72186de-e03c-4d5d-9b16-73aa3457cbd5`、Version `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`、traffic 100%
- rollback後sentinel: 8/8 PASS
- others: 0

## T. 新Production Baseline

新baseline確立0。zh foundation artifact/receiptは検証資産として残るが、Production baselineへ昇格しない。

## U. Promotion通常変更上限

guard/test上はTopic HTML 1＋sitemap 0/1。shared include、Topics index、shop、guide、他Topic、CSS/JS/image/font/robotsは通常Promotionで拒否する。

## V. 約60,000ページ境界

Astro全体生成0。baseline展開と全inventory/hash検証を行ったが、既存ページ再生成0。

## W. Tests

- Promotion 17/17
- Shared 15/15
- Deploy boundary 14/14
- Bootstrap / Recovery 27/27
- Gate helpers 13/13
- Foundation 7/7
- total 93/93 PASS
- JavaScript syntax PASS
- `git diff --check` PASS
- tracked deletion 0

## X–Z. Build counts

- Astro full build: 0
- `maintenance:full-build`: 0
- `prepare-release.mjs`: 0
- single-page Production content build: 0

## AA. Cloudflare write一覧

- zh Version Upload: 1
- zh Production switch: 1
- zh rollback: 1
- en / ko / pt / vi / ja write: 0
- Promotion公開: 0

## AB. Git状態

commit / merge / push 0。既知差分にFoundation scripts/tests/config/Worker/Layout、zh plan/evidence、本監査を未commitで追加。tracked deletion 0。

## AC. 残存リスク

root-level shared includesとlocale custom routeの境界が未解決。最小修正候補はinclude assetを各locale route内（例`/<locale>/_includes/`）へ配置し、BaseLayout/Worker/allowlistを同じmappingへ変更すること。ただしこれはarchitecture修正と再uploadを要するため本工程内では実施しなかった。JavaScript-disabled実ブラウザー確認はBLOCKED BY ENVIRONMENT（SSR静的確認のみ）。

## AD. 次工程判定

同じ5-D.5を続行せず、まず **5-D.5a Shared Include Route Boundary Correction** として、locale route内include mappingをfixture・Version URL・Production routeで検証する最小工程が必要。

## Locale結果表

| Locale | Preflight | Candidate | Version URL | Production | Baseline | Result |
|---|---|---|---|---|---|---|
| zh | PASS | PASS | PASS | FAIL → rollback | unchanged | ROLLED BACK |
| en | PASS | NOT STARTED | NOT STARTED | unchanged | unchanged | NOT STARTED |
| ko | PASS | NOT STARTED | NOT STARTED | unchanged | unchanged | NOT STARTED |
| pt | PASS | NOT STARTED | NOT STARTED | unchanged | unchanged | NOT STARTED |
| vi | PASS | NOT STARTED | NOT STARTED | unchanged | unchanged | NOT STARTED |
| ja | PASS | NOT STARTED | NOT STARTED | unchanged | unchanged | NOT STARTED |

## 最終回答

- ALL 6 LOCALE FOUNDATION MIGRATIONS COMPLETE: **NO**
- NORMAL PROMOTION SINGLE-TOPIC RELEASE READY: **NO**
- READY FOR 5-E: **NO**
