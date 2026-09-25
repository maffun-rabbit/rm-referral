# HTMLRewriter 工程4-B ChatGPT監査レポート

## A. 結論
**PARTIAL（本番deploy後に想定外アセット差分を検出し、即時rollback）**

## B. 本番deploy
実施後、rollback済み。deploy versionは`b856d869-d136-477a-83e6-6bdfe9ec9741`、復旧versionは`6be5618a-cc3b-41c6-8c54-06def5f77c61`。

## C. deploy前テスト
`node --test tests/shared-release.test.mjs`：10/10 PASS。exact pathname、対象外guide/topics/root/unknown、trailing slash、include非取得、fallbackなしを確認。

## D. deploy前バックアップ
`/private/tmp/rm-4b-backup/`に対象HTML、headers、SHA-256、rollback前後HTMLを保存。deploy前HTML SHA-256は`f38435702452e392001eab15bee8bca57f2276233ab141bc61662b3a22ecb15f`。canonical、title、header/footer、rm-include 0を記録。直前Worker versionは`6be5618a-cc3b-41c6-8c54-06def5f77c61`。

## E. 本番変更ファイル・資産
日本語`wrangler.jsonc`、`worker/index.mjs`、正式単一記事生成経路、対象ASSETSを意図したが、Wranglerは差分として20ファイルをuploadした。代表記事以外のguide 18件と日本語include 2件が含まれたため、条件不適合としてrollbackした。

## F. 使用した正式コマンド
`RM_PAGE=ja/guide/rakuten-mobile-three-features npm run deploy -- ja`

## G. 単一記事生成実測
- 明示的`npm run build:page -- ja/guide/rakuten-mobile-three-features`: 約2.21秒
- generated HTML: 1
- 対象外HTML変更: 単一記事生成出力では0
- Wrangler deploy時のupload差分: 20（想定外）
- 全体build: 0

## H. deploy実行内容
日本語設定のみを使い、build hookは`node scripts/build-page.mjs --wrangler`。Astroは1 page buildだった。Cloudflareは16,206ファイルを走査し、20 new/modified assetsをuploadした後Workerをdeployした。

## I. 本番対象URL
deploy直後の詳細検証前にrollbackしたため、成功状態としては記録しない。rollback後は対象URLがHTTP 200、title/canonical/header/footerが正常、rm-include 0。deploy前後（rollback後）の静的HTML SHA-256は同一で、最終状態は旧配信へ戻った。

## J. PC/mobile確認
本番deploy状態では未実施。工程4-A.1のローカルJS無効確認は人間PASS済み。

## K. 対象外日本語guide確認
rollback後`/guide/replacement-program/`はHTTP 200。今回の最終本番状態は旧versionであり、パイロット処理は適用されていない。

## L. topics/root/404確認
deploy後の対象versionでは確認前にrollback。ローカル回帰テストではtopics、root、unknown URLの非処理をPASS。

## M. 他言語への影響
他言語Wrangler設定はdeployしていない。`wrangler.en.jsonc`、`wrangler.ko.jsonc`、`wrangler.pt.jsonc`、`wrangler.vi.jsonc`、`wrangler.zh.jsonc`は4-B対象外として保持。

## N. 約60,000ファイル問題の実測証拠
単一記事生成自体は1 page、fullBuild false、約2.21秒。Astro全体buildとmaintenance full-buildは0。ただしWranglerのASSETSディレクトリ走査は16,206ファイル、upload差分20となったため、今回の「1記事だけ本番変更」条件は満たさなかった。

## O. 全体Astro build回数
0（単一entrypoint buildのみ）。

## P. maintenance:full-build回数
0。

## Q. ロールバック
実施。想定外20アセット差分を検出後、直前version`6be5618a-cc3b-41c6-8c54-06def5f77c61`へWrangler rollback。代表記事のrollback後SHA-256はdeploy前と一致。全体buildは使用していない。

## R. 想定外の変更・問題
`.deploy/ja`に既存の差分が残っており、Wranglerが代表記事以外のguideとincludeをupload対象にした。単一記事生成コマンドは1件でも、ASSETS deploy境界は1件に限定できていない。再deployは禁止し、ASSETS stagingを対象記事と必要共通assetだけに分離する設計が次の課題。

## S. Git状態
commit、merge、pushは未実施。工程3-B/3-Cの未コミット変更を保持し、今回変更した`worker/index.mjs`と`tests/shared-release.test.mjs`も未コミット。5つの他言語Wrangler設定はrevertしていない。

## T. P0 Done条件
残件。正式単一生成、Worker exact pathname、rollback手順、full-build 0は確認できたが、1記事限定の本番ASSETS境界と正式運用手順が未完了。

## U. 次工程の最小提案
本番再deploy前に、Wranglerへ渡す日本語ASSETS stagingを対象HTMLと必要なheader/footer/include、既存静的依存だけに決定的に構築し、対象外guideをupload差分から除外する。staging差分検査で代表HTML数=1、対象外HTML=0を満たさない場合はdeployを中止する。

## V. 最終判定
**「日本語1記事本番限定パイロット成功」: NO**。本番deployは実施したが、20アセット差分が条件違反だったためrollback済み。最終本番状態はdeploy前へ復旧している。
