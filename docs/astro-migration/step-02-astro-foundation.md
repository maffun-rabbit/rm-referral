---
date: 2026-08-26
tags: [RMリファラル, Cloudflare, Astro, 移行]
---

# 工程2：Astroの土台

## 実施内容

- 現行HTMLとは独立した `astro-site/` を新設。
- Astro `7.2.7` を固定して導入。
- Node.js `22.13.0` 以上を指定。
- `output: "static"` を指定。
- `trailingSlash: "always"` と `build.format: "directory"` を指定し、既存のディレクトリ型URLを維持できる構成にした。
- `dist/`、`node_modules/`、`.astro/` をGit管理対象外にした。
- Astroのテレメトリーをプロジェクトコマンドで無効化し、Macの保護領域へ設定を書き込まないようにした。

## 検証結果

- `npm install`: 成功
- インストール: 201パッケージ
- 既知の脆弱性: 0件
- `npm run build`: 成功
- 出力形式: static
- 出力先: `astro-site/dist/`
- 生成ページ: 1件
- ビルド時間: 約1.30秒
- 出力確認: `dist/index.html`
- 検証ページ: `noindex, nofollow`

## 影響範囲

- 現行の約5万HTML: 変更なし
- 既存Workers設定: 変更なし
- 本番デプロイ: なし
- 既存の未追跡 `index 2.html` 13件: 変更なし

## 次工程

工程3で、ヘッダー、フッター、CTAの共通コンポーネントと、言語辞書の基礎を作成する。
