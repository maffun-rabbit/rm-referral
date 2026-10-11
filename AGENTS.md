# RMリファラル（GitHub＋Cloudflare）

## Phase 0 運用入口（設計段階）

- 作業開始時に [docs/operations/CURRENT.md](docs/operations/CURRENT.md) を確認し、運用仕様ID・Version・状態を確認する。
- 目的に応じてCURRENT.mdからPHASE0.md、RELEASE.md、RETENTION.mdを参照する。
- 旧運用指示と矛盾する場合は該当処理を停止し、矛盾と参照元を報告する。
- 過去の検証clone・archive内のAGENTS.mdを現行ルールとして採用しない。
- 一時成果物の保護期限・削除条件はRETENTION.mdと台帳に従う。期限のない保留を提案しない。
- 削除と公開には独立したユーザー承認が必要。今回の文書作成はその承認ではない。
- 現在はDESIGN_ONLY、Genesis未認定、新方式の公開不許可。以下の既存開発手順を無条件に置き換えない。
- 正式mainへ反映後は、この入口をプロジェクト作業に適用する。古いcloneは自動更新されない。既存公開経路への機械制御は未接続。

## 既存開発手順（正式切り替え前は維持）

このリポジトリのサイト変更は、使用モデルを問わず `.agents/skills/rm-cloudflare-components/SKILL.md` を読んで従う。

- UIは `astro-site/src/components/`、全体は `BaseLayout.astro`、言語別文言は `src/i18n/` を編集する。
- 本文編集は `npm run page:edit -- <locale> <route>` で取得する `content/pages/.../page.json`。旧HTMLは凍結入力。直接編集・コピー公開しない。
- 日本語の通常記事更新は `RM_PAGE` と承認済みProduction Baseline planを指定し、`npm run deploy -- ja` を入口に対象HTMLだけを生成する。`npm run test:shared`、`npm run test:deploy-boundary`、`npm run test:bootstrap`を通す。
- 通常公開ではProduction Baselineからclean candidateを作り、allowlist外変更・削除・version driftがあれば停止する。Wranglerのbuildフックを迂回しない。
- 全体生成は `npm run maintenance:full-build` のみ。maintenance / migration / disaster recovery専用で、通常の記事更新・deploy・rollbackから呼ばない。
- 未翻訳の内部リンクを日本語へ向けない。公開を確認するまで公開済みと報告しない。
- 調査・状態確認だけの依頼は読み取り専用。公開・削除の承認を推測で広げない。
- 新規 `topics/` ページは `npm run page:new-topic -- <locale> <slug>` で作成し、`docs/page-design/guide-topic-regulation.md` を必ず守る。`guide/` は体系的なガイド、`topics/` は個別検索意図の記事として分ける。固定シェルを `mainHtml`、ページ固有CSS、ページ固有JSで上書きしない。
