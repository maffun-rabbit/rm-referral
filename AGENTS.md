# RMリファラル（GitHub＋Cloudflare）

このリポジトリのサイト変更は、使用モデルを問わず `.agents/skills/rm-cloudflare-components/SKILL.md` を読んで従う。

- UIは `astro-site/src/components/`、全体は `BaseLayout.astro`、言語別文言は `src/i18n/` を編集する。
- 本文編集は `npm run page:edit -- <locale> <route>` で取得する `content/pages/.../page.json`。旧HTMLは凍結入力。直接編集・コピー公開しない。
- 生成は `npm run build`、検証は `npm run test:shared` と `npm run verify:release`。
- 承認済み公開は `npm run deploy -- <locale>`。Wranglerのbuildフックを迂回しない。
- 未翻訳の内部リンクを日本語へ向けない。公開を確認するまで公開済みと報告しない。
- 調査・状態確認だけの依頼は読み取り専用。公開・削除の承認を推測で広げない。
