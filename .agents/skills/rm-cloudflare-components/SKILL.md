---
name: rm-cloudflare-components
description: GitHub＋Cloudflare版RMリファラルのページ・共通UI・多言語リンク・公開処理を変更するとき、Astro共通部品と本文データを編集し、検証済み成果物だけを生成・公開する。はてなブログ、SNS素材、他のサイトには適用しない。
---

# RMリファラル：共通部品からの生成

このスキルはモデルの種類に依存しない作業契約。実行の強制はリポジトリのビルド・Wrangler設定・成果物検証で行う。スキルだけで任意のモデルや手動操作を完全に制御できるとは説明しない。

## 対象と正本

- 対象は `maffun-rabbit/rm-referral`（Cloudflare、公開サイト `mnp-navi.jp`）。ユーザーが媒体を確認していない場合は、はてなブログかCloudflareかを一問で確認してから変更する。確認済みの同一作業中は繰り返さない。
- Vaultからのコード実体は `../制作ワークスペース/RMリファラル/cloudflare-site/`。リポジトリの `package.json` と `AGENTS.md` を確認して作業する。
- 状況説明・診断だけの依頼では編集・公開しない。サイト修正の許可と公開の許可を区別し、承認されていない公開を自動実行しない。

## 編集箇所を絞る

| 変更内容 | 正本 |
| --- | --- |
| ヘッダー・フッター・CTA | `astro-site/src/components/` |
| 全ページのhead・SEO共通設定 | `astro-site/src/layouts/BaseLayout.astro` |
| 紹介URL・言語別UI・ホームナビ | `astro-site/src/config/site.ts`、`astro-site/src/i18n/` |
| ページ固有本文・メタ情報 | `content/pages/{locale}/{route}/page.json` |
| 共通スタイル・動作 | `css/`、`js/` |

最初に必要な部品・辞書・対象ページだけを読む。全HTMLをモデルへ読み込まない。共通変更を数千件のHTMLへ置換する作業に戻さない。

既存ページを初めて編集する場合は `npm run page:edit -- en guide/replacement-program` のように実行し、表示された `page.json` を編集する。既存ファイルは上書きされない。共通ヘッダー、フッター、DOCTYPE、html/head/bodyは本文へ書かない。新規ページも同じデータ形式を使用し、完成HTMLを直接追加しない。店舗の新規追加・データ形式変更は列挙処理と生成URLの検証も行う。

旧HTMLは移行元の凍結データであり、公開ファイルでも今後の編集対象でもない。必要な本文だけを読み取る互換アダプターが残るが、必ず共通レイアウトを通す。`content/legacy-pages.json` のハッシュを日常作業で更新・リセットしない。

新規 `page.json` は `locale`、`route`（先頭末尾の `/` なし）、`title`、`description`、`mainHtml`（`<main>...</main>`）を指定する。必要な場合だけ `robots`、`schemas`、`styles`、`scripts` を追加する。後3項目は文字列の配列。既存本文は可能な限り保持し、共通CSSを使う。新規ページはルート一覧・サイトマップに自動で入るため、URLの重複と同言語の導線も確認する。

すでに専用部品で構造化されている楽天ID図解は `astro-site/src/components/RakutenIdCreationGuide.astro` とその参照データを編集する。`create-rakuten-id-step-by-step` を汎用本文で重複定義しない。

## 日本語の通常記事更新

1. `content/pages/ja/{route}/page.json`を入力とし、`RM_PAGE=ja/{route}`を明示する。完成HTMLや古い`.deploy/ja`を入力にしない。
2. 保存済みProduction Baselineのartifact、receipt、attestationを検証し、Cloudflareのcurrent deployment/version/trafficと一致しなければ停止する。
3. `npm run test:shared`、`npm run test:deploy-boundary`、`npm run test:bootstrap`を実行する。
4. 承認済みplanとhashを指定し、`npm run deploy -- ja`を入口にする。この経路が`build:page`で対象HTML 1件だけを生成し、baselineをclean candidateへ展開してtargetだけをoverlayする。
5. shared assetが必要な場合はexact path、SHA-256、size、reasonをallowlistへ別枠で固定する。candidateの全path/size/hashを比較し、unexpected change、削除、target外HTML変更が1件でもあれば停止する。
6. production preflightでbaseline、attestation、config transition、current version drift、Worker、locale、candidateを再検証してからWorker Versionだけをuploadする。
7. Version URLでtargetのheader/footer、navigation、CTA、SEO、未処理include 0を確認し、non-targetをbaselineとbyte/hash比較する。
8. production切替直前にversion driftを再確認し、検証済みversionだけへ明示的にtrafficを切り替える。本番HTTP回帰後、candidate全体を新artifact/receipt/attestationとして保存し、次回baselineにする。

通常更新でAstro full build、全ページ再生成、`maintenance:full-build`、未検証baseline、stale `.deploy`、allowlist外変更、guard迂回、他言語同時deployを行わない。通常の日本語`wrangler.jsonc`は必要なplan/hash/environmentがなければfail-closedとする。

## Maintenance

`npm run maintenance:full-build`はmaintenance / migration / disaster recovery専用。通常の記事追加・更新・deploy・rollbackから暗黙に呼ばない。6言語・全guide・topicsへの展開は、個別に承認された別milestoneとして扱う。

外国語の通常の内部リンクは同一言語に保つ。未翻訳先を日本語へフォールバックさせない。明示的な言語切替と外部公式サイトは別扱いにし、日本語の外部情報はその旨を表示する。削除・リンク無効化を行った場合は報告する。

## 公開とrollback

- 公開承認がある日本語対象だけ、正式runbookと`npm run deploy -- ja`を使用する。現時点で他言語を同じ操作へ含めない。
- 通常の`wrangler deploy`、`wrangler versions upload`を直接実行してguardを迂回しない。bootstrapとmaintenanceは専用config/commandへ隔離する。`--skip-custom-build`、guard削除、旧HTMLコピー、別configで失敗を隠さない。
- 切替直前のProduction versionをrollback targetとして保持する。重大問題時はcurrent stateを再確認してversion rollbackし、Astro full buildをrollback手段にしない。その場で修正再deployしない。
- GitHubのプッシュ成功、Cloudflareのビルド成功、デプロイ成功、本番確認を別々に報告する。本番URLのHTTP・言語・変更内容を確認しない限り「公開完了」としない。
- ログの原因を解消して再試行する。認証、権限、決済、破壊的変更など新たな権限が必要なら停止し、必要な対応だけを引き継ぐ。認証情報は出力しない。
- Vaultの `10_Projects/RMリファラル/制作物カタログ.md` に変更・言語・状態・コード実体・公開URL・検証結果を記録する。未完了を完了にしない。
