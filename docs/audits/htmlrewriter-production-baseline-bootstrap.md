# Production Baseline Bootstrap

## Purpose

Cloudflareから既存versionのStatic Assets manifestと全asset bytesをexportする公式手段が確認できないため、次の本番変更で一度だけ信頼できるbaselineを確立する。

## Source of truth

最小構成として、deployに使用した完全ASSETS treeを単一のversioned release artifactとして保存する。同じartifactから作ったreceiptと、deploy後にCloudflareから取得したdeployment/versionをattestationとして保存する。Gitへ約8,000ファイルを直接追加せず、artifact、receipt、attestationの保存場所は既存のリリース保管領域またはCI artifactとする。新しいR2等は導入しない。

保存単位：

- 完全ASSETS artifact（展開するとWranglerへ渡したtreeと一致）
- artifact SHA-256とbyte size
- baseline receipt（全path、size、SHA-256、file count）
- receipt SHA-256
- Worker名、locale、deployに使うconfig
- deploy結果のdeployment ID、version ID、traffic、capturedAt
- deploy commandと検証結果

## One-time bootstrap gate

bootstrapは本番変更を伴うため、工程4-B.2では実行しない。

1. 現在の本番version/deploymentをread-onlyで再確認し、排他作業を開始する。
2. 移行対象外の既存ASSETSを失わない完全treeを、検証可能な既存release sourceから再構成する。Cloudflareの一部URL、古い`.deploy/ja`、手書きmetadataだけでは承認しない。
3. 完全treeについてpath/size/SHA-256 receiptを機械生成し、artifact化する。artifactを別の空directoryへ展開し、receiptと全件一致することを確認する。
4. bootstrapの全差分を事前レビューする。対象外ページの変更・追加・削除を列挙し、意図不明が1件でもあれば停止する。
5. レビュー済みartifactだけをWranglerのASSETS directoryとして、一度だけ明示的なbootstrap deployを行う。Astro全体buildをrollback手段にしない。
6. deploy直後にdeployment/version/trafficをCloudflareから取得する。100%かつ予期したWorkerでなければrollbackする。
7. artifact hash、receipt hash、deployment ID、version IDをattestationへ自動記録する。version IDを人手で先書きしない。
8. HTTP回帰検証後、artifact＋receipt＋attestationを改変不能なrelease artifactとして保存する。これが次回以降の唯一のProduction Baselineとなる。

## Normal single-article path after bootstrap

1. 保存済みartifactのSHA-256、receipt SHA-256、attestationを検証する。
2. Cloudflareのcurrent deployment/versionがattestationと一致することを確認する。
3. artifactを新しいstagingへ展開する。
4. `/guide/rakuten-mobile-three-features/index.html`だけをexact SHA-256付きでoverlayする。includeがbaselineにない場合は、2件を`NEW REQUIRED SHARED ASSET`として別途承認する。
5. 全path/size/hashを比較し、target変更1、許可外変更0、新規0、削除0を確認する。
6. candidateを読み取り専用にし、再inventoryして同一hashを確認する。
7. production preflightを通常deployとWrangler build hookの両方で実行する。
8. Wranglerがこのcandidateだけをmanifest化する。deploy後のartifact、receipt、attestationを次version用に保存する。

## Rollback

bootstrap直前のcurrent version IDを保存し、重大問題時は`wrangler rollback <version-id> --config wrangler.jsonc`で戻す。Cloudflare versionにはStatic Assetsも含まれるため、全体Astro buildは不要。current version driftがあればbootstrapとrollback判断を停止して再確認する。

## Current blocker

現時点では現在本番version `6be5618a-cc3b-41c6-8c54-06def5f77c61`に対応する完全artifactをCloudflareから取得できない。したがって、現在の`.deploy/ja`をProduction Baselineへ昇格せず、candidate stagingとWrangler dry-runも実施しない。
