---
date: 2026-08-27
tags: [RMリファラル, Astro, 九州, 沖縄, Cloudflare]
---

# 九州・沖縄 Astro移行・公開記録

## 実施内容

- 福岡県: 322店舗ページ
- 佐賀県: 47店舗ページ
- 長崎県: 86店舗ページ
- 熊本県: 96店舗ページ
- 大分県: 71店舗ページ
- 宮崎県: 68店舗ページ
- 鹿児島県: 93店舗ページ
- 沖縄県: 131店舗ページ
- 今回の移行: **914店舗ページ**
- Astro移行済み累計: **47都道府県・6,714店舗ページ**

## 検証結果

- Astro生成: 6,716ページ（店舗6,714ページ、プレビュー2ページ）
- 自動テスト: 28件成功、失敗0件
- canonical重複: 0件
- サイトマップ収録: 移行済み6,714店舗ページを確認
- 本番オーバーレイ: 7,955 HTMLを維持
- 既存の周辺案内ページ: 47都道府県・1,185ページを維持
- 日本語トップ、都道府県トップ、サイトマップを維持

## 本番確認

九州・沖縄8県から各1店舗を抽出し、Astro生成HTMLと本番取得HTMLのSHA-256がすべて一致することを確認した。

- 福岡: `/fukuoka/au/au-shop-aeon-mall-chikushino/`
- 佐賀: `/saga/au/au-shop-furesupo-tosu/`
- 長崎: `/nagasaki/au/au-shop-aino-tembo-dai/`
- 熊本: `/kumamoto/au/au-shop-arao/`
- 大分: `/oita/au/au-shop-beppu-chuo/`
- 宮崎: `/miyazaki/au/au-shop-aeon-mall-miyazaki/`
- 鹿児島: `/kagoshima/au/au-shop-aeon-taun-aira/`
- 沖縄: `/okinawa/au/au-shop-aeon-gushikawa/`
- 福岡県トップ: HTTP 200
- 沖縄県トップ: HTTP 200
- `sitemap.xml`: HTTP 200
- 内部キャッシュ用パス: HTTP 404

## 公開情報

- 公開URL: https://rm-referral.maffun.workers.dev/
- 実装コミット: `abda48ec06`
- Cloudflare Version ID: `a64392f5-8890-41cd-a15a-3b7d5df26396`

## 現在の移行状態

- 日本語店舗ページは全47都道府県・6,714件をAstro化済み
- 日本語トップ、都道府県トップ、周辺案内は旧静的HTMLを維持
- 共通ヘッダー、CTA、フッターはAstroコンポーネントで管理
- Reactは現時点では不要なため導入していない
- 外国語5言語は従来構成を維持

## 次工程

- 外国語ページのAstro移行方針を言語単位で適用する。
