# HTMLRewriter 工程5-D.4b VI Production Baseline 監査

## A. 結論

PASS — VI PRODUCTION BASELINE ESTABLISHED

ALL 6 LOCALE PRODUCTION BASELINES ESTABLISHED: YES

## B. Git状態

- branch: `main`
- HEAD / origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- 既存5-B以降のmodified / untracked差分を維持
- staged: 0
- tracked deletion: 0
- `git diff --check`: PASS
- commit / merge / push / stash: 0

## C. Pre-switch Production

- Worker: `rm-referral-vi`
- deployment: `37fc9e31-42fa-45a0-9c6f-2aa8f9837155`
- version: `80de55fe-5c6c-434b-85cd-b793e31484b7` (65)
- traffic: 100%
- mixed traffic: NO

## D. Version 66 identity

- version: `a6752de5-fa9f-4821-b2ad-581683328b44` (66)
- pre-switch traffic: 0%
- reupload: 0

## E. Candidate identity

- path: `.deploy/vi`
- files: 6,851
- bytes: 123,838,626
- receipt missing / extra / SHA mismatch: 0 / 0 / 0
- algorithm: `tree-inventory-sha256-v1`
- inventory SHA-256: `f1724285205d3d3652b8335f452d0ca8f311e8227188b0dba16134ff183f5cf1`

## F. Pre-switch 6,851 verification

- evidence: `htmlrewriter-5d4b-vi-pre-switch-version66-evidence.json`
- evidence SHA-256: `41501558f69bb599664ebc4a65f28a36042d506fa675e6285c5dadae488a0609`
- expected / attempted / matched: 6,851 / 6,851 / 6,851
- mismatched / unresolved / failed / unexpected redirects: 0 / 0 / 0 / 0

## G. Production switch

- operation: existing Version 66 -> VI Production 100%
- new Version Upload: 0
- old version: `80de55fe-5c6c-434b-85cd-b793e31484b7`
- new version: `a6752de5-fa9f-4821-b2ad-581683328b44`
- deployment message: `vi initial production baseline migration 5-D.4b`

## H. New deployment/version

- deployment: `e6135318-9997-4d4b-9eee-227484918d69`
- version: `a6752de5-fa9f-4821-b2ad-581683328b44` (66)
- traffic: 100%
- mixed traffic: NO
- deployedAt: `2026-09-26T04:07:17.204841Z`

## I. Immediate sentinel

- locale root / guide / shop / CSS / JavaScript / image / robots / sitemap
- matched: 8/8
- mismatch / unresolved / failed / unexpected redirects: 0 / 0 / 0 / 0

## J. Production 6,851 verification

- evidence: `htmlrewriter-5d4b-vi-production-full-verification-evidence.json`
- evidence SHA-256: `1b8d629fca65a72b7c076448287b7a3218eb3dd8d7ef501cef42821d7ff6e313`
- expected / attempted / matched: 6,851 / 6,851 / 6,851
- mismatched / unresolved / failed / unexpected redirects: 0 / 0 / 0 / 0
- category matched: HTML 6,838; CSS 1; JavaScript 6; Image 4; Font 0; robots 1; sitemap 1; Other 0

## K. Rollback

- required: NO
- executed: NO
- retained target: Version 65 `80de55fe-5c6c-434b-85cd-b793e31484b7`

## L. Production Baseline

- status: ESTABLISHED
- artifact SHA-256: `4ad9dcdbef73c486a11756989b1ca4d82e1a0c4217c3da19df65a74ec16ea26e`
- artifact size: 129,095,680 bytes
- canonical receipt SHA-256: `8ded93e0d63fc69b45ed75a9732f98e878419e209f3327141ca8da9dae219e4c`
- receipt file SHA-256: `05acbcbfb4e89c788d0bc93da48b37945be0453bc006511b44ec9ed144203a6f`
- production attestation SHA-256: `f59eea9381639b540468f00fbf265a6d63541710e76c1d8aa69d267cd1a673a6`
- artifact round-trip: 6,851 files, 123,838,626 bytes, missing / extra / mismatch 0

## M. Transient incident binding

Version 66の初回preview検証で発生した888件（HTML 886、CSS 1、JavaScript 1）の404は`TRANSIENT`として履歴を保持した。その後の5-D.4a全件検証2回、本工程のpre-switch全件検証、switch後Production全件検証はいずれも6,851/6,851一致した。

## N. Tests

- Promotion: 17/17 PASS
- Shared: 15/15 PASS
- Deploy boundary: 14/14 PASS
- Bootstrap / Recovery: 26/26 PASS
- Gate helpers: 13/13 PASS
- total: 85/85 PASS
- JavaScript syntax: PASS
- `git diff --check`: PASS

最初のsandbox内実行ではrepository内一時directory作成がEPERMとなったため、同一suiteを必要権限で再実行した。機能テストの失敗ではない。Gate helperは存在しないnpm script名ではなく、正式な2 test fileを直接実行した。

## O. Build counts

- Astro full build: 0
- `maintenance:full-build`: 0
- `prepare-release.mjs`: 0
- Version Upload: 0

## P. Cloudflare writes

- VI Production Deployment / traffic switch: 1
- VI rollback: 0
- その他write: 0

## Q. Other locale side effects

- ja / zh / en / ko / pt write: 0
- read-only final state: all six Workers are single-version 100%
- ja `a47da27c-ebcb-474e-b357-9ec31602a35a`; zh `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`; en `a4b09119-41b7-467e-bb0f-708ac2d0011d`; ko `34af8581-59bc-4a51-baa1-347f8c4b62d8`; pt `0b6968b1-e5ef-4324-9e8c-481177932f94`; vi `a6752de5-fa9f-4821-b2ad-581683328b44`

## R. Locale readiness

| Locale | Status |
|---|---|
| ja | ESTABLISHED |
| zh | ESTABLISHED |
| en | ESTABLISHED |
| ko | ESTABLISHED |
| pt | ESTABLISHED |
| vi | ESTABLISHED |

## S. Residual uncertainty

The Production Baseline establishes exhaustive identity for all 6,851 known candidate paths. It does not cryptographically prove the absence of Cloudflare-only assets outside the known candidate inventory.

## T. Next phase readiness

READY FOR 5-D.5 FOUNDATION MIGRATION. Topic公開は未実施であり、5-D.5完了前に6言語Promotion Production運用を開始してはならない。

## U. 最終判定

PASS — VI PRODUCTION BASELINE ESTABLISHED

ALL 6 LOCALE PRODUCTION BASELINES ESTABLISHED: YES
