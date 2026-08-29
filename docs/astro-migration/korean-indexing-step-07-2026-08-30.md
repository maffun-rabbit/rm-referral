# 韓国語Astro化 工程7：インデックス設定

- 実施日: 2026-08-30
- サイトマップ: https://mnp-navi.jp/ko/sitemap.xml
- 結果: 完了

## 公開側の検証

- `robots.txt` のSitemap指定: `https://mnp-navi.jp/ko/sitemap.xml`
- sitemap URL数: 6,834
- Googlebotによる代表店舗ページの応答: HTTP 200
- canonical: 韓国語の正式URL
- hreflang: `ja-JP`、`vi-VN`、`en`、`zh-CN`、`ko-KR`、`pt-BR`、`x-default`

## Google Search Console

- 送信日: 2026-08-30
- ステータス: 成功しました
- 検出されたページ数: 6,834
- 検出された動画数: 0

初回送信直後は公開ルートの伝播タイミングにより「取得できませんでした」と表示されたが、公開レスポンスが中国語版と同一条件であることを確認後に再取得し、正常処理を確認した。

これにより、韓国語サイトのAstro移行工程1〜7を完了した。
