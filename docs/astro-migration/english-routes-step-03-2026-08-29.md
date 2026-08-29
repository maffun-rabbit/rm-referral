---
date: 2026-08-29
tags: [RMリファラル, Astro, 英語, Cloudflare, 移行計画]
---

# 工程3：英語ページのAstroルート接続と生成

## 完了した実装

英語の既存URLを維持したまま、全公開ページをAstroの静的ルートへ接続した。

| 種別 | Astroルート | 件数 |
|---|---|---:|
| トップ | `/en/` | 1 |
| 都道府県トップ | `/en/{prefecture}/` | 47 |
| ショップ | `/en/{prefecture}/{carrier}/{slug}/` | 6,714 |
| エリアカバレッジ | `/en/{prefecture}/coverage/{slug}/` | 53 |
| ガイド | `/en/guide/{path}/` | 19 |
| 合計 |  | 6,834 |

さらに、`/en/robots.txt`と`/en/sitemap.xml`もAstro出力へ接続した。

## 実装ファイル

- 英語互換ローダー: `astro-site/src/data/load-english-pages.ts`
- 英語トップ: `astro-site/src/pages/en/index.astro`
- 都道府県トップ: `astro-site/src/pages/en/[prefecture]/index.astro`
- ショップ: `astro-site/src/pages/en/[prefecture]/[carrier]/[slug]/index.astro`
- エリアカバレッジ: `astro-site/src/pages/en/[prefecture]/coverage/[slug]/index.astro`
- ガイド: `astro-site/src/pages/en/guide/[...path].astro`
- robots／sitemap: `astro-site/src/pages/en/`
- 基本検証: `astro-site/tests/english-routes.test.mjs`

## 検証結果

- Astro全体ビルド: 20,331ページ、成功
- Nodeテスト: 48件すべて成功
- 英語Astro公開HTML: 6,834件
- 英語ショップ: 6,714件
- 英語カバレッジ: 53件
- 英語ガイド: 19件
- 代表ショップの`html lang="en"`: 確認済み
- 代表ショップのcanonical: `https://mnp-navi.jp/en/`配下を確認
- 代表ショップの旧Workers URL: 残存なし
- 英語共通CTA: 表示を確認

## 言語別成果物

`node scripts/build-language.mjs en`で`.deploy/en/`を生成し、検証に成功した。

- Worker: `rm-referral-en`
- 公開パス: `/en/`
- 全ファイル: 6,845件
- HTML: 6,835件
- Astroオーバーレイ: 6,836件
- エラー: 0件

HTMLが公開ページ数より1件多いのは、Google Search Console所有権確認ファイル`google55b1c42743aa7ee2.html`を維持しているため。公開コンテンツの差分ではない。

## 次工程

工程4では、英語6,834ページ全件を対象にcanonical、hreflang、内部リンク、旧Workers URL、日本語UI残存、構造化データ、サイトマップ収録を検証する。
