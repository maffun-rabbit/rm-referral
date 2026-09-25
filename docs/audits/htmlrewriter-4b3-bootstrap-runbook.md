# RM Referral 日本語単一記事deploy Runbook

このファイルを日本語単一記事更新の正式runbookとする。通常記事更新、bootstrap、maintenance/full rebuildを混同しない。

## 正式な入口

通常の記事更新は、対象`page.json`、`RM_PAGE`、承認済みdeploy plan、Production Baselineのreceipt/attestation hashを指定した`npm run deploy -- ja`から開始する。`wrangler deploy`や`wrangler versions upload`を通常運用で直接実行しない。

現在のProduction Baselineは、`release-artifacts/production-baselines/ja/`に保存した最新のartifact + receipt + attestation三点組。古いbaselineは削除・上書きしない。

## 事前条件

1. Cloudflare current deployment/version/traffic 100%がattestationと一致する。
2. artifact SHA-256/size、canonical receipt SHA-256、receipt file SHA-256、attestation file SHA-256、全file inventoryが一致する。
3. Workerは`rm-referral`、localeは`ja`。baseline由来configは`wrangler.bootstrap.jsonc`または`wrangler.jsonc`だけを許可し、通常deploy先は厳密な`wrangler.jsonc`とする。
4. `RM_PAGE`は承認済みtargetで、planはbaseline、clean candidate、target overlay、必要なshared assetだけをexact hashとreasonで固定する。
5. `npm run test:shared`、`npm run test:deploy-boundary`、`npm run test:bootstrap`がPASSする。

## 通常記事更新

1. `page.json`を編集し、`build:page`でtarget HTML 1件だけを生成する。
2. 検証済みProduction Baseline artifactを新しいclean treeへ展開し、receiptと全件照合する。
3. target HTMLだけをoverlayする。shared assetが必要な場合はexact path/SHA-256/size/reason付きallowlistへ別枠で追加する。
4. candidate全件のpath/size/hashをbaselineと比較する。target外HTML、unexpected asset、削除があれば停止する。
5. production preflightでbaseline/receipt/attestation、current version、config transition、Worker/locale、candidateを再検証する。
6. `npm run deploy -- ja`の正式経路でWorker Versionだけをuploadする。production trafficはまだ変えない。
7. Version URLでtargetのHTTP、本文、header/footer、navigation、CTA、SEO、CSS/JS、未処理include 0を確認する。root、別guide、topics、static assets、404をbaselineと比較する。
8. production切替直前にcurrent deployment/version/trafficを再取得し、開始時からdriftしていれば停止する。
9. 検証済みversionだけを明示的に100%へ切り替える。別versionを作り直さない。
10. productionでtargetとnon-target sentinelを再検証する。成功時だけcandidate全体から新artifact/receiptを生成し、Cloudflare取得値でattestationを保存して次回baselineにする。

## 停止条件

- current version/deployment/traffic drift
- artifact、receipt、attestation、baseline treeの不一致
- unexpected asset、削除、target外HTML変更
- target/include hash不一致
- Worker、locale、config transition不一致
- Astro full build、`prepare-release.mjs`、`maintenance:full-build`へのfallback検出
- stale `.deploy/ja`や未検証treeをbaselineとして使用

## deploy後とrollback

切替直前の100% Production versionをrollback targetとして保持する。重大回帰時はcurrent stateを確認してversion rollbackする。Astro full buildや`maintenance:full-build`をrollback手段にせず、その場で修正再deployしない。

## Maintenance隔離

`npm run maintenance:full-build`はmaintenance / migration / disaster recovery専用。通常の記事追加・更新・deploy・rollbackから参照しない。bootstrapは一度限りのbaseline確立専用configで、通常deployへ再利用しない。

## 残存運用リスク

Cloudflare資格情報を持つユーザーのraw CLIはrepo外のOperational / IAM risk。第二artifact保管、CI/IAM制限、6言語・全guide・topics展開、長期CPU/料金/cache観測はP0後の別milestoneとする。
