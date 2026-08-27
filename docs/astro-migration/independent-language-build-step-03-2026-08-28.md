---
date: 2026-08-28
tags: [RMリファラル, Astro, 多言語, Cloudflare, デプロイ]
---

# 工程3：言語別ビルド・デプロイ基盤

## 実施内容

- 日本語・ベトナム語・英語・中国語・韓国語・ポルトガル語のWorker名、Wrangler設定、公開プレフィックスを `scripts/language-config.mjs` に集約した。
- `node scripts/build-language.mjs <言語コード>` で、指定言語だけのWorker成果物を `.deploy/<言語コード>/` に作成できるようにした。
- 外国語は `.deploy/vi/vi/` のように、成果物内へ正式URLと同じ言語プレフィックスを保持する。
- 現時点の外国語HTMLを基礎にし、今後 `astro-site/dist/<言語コード>/` にAstroページが生成された場合は同じパスへ上書きする段階移行方式にした。
- 作成途中のディレクトリを本番成果物として扱わないよう、一時ディレクトリで完成させてから差し替える方式にした。
- 元ファイルの全件存在確認、他言語混入、公開ルート、Worker名、Wranglerのassetsディレクトリを言語ごとに検査する。
- `scripts/deploy-language.sh <言語コード>` で、ビルド・検証に成功した言語だけを対応Workerへデプロイできるようにした。
- 既存の日本語デプロイスクリプトも共通パイプラインの `ja` を呼び出す形へ統一した。

## Workerと成果物

| 言語 | Worker | 成果物 |
|---|---|---|
| 日本語 | `rm-referral` | `.deploy/ja` |
| ベトナム語 | `rm-referral-vi` | `.deploy/vi` |
| 英語 | `rm-referral-en` | `.deploy/en` |
| 中国語 | `rm-referral-zh` | `.deploy/zh` |
| 韓国語 | `rm-referral-ko` | `.deploy/ko` |
| ポルトガル語 | `rm-referral-pt` | `.deploy/pt` |

## 検証結果

- 6言語すべてのWorker名・Wrangler設定の一意性検査に合格した。
- ベトナム語で代表ビルドを実行し、**6,852ファイル、HTML 6,835件**を欠落なく独立成果物へ格納した。
- ベトナム語成果物の最上位が `/vi/` だけであり、他言語を含まないことを確認した。
- パイプライン自動テストは **3件中3件成功**した。
- `wrangler deploy --dry-run` に成功し、Cloudflareへ送信せずWorkerパッケージとして成立することを確認した。

## この工程で変更していないもの

- Cloudflareへの本番デプロイ
- `mnp-navi.jp` のWorkerルート
- DNS設定
- 本番ページの内容

Wrangler設定にはまだ `mnp-navi.jp/<言語コード>/*` のrouteを記載していない。各言語を `workers.dev` で検証した後、その言語の公開工程で追加する。

## 次工程

工程4では、移行順1番目のベトナム語について、Astroページ生成を開始する。まずトップ・共通パーツ・代表ページをAstro化し、日本語残存、SEO、内部リンク、アセットパスを検査する。
