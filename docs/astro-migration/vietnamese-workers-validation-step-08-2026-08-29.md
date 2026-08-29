---
date: 2026-08-29
tags: [RMリファラル, Astro, ベトナム語, Cloudflare, Workers, 公開前検証]
---

# 工程8：ベトナム語Worker公開前検証

## 実施内容

- ベトナム語サイト全体のAstroビルド、回帰テスト、言語別Worker成果物検査を再確認した。
- `wrangler.vi.jsonc` にカスタムドメインのrouteがなく、検証用Workers URLだけを更新する設定であることを確認した。
- CloudflareのOAuthログイン先が対象アカウントであることを確認した。
- `rm-referral-vi` をCloudflareへデプロイし、検証用Workers URLで代表ページと静的アセットを取得した。
- 配信された代表HTMLと `.deploy/vi` のローカル成果物をバイト単位で照合した。

## デプロイ結果

- Worker: `rm-referral-vi`
- 検証URL: `https://rm-referral-vi.maffun.workers.dev/vi/`
- Cloudflare Version ID: `036b3fe8-9240-45b2-a509-af208b9c83f4`
- 更新された静的アセット: **6,783件**
- 既に登録済みで再利用された静的アセット: **69件**
- Worker成果物: **6,852ファイル、HTML 6,835件**

## Workers URLでの確認結果

| 対象 | 結果 |
|---|---:|
| ベトナム語トップ `/vi/` | HTTP 200・ローカル成果物と一致 |
| 東京都トップ `/vi/tokyo/` | HTTP 200・ローカル成果物と一致 |
| 代表店舗 `/vi/tokyo/au/au-shop-narimasu/` | HTTP 200・ローカル成果物と一致 |
| 代表トピック `/vi/guide/topics/rakuten-id-required-no-shopping-needed/` | HTTP 200・ローカル成果物と一致 |
| CSS `/vi/css/style.css` | HTTP 200 |
| サイトマップ `/vi/sitemap.xml` | HTTP 200・6,834 URL・旧Workers URLなし |
| robots.txt `/vi/robots.txt` | HTTP 200・正式サイトマップURLを参照 |
| 存在しない `/vi/` 配下URL | HTTP 404 |
| Worker直下 `/` | HTTP 404（`/vi/` のみを配信するため想定どおり） |

## SEO・表示検査

- `html lang="vi"`、`og:locale="vi_VN"` を確認した。
- canonicalは `https://mnp-navi.jp/vi/` 配下を参照している。
- Workers URLはcanonical、構造化データ、サイトマップへ含まれていない。
- 店舗ページの通常CTA、最終CTA、追従CTAと正式日本語店舗名を確認した。
- ガイドページの紹介CTA、画像、公式リンク、店舗検索への戻り導線を確認した。
- 日本語UIの残存は検出されなかった。

## この工程で変更していないもの

- `mnp-navi.jp/vi/*` のCloudflare Workerルート
- DNS設定
- 日本語Worker `rm-referral`
- Google Search Consoleへのサイトマップ送信

## 次工程

工程9では `mnp-navi.jp/vi/*` を `rm-referral-vi` へ接続し、正式URL上でトップ・都道府県・店舗・トピック・静的アセット・404を再確認する。問題がなければベトナム語サイトマップをGoogle Search Consoleへ送信する。
