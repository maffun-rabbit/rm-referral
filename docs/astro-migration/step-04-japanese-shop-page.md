---
date: 2026-08-26
tags: [RMリファラル, Cloudflare, Astro, 日本語ページ]
---

# 工程4：日本語ショップページ1件のAstro化

## 対象

- 現行URL: `https://rm-referral.maffun.workers.dev/tokyo/au/au-shop-narimasu/`
- 現行HTML: `tokyo/au/au-shop-narimasu/index.html`
- Astroソース: `astro-site/src/pages/tokyo/au/au-shop-narimasu/index.astro`
- 静的出力: `astro-site/dist/tokyo/au/au-shop-narimasu/index.html`

## 実施内容

- 「ａｕショップ 成増」を代表ページとして、既存URLと同じパスへ静的出力した。
- title、description、canonical、robots、OGP、WebPage・BreadcrumbList構造化データを維持した。
- 本文、地域トピック、最寄りの楽天モバイルショップ、関連店舗をAstroソースへ移した。
- ヘッダー、フッター、主要CTA、最終CTA、追従CTAは工程3の共通コンポーネントを使用した。
- 既存のCSS、GA4用JavaScript、追従CTA用JavaScriptをビルド前にコピーする仕組みにした。

## 検証結果

- `npm test`: 5件すべて成功。
- 生成URL、主要SEOメタ情報、2種類の構造化データ、3種類のCTA、地域情報、JavaScript資産の存在を自動検証した。
- 現行HTMLと本番環境は変更・公開していない。

## 次工程との境界

- 旧HTMLと新HTMLの詳細なタイトル・本文・構造化データ比較は工程6で実施する。
- 工程5ではベトナム語辞書を追加し、多言語展開時に本文と共通部品を分離できる構成を確認する。
