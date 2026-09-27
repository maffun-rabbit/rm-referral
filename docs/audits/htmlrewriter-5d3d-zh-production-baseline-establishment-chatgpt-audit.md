# HTMLRewriter 工程5-D.3d zh Gate 3 ChatGPT監査レポート

## A. 結論

**PASS — ZH PRODUCTION BASELINE ESTABLISHED**

検証済みVersion 66を`rm-referral-zh` Productionへ100%切り替え、直後sentinel 8/8、Production known paths 6,851/6,851、post-switch drift、artifact round-trip、final attestation binding、回帰85/85をすべてPASSした。rollbackは不要だった。

## B. Pre-switch Production

- deployment: `ebda607e-edf2-4507-9d8e-ee2cc9fb5fca`
- version ID: `1dcb8a7a-8181-4059-8856-a99166fa2e2a`
- version number: `65`
- traffic: `100%`
- mixed traffic: `NO`

## C. Candidate

- path: `.deploy/zh`
- regular files: `6,851`
- total bytes: `111,635,363`
- inventory schema: `1`
- inventory algorithm: `tree-inventory-sha256-v1`
- inventory SHA-256: `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`
- receipt entries / missing / extra / SHA mismatch: `6,851 / 0 / 0 / 0`
- pre/post verification drift: `NO`

旧`d6e849...`は`NON_CANONICAL_DIAGNOSTIC_HASH`であり、identity判定には使用していない。

## D. Artifact

- artifact: `rm-referral-zh-initial-migration.tar`
- SHA-256: `603df75f3010b237230b0e08b6f110dbe9cafd0998e7ceaa61f88b21fda6b413`
- size: `116,888,576 bytes`
- canonical receipt SHA-256: `fad4c909e9ada6063d08cd78c2e0642523438792f8fb6c723bda845b5e1c7124`
- receipt file SHA-256: `49a928ab88e591c05212d40784c6c9aefc8128816af3c93d0a8b462a22e44302`
- migration evidence canonical SHA-256: `7805d4abeea7785bd5bae4121310f6a77a10213ecd53830e006cf71ccf926c94`
- artifact再作成: `0`

## E. Gate evidence

- Gate 1 SHA-256: `c611d00bdf0057b7d603973702b1697f36eca0f06864504fc28ea1e73e8cbaea`
- Gate 2 SHA-256: `ee1b20fffcafc3603d7fba75cf69516d62a172cfffba63ef3b9f5f344de65b51`
- Gate 2 verification binding SHA-256: `dd927e9eaff02107553a73cbf21e78ecc503b11ff30bf9c6498118579e9f4ec2`
- Production full-verification evidence SHA-256: `4143a5ff9e767354104900df7554ea9565fd36e99974c00d8bba7ca3a4242a9c`

全ファイルが存在し、期待hashと一致した。

## F. Final pre-switch sentinels

Production Version 65、Version 66 URL、candidateの3者について同じ8件を比較した。

- locale root: MATCH
- guide: MATCH
- shop: MATCH
- CSS: MATCH
- JavaScript: MATCH
- image: MATCH
- robots: MATCH
- sitemap: MATCH
- matched: `8/8`
- mismatch / failed / unexpected redirect: `0 / 0 / 0`

## G. Production switch

- old deployment: `ebda607e-edf2-4507-9d8e-ee2cc9fb5fca`
- old version: `1dcb8a7a-8181-4059-8856-a99166fa2e2a`（65）
- new deployment: `66c650f7-e7ca-418a-bbfc-80588dee79a8`
- new version: `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`（66）
- traffic: `100%`
- deployedAt: `2026-09-25T21:51:50.540589Z`
- mixed traffic: `NO`
- new Version Upload: `0`

Wranglerは`No non-versioned settings to sync. Skipping...`と報告し、既存Version 66だけを100%へ切り替えた。

## H. Immediate sentinels

切替直後のProduction URLで8/8 MATCH。

- HTTP 200: `8/8`
- byte/SHA-256一致: `8/8`
- mismatch / unresolved / failed / unexpected redirect: `0 / 0 / 0 / 0`

## I. Production full verification

- Expected: `6,851`
- Attempted: `6,851`
- Matched: `6,851`
- Mismatched: `0`
- Unresolved: `0`
- Failed: `0`
- Unexpected redirects: `0`
- candidate stable: `true`
- startedAt: `2026-09-25T21:52:34.220Z`
- completedAt / verifiedAt: `2026-09-25T21:52:48.950Z`

Evidence: `docs/audits/htmlrewriter-5d3d-zh-production-full-verification-evidence.json`

## J. Category results

| Category | Expected | Attempted | Matched | Mismatch | Failed |
| --- | ---: | ---: | ---: | ---: | ---: |
| HTML | 6,838 | 6,838 | 6,838 | 0 | 0 |
| CSS | 1 | 1 | 1 | 0 | 0 |
| JavaScript | 6 | 6 | 6 | 0 | 0 |
| Image | 4 | 4 | 4 | 0 | 0 |
| Font | 0 | 0 | 0 | 0 | 0 |
| robots | 1 | 1 | 1 | 0 | 0 |
| sitemap | 1 | 1 | 1 | 0 | 0 |
| Other | 0 | 0 | 0 | 0 | 0 |

## K. Rollback

- required: `NO`
- executed: `NO`
- fixed target: Version 65 `1dcb8a7a-8181-4059-8856-a99166fa2e2a`
- target existence after verification: `YES`

## L. Production Baseline

- status: `ESTABLISHED`
- storage: `../release-artifacts/production-baselines/zh/initial-migration-20260925-gate2/`
- artifact SHA-256: `603df75f3010b237230b0e08b6f110dbe9cafd0998e7ceaa61f88b21fda6b413`
- canonical receipt SHA-256: `fad4c909e9ada6063d08cd78c2e0642523438792f8fb6c723bda845b5e1c7124`
- receipt file SHA-256: `49a928ab88e591c05212d40784c6c9aefc8128816af3c93d0a8b462a22e44302`
- attestation: `rm-referral-zh-initial-migration.production-attestation.json`
- attestation file SHA-256: `70c90f06ea871ae52b62f5a8de23429a29b4e66993708baf34f0c854792af943`
- inventory SHA-256: `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`
- file count: `6,851`
- total bytes: `111,635,363`
- production deployment: `66c650f7-e7ca-418a-bbfc-80588dee79a8`
- production version: `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`
- traffic: `100%`

Attestationからartifact、receipt、Gate 1、Gate 2、verification binding、Production full-verification evidenceへの全hash bindingを再計算し、すべてPASSした。

Baseline round-trip:

- fresh clean temporary extraction: PASS
- files: `6,851`
- bytes: `111,635,363`
- inventory: expected SHAと一致
- missing / extra / mismatch: `0 / 0 / 0`

## M. Unknown asset limitation

Candidate inventoryに含まれる既知6,851 pathすべてについて、Production Version 66とのbyte/SHA-256一致を確認した。

これはCloudflare-only unknown assetが存在しないことや、Cloudflare Version 66のasset namespace全体がcryptographically完全一致することを証明するものではない。このInitial Migration固有のresidual uncertaintyはfinal attestationにも維持した。

## N. Regression tests

- Promotion: `17/17 PASS`
- Shared: `15/15 PASS`
- Deploy boundary: `14/14 PASS`
- Bootstrap / Recovery: `26/26 PASS`
- Gate helpers: `13/13 PASS`
- total Node tests: `85/85 PASS`
- JavaScript syntax: `2/2 PASS`
- `git diff --check`: `PASS`

## O. Build counts

- Astro full build: `0`
- `maintenance:full-build`: `0`
- `prepare-release.mjs`: `0`
- Version Upload: `0`

## P. Cloudflare writes

本工程のwrite：

1. `rm-referral-zh` deployment作成、既存Version 66へtraffic 100%: `1`

その他：

- Version Upload: `0`
- rollback: `0`
- Worker/subdomain設定変更: `0`（5-D.3cの`previews_enabled=true`を維持）
- assets/code/bindings/routes/custom domain write: `0`

## Q. 他locale副作用

| Locale | Cloudflare write | Baseline変更 |
| --- | ---: | ---: |
| ja | 0 | 0 |
| en | 0 | 0 |
| ko | 0 | 0 |
| pt | 0 | 0 |
| vi | 0 | 0 |

## R. Git状態

- branch: `main`
- HEAD: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: `0`
- tracked deletion: `0`
- existing 5-B onward modified/untracked files: preserved
- commit / amend / merge / rebase / push / tag / stash: `0`

本工程で生成・更新した証拠：

- `docs/audits/htmlrewriter-5d3d-zh-production-full-verification-evidence.json`
- `docs/audits/htmlrewriter-5d3d-zh-production-baseline-establishment-chatgpt-audit.md`
- `../release-artifacts/production-baselines/zh/initial-migration-20260925-gate2/rm-referral-zh-initial-migration.production-attestation.json`
- 同baseline unitの`README.md`をESTABLISHED状態へ更新

## S. 残存リスク

- Cloudflare-only unknown assetの非存在は未証明。既知6,851 pathsの完全一致のみ証明済み。
- Cloudflareでは`previews_enabled=true`だが、repositoryの`wrangler.zh.jsonc`は`preview_urls`省略。一時的config driftは後続Wrangler guard migrationで同期が必要。
- en / ko / pt / viは依然としてtrusted Production Baseline未確立。
- raw Cloudflare権限によるrepo guard迂回は運用/IAMリスクとして残る。

## T. Locale readiness

| Locale | State |
| --- | --- |
| ja | ESTABLISHED |
| zh | ESTABLISHED |
| en | BOOTSTRAP REQUIRED |
| ko | BOOTSTRAP REQUIRED |
| pt | BOOTSTRAP REQUIRED |
| vi | BOOTSTRAP REQUIRED |

## U. 次工程判定

他locale Initial Migrationへ進む技術的テンプレートはzhで実証できた。ただし一括実行は禁止し、ChatGPT監査後にen / ko / pt / viを1 localeずつserialに承認・移行する。

判定：**YES, AFTER HUMAN/CHATGPT REVIEW OF THIS ZH RESULT**

## V. 最終判定

**ZH PRODUCTION BASELINE ESTABLISHED**
