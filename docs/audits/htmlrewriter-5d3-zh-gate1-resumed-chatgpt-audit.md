# HTMLRewriter 工程5-D.3 zh Gate 1 再開 ChatGPT監査レポート

## A. 結論

**PASS — GATE 1 READY FOR HUMAN APPROVAL**

Exhaustive byte/hash verification completed for all 6,851 known candidate paths against the unchanged current zh Production version.

## B. Git状態

- branch: `main`
- HEAD: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: 0
- tracked deletion: 0
- modified/untracked: 5-B〜5-D.3aの既知差分を維持。今回追加したhelper/test/evidence/reportは未stage・未commit
- `git diff --check`: PASS
- revert / stage / commit / stash / delete: 0

## C. Wrangler

- package: `4.131.1`
- lockfile resolved: `4.131.1`
- execution: `4.131.1`
- 判定: PASS

sandbox内version確認ではWrangler診断ログ先へのEPERM表示が出たが、CLIは`4.131.1`を返した。Cloudflare metadata readは通常のread-only実行環境で成功した。

## D. Candidate

- path: `.deploy/zh`
- files: 6,851
- total bytes: 111,635,363
- receipt entries: 6,851
- receipt missing: 0
- receipt extra: 0
- receipt SHA mismatch: 0
- receipt file SHA-256: `417d351d1abffae8586e3ac663788993686e93d487a57110495b6a24950a8600`
- inventory schema: `1`
- inventory algorithm: `tree-inventory-sha256-v1`
- inventory SHA-256: `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`
- legacy `d6e849f3ca468b7bf5e09b15b03d1cc6e67011df4642eb335122333d50d1a016`: `NON_CANONICAL_DIAGNOSTIC_HASH`としてのみ保持

## E. Production before

- Worker: `rm-referral-zh`
- host: `https://mnp-navi.jp`
- route namespace: `/zh/*`
- deployment: `ebda607e-edf2-4507-9d8e-ee2cc9fb5fca`
- version: `1dcb8a7a-8181-4059-8856-a99166fa2e2a`
- version number: 65
- traffic: 100%
- mixed traffic: NO
- deployment timestamp: `2026-09-21T08:13:01.498664Z`
- version created: `2026-09-21T08:13:01.232101Z`

## F. HTTP verification

- final evidence: `docs/audits/htmlrewriter-5d3-zh-gate1-http-evidence.json`
- evidence SHA-256: `c611d00bdf0057b7d603973702b1697f36eca0f06864504fc28ea1e73e8cbaea`
- evidence size: 6,435,094 bytes
- startedAt: `2026-09-25T12:39:18.537Z`
- completedAt: `2026-09-25T12:39:39.041Z`
- concurrency: 12
- timeout: 30,000 ms
- maximum attempts: 3

| Result | Count |
| --- | ---: |
| Expected | 6,851 |
| Attempted | 6,851 |
| Matched | 6,851 |
| Mismatched | 0 |
| Unresolved | 0 |
| Failed | 0 |
| Not started | 0 |

比較対象はHTTP content decoding後のbody bytesで、whitespace、line ending、HTML、JSON、charset等のnormalizeは行っていない。

## G. Category results

| Category | Expected | Attempted | Matched | Mismatched | Unresolved | Failed | Redirects |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HTML | 6,838 | 6,838 | 6,838 | 0 | 0 | 0 | 0 |
| CSS | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| JavaScript | 6 | 6 | 6 | 0 | 0 | 0 | 0 |
| Image | 4 | 4 | 4 | 0 | 0 | 0 | 0 |
| Font | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| robots | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| sitemap | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| Other | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## H. Redirect results

- final redirect count: 0
- expected canonical mapping:
  - `/zh/index.html` → `/zh/`
  - `/**/index.html` → corresponding trailing-slash directory URL
  - non-index `*.html` → extensionless canonical URL
  - CSS/JS/image/font/robots/sitemap/other → asset path unchanged
- unexpected redirect: 0

初回診断ではnon-index HTMLである`/zh/google55b1c42743aa7ee2.html`へ直接要求し、307でextensionless URLへ正規化された。最終body 54 bytesとSHA-256はcandidateと一致していた。この結果を隠さず`htmlrewriter-5d3-zh-gate1-http-evidence-attempt1.json`（SHA-256 `e001f705326ecbeb956c7e7b8153be3dfcae7b05da2f9e963a281d7e899e78ec`）へ保存した。candidate内の非index HTMLはこの1件だけである。Cloudflare Static Assetsの既存HTML canonicalizationに合わせ、全HTMLへ一貫するdeterministic mappingをunit testで固定してからGateを最初から再実行した。

## I. Mismatch details

Final verification mismatch: **0**

## J. Production after

- deployment: `ebda607e-edf2-4507-9d8e-ee2cc9fb5fca`
- version: `1dcb8a7a-8181-4059-8856-a99166fa2e2a`
- traffic: 100%
- drift from Production before: NO

## K. Candidate after

- files: 6,851
- bytes: 111,635,363
- receipt missing / extra / mismatch: 0 / 0 / 0
- inventory: `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`
- drift from Candidate before: NO
- `.deploy/zh`変更・touch・再生成: 0
- `.deploy/release.json`変更: 0

## L. Unknown asset uncertainty

本工程で成立した証拠は、current zh Productionの変更されていない同一versionに対する、既知candidate 6,851 pathの全件byte/hash一致である。

Cloudflare current versionの全Static Assets manifestをread-only exportできないため、candidate外の未知assetが存在しないこと、およびCloudflare asset namespace全体のcryptographic complete identityは証明していない。このresidual uncertaintyはInitial Migrationの人間承認対象として残す。

## M. Artifact

0

## N. Version Upload

0

## O. Production Deployment

0

## P. Cloudflare write

0

Cloudflare read-only metadata取得とProduction HTTP GETだけを実施した。最終Gate runは6,851 GET。初回path-mapping診断runも6,851 GETで、証拠として分離保存した。

## Q. Astro full build

0

## R. maintenance full build

0

`prepare-release.mjs`: 0

## S. 他locale影響

0

ja / en / ko / pt / viのProduction HTTP全件照合、candidate、Worker、Wrangler、baseline、sitemap、Topic、trafficには触れていない。

## T. Tests

| Suite | Result |
| --- | --- |
| Promotion | 17/17 PASS |
| Shared | 15/15 PASS |
| Deploy boundary | 14/14 PASS |
| Bootstrap / Recovery | 26/26 PASS |
| Gate 1 HTTP helper | 8/8 PASS |
| Total | 80/80 PASS |
| JavaScript syntax | PASS |
| `git diff --check` | PASS |

Gate 1 helper testsはdeterministic path mapping、locale root/index/non-index HTML/static mapping、redirect拒否、hash match/mismatch、404、transient retry、retry exhaustion、bounded concurrency、Production/candidate drift detectionを含む。

## U. Gate 1判定

**PASS — GATE 1 READY FOR HUMAN APPROVAL**

## V. Gate 2 readiness

**WAITING FOR HUMAN APPROVAL**

deterministic artifact、canonical receipt、Initial Migration Plan、review record、attestation、Version Upload、Version URL検証、Production切替、Production Baseline確立は実施していない。
