# HTMLRewriter 工程4-B.3 ChatGPT監査レポート

## A. 結論

**PASS — READY FOR BOOTSTRAP APPROVAL**。本番bootstrapは未実行。独立承認後に初めてversion uploadへ進める。

## B. bootstrap source tree

`制作ワークスペース/RMリファラル/cloudflare-site/.deploy/ja` のうち、既存 `.deploy/release.json` と全件hash一致した日本語release treeを採用した。HTMLRewriter移行中の作業tree側 `.deploy/ja` は採用していない。

## C. なぜそのsourceを信頼できるか

- source repo: main `b222f70b5c9f63905d2865c7dc6e720dc2482388`
- source release receipt SHA-256: `417d351d1abffae8586e3ac663788993686e93d487a57110495b6a24950a8600`
- `verify:release`で入力・成果物整合を確認済み。
- 7,977ファイルすべてをrelease receiptと照合。
- 本番sentinel 12件はbyte/hashまで一致。

これは現在本番全assetの逆取得による完全一致証明ではない。Cloudflareが完全Static Assets artifactをread-only exportする公式手段を提供していない限界は残る。

## D. bootstrap tree file count

**7,977**。

## E. category inventory

| category | count |
|---|---:|
| root | 1 |
| guide | 18 |
| topics | 4 |
| CSS | 1 |
| JS | 6 |
| images | 4 |
| fonts | 0 |
| redirects | 0 |
| headers | 0 |
| robots | 1 |
| sitemap | 1 |
| その他HTML | 7,941 |
| その他 | 0 |

## F. 17 guideの扱い

対象記事を含む18 guideはすべて現在本番相当の旧HTML。対象外17 guideをwrapper版へ移行しない。bootstrapはHTMLRewriter展開ではなく、現行配信の完全tree正規化である。

## G. include 2件の扱い

bootstrapには含めない。現行source、本番sentinelともincludeなしで一致するため。`/_includes/ja/header.html` と `/_includes/ja/footer.html` は4-B.4の **NEW REQUIRED SHARED ASSET** とし、target HTML 1件とは別change/hashで承認する。

## H. production sentinel比較

`/`、`/guide/`、対象guide、`monthly-cost`、`rakuten-link`、`replacement-program`、topics 1件、CSS、JS、PNG、robots、sitemapの12件が全てHTTP 200、content-type妥当、候補とbyte/hash一致。HTMLはtitle/canonicalも一致。証拠は `docs/audits/htmlrewriter-4b3-sentinels.json`。

## I. 完全一致を証明できない範囲

sentinel外7,965 pathと、Cloudflare内部manifest/metadataの完全一致は証明できない。bootstrap自体がこの不確定状態を一度だけレビュー済みartifactへ正規化するmigrationとなる。

## J. release artifact形式

決定的USTAR。path昇順、mtime/uid/gid固定、mode固定。SHA-256 `13052eabaefc3331ae02430c145ffe571ee1eccfd6d83d3b0dce51fdbdf5a362`、128,158,720 bytes。別空directoryへの展開後7,977件を再inventoryし、不一致0。二度生成したarchive hashも一致。

## K. artifact保存先

`制作ワークスペース/RMリファラル/release-artifacts/production-baselines/ja/bootstrap-20260923/`。artifact、1.3MB receipt、READMEを保存し再hash済み。Google Drive上で削除されるまで保持され、CI期限には依存しない。誤削除・アカウント/容量リスクに備え、bootstrap後に同一hashの第二保管先を設けることを推奨する。

## L. receipt schema

schema 2。locale、worker、config、createdAt、source receipt path/hash、artifact format/reference/hash/size、fileCount、category counts、全path/size/SHA-256、canonical receipt SHA-256を持つ。deployment/versionは持たない。canonical receipt hashは `96c30ed23c97a5baac6571218c59e6f1a3edbae0b21e3199b60d0209a7980c74`、receipt file hashは `d9e987aed93ed52d2ea0b049b64194f998370baaf2c93dc450a6f67cc9ff6714`。

## M. attestation schema

schema 1。artifact SHA-256、receipt canonical/file SHA-256、Worker、locale、config、deployment ID、version ID、traffic、deployedAt、verifiedAt。Cloudflare deployments JSONとversion JSONが同じversion IDかつ100% trafficの場合のみ、`wx`で新規作成する。先書き不可。

## N. Version Upload方式

**採用**。`wrangler versions upload`でversion/Version URLを作り、検証後に`wrangler versions deploy <id>@100`でproduction trafficを明示切替する。uploadとdeployを分離でき、Static Assetsを含むversionをproduction前に確認できるため。今回はuploadしていない。

## O. Version URL検証計画

root、対象guide、別guide、topics、CSS、JS、image、404を確認。HTMLはheader/footer/nav/CTA、title、canonical、JSON-LD、未処理include 0も確認する。詳細は `htmlrewriter-4b3-bootstrap-runbook.md`。

## P. bootstrap guard

single-article guardとは別実装。artifact/receipt/tree全件、sentinel report hash/PASS、独立review、worker/locale/config、他言語なし、開始時deployment/version、rollback versionをfail-closedで検証する。Wrangler専用configのbuild hookからlive preflightを再実行する。

## Q. single-article guard

既存 `deploy-boundary.mjs` はbaseline全件、target HTML 1件、include 2件の許可hash、追加/変更/削除、production attestation、current version driftを検査する。10テストPASS。4-B.4ではbootstrap attestationを正本として接続する。

## R. guard強制接続設計

- bootstrap: `wrangler.bootstrap.jsonc` → bootstrap live guard → versions upload → Version URL → live guard再確認 → versions deploy → attestation。
- normal: `npm run deploy -- ja` → baseline/attestation検証 → staging → single-article preflight → Wrangler build hook → attestation更新。
- 通常経路への最終接続はbootstrap attestation生成後に行う。baselineがない現時点で通常configのASSETS directoryをcandidateへ切り替えると欠落公開の危険があるため、まだ切り替えていない。

## S. guard迂回可能性

bootstrap専用config内ではguard必須。通常経路は設計・テスト済みだが、現在の `npm run deploy` と通常 `wrangler.jsonc` へproduction baseline guardはまだ強制接続されていない。ローカルでWranglerを直接実行する迂回も残る。**4-B.4 production pilot前の必須作業**。

## T. maintenance分離

`maintenance:full-build`は独立script。bootstrap config/guard、single-article guard、rollbackのどこからも参照されず、fallback 0。

## U. 排他/version drift対策

開始時deployment/versionをplanに固定し、upload前とproduction切替直前に100% active deploymentを再取得して一致しなければ停止する。Cloudflareにcompare-and-swap deploy APIがないため、再確認から切替までの微小raceは運用上の排他時間帯で補う。切替後attestationでも予期version/trafficを照合する。

## V. rollback手順

開始直前の100% versionを再取得し、現在確認済み `6be5618a-cc3b-41c6-8c54-06def5f77c61` と一致した場合にrollback targetとして固定。重大問題時は `wrangler rollback <fixed-version-id> --config wrangler.jsonc`。実行前drift時は停止。full build不要。

## W. dry-run

**未実施**。正式configはレビュー済みtreeを `.deploy/bootstrap-ja` へ展開し、独立承認済みplanを要求する。今回は承認前であり、禁止されたasset uploadとの混同を避けるためWranglerを起動していない。ローカルのartifact/guard/configテストで準備を検証した。

## X. テスト結果

- `test:bootstrap`: 8/8 PASS
- `test:deploy-boundary`: 10/10 PASS
- `test:shared`: 10/10 PASS
- artifact展開後inventory: 7,977、mismatch 0
- production sentinel: 12/12 PASS
- Astro full build / maintenance: 0回

## Y. Cloudflare副作用

**なし**。production deploy 0、versions upload 0、asset upload/session 0、rollback 0。Cloudflare/公開サイトへの操作はread-only GETのみ。

## Z. 変更ファイル

4-B.3で追加/変更: `scripts/bootstrap-artifact.mjs`、`scripts/bootstrap-attestation.mjs`、`scripts/bootstrap-guard.mjs`、`scripts/bootstrap-sentinel.mjs`、`tests/bootstrap-artifact.test.mjs`、`tests/bootstrap-control.test.mjs`、`wrangler.bootstrap.jsonc`、`package.json`、本runbook、sentinel JSON、本監査。長期保管領域へartifact、receipt、READMEを新規保存。既存4-B.2以前の差分はrevertしていない。

## AA. Git状態

branch `htmlrewriter-includes`。4-B.3を含め全変更は未commit。開始前からのtracked変更13件とuntracked 4-B以前のfilesがあり、今回もcommit/merge/pushしていない。他言語Wrangler 5差分は存在するが本工程の対象外で、変更もrevertもしていない。

## AB. 未解決事項

独立ChatGPT承認、実行時review record、開始直前current version再取得、Version URL実検証、production bootstrap、attestation生成は次工程。通常deployへの強制接続はbootstrap attestation後、4-B.4前に必要。

## AC. リスク

sentinel外の現行本番差異、Google Drive単一保管、Cloudflare切替直前race、Version URLがproduction resourcesを参照する点、直接Wrangler迂回が残る。いずれもrunbookの停止条件または次工程gateにした。

## AD. 約60,000ファイル問題の現在地

- BUILD Boundary: **解決**
- Production Baseline: **準備完了**（本番確立はbootstrap後）
- DEPLOY Boundary: **部分解決**（bootstrap経路は準備完了、通常経路の強制接続は4-B.4前に残る）

## AE. 次工程

ChatGPT承認後、4-B.3実行としてcurrent version再取得、artifact再検証、独立review plan固定、versions upload、Version URL検証、明示100% deploy、HTTP検証、attestation保存を行う。4-B.4のtarget overlayは混ぜない。

## AF. 最終判定

「Production Baseline Bootstrapを本番で実行するための準備が整った」: **YES**。

ただしこれは実行承認ではない。本監査へのChatGPT承認後にのみbootstrap本番実行へ進む。
