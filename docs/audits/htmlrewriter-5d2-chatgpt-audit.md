# HTMLRewriter 工程5-D.2 ChatGPT監査レポート

## A. 結論

**PASS**。Initial Production Baseline Migrationを実行せず、証明の空白を一度だけ安全に越える方式を比較・決定した。推奨は **Option E: Exhaustive candidate-path HTTP verification + human-approved one-time serial normalization**。Production write、artifact作成、full buildは0。

## B. Current problem

他5 localeにはcomplete candidate treeとreceiptがあるが、current Production versionと完全treeを直接結ぶimmutable artifact/attestation/upload manifestがない。したがって通常bootstrap guardが要求するtrusted bound sourceを満たせず、5-DはBLOCKED。

## C. Known evidence

- `.deploy/<locale>`: 各6,851 regular files
- `.deploy/release.json`との全件hash mismatch: 各0
- file total bytes: en 114,968,725 / ko 119,895,826 / pt 115,009,409 / vi 123,838,626 / zh 111,635,363
- Production sentinel: 各8/8、合計40/40 byte/SHA-256一致
- current deployment/version: read-only取得済み
- traffic: 全locale 100% single version
- receipt createdAt: 2026-09-21T08:00:39.792Z
- candidate category: root 1、guide 21、topics 0、CSS 1、JS 6、images 4、robots 1、sitemap 1、other HTML 6,816

## D. Missing evidence

- current versionとartifact SHA-256を結ぶattestation
- foreign immutable Production artifact
- historical upload manifest/hash inventory
- current versionの全Static Assets manifest/digest export
- Cloudflare側だけに存在するunknown assetの列挙

## E. Cloudflare capability

公式資料上、Worker Versionはstatic assetsを含む完全状態で、versions/deployments metadataとVersion URLはread-only確認できる。Direct Uploadにはupload manifestがあるが、これはwrite flowの入力であり、既存version manifestのexportではない。既存versionから全asset manifest、digest一覧、contentsをread-only download/exportする公開API/Wrangler commandは確認できなかった。

- [Versions & deployments](https://developers.cloudflare.com/workers/versions-and-deployments/)
- [Wrangler versions](https://developers.cloudflare.com/workers/wrangler/commands/workers/#versions)
- [Static Assets Direct Upload](https://developers.cloudflare.com/workers/static-assets/direct-upload/)
- [Workers API](https://developers.cloudflare.com/api/resources/workers/)

upload sessionをread-only照合として使用しない。

## F. Option A評価

Existing `.deploy` treeをdeterministic artifact化してone-time normalization。full build不要でrollback容易だが、現行40件sentinelだけでは証拠が弱い。**単独不採用**。

## G. Option B評価

category/地域分散の決定論的samplingでconfidenceを高める。人間レビューには有効だが、未sample assetを証明しない。**補助策として採用**。

## H. Option C評価

Historical evidence reconstruction。5-D.1でGit/stash/worktree/log/backupを限定調査したが、foreign artifact/attestation/upload hashは発見できなかった。**実施済みの補助証拠として維持**。

## I. Option D評価

Fresh full build replacement。約60,000ページ再生成、巨大diff、content/SEO regression risk、build/deploy boundary後退を招く。**REJECTED**。

## J. Option E評価

Candidate inventory全6,851 pathをcurrent Productionからread-only取得してbyte/hash比較し、human-approved one-time guardでlocale直列normalizationする。未知Production-only assetは列挙できないが、既知candidate全pathの一致を証明できる。full build 0、content変更0、locale独立。**採用**。

## K. Comparison matrix

| Option | 証拠強度 | full build | Production差分risk | rollback | 結論 |
|---|---|---:|---|---|---|
| A | 高 | 0 | 低 | 容易 | 単独不採用 |
| B | 高＋ | 0 | 低 | 容易 | 補助採用 |
| C | artifact発見時のみ完全 | 0 | 0 | N/A | 証拠未発見 |
| D | 新versionのみ完全 | 必要 | 高 | 影響大 | Reject |
| E | 既知path全件で最高 | 0 | 低 | 容易 | Recommended |

詳細15基準の比較はarchitecture documentを正本とする。

## L. Recommended strategy

**Option E — Exhaustive candidate-path HTTP verification + human-approved one-time serial normalization**。

## M. 推奨理由

候補を再生成せず、既知6,851 path全件をProductionと比較でき、content/foundation変更を混ぜず、1 localeずつVersion URL・Production・rollbackを検証できる。成功直後からstrict attested baselineへ移行できる。

## N. Residual uncertainty

Production側だけに存在しcandidateにないassetは完全列挙できない。全candidate path一致はhigh-confidence evidenceでありCloudflare version manifestとのcryptographic identity proofではない。この不確実性は人間がinitial migration時に一度だけ承認し、migration後へ持ち越さない。

## O. Human approval model

locale別review recordで、完全export不能、candidate/receipt全件一致、6,851/6,851 HTTP verification、unknown-only asset uncertainty、artifact/plan/evidence/before-version identityを明示承認する。自動guardだけでAPPROVEDへ昇格できない。

## P. One-time guard design

専用operation `foreign-initial-baseline-normalization`を通常bootstrapと分離する。正式attestation既存時、plan再利用、wrong locale/Worker/config、drift、mixed traffic、hash mismatch、cross-locale、verification不足、approval不足を拒否する。成功attestationをone-time markerとして再実行不能にする。

## Q. Normal guardとの分離

通常bootstrapは`trusted bound source only`を維持し、UNBOUNDを許可しない。Initial migration専用guardだけが、人間承認済みhigh-confidence unbound sourceを一度限り正規化できる。通常Promotion、Wrangler normal deploy、5-D.1 guardから呼ばない。

## R. Artifact / receipt design

path順、mtime、uid/gid、mode、archive formatを固定したdeterministic artifactを作り、別treeへextractして全件再照合する。Receiptは全path/size/hash、inventory/artifact/canonical/file hashes、Production metadata、verification/evidence hashes、known uncertaintyを保持する。本工程では作成していない。

## S. Sampling design

Executionでは6,851 candidate path全件を比較する。人間レビューsummaryは全fixed categories、全non-shop、47都道府県最低1 shop＋SHA-256順512 shop、全uncommon assetsを決定論的に表示する。summary samplingをcomplete proofとは扱わない。

## T. Version URL verification design

Upload後・Production切替前にcandidate全pathをVersion URLとbyte/hash比較し、root/guide/shop/static/robots/sitemap/404 semanticsも検査する。1件でも不一致なら切替禁止。Version IDを作り直して続行しない。

## U. Production verification design

切替直前drift check後、検証済みversionだけへ100%切替。同じ全件reportをProductionで再実行し、expected deployment/version/trafficを確認する。成功後だけattestationを生成する。

## V. Rollback design

localeごとに開始直前deployment/version/trafficを固定。重大問題時は当該localeだけversion rollbackし、full buildを使わない。他locale自動rollbackは禁止。

## W. Locale independence

1 localeずつartifact→verification→upload→Version URL→Production→attestationまで完結し、そこで停止・レビューする。blind 5-locale deployは禁止。

## X. Pilot locale assessment

**zhをPILOT CANDIDATE**とする。全localeは6,851 files、receipt mismatch 0、sentinel 8/8、traffic 100%で同等だが、zhは111,635,363 bytesで候補treeが最小。これはExecution承認ではなく、客観的な転送・照合量に基づく順序候補。

## Y. Topics foundationとの分離

Initial Baseline MigrationではTopics index、includes、Wrangler normal guard、Worker route、Promotion、SEO/CTA/CSS/JS/sitemap/hreflang変更を全て0とする。baseline ESTABLISHED後に別planでfoundation migrationを行う。

## Z. Tests

- Promotion: 15/15 PASS
- Shared: 15/15 PASS
- Deploy boundary: 14/14 PASS
- Bootstrap/Recovery: 26/26 PASS
- total: 70/70 PASS
- `git diff --check`: PASS
- 5-D.2は設計のみでコード変更なし。Initial Migration guard testsはExecution準備工程で実装する。

## AA. Astro full build

0回。

## AB. maintenance full build

0回。`prepare-release.mjs`によるrelease生成も0回。

## AC. Production write

0回。artifact作成、Version Upload、Production切替、rollback、baseline establishmentも0。

## AD. Cloudflare side effects

0。5-D.2ではCloudflare API/CLIを呼ばず、公式documentationのread-only調査だけを行った。

## AE. Git状態

branch `main`、HEAD/origin `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`。staged 0、tracked deletion 0、commit/merge/push 0。既知5-B〜5-D.1差分を維持。

## AF. 変更ファイル

5-D.2追加は以下2件のみ。

- `docs/audits/htmlrewriter-5d2-initial-baseline-migration-design.md`
- `docs/audits/htmlrewriter-5d2-chatgpt-audit.md`

Production Worker、Wrangler、Topics、baseline candidate、既存treeは未変更。

## AG. 残存リスク

- Cloudflare側unknown-only assetsを列挙できない。
- 6,851×5 pathの全件HTTP検証は時間・rate limit・一時network error管理が必要。
- Initial migration専用guard/schema/testsはExecution準備時に実装が必要。
- Human approvalなしではProduction writeへ進めない。

## AH. Execution readiness

**Initial Migration Execution指示書を作成可能: YES**。

ただしProduction実行自体は未承認。最初のExecutionはzh 1 localeだけに限定し、artifact作成前とCloudflare write前を別approval gateにする。

---

**工程5-D.2 Initial Production Baseline Migration Design: PASS**

**Recommended Migration Strategy: Option E — Exhaustive candidate-path HTTP verification + human-approved one-time serial normalization**

**Initial Migration Execution指示書を作成可能: YES**
