# HTMLRewriter 工程4-A ChatGPT監査レポート

## A. 結論

**PARTIAL**。工程3-B/Cの変更は採用候補として整合しており、正式単一記事生成、旧全体buildの暗黙fallback除去、Wrangler localによる実HTTP Worker検証、異常系、ロールバック設計を確認した。ただしJavaScript無効ブラウザー確認と本番相当の実Workerでの継続的な速度・料金観測は未完了である。

## B. 本番パイロットへ進めるか

**NOT YET**。日本語1記事限定パイロットに進める候補ではあるが、JS無効確認とパイロット前の承認ゲートを残す。

## C. 工程3-B/C変更レビュー

| 変更 | 判定 | 理由 |
|---|---|---|
| `astro-site/src/layouts/BaseLayout.astro` | KEEP | data-locales、ページ固有header文言、fallbackを維持 |
| `worker/index.mjs` | KEEP | headerのpath・言語option・文言補正、footer挿入、失敗時fallbackを維持 |
| `scripts/build-page.mjs` | KEEP | page.jsonと既存ContentPage/Layoutを再利用し、1HTMLだけを出力 |
| package scripts | KEEP | `build:page`と明示`maintenance:full-build`を分離 |
| Wrangler build hooks | KEEP | 全設定を単一ページhookへ変更。RM_PAGEなしはfail closed |
| `scripts/release.mjs` | KEEP | 通常deployからprepareReleaseを除去しRM_PAGEを要求 |
| `tests/shared-release.test.mjs` | KEEP | hook分離・暗黙fallbackなしを回帰テスト |
| 旧全体build | KEEP / ISOLATE | maintenance・移行・復旧用として削除せず通常経路から分離 |
| 工程3-Bのdev server HTML加工 | REMOVE from formal path | `build-page.mjs`は一時srcDirで静的Astro生成し、dev HTML除去を使わない |
| 既存未追跡実験ファイル2件 | KEEP untouched | 開始前から存在し、今回の変更対象外 |

## D. 読んだファイル

今回の直接確認対象は以下です。

- `docs/audits/htmlrewriter-3c-chatgpt-audit.md`：前工程の実測・変更範囲
- `astro-site/src/layouts/BaseLayout.astro`：工程3-B差分
- `worker/index.mjs`：Worker/HTMLRewriter本体
- `scripts/build-page.mjs`：正式単一生成
- `package.json`：script入口
- `scripts/release.mjs`：deploy経路
- `scripts/prepare-release.mjs`：旧全体build
- `wrangler.jsonc`、`wrangler.en.jsonc`、`wrangler.ko.jsonc`、`wrangler.pt.jsonc`、`wrangler.vi.jsonc`、`wrangler.zh.jsonc`：hookとASSETS
- `tests/shared-release.test.mjs`：回帰テスト
- `content/pages/ja/guide/rakuten-mobile-three-features/page.json`：代表入力

上記は今回の依頼に直接必要な範囲のみ確認した。

## E. 今回追加で読んだファイル

前回監査後に追加で読んだのは、工程3-Cレポート、単一生成script、package scripts、release/deploy経路、6 Wrangler設定、worker、既存テスト、代表page.jsonである。理由は採用候補固定、fallback検査、本番相当fixture作成に限定した。

## F. 予定外に読んだファイル

なし。作業中に生成した一時fixture以外の無関係ファイルは読んでいない。

## G. 読まなかった主要領域

他記事HTML、他言語本文、大量`.deploy`、legacy HTML、node_modules、Git履歴全体、SNS、Facebook、Hatena、URL管理、Obsidian Vault、AboutMe、本番Cloudflareは読んでいない。

## H. 変更したファイル

今回の監査では、コード・設定・テストを変更していない。追加したのは本監査レポートのみ。

工程3-B/Cからの既存変更は、tracked 13ファイルと新規`scripts/build-page.mjs`で構成される。開始前からの未追跡`astro-site/compare-shop-page.mjs`、`astro-site/local-topics-output.test.mjs`は変更していない。

## I. 正式単一記事生成再テスト

```bash
npm run build:page -- ja/guide/rakuten-mobile-three-features --output /private/tmp/rm-page-output-3c-final
```

- 実行時間：約6秒
- 生成HTML：1件
- 出力HTML：1件
- 対象外HTML変更：0件
- 全体build：0回
- staging内ファイル：74件（静的assetを含む。HTMLは対象1件）

## J. 全体build隔離テスト

通常経路から`maintenance:full-build`へ到達しないことを静的・動的に確認した。

- `build:page`は`RM_PAGE`なしで即時fail
- 不正なpage指定は即時fail
- 存在しないpage.json／routeは即時fail
- 成果物が古い場合に全体buildへfallbackするコードなし
- include取得失敗時も全体buildへfallbackしない
- 全体buildは`npm run maintenance:full-build`の明示実行だけ

## K. 本番相当Worker環境

一時fixtureで`wrangler dev --local`を起動し、実際のWorker runtimeへHTTPでアクセスした。

本番と同じ点：

- `worker/index.mjs`
- `main`設定
- `ASSETS` binding
- `run_worker_first: ["/guide/*"]`
- `HTMLRewriter`処理
- 生成済みHTMLと`/_includes/ja/{header,footer}.html`

本番と異なる点：

- localhostのMiniflare/Wrangler local
- 一時的に1記事、CSS、JS、includeだけを置いたASSETS
- Cloudflare本番配信、キャッシュ、料金、実ドメインではない

## L. HTTP E2E結果

`http://127.0.0.1:8794/guide/rakuten-mobile-three-features/`で確認した。

- HTTP 200：PASS
- header：1件
- footer：1件
- 共通ナビ：PASS
- `rm-include`：0
- title：PASS
- description：PASS
- canonical：PASS
- robots：PASS
- JSON-LD：PASS
- CSS：PASS
- JavaScript参照：PASS
- 内部リンク：4件
- CTA：PASS
- ページ固有タイトル：PASS

## M. SEO・導線比較

工程3-Cの生成HTMLと比較し、意図しない差分は検出しなかった。header文言、言語切替属性、canonical、JSON-LD、内部リンク、final CTAは維持された。

## N. JavaScript無効時検証

**NOT TESTED**。この環境でブラウザーのJavaScript無効状態を確実に設定して確認する手段を確保できなかった。HTMLには本文、header、footer、ナビ、CTAが初期HTMLとして存在することまでは確認済み。

## O. 異常系テスト

| ケース | 結果 |
|---|---|
| A. 存在しないpage指定 | PASS。exit 1、全体buildなし |
| B. `RM_PAGE`なし | PASS。Wrangler hookは即時exit 1、全体buildなし |
| C. include取得失敗 | PASS。HTTP 200、fallback header/footerを保持し、対象includeだけ未処理のまま安全に残る |
| D. 存在しない通常URL | PASS。local Worker HTTP 404、空body、全体buildなし |

## P. ロールバック手順

パイロットで問題が出た場合は、通常公開経路に全体buildfallbackを戻さない。

1. Worker routeの変更を行う前なら、Wrangler設定とWorkerの採用候補差分をGitで明示的にrevertする。
2. 単一記事artifactは対象HTMLを直前の検証済みartifactへ戻す。
3. `worker/index.mjs`変更だけなら、直前Workerコードへ戻して対象routeの配信を確認する。
4. ASSETSの対象ファイル単位で復元し、HTTP 200、header/footer、SEOを再確認する。

データ損失は想定しない。復旧単位はWorkerコード、Wrangler設定、対象HTML、include資産のいずれか。旧全体buildは通常の切戻しには不要で、全体整合性の再生成が必要な障害復旧時だけ、明示maintenanceとして使う。

## Q. commit候補ファイル一覧

一つの論理的変更セットとしてcommit可能だが、commit自体は行っていない。

- `scripts/build-page.mjs`
- `astro-site/astro.config.mjs`
- `astro-site/src/pages/[...content].astro`
- `astro-site/src/layouts/BaseLayout.astro`
- `worker/index.mjs`
- `package.json`
- `scripts/release.mjs`
- `wrangler.jsonc`
- `wrangler.en.jsonc`
- `wrangler.ko.jsonc`
- `wrangler.pt.jsonc`
- `wrangler.vi.jsonc`
- `wrangler.zh.jsonc`
- `tests/shared-release.test.mjs`
- 本監査レポート

開始前から存在した未追跡2ファイルは含めない。

## R. 約60,000ファイル問題

**部分解決**。単一記事生成と通常経路からの旧全体build fallback除去は検証済み。本番限定パイロット、正式切替、6言語展開、速度・料金観測は未完了。

## S. P0 Done条件

完了済み：

- 単一記事生成コマンドの実装
- 対象HTMLだけの静的生成
- 通常hookからの暗黙全体build除去
- Worker/HTMLRewriterのlocal実HTTP検証
- 日本語代表記事のSEO・導線確認

未完了：

- 本番または本番相当での十分な継続検証
- 日本語限定パイロット
- 正式運用手順の確定
- repo側`rm-cloudflare-components` Skill更新
- 旧全体方式の正式アーカイブ切替
- 料金・CPU・速度の観測

P0は`IN PROGRESS`のまま。

## T. P0後へ回してよい項目

6言語全面展開、全guide/topics展開、長期の速度・料金観測は、P0の日本語限定パイロットと正式運用切替後の別milestoneへ分離可能。ただし日本語パイロットとロールバック確認はP0に残す。

## U. 未検証項目

- JavaScript無効ブラウザー
- 本番Cloudflareでの実測
- 本番キャッシュ挙動
- Worker CPU・料金
- 日本語パイロット後のロールバック実地確認
- 6言語およびtopicsへの拡張

## V. リスク

- 単一生成は既存include・静的assetが存在することを前提とする。
- local fixtureは本番と同じWorkerコードだが、Cloudflare本番のキャッシュ・失敗条件を完全には再現しない。
- JavaScript無効時の視覚確認が残っている。
- 6言語Wrangler設定も新hookになったため、各言語で`RM_PAGE`を明示する運用が必要。

## W. 次工程の最小提案

まず安全なブラウザー環境でJavaScript無効確認を行い、その後に日本語`/guide/*`の本番限定パイロット承認を別途得る。承認前にdeploy・merge・Skill更新はしない。

## X. コンテキスト効率

- 読んだファイル総数：今回直接確認は約15実ファイル（6 Wrangler含む）
- 追加ファイル数：工程3-C監査レポート、単一生成、package、release、prepare-release、page-sources、Worker、Layout、テスト、代表page.json等
- 予定外ファイル数：0
- 変更ファイル数：監査レポート1。コードの追加変更0
- 必要最小限だったか：MOSTLY YES。local Worker起動に必要なfixtureだけ追加作成した。

## Y. Git状態

- 作業開始前の変更：`astro-site/compare-shop-page.mjs`、`astro-site/local-topics-output.test.mjs`の未追跡2件
- 工程3-B/Cの変更：tracked 13件＋`scripts/build-page.mjs`
- 今回4-Aの追加変更：本監査レポートのみ
- commit、merge、push、deploy：なし

## Z. 最終判定

**NOT YET**。実HTTP Worker検証と主要HTML検証はPASSしたが、JavaScript無効時のブラウザー確認が未検証で、本番限定パイロットへの進行条件をすべて満たしていない。次はJS無効確認と明示的なパイロット承認であり、工程4-Bへは進まない。
