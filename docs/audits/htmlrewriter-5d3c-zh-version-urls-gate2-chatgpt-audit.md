# HTMLRewriter 工程5-D.3c zh Version URLs Enablement / Gate 2 ChatGPT監査レポート

## A. 結論

**PASS**

`rm-referral-zh`だけについて、Production workers.devを無効のまま維持し、Version URLsだけを有効化した。既存Version 66を再uploadせず、Version URL上のknown paths 6,851件を固定artifact/candidate inventoryと全件照合し、6,851/6,851 MATCHを確認した。

最終判定：**GATE 2 COMPLETE — READY FOR HUMAN PRODUCTION APPROVAL**

## B. 開始時Production

- Worker: `rm-referral-zh`
- deployment: `ebda607e-edf2-4507-9d8e-ee2cc9fb5fca`
- version: `1dcb8a7a-8181-4059-8856-a99166fa2e2a`
- traffic: `100%`
- mixed traffic: `NO`

## C. Version 66

- ID: `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`
- number: `66`
- createdAt: `2026-09-25T12:58:01.199233Z`
- `has_preview`: `true`
- production traffic: `0%`
- existence: `YES`
- reupload: `0`

## D. Evidence再検証

- Gate 1 evidence SHA-256: `c611d00bdf0057b7d603973702b1697f36eca0f06864504fc28ea1e73e8cbaea`
- candidate inventory algorithm: `tree-inventory-sha256-v1`
- candidate inventory SHA-256: `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`
- candidate files: `6,851`
- candidate bytes: `111,635,363`
- receipt entries / missing / extra / mismatch: `6,851 / 0 / 0 / 0`
- artifact SHA-256: `603df75f3010b237230b0e08b6f110dbe9cafd0998e7ceaa61f88b21fda6b413`
- canonical receipt SHA-256: `fad4c909e9ada6063d08cd78c2e0642523438792f8fb6c723bda845b5e1c7124`
- receipt file SHA-256: `49a928ab88e591c05212d40784c6c9aefc8128816af3c93d0a8b462a22e44302`
- migration evidence canonical SHA-256: `7805d4abeea7785bd5bae4121310f6a77a10213ecd53830e006cf71ccf926c94`
- candidate drift before/after verification: `NO`

## E. Before subdomain state

- `enabled`: `false`
- `previews_enabled`: `false`
- `preview_url_suffix`: `-rm-referral-zh.maffun.workers.dev`

## F. Cloudflare write

実施したwriteは1件だけ。

- API: Worker Script Subdomain setting update
- Worker: `rm-referral-zh`
- request intent: `{ "enabled": false, "previews_enabled": true }`
- result: HTTP 200 / success true

Version upload、deployment、route、custom domain、Access、Worker code、assetsへのwriteは行っていない。

## G. After subdomain state

- `enabled`: `false`
- `previews_enabled`: `true`
- Production workers.dev exposure: `NO`

期待状態と完全一致した。

## H. Production drift

| State | Deployment | Version | Traffic |
| --- | --- | --- | ---: |
| write前 | `ebda607e-edf2-4507-9d8e-ee2cc9fb5fca` | `1dcb8a7a-8181-4059-8856-a99166fa2e2a` | 100% |
| write直後 | 同一 | 同一 | 100% |
| 全件検証後 | 同一 | 同一 | 100% |

- drift: `NO`
- Version 66 traffic change: `NO`（0%維持）

## I. Version URL

`https://2bc39880-rm-referral-zh.maffun.workers.dev`

Version ID prefixとCloudflare metadataの`preview_url_suffix`から確定した。

## J. Sentinel

全8件が初回HTTP 200、redirect 0、size/SHA-256一致。

| Category | Path | Result |
| --- | --- | --- |
| locale root | `/zh/` | MATCH |
| guide | `/zh/guide/foreigners/` | MATCH |
| shop | `/zh/aichi/au/au-shop-aeon-mall-nagakute/` | MATCH |
| CSS | `/zh/css/style.css` | MATCH |
| JavaScript | `/zh/js/analytics.js` | MATCH |
| image | `/zh/images/guides/rakuten-id/rakuten-id-registration-form.png` | MATCH |
| robots | `/zh/robots.txt` | MATCH |
| sitemap | `/zh/sitemap.xml` | MATCH |

Fontはcandidate内0件のためsentinel対象なし。

## K. Full Version URL verification

- Expected: `6,851`
- Attempted: `6,851`
- Matched: `6,851`
- Mismatched: `0`
- Unresolved: `0`
- Failed: `0`
- Unexpected redirects: `0`
- candidate stable: `true`
- bounded concurrency: `12`
- retry attempts: 最大`3`

## L. Category results

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

代表HTMLについてtitle、description、canonical、robots、`lang=zh-CN`、JSON-LD、h1、main、header、footer、navigation、CTA/internal linksの存在を静的確認した。Version URL bytesがartifact bytesと一致するため、構造も固定artifactと一致する。

## M. Gate 2 evidence

- 全件詳細 evidence: `docs/audits/htmlrewriter-5d3c-zh-gate2-version-url-evidence.json`
- SHA-256: `ee1b20fffcafc3603d7fba75cf69516d62a172cfffba63ef3b9f5f344de65b51`
- binding record: `docs/audits/htmlrewriter-5d3c-zh-gate2-verification-binding.json`
- binding record SHA-256: `dd927e9eaff02107553a73cbf21e78ecc503b11ff30bf9c6498118579e9f4ec2`
- verifiedAt: `2026-09-25T21:36:56.626Z`

Binding recordはGate 1、artifact、receipt、migration evidence、Version 66、Version URL evidence、inventory、Production state、Version URL settingを結合する。

## N. Residual uncertainty

All 6,851 known candidate paths were exhaustively verified against both the pre-migration Production version and uploaded Version 66. This does not prove the absence of Cloudflare-only assets outside the known candidate path set.

Cloudflare asset namespace全体のcomplete cryptographic identityや、candidate外assetが存在しないことを証明したとは扱わない。

## O. Version Upload

`0`

## P. Production Deployment

`0`

## Q. Traffic変更

`0`

## R. Cloudflare write

- zh `previews_enabled: false → true`: `1`
- zh `enabled`変更: `0`（false維持）
- Version upload: `0`
- Production deployment: `0`
- 他Cloudflare write: `0`

## S. Astro full build

`0`

`prepare-release.mjs`: `0`

## T. maintenance full build

`0`

## U. 他locale副作用

| Locale | Cloudflare write | Repository/config変更 |
| --- | ---: | ---: |
| ja | 0 | 0 |
| en | 0 | 0 |
| ko | 0 | 0 |
| pt | 0 | 0 |
| vi | 0 | 0 |

## V. Tests

- Promotion: `17/17 PASS`（初回sandbox EPERM後、通常権限で同一suiteを再実行してPASS）
- Shared: `15/15 PASS`
- Deploy boundary: `14/14 PASS`
- Bootstrap / Recovery: `26/26 PASS`
- Gate 1 / Gate 2 helpers: `13/13 PASS`
- JavaScript syntax: `2/2 PASS`
- `git diff --check`: `PASS`
- 合計Node tests: `85/85 PASS`

初回Promotion failureは`.single-page-source`へのsandbox書込み制約によるEPERMで、テスト・production codeのfailureではない。許可された再実行で17/17 PASSを確認した。

## W. Git状態

- branch: `main`
- HEAD: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: `0`
- tracked deletion: `0`
- 既存5-B以降のmodified/untracked差分: 維持
- commit / merge / push / stash / revert: `0`

本工程の追加ファイル：

- `docs/audits/htmlrewriter-5d3c-zh-gate2-version-url-evidence.json`
- `docs/audits/htmlrewriter-5d3c-zh-gate2-verification-binding.json`
- `docs/audits/htmlrewriter-5d3c-zh-version-urls-gate2-chatgpt-audit.md`

## X. Repository/Cloudflare config drift

- Cloudflare: `previews_enabled=true`
- repository `wrangler.zh.jsonc`: `preview_urls` omitted

意図的な一時driftである。工程5-DのWrangler guard migration完了前に別semantic changeを混ぜないため、repository configは今回変更していない。後続の正式同期まで、`preview_urls`省略のWrangler操作が現在値を変更しないことを維持する必要がある。

## Y. Gate 2最終判定

**GATE 2 COMPLETE — READY FOR HUMAN PRODUCTION APPROVAL**

ProductionはVersion 65・traffic 100%のままである。Version 66へのProduction切替は実施していない。
次工程は人間承認後の別指示：

**工程5-D.3d — zh Gate 3: Initial Production Switch / Production Baseline Establishment**
