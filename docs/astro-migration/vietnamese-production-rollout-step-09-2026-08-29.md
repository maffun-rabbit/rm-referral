---
date: 2026-08-29
tags: [RMリファラル, Astro, ベトナム語, Cloudflare, Search Console, 本番公開]
---

# 工程9：ベトナム語サイトの本番公開

## 公開内容

- ベトナム語Worker `rm-referral-vi` を `mnp-navi.jp/vi/*` へ接続した。
- ベトナム語サイト全体をAstro成果物で再構築し、Cloudflare Workersへデプロイした。
- 日本語サイトは従来どおり `mnp-navi.jp/*` の日本語Workerで配信し、表示が維持されていることを確認した。

## Cloudflare設定

- Route: `mnp-navi.jp/vi/*`
- Worker: `rm-referral-vi`
- Cloudflare Version ID: `37b1267c-4848-40f0-952a-40003d5167ce`
- Worker成果物: **6,852ファイル、HTML 6,835件**
- Astroオーバーレイ: **6,783件**
- apexにプロキシ済みAレコードを追加し、Workerルートへ到達できるようにした。
- カスタムルート設定後、ベトナム語Workerの `workers.dev` URLは無効化され、正式ドメインを公開先とした。

## 本番確認

| 対象 | 結果 |
|---|---:|
| ベトナム語トップ `/vi/` | HTTP 200 |
| 東京都トップ `/vi/tokyo/` | HTTP 200 |
| 代表店舗ページ | HTTP 200・ローカル成果物と一致 |
| 代表トピックページ | HTTP 200・ローカル成果物と一致 |
| CSS | HTTP 200 |
| サイトマップ `/vi/sitemap.xml` | HTTP 200・6,834 URL |
| robots.txt `/vi/robots.txt` | HTTP 200 |
| 存在しない `/vi/` 配下URL | HTTP 404 |
| 日本語トップ `/` | HTTP 200・`lang="ja"`を維持 |

代表4ページの本番HTMLはローカルの `.deploy/vi` とバイト単位で一致した。サイトマップに旧Workers URLは含まれていない。

## Google Search Console

- `mnp-navi.jp` のドメインプロパティをDNS TXTレコードで所有権確認した。
- `https://mnp-navi.jp/vi/sitemap.xml` を2026年8月29日に送信した。
- Search Consoleは送信を受理したが、送信直後の初回読み込みは「取得できませんでした」と表示された。
- 公開サイトマップ自体はHTTP 200で取得できるため、DNS追加直後の反映差を考慮し、Search Console側の再取得結果を継続確認する。

## GitHub

- 本番ルート設定コミット: `fc0353c6a0`（`Route Vietnamese site on mnp-navi.jp`）
- 無関係な中国語ページのステージ済みファイル13件は変更・コミットしていない。

## 次工程

1. Search Consoleでベトナム語サイトマップが「成功しました」へ変わることを確認する。
2. 次の対象である英語サイトを、ベトナム語と同じ独立Worker・言語別パス方式でAstro化する。
3. 英語公開後に `mnp-navi.jp/en/*` のルート、サイトマップ、Search Console登録を確認する。
