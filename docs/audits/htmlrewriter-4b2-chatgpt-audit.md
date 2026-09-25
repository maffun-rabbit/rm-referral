# HTMLRewriter 工程4-B.2 ChatGPT監査レポート

## A. 結論

**PARTIAL**。現在本番deployment/versionはread-onlyで確定した。Cloudflareから当該versionの完全Static Assets manifestとasset bytesを復元する公式手段は確認できず、CASE CとしてProduction Baseline Bootstrapを設計した。信頼できるbaselineがないためcandidate構築とWrangler dry-runは実施していない。

## B. current production

- Worker: `rm-referral`
- config: `wrangler.jsonc`
- deployment: `1e8adc59-cf3a-49e6-97eb-5606ca65f215`
- version: `6be5618a-cc3b-41c6-8c54-06def5f77c61`（version number 105）
- traffic: 100%
- deployment created: `2026-09-23T11:41:23.301663Z`
- capturedAt: `2026-09-23T12:07:12Z`
- 確認方法: `wrangler deployments list --config wrangler.jsonc --json`と`wrangler versions view ... --json`

記録：[current production JSON](htmlrewriter-4b2-current-production.json)

## C. Cloudflare公式仕様調査

- manifest取得可否: **既存version用の完全manifestをread-only exportする公開API/現行Wrangler commandは確認できない**。asset upload sessionはmanifestをPOSTする入口で、既存manifestのGETではない。
- asset bytes復元可否: **不可**。Worker scriptのdownload APIは存在するが、versionに紐づく全Static Assetsのdownload APIは確認できない。
- versionとの関係: Worker versionはコード、Static Assets、bindings、compatibility settingsを含む。deploymentがversionへtrafficを割り当てる。
- version詳細: assetsの設定情報は取得できるが、個別asset path/hash/bytesは返らない。今回のversion詳細にも完全manifestはなかった。
- manifestはdeploy時にdirectory全体から登録し、未変更bytesの再uploadを省略するために使われる。差分転送は既存manifestへのpartial patchを意味しない。

根拠：[Direct Uploads](https://developers.cloudflare.com/workers/static-assets/direct-upload/)、[Workers API](https://developers.cloudflare.com/api/resources/workers/)、[Get Worker Version](https://developers.cloudflare.com/api/typescript/resources/workers/subresources/beta/subresources/workers/subresources/versions/methods/get/)、[Download Worker Script](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/get/)、[Versions and deployments](https://developers.cloudflare.com/workers/versions-and-deployments/)、[CI/CD](https://developers.cloudflare.com/workers/ci-cd/)。現行Wrangler 4.131.1の`buildAssetManifest`/`syncAssets`実装も確認した。

## D. Production Baseline取得方法

Cloudflareからの逆生成は採用しない。次回の一度限りのbootstrapで、事前に保存した完全ASSETS artifactをそのままdeployし、生成済みreceiptのhashと、deploy後にCloudflareが返すdeployment/versionをattestationで関連付ける。

詳細：[Production Baseline Bootstrap](htmlrewriter-production-baseline-bootstrap.md)

## E. baselineは信頼可能か

**NO**。現在の`.deploy/ja`、古いrelease receipt、一部HTTP、rollback backup、手書きversion IDはいずれも完全production artifactの証拠ではない。今回取得したCloudflare metadataにも個別asset manifest/bytesがない。

## F. baseline receipt

本番receiptは未作成。偽のevidenceを作っていない。

実装したschema検査では最低限、schema/locale/Worker、fileCount、各path/size/SHA-256、完全artifactのSHA-256/size/reference、deployment ID、version ID、traffic 100、capturedAtを要求する。planはreceipt自身のSHA-256と完全artifact実体を参照し、両方を再計算する。

## G. baseline file count

**未確定**。過去のローカルtree 7,975 filesをproduction file countへ昇格していない。

## H. source-of-truth方針

最小構成は「deployに使用した完全treeをversioned release artifactとして保存し、receiptとdeployment attestationを併置する」方式。Gitへ大量ファイルを追加せず、既存のrelease artifact/CI artifact保管を使う。R2等の新サービスは現時点で追加しない。

保存artifactを次回baselineとして展開し、target overlay後のcandidateも次versionのartifactとして保存することで、「deployしたもの」と「次回baseline」を同一にする。

## I. bootstrapが必要か

**YES**。完全production artifactをCloudflareから取得できないため、一度だけレビュー済み完全artifactをdeployしてsource-of-truthを確立する本番変更が必要。今回は設計のみ。

## J. candidate staging

**未構築**。信頼できるProduction Baselineがないため、過去のローカルtreeからcandidateを作ってdry-runへ進めていない。

## K. target overlay

**未実施**。正式経路では`/guide/rakuten-mobile-three-features/index.html`のexact hash付きoverlayだけを通常変更として許可する。

## L. include2件の扱い

現在production manifest上の存在を証明できない。過去の公開URL 404は参考情報に留める。bootstrap artifactに必要なら、`/_includes/ja/header.html`と`/_includes/ja/footer.html`を`NEW REQUIRED SHARED ASSET`として、target HTML変更とは別にpath/hash/reasonを明示承認する。baselineに存在することが確認できた後はbytesをそのまま維持する。

## M. production preflight結果

**FAIL CLOSED（期待どおり）**。ローカル4-B.1 planをproduction modeへ渡すと`Verified production artifact receipt required`で、Cloudflare upload前に停止した。

`scripts/deploy-boundary.mjs`を強化し、完全artifact実体のhash/size、Worker、deployment、version、traffic、capturedAt、fileCountを検証する。人手でversion IDだけを書いても通らない。

## N. version drift guard

実装済み。最新deploymentが単一versionへ100% trafficを割り当てていることを要求し、receiptのdeployment IDとversion IDの両方を比較する。mixed traffic、欠落ID、version/deployment driftは停止する。unit testはPASS。認証付きproduction成功分岐はbaseline未確保のため未実行。

## O. deploy経路へのguard統合

**未適用**。提案した正式接続は、`npm run deploy -- ja`→production preflight→`.deploy/pilot-ja`完全candidate→Wrangler build hook再検査→deploy。

日本語`wrangler.jsonc`のASSETS directory/build hookと`release.mjs`をこの経路へ切り替えるパッチは、自動承認レビューに「既存asset欠落時のサービス障害リスク」を理由に拒否された。迂回して変更していない。

## P. guard迂回可能性

**YES**。独立guardは強化済みだが、現在の`npm run deploy -- ja`とWrangler build hookは4-B.1 guardを強制しない。正式接続が承認・適用されるまでdeploy禁止を維持する。

## Q. maintenance full-buildとの分離

維持。通常deployコードは`prepareRelease`を呼ばず、`maintenance:full-build`だけが`release.mjs build`を明示実行する。今回、全体buildやmaintenance経路は実行していない。

## R. Wrangler dry-run

**未実施**。信頼できるProduction Baselineと完全candidateがないため、PASS条件に従い停止した。`wrangler deploy --dry-run`はローカルbundle/manifest確認には使えるが、本番artifactの真正性を補わない。

## S. files scanned

- Cloudflare: deployments 10件とcurrent version metadata 1件をread-only取得。asset manifest scanは不可。
- Production assets: 0 files。
- ローカル: synthetic fixtureのみ。既存の約7,975-file treeを本番baseline目的で再走査していない。

## T. files generated

- 本番asset: 0
- baseline artifact/receipt: 0
- 開発成果物: bootstrap手順1、current production記録1、監査レポート1

## U. files changed

- 本番asset: 0
- この工程のコード変更: `scripts/deploy-boundary.mjs`、`tests/deploy-boundary.test.mjs`
- 文書追加: `docs/audits/htmlrewriter-production-baseline-bootstrap.md`、`docs/audits/htmlrewriter-4b2-current-production.json`、本レポート

`package.json`の3つのboundary commandは4-B.1で追加済み。Worker、build-page、Astro、他言語Wrangler設定は4-B.2で変更していない。

## V. files uploaded

**0**。

## W. HTML generated

**0**。

## X. HTML uploaded

**0**。

## Y. Cloudflareへの副作用

**なし**。read-onlyでdeployment listとversion metadataを取得しただけ。upload session、version作成、preview、本番deploy、rollback、設定変更は行っていない。

## Z. 変更したファイル

- `scripts/deploy-boundary.mjs`
- `tests/deploy-boundary.test.mjs`
- `docs/audits/htmlrewriter-production-baseline-bootstrap.md`
- `docs/audits/htmlrewriter-4b2-current-production.json`
- `docs/audits/htmlrewriter-4b2-chatgpt-audit.md`

## AA. テスト結果

- deploy boundary: 10/10 PASS
- shared release: 10/10 PASS
- 合計: 20/20 PASS
- `git diff --check`: PASS
- production preflight negative test: PASS（不正なlocal baselineをupload前に拒否）

## AB. 未検証

- 完全Production Baseline artifact/manifest/receipt
- bootstrap deploy
- include2件のproduction manifest上の存在
- production preflight認証付き成功分岐
- 正式接続後のcandidate immutability
- Wrangler dry-run
- 本番HTTP E2E

## AC. リスク

1. 現行通常deployはguardを迂回できるため、正式接続まで実行不可。
2. bootstrapは完全treeの正しさを一度レビューする必要があり、本番変更を伴う。
3. artifact保管先が期限付きCI artifactの場合、次回baselineを失う。長期保持方針が必要。
4. candidate検査後からWrangler manifest化までの書換え防止を正式接続時に実装する必要がある。

## AD. Git状態

dirty worktreeを維持。工程3-B/C/4-A/4-B.1の既存変更をrevertしていない。今回のファイルは未コミット。commit、merge、pushなし。他言語Wrangler 5設定の既存差分は触っていない。

## AE. 約60,000ファイル問題の現在地

- BUILD Boundary: **解決**。page.json 1件→HTML 1件、全体Astro build 0。
- DEPLOY Boundary: **部分解決**。完全baseline＋overlay方式、guard、evidence schema、version drift検査は成立。Production Baselineと通常deployへの強制統合が未完了。

## AF. 次工程の最小提案

**Production Baseline Bootstrap**だけを次工程にする。

1. 保存・長期保持できる完全ASSETS artifactの作成元を確定し、全差分レビューを行う。
2. artifact＋receiptを先に保存してから、一度だけbootstrap deployする具体的変更セットを提示する。
3. 同じ変更セットに、`wrangler.jsonc`を完全candidateへ接続し、`release.mjs`とWrangler build hookの双方でproduction preflightを必須化するパッチを含める。
4. 明示承認後にのみbootstrap deployし、返されたdeployment/versionをattestationへ自動記録する。その後dry-runと再パイロットを別工程で行う。

## AG. 最終判定

**「安全な1記事本番再パイロットのdeploy準備経路が確立した」：NO**。

最後のブロッカーは2点：

1. 現在本番と機械的に結び付いた完全Production Baselineがなく、一度限りのbootstrapが必要。
2. 日本語Wrangler/通常deployへのguard強制接続が未承認・未適用で、現行経路を迂回できる。
