---
name: rm-cloudflare-components
description: GitHub＋Cloudflare版RMリファラルのページ、Astro共通部品、本文データ、多言語リンクを編集・生成するときに使う。公開・復旧・保管の運用指示はCURRENT.mdを入口とする現行運用文書へ委譲する。
---

# RMリファラル：共通部品と記事データ

対象は `maffun-rabbit/rm-referral`、公開サイトは `mnp-navi.jp`。Astro共通部品と本文データを使ってページを制作するための専門Skill。
正式環境は `/Users/masayuki/Developer/projects/RMリファラル/cloudflare-site/`。作業元のGit状態、`AGENTS.md`、`package.json`を確認する。

## 最初に現行運用の入口を確認する

作業開始時に [CURRENT.md](../../../docs/operations/CURRENT.md) を読み、適用する運用仕様ID・Version・状態を確認する。
Phase 0原本・再設計はCURRENT.mdからPHASE0.md、公開・復旧はRELEASE.md、一時成果物・保管・削除はRETENTION.mdを参照する。
これらの運用ルールをこのSkillで再定義しない。文書との矛盾がある場合は該当処理を停止して参照元を報告する。

CURRENT.mdで示されるDESIGN_ONLY・Genesis未認定・新方式公開不許可を、このSkillの変更で解除しない。
既存公開方式を自動的に無効化したとも扱わない。公開要求で旧方式・新方式のどちらを使うべきか判断できない場合は停止して確認する。
このSkillには公開・復旧の実行手順を置かず、candidate・baseline、検証範囲、承認、Upload・切り替え、証跡保存、rollbackは現行運用文書へ委譲する。
一時成果物の作成・保護が関係する作業もCURRENT.mdからRETENTION.mdと台帳を確認し、このSkill独自の維持・削除条件を設けない。

## 編集箇所を絞る

| 変更内容 | 編集元 |
| --- | --- |
| ヘッダー・フッター・CTA | `astro-site/src/components/` |
| 全ページのhead・SEO共通設定 | `astro-site/src/layouts/BaseLayout.astro` |
| 紹介URL・言語別UI・ホームナビ | `astro-site/src/config/site.ts`、`astro-site/src/i18n/` |
| ページ固有本文・メタ情報 | `content/pages/{locale}/{route}/page.json` |
| 共通スタイル・動作 | `css/`、`js/` |

必要な部品・辞書・対象ページを読む。共通変更を数千件のHTMLへの置換で実施しない。
既存ページを初めて編集する場合は `npm run page:edit -- en guide/replacement-program` のように取得し、表示された `page.json` を編集する。既存ファイルは上書きされない。
共通ヘッダー・フッター・DOCTYPE・html/head/bodyは本文へ書かない。新規ページも同じデータ形式を使用し、完成HTMLを直接追加しない。
店舗の新規追加・データ形式変更では、列挙処理と生成URLの対応も確認する。

旧HTMLは互換アダプターが本文抽出に使う凍結入力。直接編集やコピー公開を行わず、必要な本文を共通レイアウトへ渡す。
`content/legacy-pages.json` のhashを本文編集のために更新・リセットしない。

## 記事データと個別生成の技術手順

`page.json`は `locale`、`route`（先頭末尾の `/` なし）、`title`、`description`、`mainHtml`（`<main>...</main>`）を持つ。
必要な場合だけ `robots`、`schemas`、`styles`、`scripts`を追加する。後3項目は文字列の配列。既存本文を保持し、共通CSSを使う。
新規ページはルート一覧・サイトマップの列挙対象になるため、URL重複と同言語の導線を確認する。

記事個別生成の技術的入口は、[package.json](../../../package.json) の `build:page` と [build-page.mjs](../../../scripts/build-page.mjs)。
明示された生成作業では対象の `locale/route` を指定する。生成先・実行許可・検証範囲はCURRENT.mdを入口に判断する。
この技術情報から公開手順や全件ビルドの実行許可を導かない。

新規の検索意図別記事は `topics/`、制度・手順を体系的に説明するガイドは `guide/` として分ける。
`npm run page:new-topic -- <locale> <slug>` で `pageType: guide-topic-v1` の構造化データを作り、[ページ制作規約](../../../docs/page-design/guide-topic-regulation.md) の制作・情報設計・品質基準を参照する。
`guide-topic-v1`では自由記述の `mainHtml`を使わず、ヘッダー、フッター、パンくず、記事幅、ヒーロー、出典、更新日、CTA、関連ページを固定部品で構成する。
本文は `prose`、`steps`、`comparison`、`cards`、`warning`、`faq`、`table`、`media` から選ぶ。
新しい表現はページ固有HTML/CSSで回避せず、共通セクション型として実装・確認する。既存ページの移行は明示された対象に限定する。

楽天ID図解は `astro-site/src/components/RakutenIdCreationGuide.astro` と参照データを編集する。
`create-rakuten-id-step-by-step`を汎用本文で重複定義しない。

## 多言語URLとWorker変換の専門知識

言語と公開prefixの技術的対応は [locale-mapping.mjs](../../../scripts/locale-mapping.mjs) を参照する。

| Locale | 公開prefix | Topicの例 |
| --- | --- | --- |
| ja | なし | `/topics/<slug>/` |
| en | `/en` | `/en/topics/<slug>/` |
| ko | `/ko` | `/ko/topics/<slug>/` |
| pt | `/pt` | `/pt/topics/<slug>/` |
| vi | `/vi` | `/vi/topics/<slug>/` |
| zh | `/zh` | `/zh/topics/<slug>/` |

`/ja/`を導入しない。外国語の通常の内部リンクは同一言語へ向け、未翻訳先を日本語へフォールバックさせない。
明示的な言語切り替えと外部公式サイトは区別し、日本語の外部情報はその旨を表示する。
selector・hreflangへ未公開URLを混入させない。既存ページのhreflang修正を、無関係な記事編集へ混ぜない。
公開状態の認定・対象への束縛条件はCURRENT.mdを入口とする運用文書に従う。

静的生成内容とWorkerのHTMLRewriter後の応答を区別する。
変換対象ではWorkerと一致する変換期待値を用い、非変換対象と取り違えない。比較不一致を解消するために変換routeを拡張しない。
比較範囲・実行時期・完了判定は現行運用文書へ委譲する。

## 履歴資料の扱い

過去の監査記録・旧手順は履歴・参考情報であり、現在有効な操作指示ではない。
必要な専門資料に旧運用手順が含まれる場合も、操作の判断はCURRENT.mdを入口として行う。
