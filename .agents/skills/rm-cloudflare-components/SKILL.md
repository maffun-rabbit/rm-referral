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

新規の検索意図別記事は `topics/` 配下に置き、自由記述の `mainHtml` を使わない。`guide/` は制度・手順を体系的に説明するガイドとして扱う。`npm run page:new-topic -- <locale> <slug>` で `pageType: guide-topic-v1` の構造化データを作り、`docs/page-design/guide-topic-regulation.md` に従う。ヘッダー、フッター、パンくず、記事幅、ヒーロー、出典、更新日、CTA、関連ページは固定部品を使用する。本文は承認済みの `prose`、`steps`、`comparison`、`cards`、`warning`、`faq`、`table`、`media` から選ぶ。新しい表現が必要ならページ固有HTML/CSSで回避せず、共通セクション型を追加して検証する。既存ページは明示的な移行依頼がない限り変更しない。

すでに専用部品で構造化されている楽天ID図解は `astro-site/src/components/RakutenIdCreationGuide.astro` とその参照データを編集する。`create-rakuten-id-step-by-step` を汎用本文で重複定義しない。

## 生成と検証

1. `npm ci --ignore-scripts` で固定依存関係を用意する。
2. `npm run test:shared` で共通生成の制約を検証する。
3. `npm run build` で6言語の共通部品から全公開ページと `.deploy/{locale}/` を生成する。入力と出力が一致する検証済みリリースだけは再利用できる。
4. `npm run verify:release` で入力ハッシュ・成果物ハッシュ・欠落を確認する。`.deploy/release.json` を手作業で作成・修正しない。
5. 変更した種類のページをPCとモバイルで確認する。URL、title、description、本文、画像、リンク、紹介導線を維持する。視覚的変更には利用可能な `dads-inspired-design` を併用し、未導入なら既存スタイルを維持して文字切れ・可読性を確認する。

外国語の通常の内部リンクは同一言語に保つ。未翻訳先を日本語へフォールバックさせない。明示的な言語切替と外部公式サイトは別扱いにし、日本語の外部情報はその旨を表示する。削除・リンク無効化を行った場合は報告する。

## 公開

- 公開承認がある場合だけ、対象コミットをGitHubへ反映し、`npm run deploy -- ja`（言語は `ja/en/zh/ko/vi/pt`）を使用する。共通変更の場合は全言語への影響を確認する。
- 各 `wrangler*.jsonc` のビルドフックでも共通生成と検証が起動する。`--skip-custom-build`、ガードの削除、旧HTMLのコピー、別設定による迂回で失敗を隠さない。
- GitHubのプッシュ成功、Cloudflareのビルド成功、デプロイ成功、本番確認を別々に報告する。本番URLのHTTP・言語・変更内容を確認しない限り「公開完了」としない。
- ログの原因を解消して再試行する。認証、権限、決済、破壊的変更など新たな権限が必要なら停止し、必要な対応だけを引き継ぐ。認証情報は出力しない。
- Vaultの `10_Projects/RMリファラル/制作物カタログ.md` に変更・言語・状態・コード実体・公開URL・検証結果を記録する。未完了を完了にしない。
