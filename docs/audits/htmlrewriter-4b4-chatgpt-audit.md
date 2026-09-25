# HTMLRewriter 工程4-B.4 ChatGPT監査レポート

## A. 結論

**PASS**。Production Baselineからtarget HTML 1件と明示したshared include 2件だけを反映し、Astro全体buildなしで本番100%切替、新baseline確立まで完了した。JavaScript-disabledの今回実ブラウザー確認だけは環境制約でBLOCKED。

## B. 開始時Production Baseline

Bootstrap baseline 7,977 files。artifact `13052eabaefc3331ae02430c145ffe571ee1eccfd6d83d3b0dce51fdbdf5a362`、receipt `96c30ed23c97a5baac6571218c59e6f1a3edbae0b21e3199b60d0209a7980c74`、attestation file `0b0eed2ab8c6c09912110a0ca825169468fad91cbc5a0787e4489aca153d1613`。

## C. current production

開始時はdeployment `c2020aee-a6b7-4c3a-8ed6-c80520ce8a90`、version `a96044c9-dec7-4bc4-8aa6-8f7b3122f429`、traffic 100%。attestationと一致。

## D. baseline integrity

artifact size 128,158,720 bytes、canonical/file receipt hash、attestation hash、7,977件treeを再検証。不一致0。Worker `rm-referral`、locale `ja`、bootstrap plan hash `e0ca83074c076a7792ccb5c1b19be45bc5c00ef64af9c564d21e18ddcc619030`を確認。

## E. config transition

- bootstrap config: `wrangler.bootstrap.jsonc`
- normal deploy config: `wrangler.jsonc`
- 判定: **PASS**

attestationの由来configは変更していない。transitionは同一Worker `rm-referral`、locale `ja`、production state、baseline artifact/receipt/attestation、candidate全hashが一致し、normal configが`worker/index.mjs`、guard build hook、`.deploy/pilot-ja`、ASSETS binding、exact pathnameのみを持つ場合に限定。他言語・任意config・別transitionはfail closed。

## F. guard強制接続

**PASS**。`npm run deploy -- ja`は`single-article-deploy.mjs`へ接続し、baseline pin、single page build、clean staging、diff preflight、current version検証、Wrangler build hookを必須化。通常`wrangler deploy`/`versions upload`も同じconfig hookが環境・planなしで停止する。

## G. guard迂回可能性

通常uploadは既定fail-closed。正しいplan/hash環境値を持つ実行は同じguardを通る。Cloudflare資格情報を持つ者がraw CLIで既存versionへ`versions deploy`する可能性はrepoだけでは完全禁止できず、CI/IAM運用上の残存リスク。

## H. guard test結果

32/32 PASS。正しいbaseline/candidate、baseline改変、attestation改変、version drift、target外変更、unexpected追加、削除、他言語config、未許可transition、RM_PAGE欠落、full-build fallbackなしを確認。

## I. single page build

`build:page`で`ja/guide/rakuten-mobile-three-features`だけを生成。accepted runの出力はtarget HTML 1件。

## J. HTML generated

accepted deploy run: **1**。なお最初のpreflight試行でも1件生成後、header hash差でupload前停止したため、工程全体のローカル生成試行は合計2件。どちらも同じtargetのみ。

## K. build実行時間

accepted run: **1,720 ms**。停止した初回試行: 1,838 ms。

## L. Astro full build回数

0。

## M. maintenance full build回数

0。

## N. candidate file count

7,979 = baseline 7,977 + new shared assets 2。

## O. target changed count

既存HTML変更1。

## P. new shared assets

| path | SHA-256 | size | reason |
|---|---|---:|---|
| `/_includes/ja/header.html` | `ede7055de835c5059864492e20eb34b2d68d2aca6435621a2d020165d6b54b6f` | 806 | NEW REQUIRED SHARED ASSET。exact pilot pathnameの共通header |
| `/_includes/ja/footer.html` | `3e0b8e87b7a83371c841dd011c84c31f6f85cbb6b1c286fdde37d994849adceb` | 385 | NEW REQUIRED SHARED ASSET。exact pilot pathnameの共通footer |

## Q. unexpected changes

0。other guide/topics/root/CSS/JS/images/other languages変更0。

## R. deleted assets

0。

## S. production preflight

PASS。baseline/candidate/attestation/current production/config transition/target/include hashes/diff allowlistをupload前とproduction切替前に検証。

## T. Version Upload

version ID `a47da27c-ebcb-474e-b357-9ec31602a35a`、version number 108、createdAt `2026-09-23T13:20:07.791319Z`。

## U. Version URL

`https://single-page-pilot-4b4-rm-referral.maffun.workers.dev`

## V. asset scan count

16,214 entries（7,979 regular files + 8,236 directories − root）。regular file countとentry countを区別。

## W. updated/uploaded asset count

version manifest差分は3 assets（target 1 + includes 2）。物理blob upload数はWrangler出力の該当部分が実行ログへ保持されず、Cloudflareの既存blob dedupe有無を含め **NOT RECOVERABLE**。version内容とcandidate hashは検証済み。

## X. updated/uploaded HTML count

manifest上3 HTML assets。既存HTML changedはtarget 1、new shared HTML assetsは2。物理blob upload数は前項と同じく未確定。

## Y. Version URL target検証

PASS。HTTP 200、header/footer各1、`rm-include` 0、nav/CTA/title/description/canonical/robots/JSON-LD/CSS/JS/body正常。slashなしは307でslash付きへ統一。

## Z. Version URL non-target検証

PASS。root、guide index、monthly-cost、rakuten-link、replacement-program、topics、CSS、JS、PNG、robots、sitemapの11件が旧baselineとbyte/hash一致。404正常。

## AA. JavaScript disabled

**BLOCKED BY ENVIRONMENT**。Chrome tab作成後、Computer Use利用上限でタブ操作が拒否され、今回のJS無効化を証明できなかった。工程4-A.1の人間manual PASSは履歴としてのみ扱い、今回のPASSには算入していない。

## AB. production切替直前version

`a96044c9-dec7-4bc4-8aa6-8f7b3122f429`、deployment `c2020aee-a6b7-4c3a-8ed6-c80520ce8a90`、100%。開始時と一致、driftなし。

## AC. Production Deployment

- deployment ID: `1e0187ef-d4c4-4b08-beca-f02d576f0b5e`
- version ID: `a47da27c-ebcb-474e-b357-9ec31602a35a`
- traffic: 100%
- deployedAt: `2026-09-24T08:51:46.344223Z`

## AD. production target検証

PASS。Version URLと同じtarget全項目をproductionで確認し、HTMLRewriter処理済み、未処理include 0。

## AE. production non-target回帰

0。11 sentinelが旧baselineとbyte/hash一致、404正常。

## AF. rollback

不要。rollback target `a96044c9-dec7-4bc4-8aa6-8f7b3122f429`は保持。

## AG. 新Production Baseline

- artifact: `f0c59f185bb6fe4b3fe000bf7d2d6793de11e2ab99fb34b3565d841932a8f65c`
- canonical receipt: `77867adfa588e07ff26829e523bd13f9581eb2f833f944e8524500ffc9051885`
- receipt file: `0b09a8b249d44351b7d470a7cd1d08e7b7bc6234c61496e992562d20d644f685`
- attestation file: `56a206e5fce31f2d1cf191ff546c2a618f7b7b39296fb59c902e4338b5b5c388`
- file count: 7,979
- config: `wrangler.jsonc`

旧bootstrap baselineは未変更・保持。

## AH. files generated

accepted buildの一時Astro stagingは74 files、公開overlayとして保持した生成物はtarget HTML 1。candidate 7,979件はbaseline展開＋3 overlayで再構成。

## AI. files changed

3（existing target 1 + new includes 2）。

## AJ. files uploaded

version manifest差分3。物理blob転送数は未回収。

## AK. HTML generated

accepted run 1。工程全体の試行2（初回はupload前fail-closed）。

## AL. HTML changed

existing HTML 1。

## AM. HTML uploaded

version manifest上3 HTML assets（existing 1 + new 2）。物理blob転送数は未確定。

## AN. 他言語影響

0。他言語config/version/deploymentは未操作。

## AO. 第二保管

未実施。既存の安全な第二保管先を確認できず、新サービスは導入していない。本番pilot成功のblockerではない。

## AP. Git状態

branch `htmlrewriter-includes`、全変更未commit。commit/merge/push 0。開始前差分を維持し、4-B.4のguard、plan、evidence、新baseline生成処理を追加。

## AQ. 想定外事象

1. 初回正式実行はtarget fallback由来の縮約headerが、承認済み共通header hashと異なりupload前停止。全言語選択肢を持つ既存検証済み共通headerをexact hash入力に固定してclean retry。サイト修正やversion作成は初回にはなし。
2. Version upload後に詳細化されたconfig-transition要件を追加テストし、production切替前に32/32 PASSを確認。既存versionは作り直していない。
3. Wrangler physical upload countのstdout部分が保持されず、manifest差分3は確定したがblob転送数は未回収。
4. JS-disabledはComputer Use利用上限でBLOCKED。

## AR. 残るリスク

raw Cloudflare CLIを使える資格情報保有者の運用迂回、JS-disabled今回確認待ち、物理blob upload telemetry欠落、第二保管未完了。repo通常upload経路はfail-closed。

## AS. 約60,000ファイル問題

- BUILD Boundary: **解決**
- Production Baseline: **確立**
- Single Article Deploy: **実証済み**
- DEPLOY Boundary: **解決（repo正式経路）**。資格情報保有者のraw CLIは運用/IAMリスクとして残る。

## AT. P0残件

正式運用手順の最終確定、repo側`rm-cloudflare-components` Skill更新、今回のJS-disabled人間確認または再実行、必要ならCI/IAMでraw CLI権限を制約。P0はDONEにしていない。

## AU. 次工程

ChatGPT監査後、4-B.4結果を正式運用へ反映する工程を別途承認する。ここでは6言語・全guide/topics展開へ進まない。

## AV. 最終判定

「1記事だけの更新を、Astro全体buildなしで、他記事を変更せず、Production Baselineから安全に本番deployできた」: **YES**。

P0はDONEにせず停止する。
