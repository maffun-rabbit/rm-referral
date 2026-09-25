# HTMLRewriter 工程3-C ChatGPT監査レポート

## A. 結論

**PASS（工程3-Cの範囲）**。単一記事生成コマンド、通常Wrangler hookからの旧全体ビルド分離、代表記事のWorker/HTMLRewriter経路を確認した。本番deploy、main merge、工程4、6言語展開、P0 DONE化は行っていない。

## B. 今回確立した正式生成経路

`content/pages/ja/guide/rakuten-mobile-three-features/page.json`
→ `npm run build:page -- ja/guide/rakuten-mobile-three-features`
→ 一時srcDirに既存`ContentPage`を1ページだけ定義
→ 既存`BaseLayout`・既存コンポーネントで静的HTMLを生成
→ 対象HTML 1件を出力
→ Wrangler ASSETS
→ `worker/index.mjs`のHTMLRewriter
→ `_includes/ja/header.html`・`footer.html`挿入
→ 完成HTML

dev server HTMLの後処理、開発用script除去、全体Astro buildは正式経路に含めない。

## C. 読んだファイル

| path | 理由 | 範囲 |
|---|---|---|
| `.agents/skills/rm-cloudflare-components/SKILL.md` | Cloudflare作業の正本・安全条件 | 全文 |
| `astro-site/src/layouts/BaseLayout.astro` | 工程3-B差分と共通Layout確認 | 全文 |
| `worker/index.mjs` | HTMLRewriterの挿入・言語切替確認 | 全文 |
| `package.json` | npm scriptの入口確認 | 全文 |
| `wrangler*.jsonc` | build hook、ASSETS、Worker経路確認 | 6ファイル全文 |
| `scripts/release.mjs` | deployから旧全体buildが呼ばれる経路確認 | 全文 |
| `scripts/prepare-release.mjs` | 旧全体buildの内容と用途確認 | 全文 |
| `scripts/page-sources.mjs` | page.json読込・検証・正本確認 | 全文 |
| `astro-site/src/components/ContentPage.astro` | 既存生成ロジック再利用確認 | 全文 |
| `astro-site/astro.config.mjs` | 単一srcDir/outDirの注入点確認 | 全文 |
| `astro-site/src/pages/[...content].astro` | route生成の限定点確認 | 全文 |
| `tests/shared-release.test.mjs` | 既存回帰テストと追加安全テスト | 全文 |
| `content/pages/ja/guide/rakuten-mobile-three-features/page.json` | 代表記事の入力 | 読込・コマンド経由検証 |

## D. 追加で読んだファイルと理由

今回追加で読んだのは、上表のうち前回監査後に直接必要だった`package.json`、6つの`wrangler*.jsonc`、`scripts/release.mjs`、`scripts/prepare-release.mjs`、`page-sources.mjs`、`ContentPage.astro`、`astro.config.mjs`、`[...content].astro`、既存共有テスト、代表`page.json`である。いずれも正式コマンドとhook分離に直接必要だった。

## E. 予定外ファイル

なし。リポジトリ開始時から存在した未追跡の`astro-site/compare-shop-page.mjs`と`astro-site/local-topics-output.test.mjs`は変更していない。

## F. 読まなかった主要領域

他言語のページ本文、全店舗HTML、topics全体、生成済み大量HTML、Cloudflare本番、外部ダッシュボードは読んでいない。6言語設定ファイルのhook構造だけは確認した。

## G. 変更した全ファイル

| path | 内容 | diff規模 |
|---|---|---:|
| `scripts/build-page.mjs` | 正式単一記事生成コマンド | 新規50行 / 3,616 bytes |
| `astro-site/astro.config.mjs` | 一時srcDir・outDirを環境変数で指定 | +2 |
| `astro-site/src/pages/[...content].astro` | 単一ページ指定時のroute限定 | +2 |
| `package.json` | `build:page`追加、全体buildを`maintenance:full-build`へ隔離 | +2/-1 |
| `scripts/release.mjs` | 通常deployからprepare-release呼出しを除去。RM_PAGE必須化 | +1/-1 |
| `wrangler.jsonc`ほか5言語 | build hookを`build-page.mjs --wrangler`へ変更 | 各+1/-1 |
| `tests/shared-release.test.mjs` | hook分離と暗黙fallbackなしのテスト | +10/-1 |
| `docs/audits/htmlrewriter-3c-chatgpt-audit.md` | 本監査レポート | 新規 |

## H. 工程3-Bの2ファイルの扱い

- `astro-site/src/layouts/BaseLayout.astro`：**維持**。`data-locales`と`data-header-label`を渡し、工程3-Bで確認した言語切替・header文言・ページ固有導線を保持している。
- `worker/index.mjs`：**維持**。headerの言語optionとページ固有リンクをリクエストpathに合わせて補正し、footerは従来どおり挿入する。revertしていない。

## I. 正式単一記事生成コマンド

```bash
npm run build:page -- ja/guide/rakuten-mobile-three-features --output /private/tmp/rm-page-output-3c-final
```

Wrangler hookは`RM_PAGE=ja/guide/... node scripts/build-page.mjs --wrangler`を要求し、未指定時はエラー終了する。全体buildへのfallbackはない。

## J. 単一記事生成実測

- 実行時間：コマンド全体 約6.0秒、Astro表示上 約2.38秒（環境負荷により変動）
- 生成HTML数：1
- staging内ファイル数：74（既存静的assetを含む。公開対象HTMLは1件）
- 出力先のHTML数：1
- リポジトリ変更ファイル数：今回のtracked変更13件＋新規script 1件。開始時から存在した未追跡2件は別扱い
- 対象外変更数：0（single outputは`/private/tmp`、stagingは終了時削除）
- 全体build実行回数：0

## K. Worker / HTMLRewriter E2E

正式生成HTMLを工程3-Bと同じ`IncludeHandler`へ通すテストを実施した。

- HTTP相当status：200
- header：PASS
- footer：PASS
- 共通ナビ：PASS
- 未処理`rm-include`：0
- fallback asset取得失敗時の既存テスト：PASS

## L. SEO・内部リンク・CTA検証

- canonical：PASS
- JSON-LD：PASS
- title：PASS
- 内部リンク：4件以上を確認
- final CTA：PASS
- `main`重複：なし

## M. JavaScript無効時検証

ブラウザーを使ったJavaScript無効確認は **NOT TESTED**。HTML上はheader、footer、本文、主要リンクが初期HTMLに存在し、共通部品はWorker側挿入方式であることを確認した。

## N. 旧全体ビルド経路

旧経路は`prepare-release.mjs`が入力fingerprintを検査し、staleなら`npm --prefix astro-site run build`で全routeを生成し、全言語releaseと全件検証を行うものだった。従来は全Wrangler設定のbuild hookと`release.mjs deploy`から到達できた。

## O. 旧経路の最終方針

**ISOLATE**。全サイト再生成、移行、安全網、障害復旧に必要なため削除しない。

## P. ISOLATEの場合

- 明示コマンド：`npm run maintenance:full-build`
- 実体：`node scripts/release.mjs build` → `prepare-release.mjs`
- 通常の`build:page`、通常Wrangler hook、通常deployからは呼ばれない。
- 従来の`build` script名は削除し、maintenanceという名前にした。

## Q. 通常記事公開から旧全体ビルドへ到達できない保証

1. 全Wrangler設定のhookが`node scripts/build-page.mjs --wrangler`になった。
2. `build-page.mjs`は`RM_PAGE`なしで即時エラーとなり、旧scriptをimportしない。
3. `release.mjs deploy`は`prepareRelease()`を呼ばず、`RM_PAGE`を要求する。
4. 旧全体buildは`maintenance:full-build`という明示scriptだけに残した。
5. 回帰テストでhook、script、`prepare-release.mjs`非参照を検査している。

## R. 約60,000ファイル問題

**部分解決**。単一記事の静的生成と旧hookからの暗黙fallback除去は実証済み。ただし本番パイロット、正式切替、6言語展開、旧全体方式の運用アーカイブ化は未完了であり、P0はDONEではない。

## S. 未検証項目

- JavaScript無効ブラウザー確認
- Cloudflare本番相当の実Worker HTTP起動確認
- 本番パイロット
- 6言語の単一生成・共通部品挿入
- 速度、Worker CPU、料金影響
- 更新・ロールバックの本番相当検証

## T. リスク

- 現在の単一生成は`.deploy/ja`へ対象HTMLだけを書けるが、既存asset・include資産の存在を前提とする。
- 他言語Wrangler hookも同じ単一コマンドにしたため、各言語で`RM_PAGE`を指定する運用契約が必要。
- `astro-site`のsync asset処理は単一生成時にも実行されるが、全HTML生成は行わない。
- JavaScript無効時の見た目確認が未実施。

## U. 次工程の最小提案

工程4として、日本語`/guide/*`の本番相当パイロットだけを対象に、単一生成・Worker挿入・SEO・ロールバック・速度を検証する。合格するまで6言語展開とSkill正式更新には進まない。

## V. コンテキスト効率

- 読んだファイル数：前回までの既読を除き、今回直接追加で約12カテゴリ（6 Wranglerを含む）
- 追加で読んだファイル数：12カテゴリ／約18実ファイル
- 予定外ファイル数：0
- 変更ファイル数：tracked 13＋新規1＋本レポート1
- 必要最小限だったか：PASS。全大量HTML、全言語本文、本番環境は読んでいない。

## W. Git状態

開始前から存在した変更：

- `astro-site/compare-shop-page.mjs`（未追跡）
- `astro-site/local-topics-output.test.mjs`（未追跡）

今回の変更は、単一生成、hook分離、テスト、監査レポートに限定されている。既存2ファイルをrevertしていない。mainへのmerge、push、deployは行っていない。
