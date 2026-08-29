# 中国語Astro化 工程6：本番公開

- 実施日: 2026-08-30
- 本番URL: https://mnp-navi.jp/zh/
- Cloudflare route: `mnp-navi.jp/zh/*`
- Worker: `rm-referral-zh`
- Version ID: `e0b9248b-7b84-4e80-80ca-14f7eeb6cc20`
- 結果: 合格

## 本番確認

- トップ、都道府県、店舗、通信品質、ガイド、CSS、sitemap、robots: HTTP 200
- 存在しない中国語URL: HTTP 404
- 日本語 `/`、英語 `/en/`、ベトナム語 `/vi/`: HTTP 200
- PC・スマートフォン表示、店舗検索、canonical、画像、コンソールを実ブラウザーで確認
