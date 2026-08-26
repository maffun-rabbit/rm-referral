---
date: 2026-08-27
tags: [RMリファラル, Astro, 中国地方, 四国, Cloudflare]
---

# 中四国 Astro移行・公開記録

## 実施内容

- 鳥取県: 34店舗ページ
- 島根県: 45店舗ページ
- 岡山県: 120店舗ページ
- 広島県: 176店舗ページ
- 山口県: 83店舗ページ
- 徳島県: 49店舗ページ
- 香川県: 69店舗ページ
- 愛媛県: 93店舗ページ
- 高知県: 52店舗ページ
- 今回の移行: **721店舗ページ**
- Astro移行済み累計: **39都道府県・5,800店舗ページ**

## 検証結果

- Astro生成: 5,802ページ（店舗5,800ページ、プレビュー2ページ）
- 自動テスト: 26件成功、失敗0件
- canonical重複: 0件
- サイトマップ収録: 移行済み5,800店舗ページを確認
- 本番オーバーレイ: 7,955 HTMLを維持
- 既存の周辺案内ページ: 39都道府県・1,002ページを維持
- 日本語トップ、都道府県トップ、サイトマップを維持

## 本番確認

中四国9県から各1店舗を抽出し、Astro生成HTMLと本番取得HTMLのSHA-256がすべて一致することを確認した。

- 鳥取: `/tottori/au/au-shop-maibara/`
- 島根: `/shimane/au/au-shop-aeon-mall-izumo/`
- 岡山: `/okayama/au/au-shop-aeon-mall-okayama/`
- 広島: `/hiroshima/au/au-shop-aeon-mall-hiroshima-fuchu/`
- 山口: `/yamaguchi/au/au-shop-aeon-hikari/`
- 徳島: `/tokushima/au/au-shop-aizumi/`
- 香川: `/kagawa/au/au-shop-azushima/`
- 愛媛: `/ehime/au/au-shop-aeon-mall-imabari-shin-toshi/`
- 高知: `/kochi/au/au-shop-aeon-mall-kochi/`
- 広島県トップ: HTTP 200
- `sitemap.xml`: HTTP 200
- 内部キャッシュ用パス: HTTP 404

## 公開情報

- 公開URL: https://rm-referral.maffun.workers.dev/
- 実装コミット: `fc6793b090`
- Cloudflare Version ID: `d1a21256-70d6-4b4e-ae5f-1a39ff71e89b`

## 現在の移行境界

- Astro化済み: 北海道から四国までの日本語店舗ページ5,800件
- 旧静的HTMLを維持: 日本語トップ、都道府県トップ、周辺案内、九州・沖縄の店舗ページ
- 共通ヘッダー、CTA、フッターはAstroコンポーネントで管理
- Reactは現時点では不要なため導入していない
- 外国語5言語は従来構成を維持

## 次工程

- 九州・沖縄の日本語店舗ページをAstroへ移行する。
