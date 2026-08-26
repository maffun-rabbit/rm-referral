# RMリファラル Astro移行環境

現行の `cloudflare-site/` を直接変更せず、Astroへの段階移行を検証するための独立環境です。

## コマンド

```bash
npm install
npm run build
npm run dev
```

## 方針

- `output: "static"` で完成HTMLを生成する。
- `trailingSlash: "always"` と `build.format: "directory"` により、既存の `/path/index.html` 構造を維持する。
- 現行サイトと同じURLを生成できるまで、本番デプロイ元には使用しない。
- 生成物の `dist/` と `node_modules/` はGit管理しない。
