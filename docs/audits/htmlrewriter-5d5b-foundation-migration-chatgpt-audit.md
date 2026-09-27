# HTMLRewriter 工程5-D.5b Foundation Migration 監査

## A. 結論

**PASS — EN / KO / PT / VI FOUNDATION MIGRATIONS COMPLETE**

`EN → KO → PT → VI` の順でlocale-serialに実行した。各localeで、verified Initial Production Baselineからclean candidateを作成し、exact Foundation allowlist、Version URL全件検証、Production切替、Production全件検証、deterministic artifact round-trip、新Production attestationまで完了した。rollbackは0回。Promotion公開は0件。

## B. 開始時Git状態

- branch: `main`
- HEAD: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: 0
- tracked deletion: 0
- 5-B〜5-D.5aの既知modified/untracked差分を維持
- `git diff --check`: PASS
- commit / merge / push / stash / reset: 0

## C. Wrangler / runtime

- repository / lockfile / runtime: Wrangler `4.131.1`
- normal build guard: `scripts/production-release-guard.mjs`
- canonical mapping: `scripts/locale-mapping.mjs`
- `workers_dev=false`, `preview_urls=true`
- JA public prefixは空文字のまま。`/ja/` migrationは行っていない。

## D. Serial execution

Actual order: **EN → KO → PT → VI**

| Locale | Preflight | Candidate | Version URL | Production | Baseline | Rollback | Result |
|---|---|---|---|---|---|---|---|
| en | PASS | PASS | 6,854/6,854 | 6,854/6,854 | ESTABLISHED | 0 | PASS |
| ko | PASS | PASS | 6,854/6,854 | 6,854/6,854 | ESTABLISHED | 0 | PASS |
| pt | PASS | PASS | 6,854/6,854 | 6,854/6,854 | ESTABLISHED | 0 | PASS |
| vi | PASS | PASS | 6,854/6,854 | 6,854/6,854 | ESTABLISHED | 0 | PASS |

## E. Candidate diff

4 localeとも同じexact diff boundaryを満たした。

- added: 3 (`/<locale>/_includes/header.html`, `/<locale>/_includes/footer.html`, `/<locale>/topics/index.html`)
- changed: 1 (`/<locale>/sitemap.xml`)
- deleted: 0
- unexpected: 0
- unchanged: 6,850
- shop / guide / other Topic / root / CSS / JavaScript / image / font / robots / other locale changes: 0
- unpublished Promotion links/routes: 0

| Locale | Files | Bytes | Inventory SHA-256 | Plan canonical SHA-256 |
|---|---:|---:|---|---|
| en | 6,854 | 114,971,980 | `b5a27de8eafc6cd51ef3b9dce425d26357f10b023ce2743018e7952980cef795` | `2909183bd6f703e6956c41f2f7873e31d8684d261b4b9a2858fbaa7d083d67ee` |
| ko | 6,854 | 119,899,270 | `5ed8d1715b727c073f0b6d8e8eba362d72b14c82939b48677ae2601d357070a2` | `e83f4a63c185f1f789acb617657d7752faf5f8cf85b355d6f0b0cd09537cfa9b` |
| pt | 6,854 | 115,012,768 | `7565c75a81c077456c78e3f4a5008d537417fbff6b58dc97bf06c0df332bb54b` | `71bb9a92e2ca1d3d9f10058fd353bf7c38e32b0edc50e0c33c4de1c4bb9475f4` |
| vi | 6,854 | 123,842,154 | `a1e009a1119208bfe36af84c63a6cbbc898bec0b416131f04bcf74de80b5f463` | `ec9aa3e78e14e5e9fbc1311055474af2678390ccd3f1668f34d207a4556fcb7e` |

## F. Version / Production chain of custody

| Locale | Uploaded Version | Version No. | New Deployment | Traffic |
|---|---|---:|---|---:|
| en | `e63e3a45-59eb-4abc-97fa-18eb0799d005` | 68 | `e4830995-01f6-4d5b-b2a8-3df13aa3e45a` | 100% |
| ko | `8883a63e-2390-40c0-8235-ba7867c989e1` | 63 | `871192d5-96f5-4031-95e6-2cb2ccbe3e28` | 100% |
| pt | `531a1a36-5eef-4383-bb15-7a8026510fdb` | 50 | `992eee0f-034c-42db-b42b-6974b41cd4b1` | 100% |
| vi | `df23b77c-9099-4665-a09a-ef568c829956` | 67 | `3378d4e7-78c7-4264-8a82-5f89c71d1ca7` | 100% |

Version URLとProduction custom domainの両方で各candidateの6,854 known pathsを全件検証した。各localeの結果は同一。

- Expected: 6,854
- Attempted: 6,854
- Matched: 6,854
- Mismatched: 0
- Unresolved: 0
- Failed: 0
- Unexpected redirects: 0
- category: HTML 6,841 / CSS 1 / JavaScript 6 / Image 4 / Font 0 / robots 1 / sitemap 1 / Other 0

VIは過去のInitial Migrationでtransient propagation incidentがあったが、今回のFoundation Version 67は初回Version URL検証から6,854/6,854一致し、再uploadは行っていない。

## G. Production Baseline identities

| Locale | Artifact SHA-256 | Receipt canonical SHA-256 | Receipt file SHA-256 | Attestation SHA-256 |
|---|---|---|---|---|
| en | `f6c8bad587e7f06fd1013370c58022ccdcdbbe1825932257122987bbbc3ee015` | `11af5db80e84a5818729ca7d3f389acc6c56fa9ebdbc45b6a3c747a178731ecb` | `70c1d0d300d8087d9a975124a461bdd21a91b9f9ecce055aafc573a270b6344c` | `49b8a24f31596f86772f21d309fe053681243db0606a44a87881deb360bdc218` |
| ko | `ac8d751be35730230e94238e6d6216456decd6637ecced26a6c318932502c808` | `c9238fdb4764ddb833137fb9464dec27c500c65b11593da50d0e27ba97709986` | `a7462b18712da7090ff91ed8e377234ef5284dd6eccb1ede0c30c91a9a1ef6b4` | `e68c3ceb175a697993956e0a8505b6d2592fbf524b7a73a3cd8bf84902128dba` |
| pt | `cdc274cb5316830c658316a338aa21a12f2ea4e61e9379059fd59e12dd238363` | `5a05ff67256e079ad3d47c43170a15943e3c519bfb4c248409071fc3056168fa` | `8bdba4a0637c11e366269f255025ad4a247eef4e153b977c7889f0d5b268a44c` | `3db30ffdea6a6db65cb79ba311fa7d0d3915ab6e0e3a52e6c1ab62c989bcff7f` |
| vi | `d544438e362faead01a78eaf70a5b29569c6a7f2dee42e690da14545d094ed87` | `e8c568ad9be0f50ede638335916b93e39101e590bab6f7901e273359a53aa48e` | `632a3a8f7e5dc90674e9e3765e65235e2a3d70193c4479e0c813fb8afd2f4711` | `638a340c53eb98d3a5ff0f3512786e55a2f4ea0cb5ae1f7289455d1b50c7673b` |

4 artifactすべてをclean temporary directoryへ展開し、file count / total bytes / canonical inventoryのround-trip一致を確認した。

## H. Evidence files

- `docs/audits/htmlrewriter-5d5b-<locale>-foundation-plan.json`
- `docs/audits/htmlrewriter-5d5b-<locale>-version-url-evidence.json`
- `docs/audits/htmlrewriter-5d5b-<locale>-production-evidence.json`
- `../release-artifacts/production-baselines/<locale>/foundation-20260926|20260927/`

## I. Cloudflare writes

| Locale | Version Upload | Production switch | Rollback | Settings | Other |
|---|---:|---:|---:|---:|---:|
| en | 1 | 1 | 0 | 0 | 0 |
| ko | 1 | 1 | 0 | 0 | 0 |
| pt | 1 | 1 | 0 | 0 | 0 |
| vi | 1 | 1 | 0 | 0 | 0 |
| ja | 0 | 0 | 0 | 0 | 0 |
| zh | 0 | 0 | 0 | 0 | 0 |

Wranglerが報告したmanifest上のupdated assetsは各locale 4件。physical blob upload countはCloudflare/Wranglerから独立値として回復できないため **NOT RECOVERABLE**。

## J. JA / ZH integrity and final six-locale state

| Locale | Deployment | Version | Traffic | Mixed |
|---|---|---|---:|---|
| ja | `1e0187ef-d4c4-4b08-beca-f02d576f0b5e` | `a47da27c-ebcb-474e-b357-9ec31602a35a` | 100% | NO |
| en | `e4830995-01f6-4d5b-b2a8-3df13aa3e45a` | `e63e3a45-59eb-4abc-97fa-18eb0799d005` | 100% | NO |
| ko | `871192d5-96f5-4031-95e6-2cb2ccbe3e28` | `8883a63e-2390-40c0-8235-ba7867c989e1` | 100% | NO |
| pt | `992eee0f-034c-42db-b42b-6974b41cd4b1` | `531a1a36-5eef-4383-bb15-7a8026510fdb` | 100% | NO |
| vi | `3378d4e7-78c7-4264-8a82-5f89c71d1ca7` | `df23b77c-9099-4665-a09a-ef568c829956` | 100% | NO |
| zh | `4d7b6255-63de-49bf-93cb-b54f2506ee1d` | `c30186cb-6ba9-4242-9a3e-1319ab5e8c75` | 100% | NO |

JA / ZHは開始時から不変。JAのpublic URL migrationは不要。

## K. Guard / normal Promotion boundary

- canonical 6-locale mapping: PASS
- exact pathname authorization: PASS
- Foundation allowlist and Promotion allowlist separation: PASS
- active unpublished Promotion route: 0
- old normal `prepare-release.mjs` fallback: unreachable by normal Wrangler build
- normal Promotion maximum: target Topic HTML 1 + locale sitemap 0/1
- Topics index / shared include / shop / guide / other Topic / CSS / JS / image / font / robots: normal Promotion changes forbidden
- partial locale failure isolation and rollback locale isolation: PASS

## L. Tests

Final run:

- Promotion: 17/17 PASS
- Shared: 15/15 PASS
- Deploy boundary: 14/14 PASS
- Bootstrap / Recovery: 27/27 PASS
- Foundation / canonical mapping: 7/7 PASS
- Gate helpers: 13/13 PASS
- Total: **93/93 PASS**
- JavaScript syntax checks: PASS
- `git diff --check`: PASS
- tracked deletion: 0

## M. Build / publication boundary

- Astro full build: 0
- `maintenance:full-build`: 0
- `prepare-release.mjs`: 0
- site-wide regeneration: 0
- Promotion Topic publication: 0
- sitemap Promotion URL additions: 0
- hreflang unpublished Promotion additions: 0

## N. Residual uncertainty

Each Foundation Baseline establishes exhaustive byte/SHA-256 identity for all 6,854 known candidate paths. It does **not** cryptographically prove the absence of Cloudflare-only assets outside the known candidate inventory. This is preserved explicitly in every attestation.

## O. Final answers

- EN FOUNDATION MIGRATION COMPLETE: **YES**
- KO FOUNDATION MIGRATION COMPLETE: **YES**
- PT FOUNDATION MIGRATION COMPLETE: **YES**
- VI FOUNDATION MIGRATION COMPLETE: **YES**
- ALL FOREIGN LOCALE FOUNDATION MIGRATIONS COMPLETE: **YES**
- JA PUBLIC URL MIGRATION REQUIRED: **NO**
- CANONICAL 6-LOCALE MAPPING PRESERVED: **YES**
- NORMAL PROMOTION SINGLE-TOPIC BOUNDARY PRESERVED: **YES**
- ALL 6 LOCALE FOUNDATION BASELINES ESTABLISHED: **YES**
- READY FOR 5-E: **YES**
