---
date: 2026-08-29
tags: [RMリファラル, Astro, 中国語, Cloudflare, 移行計画]
---

# 工程3：中国語ページのAstroルート接続と生成

## 接続したルート

| 種別 | Astroルート | 件数 |
|---|---|---:|
| トップ | `/zh/` | 1 |
| 都道府県 | `/zh/[prefecture]/` | 47 |
| ショップ | `/zh/[prefecture]/[carrier]/[slug]/` | 6,714 |
| エリアカバレッジ | `/zh/[prefecture]/coverage/[slug]/` | 53 |
| ガイド | `/zh/guide/[...path]/` | 19 |
| 合計 |  | 6,834 |

`/zh/robots.txt`と`/zh/sitemap.xml`もAstro出力へ接続した。

## 生成結果

- Astro全体ビルド: 27,165ページ、成功
- 中国語Astro公開HTML: 6,834件
- 中国語サイトマップ: 6,834 URL
- 中国語Worker用成果物: 6,845ファイル
- Worker用HTML: 6,835ファイル（公開6,834ページとGoogle確認HTML）
- Astroオーバーレイ: 6,836ファイル

## 代表ページ確認

`/zh/tokyo/au/au-shop-narimasu/`で次を確認した。

- `html lang="zh-CN"`
- canonical: `https://mnp-navi.jp/zh/...`
- `og:locale="zh_CN"`
- 6言語とx-defaultのhreflang
- CSS・JavaScript: `/zh/`配下
- 構造化データ: `inLanguage="zh-CN"`
- 共通CTA: 中国語表示
- 旧中国語Workers URLなし

## 回帰検証

- 全51テスト: 成功
- 日本語ショップ同等性: 成功
- 日本語6,714ショップ検証: 成功
- 英語6,834ページ検証: 成功
- ベトナム語ページ検証: 成功

## 工程4で確認する事項

現行中国語ソースには、特に53件のエリアカバレッジページを中心に日本語本文・見出し・SEO文言が残っている。工程3では既存コンテンツを欠落なくAstroへ接続することを優先した。

工程4では中国語6,834ページ全件を対象に、次を検査・修正する。

- 日本語UI・本文・SEO文言の残存
- canonical、hreflang、構造化データ
- 内部リンクと旧Workers URL
- サイトマップとrobots.txt
- 中国語として不自然な共通表現
