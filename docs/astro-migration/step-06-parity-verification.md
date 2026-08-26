---
date: 2026-08-26
tags: [RMリファラル, Cloudflare, Astro, 移行検証]
---

# 工程6：旧HTMLとAstro版の一致検証

## 比較対象

- 旧HTML: `tokyo/au/au-shop-narimasu/index.html`
- Astro出力: `astro-site/dist/tokyo/au/au-shop-narimasu/index.html`
- 比較スクリプト: `astro-site/scripts/compare-shop-page.mjs`
- 実行コマンド: `npm run verify:parity`

## 比較結果

| 項目 | 結果 |
|---|---|
| title | 一致 |
| meta description | 一致 |
| canonical URL | 一致 |
| main内の表示テキスト | 一致 |
| h1〜h3の内容と順序 | 一致 |
| JSON-LD構造化データ | 一致 |
| main内のリンクURLと順序 | 一致 |
| 外部JavaScriptのURLと順序 | 一致 |

## 件数比較

| 指標 | 旧HTML | Astro版 |
|---|---:|---:|
| 見出し | 26 | 26 |
| main内リンク | 18 | 18 |
| JSON-LD | 2 | 2 |
| 外部JavaScript | 3 | 3 |
| main内の表示文字数 | 2,615 | 2,615 |

## 検証中に修正した点

追従CTAの表示制御が、Astroコンポーネント内のインライン処理と既存の `/js/shop-cta.js` の両方で実行されていた。共通コンポーネントから外部JavaScriptを1回だけ読み込む構成に統一し、旧HTMLと同じ3本の外部JavaScript構成に修正した。

## 自動検証

- `npm test`: 9件成功、失敗0件。
- 比較に不一致がある場合、`npm test` と `npm run verify:parity` は失敗終了する。
- 現行HTML、本番Workers、既存の未追跡ファイルは変更していない。

## 次工程

工程7では、代表ページで確認したデータ構造とテンプレートを使い、1都道府県分のショップページをAstroで全件生成する。
