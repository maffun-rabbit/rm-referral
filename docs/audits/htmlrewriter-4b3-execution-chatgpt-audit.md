# HTMLRewriter 工程4-B.3 Execution ChatGPT監査レポート

## A. 結論

**PASS**。Production Baseline Bootstrapのみを実行し、日本語Production Baselineを確立した。4-B.4は未開始。

## B. 開始時production

- deployment: `1e8adc59-cf3a-49e6-97eb-5606ca65f215`
- version: `6be5618a-cc3b-41c6-8c54-06def5f77c61`
- traffic: 100%

## C. version drift

**NO**。開始時とproduction切替直前の2回とも一致。

## D. artifact再検証

- artifact SHA-256: `13052eabaefc3331ae02430c145ffe571ee1eccfd6d83d3b0dce51fdbdf5a362`
- size: 128,158,720 bytes
- canonical receipt SHA-256: `96c30ed23c97a5baac6571218c59e6f1a3edbae0b21e3199b60d0209a7980c74`
- receipt file SHA-256: `d9e987aed93ed52d2ea0b049b64194f998370baaf2c93dc450a6f67cc9ff6714`
- receipt/tree: 7,977 / 7,977、mismatch 0
- include: 0、`rm-include`: 0、overlay: 0
- sentinel report hash: `b621eb7442e93c56df84682ecbd5584a30493bc96658876163310a0a9bc61ab7`

## E. bootstrap guard

PASS。plan SHA-256 `e0ca83074c076a7792ccb5c1b19be45bc5c00ef64af9c564d21e18ddcc619030`。artifact/receipt/tree/sentinel/review/Worker `rm-referral`/locale `ja`/config/rollback versionをfail-closedで検証。

## F. Version Upload

- version ID: `a96044c9-dec7-4bc4-8aa6-8f7b3122f429`
- number: 107
- created: `2026-09-23T12:49:45.497385Z`
- production traffic at upload: unchanged
- updated asset files: 0。既存Cloudflare asset bytesを再利用し、新versionを作成。

## G. Version URL

`https://bootstrap-ja-20260923-rm-referral.maffun.workers.dev`

## H. Version URL検証結果

PASS。root、guide index、対象guide、別guide複数、replacement-program、topics、CSS、JS、PNG、robots、sitemapは候補treeとbyte/hash一致。404正常。header/footer/nav/CTA/title/canonical/JSON-LD正常、未処理`rm-include` 0。

初回CTAチェックは旧URL `r10.to/hNearm` を誤って仮定してFAILした。production切替を停止したまま承認済みHTMLの実CTA `go.mnp-navi.jp/r/switching-guide_ja_topic_26092000` を確認し、同一byteのVersion URLで再検証してPASS。サイト変更・再uploadなし。

## I. production切替直前version

`6be5618a-cc3b-41c6-8c54-06def5f77c61`、100%。開始時と一致。

## J. Production Deployment

- deployment ID: `c2020aee-a6b7-4c3a-8ed6-c80520ce8a90`
- version ID: `a96044c9-dec7-4bc4-8aa6-8f7b3122f429`
- traffic: 100%
- deployedAt: `2026-09-23T12:53:05.356027Z`

## K. production HTTP回帰

PASS。Version URLと同じ12 sentinelがすべて200・byte/hash一致。404正常。HTML構造、CTA、SEO、assets欠落なし。

## L. bootstrap前後sentinel比較

12/12一致。bootstrap前、Version URL、bootstrap後productionの三者でbyte/hash一致。

## M. rollback

**不要**。旧version `6be5618a-cc3b-41c6-8c54-06def5f77c61` はrollback targetとして保持。

## N. attestation

- path: `制作ワークスペース/RMリファラル/release-artifacts/production-baselines/ja/bootstrap-20260923/rm-referral-ja-bootstrap-20260923.attestation.json`
- file SHA-256: `0b0eed2ab8c6c09912110a0ca825169468fad91cbc5a0787e4489aca153d1613`
- artifact/receipt/deployment/version/traffic/config/plan hashを相互結合
- verifiedAt: `2026-09-23T12:55:32Z`

## O. Production Baseline

**ESTABLISHED**。artifact + receipt + attestationを日本語サイトの正式baselineとする。

## P. baseline file count

7,977 regular files。Wrangler表示の16,210 entriesは7,977 files + 8,234 directories − rootであり、receiptとの差異ではない。

## Q. files generated

0。承認済みarchiveから7,977件を専用treeへ展開したが、内容生成・再buildはなし。

## R. HTML generated

0。

## S. files uploaded

0 updated asset files。Cloudflare上の既存asset bytesを再利用。Worker Version metadataは1件作成。

## T. HTML uploaded

0 updated HTML asset files。

## U. Astro full build回数

0。

## V. maintenance:full-build回数

0。

## W. 他言語への影響

なし。日本語 `rm-referral` のbootstrap configだけを使用。他言語config/deployは未実行。

## X. Cloudflareで作成されたversion/deployment

- version `a96044c9-dec7-4bc4-8aa6-8f7b3122f429`
- deployment `c2020aee-a6b7-4c3a-8ed6-c80520ce8a90`

## Y. artifact保存状態

Google Drive内の既存制作ワークスペースにartifact、receipt、attestation、READMEを保存。全hash再確認済み。

## Z. 第二保管状態

**未保存**。`gh` CLIが環境に存在せず、既存GitHub Releaseを安全に確認・利用できなかった。新しいサービスや未確認Releaseは作成していない。残件。

## AA. Git状態

branch `htmlrewriter-includes`。commit / merge / push 0。開始前の既存差分を維持。実行証拠・plan/review/reportのみ追加され、サイト本文・target HTML・include・他言語は変更なし。

## AB. 想定との差異・残件

- Wranglerはentry数16,210と表示したが、regular filesは7,977で全hash一致。
- CTA初回検査は検査側の古いURL仮定でFAIL。production切替前に原因を特定し、実CTAでPASS。artifact変更なし。
- 第二保管は未完了。
- 通常single-article deployへのguard強制接続は4-B.4開始前の残件。P0はDONEにしていない。

工程4-B.3 Executionはここで停止する。4-B.4、HTMLRewriter pilot、include追加、target overlayは実施しない。
