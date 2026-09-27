# HTMLRewriter 工程5-D.3 zh Gate 2 ChatGPT監査レポート

## A. 結論

**BLOCKED**

Phase A Artifact FreezeとVersion UploadはPASSしたが、WranglerがVersion Preview URLを返さず、Wrangler実装から導出されるVersion URLもHTTP 404だった。STOP条件「Version URLが取得できなければSTOP」に従い、Version URL全件検証とProduction Deploymentへ進まなかった。

## B. Gate 1再検証

- result: PASS
- evidence: `docs/audits/htmlrewriter-5d3-zh-gate1-http-evidence.json`
- evidence SHA-256: `c611d00bdf0057b7d603973702b1697f36eca0f06864504fc28ea1e73e8cbaea`
- expected / attempted / matched: 6,851 / 6,851 / 6,851
- mismatched / unresolved / failed / unexpected redirect: 0 / 0 / 0 / 0
- evidence変更・再生成: 0

## C. Candidate

- path: `.deploy/zh`
- files: 6,851
- total bytes: 111,635,363
- inventory schema: 1
- inventory algorithm: `tree-inventory-sha256-v1`
- inventory SHA-256: `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`
- receipt entries: 6,851
- receipt missing / extra / SHA mismatch: 0 / 0 / 0
- candidate drift: NO
- candidate変更・再生成: 0

## D. Current Production

- Worker: `rm-referral-zh`
- deployment: `ebda607e-edf2-4507-9d8e-ee2cc9fb5fca`
- version: `1dcb8a7a-8181-4059-8856-a99166fa2e2a`
- traffic: 100%
- mixed traffic: NO
- upload前drift: NO
- upload後drift: NO

## E. Artifact

- path: `../release-artifacts/production-baselines/zh/initial-migration-20260925-gate2/rm-referral-zh-initial-migration.tar`
- format: deterministic ustar
- SHA-256: `603df75f3010b237230b0e08b6f110dbe9cafd0998e7ceaa61f88b21fda6b413`
- size: 116,888,576 bytes
- deterministic reproduction: PASS。同じtreeから独立生成したartifactも同一SHA-256
- source classification: `human-approved-known-path-production-reconstruction`

archiveはpath順、mtime 0、uid/gid 0、mode 0644、ustar metadataを固定した。candidate asset bytesは変更していない。

## F. Artifact round-trip

- expected: 6,851
- matched: 6,851
- mismatch: 0
- missing: 0
- extra: 0
- total bytes: 111,635,363
- inventory SHA-256: `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`
- upload source: artifactをclean directoryへ展開した`upload-tree`

## G. Receipt

- path: `../release-artifacts/production-baselines/zh/initial-migration-20260925-gate2/rm-referral-zh-initial-migration.receipt.json`
- canonical receipt SHA-256: `fad4c909e9ada6063d08cd78c2e0642523438792f8fb6c723bda845b5e1c7124`
- receipt file SHA-256: `49a928ab88e591c05212d40784c6c9aefc8128816af3c93d0a8b462a22e44302`
- file count / bytes / inventory: 6,851 / 111,635,363 / expected hashと一致

## H. Migration evidence

- path: `../release-artifacts/production-baselines/zh/initial-migration-20260925-gate2/rm-referral-zh-initial-migration.migration-evidence.json`
- canonical SHA-256: `7805d4abeea7785bd5bae4121310f6a77a10213ecd53830e006cf71ccf926c94`
- file SHA-256: `d2c1c604fc2ea9cf1ba257c9e03df702053dbeb56979e3f2b7d14f06dd061937`
- Gate 1 evidence、artifact、receipt、current Production、known path countをbinding済み
- pre-upload attestation canonical SHA-256: `8537be549c37158004fd348104dbe68f252a5f078f94d61153d922974b169dc3`
- pre-upload status: `PENDING_GATE_2_UPLOAD_APPROVAL`
- Production attestationとの混同: なし

## I. Residual uncertainty

All 6,851 known candidate paths were exhaustively verified against the current Production version. This does not prove the absence of Cloudflare-only assets outside the known candidate path set.

Cloudflare asset namespace全体のcomplete cryptographic identityを証明したとは扱っていない。

## J. Version Upload

- result: PASS
- Worker: `rm-referral-zh`
- config: `wrangler.initial-migration.zh.jsonc`
- source: artifact round-trip済みclean `upload-tree`
- source files: 6,851
- source bytes: 111,635,363
- source inventory: `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`
- version ID: `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`
- version number: 66
- createdAt: `2026-09-25T12:58:01.199233Z`
- message: `zh initial baseline migration Gate 2`
- Wrangler asset scan/entry count: 13,960
- updated asset files: 0（Wrangler出力: `No updated asset files to upload`）
- physical blob upload count: NOT EXPOSED
- worker metadata upload: 0.31 KiB / gzip 0.22 KiB

13,960はupload sourceのregular file数ではなく、Wranglerが報告したasset scan/manifest entry countである。regular files 6,851、manifest entries、updated blobsを混同しない。

## K. Version URL

- Wrangler output preview URL: NOT AVAILABLE
- version metadata `has_preview`: true
- Wrangler実装から導出したURL: `https://2bc39880-rm-referral-zh.maffun.workers.dev`
- tested path: `/zh/`
- HTTP result: 404
- verdict: VERSION PREVIEW UNAVAILABLE

preview URLを有効化するためのWorker subdomain設定変更やversion再uploadは行わず、安全停止した。

## L. Version URL全件検証

- expected: 6,851
- attempted: 0
- matched: 0
- mismatched: 0
- unresolved: 0
- failed: 0
- not started: 6,851
- redirects: NOT TESTED

Version URLが利用できないため全件検証を開始していない。Production URLをVersion URLの代用にはしていない。

## M. Category別検証

全categoryでVersion URL検証はNOT STARTED。

| Category | Expected | Attempted | Matched |
| --- | ---: | ---: | ---: |
| HTML | 6,838 | 0 | 0 |
| CSS | 1 | 0 | 0 |
| JavaScript | 6 | 0 | 0 |
| Image | 4 | 0 | 0 |
| Font | 0 | 0 | 0 |
| robots | 1 | 0 | 0 |
| sitemap | 1 | 0 | 0 |
| Other | 0 | 0 | 0 |

代表HTML構造検証もVersion URL不存在のためNOT TESTED。

## N. Production Deployment

**0**

## O. Traffic変更

**0**

## P. Astro full build

**0**

## Q. maintenance full build

**0**

`prepare-release.mjs`: 0

## R. 他locale副作用

- ja: 0
- en: 0
- ko: 0
- pt: 0
- vi: 0

他localeのCloudflare write、artifact、candidate、receipt、Wrangler、Worker、sitemap変更は0。

## S. Tests

| Suite | Result |
| --- | --- |
| Promotion | 17/17 PASS |
| Shared | 15/15 PASS |
| Deploy boundary | 14/14 PASS |
| Bootstrap / Recovery | 26/26 PASS |
| Gate 1 helper | 8/8 PASS |
| Gate 2 artifact/helper | 5/5 PASS |
| Total | 85/85 PASS |
| JavaScript syntax | PASS |
| `git diff --check` | PASS |

Gate 2 testsはdeterministic artifact、round-trip identity、receipt/evidence binding、wrong artifact/receipt/Gate 1 hash、candidate/Production drift、wrong locale/cross-locale/incomplete tree、pre-upload/Production attestation分離を検証した。Version URL mismatch、unexpected redirect、unknown path拒否はGate 1 helper suiteで維持される。

## T. Git状態

- branch: `main`
- HEAD: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: 0
- tracked deletion: 0
- commit / merge / push / stash: 0
- 既存5-B〜5-D.3a差分: 維持

## U. 変更ファイル

Repository:

- `scripts/bootstrap-artifact.mjs` — Initial Migration evidence classificationとinventory metadata対応
- `scripts/initial-migration-gate.mjs` — Gate 2 artifact/evidence/pre-upload binding helper
- `tests/initial-migration-gate.test.mjs` — Gate 2 fail-closed tests
- `docs/audits/htmlrewriter-5d3-zh-gate2-chatgpt-audit.md` — 本監査レポート

Release unit:

- `rm-referral-zh-initial-migration.tar`
- `rm-referral-zh-initial-migration.receipt.json`
- `rm-referral-zh-initial-migration.migration-evidence.json`
- `rm-referral-zh-initial-migration.pre-upload-attestation.json`
- `rm-referral-zh-initial-migration.version-upload.json`
- `wrangler.initial-migration.zh.jsonc`
- `README.md`
- `upload-tree/`（artifact round-trip clean tree、6,851 files）

## V. Gate 2最終判定

**BLOCKED**

Artifact FreezeとVersion Uploadは成功したが、Version URLを取得・検証できていないため、`GATE 2 READY FOR HUMAN PRODUCTION APPROVAL`の条件を満たさない。

作成済みVersion `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`はProduction traffic 0%の未使用versionとして保持する。Production Deployment、traffic変更、rollbackは行わない。
