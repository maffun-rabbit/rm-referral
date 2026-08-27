---
date: 2026-08-27
tags: [RMリファラル, Astro, 多言語, Cloudflare, URL設計]
---

# mnp-navi.jp 多言語URL・ルーティング仕様

## 目的

`mnp-navi.jp` に検索評価と計測を集約しながら、各言語を独立したCloudflare Workerとしてビルド・検証・公開できる構成にする。

## 正式URL

- 正式オリジン: `https://mnp-navi.jp`
- 日本語は言語プレフィックスを付けない。
- 外国語は小文字のISO言語コードを第1階層に付ける。
- ディレクトリURLは末尾スラッシュありを正規URLとする。
- URLによる言語の自動判定・自動転送は行わない。利用者が言語切替を明示的に選ぶ。

| 移行順 | 言語 | 言語コード | 正式トップURL | Worker | Cloudflareルート |
|---:|---|---|---|---|---|
| 0 | 日本語 | `ja` | `https://mnp-navi.jp/` | `rm-referral` | `mnp-navi.jp/*` |
| 1 | ベトナム語 | `vi` | `https://mnp-navi.jp/vi/` | `rm-referral-vi` | `mnp-navi.jp/vi/*` |
| 2 | 英語 | `en` | `https://mnp-navi.jp/en/` | `rm-referral-en` | `mnp-navi.jp/en/*` |
| 3 | 中国語（簡体字） | `zh` | `https://mnp-navi.jp/zh/` | `rm-referral-zh` | `mnp-navi.jp/zh/*` |
| 4 | 韓国語 | `ko` | `https://mnp-navi.jp/ko/` | `rm-referral-ko` | `mnp-navi.jp/ko/*` |
| 5 | ポルトガル語 | `pt` | `https://mnp-navi.jp/pt/` | `rm-referral-pt` | `mnp-navi.jp/pt/*` |

将来追加するインドネシア語は `/id/`、ネパール語は `/ne/` を予約する。

## ページURLの対応

同じ内容に対応するページは、言語プレフィックス以外のパスを共通にする。

```text
日本語:       /tokyo/au/au-shop-narimasu/
ベトナム語:   /vi/tokyo/au/au-shop-narimasu/
英語:         /en/tokyo/au/au-shop-narimasu/
中国語:       /zh/tokyo/au/au-shop-narimasu/
韓国語:       /ko/tokyo/au/au-shop-narimasu/
ポルトガル語: /pt/tokyo/au/au-shop-narimasu/
```

店舗slug、都道府県slug、キャリアslugは全言語で共通とし、言語ごとに翻訳しない。言語切替では可能な限り同一ページへ移動し、対応ページがない場合だけ対象言語トップへ移動する。

## Cloudflareルーティング

- 現在の `mnp-navi.jp/* → rm-referral` を日本語のフォールバックとして維持する。
- 外国語公開時に、言語プレフィックス付きの具体的なルートを1件ずつ追加する。
- 外国語ルートが日本語の包括ルートより具体的に一致することで、対象言語Workerへ振り分ける。
- 同じホスト名を使うため、言語ごとのDNSレコードやサブドメインは作らない。
- ルートは最終的に各 `wrangler.*.jsonc` でコード管理し、ダッシュボードだけに設定を残さない。
- ルート切替は、対象言語のAstroビルドを既存の `workers.dev` URLで検証した後に行う。

## 静的アセットの配置

各外国語Workerは、自言語だけを保持する。公開パスとアセットパスを一致させるため、出力の最上位に言語コードを残す。

```text
.deploy/vi/vi/index.html
.deploy/vi/vi/tokyo/index.html
.deploy/vi/vi/tokyo/au/au-shop-narimasu/index.html
```

これにより `mnp-navi.jp/vi/...` をWorkerスクリプトで書き換えず、Cloudflare Static Assetsから直接配信できる。日本語Workerには外国語アセットを含めない。

## SEOメタデータ

- canonicalは必ず `https://mnp-navi.jp` の正式URLを指す。
- 各ページは、実際に存在する翻訳ページだけを `hreflang` で相互参照する。
- 言語値は `ja-JP`、`vi-VN`、`en`、`zh-CN`、`ko-KR`、`pt-BR` とする。
- `x-default` は対応する日本語ページ、存在しなければ日本語トップを指す。
- `html lang`、`og:locale`、構造化データの `inLanguage` を辞書設定から生成する。
- 外国語ページが未公開の段階では、その言語の `hreflang` を出力しない。
- `workers.dev` の検証URLをcanonicalやサイトマップへ含めない。

## サイトマップ

| 言語 | サイトマップ |
|---|---|
| 日本語 | `https://mnp-navi.jp/sitemap.xml` |
| ベトナム語 | `https://mnp-navi.jp/vi/sitemap.xml` |
| 英語 | `https://mnp-navi.jp/en/sitemap.xml` |
| 中国語 | `https://mnp-navi.jp/zh/sitemap.xml` |
| 韓国語 | `https://mnp-navi.jp/ko/sitemap.xml` |
| ポルトガル語 | `https://mnp-navi.jp/pt/sitemap.xml` |

最終的にルートのサイトマップインデックスから、公開済みの言語サイトマップだけを参照する。

## 旧URLの扱い

- 移行中は既存の各 `*.maffun.workers.dev` URLを検証用として維持する。
- 新ドメインでの公開確認前に旧URLを停止しない。
- 新URLのインデックス確認後、旧URLは301転送または `workers_dev: false` による停止を言語単位で判断する。
- 旧URLを正式URLとしてサイトマップへ再登録しない。

## 計測

- GA4は同一プロパティを維持し、URL第1階層から言語を判別する。
- 日本語は第1階層が言語コードではないため `ja` として補完する。
- Search Consoleはドメインプロパティ `mnp-navi.jp` を正本とする。
- 必要に応じて `/vi/` などのURLプレフィックスプロパティを補助的に追加する。

## 公開ゲート

各言語は次の条件をすべて満たした後にCloudflareルートへ接続する。

1. Astroの全対象ページが生成される。
2. 日本語など別言語の残存テキスト検査を通過する。
3. canonical、`hreflang`、`html lang`、構造化データが正しい。
4. 内部リンク、CSS、JavaScript、画像が `/言語コード/` 配下で解決する。
5. 言語別サイトマップに公開対象ページが過不足なく含まれる。
6. `workers.dev` 上の代表ページとローカル生成物が一致する。
7. ルート接続後、トップ・都道府県・店舗・トピック・404を本番確認する。

## 決定事項

- Astroのソースと共通コンポーネントは一本化する。
- ビルド成果物、Cloudflare Worker、デプロイは言語別に独立させる。
- 公開ドメインは `mnp-navi.jp` に統一し、外国語をサブディレクトリで配信する。
- 移行順はベトナム語、英語、中国語、韓国語、ポルトガル語とする。
