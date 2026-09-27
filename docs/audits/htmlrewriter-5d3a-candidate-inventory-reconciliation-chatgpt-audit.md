# HTMLRewriter 工程5-D.3a Candidate Inventory Hash Reconciliation ChatGPT監査レポート

## A. 結論

**PASS — SAME TREE / CANONICALIZATION RECONCILED**

`d6e849f3ca468b7bf5e09b15b03d1cc6e67011df4642eb335122333d50d1a016` と `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e` は、同一の6,851 path、同一size、同一file SHA-256 mapを異なるkey順でcompact JSON serializationした結果である。candidate content driftではない。

## B. Git状態

- branch: `main`
- HEAD: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: 0
- tracked deletion: 0
- modified/untracked: 5-B〜5-D.2の既知差分を維持。今回の変更は下記Jの3ファイルのみ
- `git diff --check`: PASS

## C. Candidate identity

- path: `.deploy/zh`
- regular files: 6,851
- total bytes: 111,635,363
- `.deploy/release.json` zh entries: 6,851
- missing: 0
- extra: 0
- file SHA-256 mismatch: 0
- size mismatch: NOT AVAILABLE（legacy release receiptはsize fieldを持たない）。filesystem側total bytesは5-D.3記録と一致
- cross-locale contamination: 0（locale recovery guard testで拒否を確認）

`.deploy/zh`および`.deploy/release.json`は変更・再生成していない。

## D. 旧inventory

- hash: `d6e849f3ca468b7bf5e09b15b03d1cc6e67011df4642eb335122333d50d1a016`
- source: `scripts/deploy-boundary.mjs`の`inventory('.deploy/zh')`結果
- algorithm: inventory objectをrecursive filesystem traversalの挿入順のまま`JSON.stringify`し、そのUTF-8 bytesをSHA-256
- path normalization: `path.relative`後にplatform separatorを`/`へ変換し、先頭`/`を付与
- serialization: compact JSON object、whitespaceなし、trailing newlineなし
- value field order: `sha256`, `size`
- serialized byte length: 990,462
- reproducible: YES
- semantics: **NON_CANONICAL_DIAGNOSTIC_HASH**。同じtree内容でもtraversal insertion orderに依存するため正式bindingには使用しない

## E. 現inventory

- hash: `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`
- source: `scripts/promotion-release.mjs`
- schema: `1`
- algorithm: `tree-inventory-sha256-v1`
- input tree: `.deploy/zh`
- path normalization: `inventory()`がrelative pathを`/` separatorへ正規化し先頭`/`を付与
- path order: global code-point order。filesystem traversal orderから独立
- case sensitivity: preserved / case-sensitive
- file hash: SHA-256
- file size: included
- directory entries: excluded
- root file: `/index.html`等のregular fileとして含む。root directory自体は含まない
- symlink: `inventory()`が拒否
- hidden regular file: 他のregular fileと同様に含む
- serialization: UTF-8 compact JSON object、whitespaceなし、trailing newlineなし
- key field order: global path sort
- value field order: canonical `{sha256,size}`へ再構成
- Unicode normalization: 追加変換なし。filesystemから得たpath code pointsを保持
- serialized byte length: 990,462
- reproducible: YES。元mapと逆挿入順mapの両方が同じhash
- temp verification bytes: `/private/tmp/zh-tree-inventory-v1-a.json`、`/private/tmp/zh-tree-inventory-v1-b.json`（repository外、一時診断用）
- semantics: **TREE_INVENTORY_V1**

## F. Difference

- tree content difference: NO
- canonicalization difference: YES
- exact cause: legacyは各directoryを再帰的に並べたobject insertion order、currentは完成した全path mapをglobal code-point sortした順序
- first differing serialized byte offset: 17,681（0-based）
- first differing record index: 126（0-based）
- legacy record: `/zh/aichi/au/au-style-nagoya/index.html`
- canonical record: `/zh/aichi/au/au-style-nagoya-noritake/index.html`
- previous canonical record: `/zh/aichi/au/au-style-miyoshi-minami/index.html`
- serialized byte lengthは双方990,462で、差はrecord orderのみ

## G. Path/hash map comparison

| 項目 | 結果 |
| --- | ---: |
| filesystem path count | 6,851 |
| receipt path count | 6,851 |
| missing | 0 |
| extra | 0 |
| SHA-256 mismatch | 0 |
| size mismatch | N/A（receiptにsizeなし） |

aggregate hashとは独立に、filesystem mapとrelease receipt mapのpath/file SHA-256 identityを確認した。

## H. Hash semantics

- `d6e849...`: `NON_CANONICAL_DIAGNOSTIC_HASH`。traversal insertion order serialization
- `5b0ad5...`: `TREE_INVENTORY_V1`。schema 1 / algorithm `tree-inventory-sha256-v1`
- receipt canonical hashおよびreceipt file hashとは別物

## I. Canonical algorithm

- selected algorithm: `tree-inventory-sha256-v1`
- schema: 1
- implementation: `inventoryCanonicalBytes()`と`inventorySha256()`
- canonical input: global code-point-sorted `/relative/path`をkeyとし、valueを`{sha256,size}`順へ再構成したcompact JSON UTF-8 bytes
- rationale: traversal order、insertion order、platform separator、value property insertion orderに依存しない。path/content/add/delete/renameに敏感
- plan binding: promotion planへ`baselineInventorySchema`と`baselineInventoryAlgorithm`を記録し、不足・未知値はfail-closed
- deterministic evidence: identical treeの通常挿入順、逆挿入順、value field逆順で同一hash

## J. Code changes

1. `scripts/promotion-release.mjs`
   - `INVENTORY_SCHEMA = 1`
   - `INVENTORY_ALGORITHM = tree-inventory-sha256-v1`
   - `inventoryCanonicalBytes()`を追加
   - global code-point path sortとvalue field順を固定
   - planにschema/algorithmを保存し、candidate buildで必須検証
2. `tests/promotion-release.test.mjs`
   - determinism、insertion/traversal order independence、value field order independence
   - content/add/delete/rename sensitivity
   - missing/unknown algorithm metadataのfail-closed test
3. `docs/audits/htmlrewriter-5d3a-candidate-inventory-reconciliation-chatgpt-audit.md`
   - 本監査証跡

candidate、release receipt、Worker、Wrangler production config、page sourceは変更していない。

## K. Tests

| Suite | Result |
| --- | --- |
| JavaScript syntax checks | PASS |
| Promotion | 17/17 PASS |
| Shared | 15/15 PASS |
| Deploy boundary | 14/14 PASS |
| Bootstrap / Recovery | 26/26 PASS |
| Total | 72/72 PASS |
| `git diff --check` | PASS |

補足: 最初のsandbox内実行ではPromotion build testの一時directory作成がEPERMとなった。権限を変えずコード修正で回避せず、同じ正式suiteをrepositoryのテスト用一時領域へ書き込める実行環境で再実行し、最終結果72/72 PASSを確認した。

## L. Production side effects

- Cloudflare read count: 0
- Cloudflare write: 0
- Version Upload: 0
- Production Deployment: 0
- Traffic変更: 0
- Rollback: 0
- Artifact作成: 0
- Production Baseline変更: 0
- Production HTTP 6,851 path verification: 0
- Astro full build: 0
- maintenance full build: 0
- `prepare-release.mjs`: 0
- 他locale変更: 0

## M. 5-D.3 resume readiness

**YES**

5-D.3 Gate 1再開時は、inventory schema `1`、algorithm `tree-inventory-sha256-v1`、expected hash `5b0ad5e0ba204252295f9b50d5fef150ebb0559e7214507b050d365dbe1a9a0e`を明示する。旧`d6e849...`を上書き・消去せず、legacy non-canonical diagnostic evidenceとして関係を保持する。

## N. Next action

**工程5-D.3 Gate 1をzhだけで再開し、正式`TREE_INVENTORY_V1`をcandidate gateに使用してから、Production既知6,851 pathのread-only全件HTTP照合を実行する。**

本工程ではそのHTTP照合を開始していない。
