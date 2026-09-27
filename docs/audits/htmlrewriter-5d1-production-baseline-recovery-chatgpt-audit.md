# HTMLRewriter 工程5-D.1 Production Baseline Recovery ChatGPT監査レポート

## A. 結論

**PASS**。Recovery工程として、Wrangler read-only環境を復元し、5 localeのcurrent Productionを実測し、bootstrap guardをlocale-awareかつfail-closedに汎用化し、全候補を個別評価した。Production writeは0。5 localeの既存`.deploy` treeはreceipt全件一致かつ40/40 sentinel byte一致だが、current deployment/versionと完全treeを結ぶimmutable artifact/attestation/upload recordがないため、全localeを安全に`BLOCKED / UNBOUND`と判定した。

## B. 開始時Git状態

- branch: `main`
- HEAD: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- `origin/main`: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: 0
- tracked deletion: 0
- 既知差分: 5-B/5-Cの14件＋5-D audit 1件
- unexpected差分: 0
- revert/stash/checkout/reset/stage/commitは実施していない。

## C. Wrangler environment

- `package.json`: `wrangler: 4.131.1`
- `package-lock.json`: root requirement、resolved packageとも`4.131.1`
- 復元方法: `npm ci --ignore-scripts`
- 実測: `Wrangler 4.131.1`
- lockfile、package version、tracked sourceのdependency復元起因変更: 0
- グローバルWranglerおよび自動latest upgradeは使用していない。

## D. Cloudflare read-only discovery

取得日時: 2026-09-25T11:21:53Z。`deployments list --json`と`versions view --json`のみ使用した。

| locale | Worker | deployment | version | traffic | deployedAt | version no. |
|---|---|---|---|---:|---|---:|
| en | `rm-referral-en` | `49c31aa6-493d-44e0-b53d-03682783420b` | `b4cb690f-98bb-484b-94d3-e18d0de8d0be` | 100% | 2026-09-21T08:20:50.243405Z | 66 |
| ko | `rm-referral-ko` | `b0bbe8bb-8057-4b99-99b4-5419c741d721` | `304bab7b-1932-4928-93f6-66151068c970` | 100% | 2026-09-21T08:24:57.979204Z | 61 |
| pt | `rm-referral-pt` | `9aa2a5ab-edf6-4ca9-86e0-67fd5b1b4f6b` | `d7d413ae-64e5-425a-a473-d027a759ab7c` | 100% | 2026-09-21T08:32:34.155214Z | 48 |
| vi | `rm-referral-vi` | `37fc9e31-42fa-45a0-9c6f-2aa8f9837155` | `80de55fe-5c6c-434b-85cd-b793e31484b7` | 100% | 2026-09-21T08:28:55.451788Z | 65 |
| zh | `rm-referral-zh` | `ebda607e-edf2-4507-9d8e-ee2cc9fb5fca` | `1dcb8a7a-8181-4059-8856-a99166fa2e2a` | 100% | 2026-09-21T08:13:01.498664Z | 65 |

全versionは`source: wrangler`、Static Assets `serve_directly: true`、`raw_run_worker_first: false`、compatibility date `2026-08-21`。mixed trafficは0。

## E. Production write

0。deploy、versions upload/deploy、rollback、traffic変更、asset upload session、resource create/update/deleteは実行していない。

## F. bootstrap guard汎用化

- locale mappingを`bootstrap-locales.mjs`へ集約。
- CLIはexactly one `--locale <locale>`を必須化。missing、unknown、multiple、`all`、wildcardを拒否。
- schema 2 planでcomplete tree、provenance、evidence hash、attestation hash、current deployment/version binding、independent reviewを必須化。
- locale/Worker/config/receipt/tree inventory/path/size/per-file hash/artifact hash/receipt hash/sentinel/review/rollback/drift/trafficを照合。
- cross-locale treeを拒否。
- 既存日本語schema 1 planだけを限定後方互換として維持。
- attestation作成もlocale mappingのWorker/config/trafficへ拘束。
- 日本語bootstrap configは`--locale ja`を明示するよう変更。通常日本語Production configは未変更。

## G. locale mapping

| locale | Worker | normal config | bootstrap config | route | sitemap | topics |
|---|---|---|---|---|---|---|
| ja | rm-referral | wrangler.jsonc | wrangler.bootstrap.jsonc | `/` | `/sitemap.xml` | `/topics/` |
| en | rm-referral-en | wrangler.en.jsonc | wrangler.bootstrap.en.jsonc | `/en/` | `/en/sitemap.xml` | `/en/topics/` |
| ko | rm-referral-ko | wrangler.ko.jsonc | wrangler.bootstrap.ko.jsonc | `/ko/` | `/ko/sitemap.xml` | `/ko/topics/` |
| pt | rm-referral-pt | wrangler.pt.jsonc | wrangler.bootstrap.pt.jsonc | `/pt/` | `/pt/sitemap.xml` | `/pt/topics/` |
| vi | rm-referral-vi | wrangler.vi.jsonc | wrangler.bootstrap.vi.jsonc | `/vi/` | `/vi/sitemap.xml` | `/vi/topics/` |
| zh | rm-referral-zh | wrangler.zh.jsonc | wrangler.bootstrap.zh.jsonc | `/zh/` | `/zh/sitemap.xml` | `/zh/topics/` |

artifact/receipt/attestation/baseline namespaceはlocale別`release-artifacts/production-baselines/<locale>`に固定。外国語bootstrap config自体は5-D.1では作成していない。

## H. guard tests

新規Recovery tests: 18/18 PASS。ja/en/ko/pt/vi/zh valid、locale missing/unknown/multiple、wrong Worker/config、cross-locale tree、wrong receipt、wrong attestation binding、version drift、traffic != 100、STALE、UNBOUNDを確認した。

## I. 日本語回帰

既存bootstrap 8/8 PASS。日本語を含むbootstrap全体26/26 PASS。既存日本語Production Baseline artifactおよびProductionは変更していない。

## J. en baseline discovery

- 候補: `.deploy/en`＋`.deploy/release.json`
- complete tree: 6,851 files / 114,968,725 bytes
- inventory SHA-256: `284363b78ee215a228b225697b56ebe60169d59ba1a2cd414c5d46944814514b`
- receipt全件 mismatch: 0
- sentinel: 8/8 byte/SHA-256一致
- 分類: **UNBOUND**
- 最終判定: **BLOCKED — NO TRUSTED BASELINE SOURCE**

## K. ko baseline discovery

- 候補: `.deploy/ko`＋`.deploy/release.json`
- complete tree: 6,851 files / 119,895,826 bytes
- inventory SHA-256: `2090c95c574f2447371875369bdb3683665eb677289cb3937cbc81d785e0edd3`
- receipt全件 mismatch: 0
- sentinel: 8/8 byte/SHA-256一致
- 分類: **UNBOUND**
- 最終判定: **BLOCKED — NO TRUSTED BASELINE SOURCE**

## L. pt baseline discovery

- 候補: `.deploy/pt`＋`.deploy/release.json`
- complete tree: 6,851 files / 115,009,409 bytes
- inventory SHA-256: `66f02cf497120bfdcb03cc4607a818f82232a2d9e891aeb6bad4cdbd118a47cb`
- receipt全件 mismatch: 0
- sentinel: 8/8 byte/SHA-256一致
- 分類: **UNBOUND**
- 最終判定: **BLOCKED — NO TRUSTED BASELINE SOURCE**

## M. vi baseline discovery

- 候補: `.deploy/vi`＋`.deploy/release.json`
- complete tree: 6,851 files / 123,838,626 bytes
- inventory SHA-256: `93b2affe2e2b6ee848224821fdc28d0dba5cff1966970606c7bdaa43e6328409`
- receipt全件 mismatch: 0
- sentinel: 8/8 byte/SHA-256一致
- 分類: **UNBOUND**
- 最終判定: **BLOCKED — NO TRUSTED BASELINE SOURCE**

## N. zh baseline discovery

- 候補: `.deploy/zh`＋`.deploy/release.json`
- complete tree: 6,851 files / 111,635,363 bytes
- inventory SHA-256: `d6e849f3ca468b7bf5e09b15b03d1cc6e67011df4642eb335122333d50d1a016`
- receipt全件 mismatch: 0
- sentinel: 8/8 byte/SHA-256一致
- 分類: **UNBOUND**
- 最終判定: **BLOCKED — NO TRUSTED BASELINE SOURCE**

各tree categoryは共通でroot 1、guide 21、topics 0、CSS 1、JS 6、images 4、robots 1、sitemap 1、その他HTML 6,816。duplicate path、traversal、cross-locale、receipt deletion/mismatchは0。

## O. stale release調査

- receipt createdAt: `2026-09-21T08:00:39.792Z`
- receipt file SHA-256: `417d351d1abffae8586e3ac663788993686e93d487a57110495b6a24950a8600`
- receipt input fingerprint: `6db667fe9d4bd076a8b6bea96509bc0e543e1fdcb1d99ae365cc86a888d3b58a`
- current clean HEAD fingerprint: `43feff960d8d073520b88f39ad453b953b9ea05d54085fe4201e792ea7ce9a95`
- 生成時刻近辺の限定Git statesもcurrent clean HEADと同じfingerprintで、receipt inputとは一致しなかった。
- tree bytesはreceiptと全件一致するため、tree改変がstale原因ではない。
- staleの直接原因はreceipt作成時source fingerprintと現在source fingerprintの差。receiptを生成した完全なsource stateはGit commitとして復元できなかった。
- foreign current versionsはreceipt作成の約12〜32分後だが、時刻近接だけではbindingと認定していない。
- 対応するforeign immutable artifact/attestation/upload logは既存保存領域で発見できなかった。

## P. Production sentinel

各localeでroot、representative guide、representative shop、CSS、JavaScript、image、robots、sitemapを比較。既存Topicは0件のため対象なし。

| locale | HTTP | byte/hash一致 |
|---|---:|---:|
| en | 8/8 PASS | 8/8 |
| ko | 8/8 PASS | 8/8 |
| pt | 8/8 PASS | 8/8 |
| vi | 8/8 PASS | 8/8 |
| zh | 8/8 PASS | 8/8 |

HTML sentinelはtitle/canonicalも取得し、各localeのProduction URLと整合した。

## Q. 完全一致を証明できる範囲

- `.deploy/<locale>`全6,851 filesとrelease receiptのpath/hash（size記録がある項目はsizeを含む）
- tree inventory hash、file count、category inventory
- current Productionの選定sentinel 40件と候補bytes/hash
- current deployment/version/trafficおよびStatic Assets runtime metadata

## R. 完全一致を証明できない範囲

- Cloudflare current versionの全Static Assets bytes/manifestと候補6,851 filesの全件一致
- receipt/artifact hashとcurrent version IDを結ぶ保存済みattestation
- foreign version upload時に使用した完全treeのimmutable provenance
- Cloudflareからの完全Static Assets read-only export（利用可能な公式経路なし）

sentinel一致、file count、古いreceipt、時刻近接を組み合わせても全件bindingとは断定していない。

## S. locale readiness matrix

| locale | source | Production binding | sentinel | result |
|---|---|---|---|---|
| en | complete, receipt match | insufficient / UNBOUND | 8/8 PASS | BLOCKED |
| ko | complete, receipt match | insufficient / UNBOUND | 8/8 PASS | BLOCKED |
| pt | complete, receipt match | insufficient / UNBOUND | 8/8 PASS | BLOCKED |
| vi | complete, receipt match | insufficient / UNBOUND | 8/8 PASS | BLOCKED |
| zh | complete, receipt match | insufficient / UNBOUND | 8/8 PASS | BLOCKED |

## T. Tests

- Promotion: 15/15 PASS
- Shared: 15/15 PASS
- Deploy boundary: 14/14 PASS
- Bootstrap: 26/26 PASS（既存8＋Recovery 18）
- total: 70/70 PASS
- JavaScript/schema syntax: PASS
- `git diff --check`: PASS

## U. Astro full build

0回。

## V. maintenance full build

0回。`prepare-release.mjs`によるrelease生成も0回。

## W. Cloudflare副作用

0。read-only GET相当のdeployment/version discoveryとpublic HTTP sentinelだけを実施。

## X. Production Baseline変更

0。日本語・外国語ともartifact/receipt/attestationを作成・変更・昇格していない。

## Y. Git状態

stage 0、commit 0、stash 0、merge/rebase/push 0。既存差分を維持。`node_modules`はlockfile固定で復元したignored dependencyで、tracked差分ではない。

## Z. 変更ファイル

5-D.1変更:

- `package.json`: Recovery testをbootstrap test suiteへ追加
- `scripts/bootstrap-locales.mjs`: 6 locale明示mappingとtree isolation
- `scripts/bootstrap-artifact.mjs`: locale-aware artifact/receipt validation
- `scripts/bootstrap-guard.mjs`: locale-aware schema 2 source/Production binding guard
- `scripts/bootstrap-attestation.mjs`: locale-aware Worker/config validation
- `wrangler.bootstrap.jsonc`: 日本語localeを明示
- `tests/bootstrap-locale-recovery.test.mjs`: 18 fail-closed cases
- 本監査レポート

他5 locale Wrangler、Production Worker、Promotion semanticsは変更していない。

## AA. 読んだファイル

- 5-D audit、5-C architecture/audit: 停止理由と正本Decision
- `package.json`、`package-lock.json`: Wrangler versionとscripts
- bootstrap artifact/guard/attestation、deploy-boundary scripts/tests、bootstrap config: 汎用化範囲
- 他5 Wrangler config: Worker/config/route mapping
- `.deploy/release.json`: metadataと全件inventory照合（HTML本文は未読）
- `release-artifacts/production-baselines`: 既存artifact調査
- locale migration baseline docs: 過去sourceの性質確認
- 限定Git history/stash/worktree metadata: receipt作成時source探索
- 2026-09-21該当Wrangler logs: foreign upload binding evidence探索
- public Production sentinel 40 URL: byte/hash照合

## AB. 予定外に読んだファイル

なし。証拠探索のため該当時間帯Wrangler logsを追加で読んだが、対象Worker/version/asset行だけに限定した。大量HTML本文、実Promotion本文、Vault、AboutMe、SNS、他制作物は未読。

## AC. 残存リスク

5 localeすべて、完全候補treeはあるがcurrent Productionとの全件bindingがない。full build禁止下では、既存のforeign immutable artifact/attestation/upload inventoryが別保管先から発見されない限りRecovery bootstrapへ進めない。次問題は`Production Baseline Reconstruction / Initial Migration`として別承認が必要であり、本工程では設計・実行していない。

## AD. 5-D再開可否

- en: NO
- ko: NO
- pt: NO
- vi: NO
- zh: NO

**5-D Production Bootstrapを再開可能なlocale: `[]`**

工程5-D.1 Production Baseline Recovery: **PASS**

Locale判定:

- en: **BLOCKED**
- ko: **BLOCKED**
- pt: **BLOCKED**
- vi: **BLOCKED**
- zh: **BLOCKED**
