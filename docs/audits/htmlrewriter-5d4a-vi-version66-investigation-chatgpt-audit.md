# HTMLRewriter 工程5-D.4a VI Version 66 Missing Asset Investigation

## A. 結論

**ROOT CAUSE IDENTIFIED — VERSION 66 SAFE TO REUSE**

観測上のroot cause classificationは **G. TRANSIENT**。Version URLsをupload後に有効化した直後、Version 66のStatic Assets配信が部分的に未反映の状態で、888 pathが同一の404 bodyを返した。Cloudflareへ一切writeせず、同一Version 66は約10分後に6,851/6,851 MATCHへ変化し、その後の2回目の全件検証でも6,851/6,851 MATCHを維持した。

Cloudflare内部のどのpropagation/cache層が原因かはread-only APIからは取得不能。ただし、candidate/receipt/upload input/Version自体の恒久的asset欠落ではないことは実証できた。

## B. Git状態

- branch: `main`
- HEAD / origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: 0
- tracked deletion: 0
- 5-B以降の既知modified/untracked差分を維持
- `git diff --check`: PASS

## C. VI Production状態

- Worker: `rm-referral-vi`
- deployment: `37fc9e31-42fa-45a0-9c6f-2aa8f9837155`
- version: `80de55fe-5c6c-434b-85cd-b793e31484b7` (65)
- traffic: 100%
- mixed traffic: NO
- 開始/終了drift: NO

## D. Version 66状態

- version ID: `a6752de5-fa9f-4821-b2ad-581683328b44`
- number: 66
- createdAt: `2026-09-26T03:42:44.94012Z`
- source: Wrangler
- `has_preview`: true
- Production traffic: 0%（deployment一覧に含まれない）
- assets: `serve_directly=true`, `raw_run_worker_first=false`, `base_path=/`

## E. Candidate identity

- path: `.deploy/vi`
- files: 6,851
- bytes: 123,838,626
- receipt entries: 6,851
- missing / extra / mismatch: 0 / 0 / 0
- inventory algorithm: `tree-inventory-sha256-v1`
- inventory SHA-256: `f1724285205d3d3652b8335f452d0ca8f311e8227188b0dba16134ff183f5cf1`
- candidate drift: NO

## F. Original mismatch set

Source of truth: `docs/audits/htmlrewriter-5d4-vi-gate2-version-url-evidence.json`

- evidence SHA-256: `b09d7663c9c95afdf6036258f532377ef933d7b21329986d6beb851175e92b6e`
- started/completed: `2026-09-26T03:44:20.259Z` / `2026-09-26T03:44:49.267Z`
- expected/attempted: 6,851/6,851
- matched: 5,963
- mismatched: 888
- unresolved / failed / redirect: 0 / 0 / 0
- HTML 886, CSS 1, JavaScript 1

888 recordsは既存evidenceのpath/expected size/expected SHA/actual status/actual SHA/content type/actual sizeで固定した。

## G. Recheck結果

### Recheck 1

- evidence: `htmlrewriter-5d4a-vi-version66-recheck-evidence.json`
- SHA-256: `a67445191b1dd223275a9b2391aec5ad67a7127eb0d94f31dde0f0a45b6cc6e9`
- started/completed: `2026-09-26T03:54:21.801Z` / `2026-09-26T03:54:50.111Z`
- matched: 6,851/6,851
- mismatch / unresolved / failed / redirect: 0 / 0 / 0 / 0
- original 888: すべて `NOW_MATCHED`

### Recheck 2 (stability)

- evidence: `htmlrewriter-5d4a-vi-version66-stability-evidence.json`
- SHA-256: `dd3c6fdda0e268623f4e5d3e16737628cf3a5d313da77f298145683e772fd518`
- started: `2026-09-26T03:56:13.272Z`
- matched: 6,851/6,851
- mismatch / unresolved / failed / redirect: 0 / 0 / 0 / 0

Version/candidate/configの変更なしに、同一Version URLが2回連続で完全一致した。

## H. Path pattern分析

- mismatchはlexicographic上888個の単独runとして全体に分散。contiguous blockなし。
- sorted index range: 5〜6,841
- depth: 5 components = 884; 3 components = 4
- path length: min 17, median 50, p90 60, p99 69, max 85
- matched HTML: median 50, p90 60, p99 69でほぼ同じ
- Unicode / percent encoding / space / uppercase: すべて0
- 同directory familyにmatched peerが存在
- shop route familyに広く分散し、特定prefecture/carrier/path-lengthに限定されない

従ってpath normalization、Unicode、path length、sort truncationは原因と整合しない。

## I. 404 body分析

- original 888件は全てHTTP 404
- content type: `text/html; charset=UTF-8`
- actual size: 19,984 bytes
- body SHA-256: `2000e6b28a1517ba1268e1649cd3163326ef839492edfdba31e8959830580976`
- body group: 1種類 × 888
- candidate内に同一SHAのassetはない
- original responseはETag/CF-Cache-Statusなし、後の200 responseはassetごとの正しいbytes/SHAを返し、CF-Cache-Status `HIT`

個別contentの誤uploadではなく、Version URL Static Assets lookupが一時的に未解決だった際の共通404 responseと判定する。

## J. CSS mismatch詳細

- path: `/vi/css/style.css`
- candidate size/SHA: 54,328 / `17fbfb7671d60a9cdc03eaaffec8f9fb9db44ae3dc12ab0f2f55c8d5b7c95811`
- receipt/candidate/current Production: present and matching
- original Version 66: 404 / 19,984 bytes / common 404 SHA
- recheck 1/2: 200 / exact candidate bytes/SHA
- non-hashed asset

## K. JavaScript mismatch詳細

- path: `/vi/js/prefecture-search.js`
- candidate size/SHA: 2,169 / `4f641d2bd79408e46921c02d4978ffde7b37accdd21f6854ecd21242a37003b0`
- receipt/candidate/current Production: present and matching
- original Version 66: 404 / 19,984 bytes / common 404 SHA
- recheck 1/2: 200 / exact candidate bytes/SHA
- non-hashed asset

CSS/JSもHTMLと同じ404 mechanismであり、HTML handling固有問題ではない。

## L. Upload input reconstruction

- command: `wrangler versions upload --config .../wrangler.initial-migration.vi.jsonc`
- Wrangler: 4.131.1
- source: immutable artifact round-trip `upload-tree`
- upload root regular files/bytes: 6,851 / 123,838,626
- config: assets directory `./upload-tree`; compatibility date `2026-08-21`; Worker `rm-referral-vi`
- `html_handling`, `not_found_handling`, `run_worker_first`: explicit overrideなし
- Version metadata: `raw_run_worker_first=false`, `base_path=/`
- upload-tree内 `.assetsignore`, `_worker.js`, `.gitignore`: 0
- Wrangler output: `No updated asset files to upload`; Version ID 66作成
- candidate→receipt→artifact round-tripのmissing/extra/hash mismatch: 0

Boundary A (candidate→receipt) と Boundary B (receipt→upload input) はPASS。後に同一Version 66が全件を配信したため、Boundary Cの恒久的manifest欠落も棄却できる。問題はBoundary Dの時間依存Version URL availabilityに局在する。

## M. Wrangler / Cloudflare metadata

- Version 66は存在し`has_preview=true`
- static assets metadataは後続全件配信と整合
- Cloudflare API/Wranglerはversion別asset manifest path/digestのread-only exportやupload session内部propagation stateを提供しない
- physical blob upload count / per-path upload acknowledgement: NOT EXPOSED

Cloudflare公式仕様で、Version URLはuploaded versionのexisting configuration/resourcesをProduction前に検証する機能であり、versionはstatic assetsを含むcomplete stateとして扱われる。

- https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/
- https://developers.cloudflare.com/workers/versions-and-deployments/

## N. Successful locale比較

EN/KO/PT/VIは全て：

- Wrangler 4.131.1
- 6,851 regular files
- 同一構造のassets-only upload config
- `./upload-tree`
- `serve_directly=true`, `raw_run_worker_first=false`
- `enabled=false`, upload後`previews_enabled=true`
- Version upload時`No updated asset files to upload`

異なるのはVI Gate 2開始時の時間依存の配信状態だけで、後のVI metadata/config/asset identityは成功localeと同等。

## O. Hypothesis matrix

| Hypothesis | 判定 | 根拠 |
|---|---|---|
| H1 candidateに888件がない | REJECTED | filesystem/receipt/Gate 1で全件存在 |
| H2 receiptから欠落 | REJECTED | 6,851 entries, mismatch 0 |
| H3 upload inputから除外 | REJECTED | artifact round-trip/upload-treeに全件存在、後の同Versionが全件配信 |
| H4 Wrangler manifestに恒久的に未収録 | REJECTED | Versionを変更せず後続6851/6851 |
| H5 Cloudflare asset storageで恒久欠落 | REJECTED | 後続6851/6851を2回連続 |
| H6 Version URL routing/availabilityの一時的404 | CONFIRMED | 同URL/同Version/無writeで404→200 exact bytes |
| H7 HTML handling設定差 | REJECTED | CSS/JSも同じ404、設定差なし |
| H8 path normalization | REJECTED | ASCIIのみ、matched peer存在、後に同pathがPASS |
| H9 asset数/サイズlimit | REJECTED | 6,851全件が後に配信、成功localeも同file count |
| H10 transient propagation/cache | CONFIRMED | upload/preview enable直後の部分404、約10分後に無writeで解消し連続PASS |
| H11 Worker route/run_worker_first差 | REJECTED | assets-only config、raw_run_worker_first=false、CSS/JSも同現象 |
| H12 Version Preview固有の一時的挙動 | CONFIRMED | Productionは同時間帯6851/6851、Version URLのみ時間依存 |

## P. Root cause classification

**G. TRANSIENT**

Boundary D `Cloudflare uploaded Version → Version URL routing/asset availability`における一時的な部分未反映。特に、Version作成後に`previews_enabled`を有効化した直後の検証で発生した。内部実装上のpropagation/cache層名まではUNKNOWNだが、恒久的missing assetではない。

## Q. Version 66 reuse decision

**SAFE TO REUSE**

- current Version URL: 6,851/6,851 MATCH × 2 consecutive runs
- mismatch / unresolved / redirect: 0
- candidate/Production drift: 0
- original 888件: 全件NOW_MATCHED
- Version identity: unchanged
- Version 66のProduction traffic: 0%

後続Gateでは、Production switch直前にもう1回6,851/6,851全件検証とProduction drift checkを必須とする。

## R. New Version required

**NO**

Version 66の再uploadや修正Versionは不要。

## S. Production drift

NO. VI ProductionはVersion 65 / 100%のまま。

## T. 他locale副作用

JA / ZH / EN / KO / PTへのread/write変更: 0。

## U. Tests

- Promotion: 17/17 PASS
- Shared: 15/15 PASS
- Deploy boundary: 14/14 PASS
- Bootstrap / Recovery: 26/26 PASS
- Gate helpers: 13/13 PASS
- Total: 85/85 PASS
- JavaScript syntax: PASS
- `git diff --check`: PASS
- tracked deletion: 0

## V. Build counts

- Astro build/full build: 0
- `maintenance:full-build`: 0
- `prepare-release.mjs`: 0

## W. Cloudflare writes

**0**

- Version Upload: 0
- Production Deployment: 0
- traffic change: 0
- rollback: 0
- preview setting change: 0

## X. 残存リスク

- Cloudflare内部のpropagation/cacheの正確な層と所要時間はAPIから取得不能。
- Version URL enablement/upload直後の即時全件検証で同様の一時404が起こり得る。後続Runbookではbounded wait + repeated full verificationが必要。
- unknown Cloudflare-only asset limitationは従来どおり残る。

## Y. 次工程

`5-D.4b — VI Version 66 Production Switch / Baseline Establishment`

必須Gate：

1. candidate/artifact/evidence identity再検証
2. VI ProductionがVersion 65 / 100%でdriftなし
3. Version 66の6,851/6,851全件検証を切替直前に再実行
4. Version 66のみを100%切替
5. sentinel、Production 6,851/6,851、attestation/round-trip
6. 失敗時はVersion 65へrollback

本工程ではProduction switchを実行していない。
