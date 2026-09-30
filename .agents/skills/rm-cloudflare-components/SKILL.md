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

## Six-locale normal Promotion release

The established locale mapping in `scripts/locale-mapping.mjs` is authoritative:

| Locale | Public prefix | Topic example |
| --- | --- | --- |
| ja | empty | `/topics/<slug>/` |
| en | `/en` | `/en/topics/<slug>/` |
| ko | `/ko` | `/ko/topics/<slug>/` |
| pt | `/pt` | `/pt/topics/<slug>/` |
| vi | `/vi` | `/vi/topics/<slug>/` |
| zh | `/zh` | `/zh/topics/<slug>/` |

Do not introduce `/ja/`. Treat each locale as an independent serial release unit. Use that locale's current verified Production Baseline as the only candidate source; create a clean candidate and generate only the target Topic HTML. Never reuse a stale `.deploy` candidate. The normal diff is exactly one target Topic asset (`added` for a new Topic or `changed` for an update) plus zero or one change to that locale's sitemap. Deletions and all other changes fail closed; Foundation assets, shared includes, Topics index, shop, guide, other Topics, root pages, CSS, JavaScript, images, fonts, and robots are outside the normal Promotion allowlist.

Bind the Promotion Manifest, exact target pathname, Release Plan, baseline receipt/attestation, and Publication State. Selector and hreflang output may include only locales allowed by that release's Publication State; do not leak unpublished Promotion URLs. Do not change existing pages to normalize hreflang as part of an ordinary single-Topic release.

Verification separates static candidate identity from deterministic edge identity. Compare non-transformed paths byte-for-byte and by SHA-256 with the candidate. For an authorized HTMLRewriter route, derive expected response bytes using the same deterministic transformation as the Worker and compare those bytes/hash to the Version URL or Production response. Keep each exact route independently authorized; never broaden the route allowlist to fix a verifier mismatch.

Before upload, verify the current Production deployment/version/100% traffic, baseline binding, candidate inventory/diff, Publication State, exact-route security cases, and formal regression suite. The normal human approval gates are: (1) Version Upload for the one locale and (2) switch of that verified Version to 100% Production traffic. Do not upload another Version or change Production without its corresponding approval. Verify the Version URL before the switch; after the switch, verify sentinels and all known candidate paths. On verification failure, restore only that locale's recorded previous Version, confirm 100% traffic and sentinel recovery, and do not establish a new Baseline. On full PASS, create the next artifact, canonical receipt, and attestation bound to the deployment/version and verification evidence; perform a clean extraction/inventory round-trip before marking the Baseline established.

Execute builds and candidate verification from local SSD working storage. Google Drive is durable storage for source-of-truth records and approved evidence, not the execution directory for I/O-intensive generation. Record and verify hashes when copying. Do not make a local temporary copy the durable Production source of truth or bind machine-specific absolute paths into release plans/configuration.

Normal operation is single-page generation only. Never invoke Astro full build, `maintenance:full-build`, `prepare-release.mjs`, or site-wide generation as a normal release or fallback. The maintenance full build is an explicit maintenance/migration/disaster-recovery operation only, separately authorized and invoked by its dedicated command.

## Maintenance

`npm run maintenance:full-build` is for explicitly authorized maintenance, migration, or disaster recovery only. It is never an implicit fallback for normal Promotion, deploy, verification, or rollback. Any full-site regeneration requires a separate scope and authorization.

外国語の通常の内部リンクは同一言語に保つ。未翻訳先を日本語へフォールバックさせない。明示的な言語切替と外部公式サイトは別扱いにし、日本語の外部情報はその旨を表示する。削除・リンク無効化を行った場合は報告する。

## Release approval and rollback

- Release one approved locale at a time through the guarded Promotion release path. The normal human gates are Version Upload and Production switch; approval for one does not authorize the other.
- Do not invoke `wrangler deploy` or `wrangler versions upload` directly to bypass the guard. Bootstrap and maintenance remain isolated behind their dedicated configuration/command. Do not use `--skip-custom-build`, remove guards, copy old HTML, or hide failures with another config.
- 切替直前のProduction versionをrollback targetとして保持する。重大問題時はcurrent stateを再確認してversion rollbackし、Astro full buildをrollback手段にしない。その場で修正再deployしない。
- GitHubのプッシュ成功、Cloudflareのビルド成功、デプロイ成功、本番確認を別々に報告する。本番URLのHTTP・言語・変更内容を確認しない限り「公開完了」としない。
- ログの原因を解消して再試行する。認証、権限、決済、破壊的変更など新たな権限が必要なら停止し、必要な対応だけを引き継ぐ。認証情報は出力しない。
- Vaultの `10_Projects/RMリファラル/制作物カタログ.md` に変更・言語・状態・コード実体・公開URL・検証結果を記録する。未完了を完了にしない。
