---
date: 2026-08-26
tags: [RMリファラル, Cloudflare, Astro, 共通コンポーネント]
---

# 工程3：共通コンポーネント

## 作成した共通パーツ

- `SiteHeader.astro`: サイト名、ホームリンク、ページ別の補助リンク
- `SiteFooter.astro`: サイト名、運営者表記、紹介リンク表記
- `PrimaryCta.astro`: ファーストビュー付近のポイント訴求とCTA
- `FinalCta.astro`: ページ末尾のキャンペーンCTA
- `FloatingCta.astro`: 通常CTA通過後から最終CTA手前まで表示する追従CTA
- `BaseLayout.astro`: head、OGP、ヘッダー、本文、フッターの共通レイアウト

## 共通設定

- 紹介URLは `src/config/site.ts` の `REFERRAL_URL` に集約。
- 日本語のサイト名、キャンペーン文言、ポイント数、注意書きは `src/i18n/ja.ts` に集約。
- 言語辞書の型は `src/i18n/types.ts` で固定。
- 工程5でベトナム語辞書を追加できる構造にした。

## CSSの扱い

現行 `css/style.css` には、ブラウザでは利用できるもののAstroのCSS圧縮処理が拒否する既存構文が含まれる。そのため現行CSSをAstroへimportして再処理せず、`scripts/sync-static-assets.mjs` で静的アセットとしてそのまま同期する。

- CSSの正本: `cloudflare-site/css/style.css`
- Astro検証用コピー: `astro-site/public/css/style.css`（Git管理外）
- ビルド出力: `astro-site/dist/css/style.css`
- 3ファイルのSHA-256一致を確認済み

## 検証結果

- 静的ビルド: 成功
- 共通ヘッダー: 1件
- 共通フッター: 1件
- 通常CTA: 出力確認済み
- 最終CTA: 出力確認済み
- 追従CTA: 出力および制御スクリプト確認済み
- 紹介URL: 3つのCTAすべてで共通設定を使用
- 自動テスト: 4件成功、失敗0件
- 検証ページ: `noindex, nofollow`

## 影響範囲

- 現行の約5万HTML: 変更なし
- 現行CSSの正本: 変更なし
- 既存Workers設定: 変更なし
- 本番デプロイ: なし
- 既存の未追跡 `index 2.html` 13件: 変更なし

## 次工程

工程4で、東京都の `auショップ 成増` を代表ページとしてAstroへ移植し、既存と同じURL構造で静的生成する。
