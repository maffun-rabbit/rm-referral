# RMリファラル（GitHub＋Cloudflare）

このリポジトリのサイト変更は、使用モデルを問わず `.agents/skills/rm-cloudflare-components/SKILL.md` を読んで従う。

- UIは `astro-site/src/components/`、全体は `BaseLayout.astro`、言語別文言は `src/i18n/` を編集する。
- 本文編集は `npm run page:edit -- <locale> <route>` で取得する `content/pages/.../page.json`。旧HTMLは凍結入力。直接編集・コピー公開しない。
- 日本語の通常記事更新は `RM_PAGE` と承認済みProduction Baseline planを指定し、`npm run deploy -- ja` を入口に対象HTMLだけを生成する。`npm run test:shared`、`npm run test:deploy-boundary`、`npm run test:bootstrap`を通す。
- 通常公開ではProduction Baselineからclean candidateを作り、allowlist外変更・削除・version driftがあれば停止する。Wranglerのbuildフックを迂回しない。
- 全体生成は `npm run maintenance:full-build` のみ。maintenance / migration / disaster recovery専用で、通常の記事更新・deploy・rollbackから呼ばない。
- 未翻訳の内部リンクを日本語へ向けない。公開を確認するまで公開済みと報告しない。
- 調査・状態確認だけの依頼は読み取り専用。公開・削除の承認を推測で広げない。
