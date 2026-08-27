# RMリファラル Astro移行環境

現行の `cloudflare-site/` を直接変更せず、Astroへの段階移行を検証するための独立環境です。

## コマンド

```bash
npm install
npm run build
npm run dev
```

言語別Workerの成果物はリポジトリルートから作成する。

```bash
node scripts/build-language.mjs vi
```

成果物は `.deploy/vi/vi/` のように、Worker別ディレクトリの内側へ公開URLと同じ言語プレフィックスを残す。実際の公開が承認された場合だけ、共通デプロイスクリプトを実行する。

```bash
scripts/deploy-language.sh vi
```

## 方針

- `output: "static"` で完成HTMLを生成する。
- `trailingSlash: "always"` と `build.format: "directory"` により、既存の `/path/index.html` 構造を維持する。
- 現行サイトと同じURLを生成できるまで、本番デプロイ元には使用しない。
- 生成物の `dist/` と `node_modules/` はGit管理しない。
- Astroの共通ソースは一本化し、`.deploy/ja`、`.deploy/vi`、`.deploy/en`、`.deploy/zh`、`.deploy/ko`、`.deploy/pt` を別々に生成・検証・デプロイする。
