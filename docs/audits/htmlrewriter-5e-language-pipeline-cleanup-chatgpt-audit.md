# HTMLRewriter 5-E — Legacy Language Pipeline Test Cleanup Audit

Date: 2026-09-28 JST

## A. Conclusion

PASS — the remaining valid legacy language-pipeline safety checks were migrated into the formal guarded-release suite, and the obsolete test file was removed rather than rewritten to make its retired assumptions pass.

PT preflight remains prohibited until this cleanup is committed, clean-commit verified, and pushed after separate human approvals.

## B. Git identity and safety boundary

- Branch: `main`
- HEAD / origin/main: `59f71e07377db9a42558631a56a9c0c65a61e868`
- Ahead / behind before cleanup: `0 / 0`
- Staged: `0`
- Existing untracked Validation sources, plans, evidence, and audits: preserved
- Cloudflare write: `0`
- Production Deployment / traffic / rollback: `0`
- Production Baseline change: `0`
- Full build / `maintenance:full-build`: `0`
- Production generation through `prepare-release.mjs`: `0`
- Commit / push: `0`

The defect-reproduction run executed the legacy test file once. Its obsolete VI test launched the read-only `validate-language-assets.mjs` validator, which imported `verifyReceipt` from `prepare-release.mjs` and failed on the stale receipt before any generation or mutation. The `prepare-release.mjs` entrypoint and its generation path were not invoked.

## C. Legacy test reproduction

`tests/language-pipeline.test.mjs` contained three tests:

1. `all six languages have independent Worker and Wrangler settings` — failed because it required retired `.deploy/<locale>` directories instead of guarded `.deploy/candidate-<locale>` directories.
2. `Vietnamese artifact contains only the /vi/ public root` — failed because it inspected a stale generated `.deploy/vi` tree and invoked the isolated legacy receipt validator.
3. `unknown language is rejected before packaging or deployment` — passed and represented a still-valid fail-closed requirement.

Observed legacy result: `1/3 PASS`, `2/3 FAIL`. This result was preserved as diagnostic evidence and was not converted into a passing legacy path.

## D. Classification and replacement coverage

| Legacy check | Classification | Reason | Formal replacement coverage |
|---|---|---|---|
| Six independent Worker/Wrangler settings | Valid invariant with obsolete directory assertion | Worker/config isolation remains required, but `.deploy/<locale>` is forbidden for normal Promotion | New formal Shared test checks six unique Worker/config bindings; existing `all language entrypoints use the guarded Production release build` checks `.deploy/candidate-<locale>`, `workers_dev=false`, `preview_urls=true`, locale variable, guard command, and Worker entrypoint; existing `normal deploy configs are locale-isolated guarded candidates` checks candidate isolation |
| VI `.deploy/vi` artifact count/root | OBSOLETE / SAFE TO DELETE | It depends on a stale mutable candidate, fixed historical counts, and legacy `prepare-release.mjs` receipt semantics. Current releases must start from an attested Baseline and a clean guarded candidate | Bootstrap/Recovery tests reject cross-locale trees, wrong Worker/config, stale and unbound sources; Foundation canonical mapping tests enforce `/vi` isolation; Promotion tests verify full baseline-copy candidate inventory and exact allowlists; Production evidence verifies all known paths |
| Unknown locale rejection | Valid and migrated | Unknown locale must fail before guarded packaging or deployment | New formal Shared test calls `requireLanguage('fr')` and requires `Unsupported locale`; existing Bootstrap/Recovery `unknown locale fails` independently checks recovery argument rejection |

## E. Changes

1. `tests/shared-release.test.mjs`
   - Added a formal six-language registry test requiring six unique Worker and Wrangler config bindings.
   - Added a formal unknown-locale rejection test.
   - Did not change Worker, guard, Foundation, Wrangler, schema, build, or Production code.
2. `tests/language-pipeline.test.mjs`
   - Deleted as an obsolete test container.
   - It was not archived as executable test code because retaining it under the test tree would continue to advertise stale `.deploy/<locale>` and `prepare-release.mjs` behavior as supported.
3. This audit document
   - Records the migration, replacement coverage, retention policy, and Human Gate.

## F. Known-defect regression preservation

- New Topic truthful diff (`Topic added` plus optional sitemap changed): retained in Foundation/guard tests.
- Static candidate identity versus deterministic edge-response identity: retained in Edge Response tests.
- Shared deterministic edge transformation: retained.
- Publication State binding and unpublished-locale selector/hreflang exclusion: retained.
- Worker exact pathname authorization and collision rejection: retained.
- Foundation/Promotion allowlist separation: retained.
- Full-build and legacy fallback isolation: retained.
- Canonical six-locale mapping and JA empty prefix: retained.
- Stale candidate, cross-locale tree, drift, and unbound source rejection: retained.

## G. Formal regression result

- Promotion: `17/17`
- Shared: `17/17` (previously 15; two migrated checks added)
- Deploy boundary: `14/14`
- Bootstrap / Recovery: `27/27`
- Foundation / guarded Promotion: `36/36`
- Edge response / Publication State: `28/28`
- Gate helpers: `13/13`
- Total: `152/152 PASS`
- Previous formal coverage removed: `0`

## H. Retention and cleanup classification

| Item/group | Classification | Current action | Deadline / deletion condition | Replacement source of truth |
|---|---|---|---|---|
| `tests/language-pipeline.test.mjs` | OBSOLETE / SAFE TO DELETE | Deleted in working tree; deletion becomes authoritative only after approved commit, clean verification, and push | Immediate; commit only after Human Gate | Formal Shared, Bootstrap/Recovery, Foundation, Promotion, and Edge Response tests listed above |
| Migrated registry and unknown-locale assertions | MUST RETAIN | Commit in formal Shared suite | Retain while six-locale guarded architecture is supported; deletion requires a reviewed equivalent test in the same formal suite | `tests/shared-release.test.mjs` |
| This cleanup audit | AUDIT RETENTION | Commit after approval | Permanent compact audit record | Git history and the clean-commit test record |
| Validation source and corrected manifest needed for unfinished PT/VI/JA releases | MUST RETAIN | Local untracked; do not delete or commit in this cleanup | Until all remaining locale releases and Validation cleanup are Production-verified, and not before `2026-12-26` | Final per-locale attestations and cleanup Baselines |
| Current ZH/EN/KO Production artifacts, receipts, and attestations | MUST RETAIN | Baseline store only | While current; after supersession, retain 90 days and until two newer verified Baselines exist | Two newer attested Baselines |
| Immediate predecessor rollback Versions/artifacts | TIME-BOUND RETENTION | Keep | At least seven stable days after switch, no severity-1/2 incident, successor verified, and explicit human rollback-window closure | Current verified Baseline and the next approved rollback generation |
| Multi-megabyte path evidence JSON | TIME-BOUND AUDIT RETENTION | Local/external only; DO NOT COMMIT | 90 days after its release and until the successor is Production-verified; for current 5-E evidence, not before `2026-12-26` | Permanent evidence SHA/aggregate in attestation and compact audit |
| Stale pre-upload candidates and temp output | TEMPORARY / REGENERABLE; SAFE TO DELETE when separately approved | Not touched in this cleanup | Delete before rebuilding the affected locale, or within seven days after durable evidence is hashed | Current attested Baseline plus committed generator, Manifest, Publication State, and Release Plan |

No Production artifact, candidate, evidence JSON, or Cloudflare object was deleted in this cleanup. The only deletion is the explicitly obsolete tracked test file.

## I. Commit candidate inventory

| Path | Status | Purpose |
|---|---|---|
| `tests/shared-release.test.mjs` | Modified; SHA-256 `6902e97cda7cde29b8619c281701d84b6a04d18f10675969b381dbdfd72de945` | Formal migration of six-language registry uniqueness and unknown-locale fail-closed coverage |
| `tests/language-pipeline.test.mjs` | Deleted; HEAD blob was 1,783 bytes, SHA-256 `d6cc66881ec987cafce490ab9fb3f64f6230f6f2f7b7b1cbbd20bdde1c8e6a11` | Remove obsolete `.deploy/<locale>` / legacy receipt test container |
| `docs/audits/htmlrewriter-5e-language-pipeline-cleanup-chatgpt-audit.md` | Added | Durable cleanup and replacement-coverage audit |

Approved commit message proposal: `Retire obsolete language pipeline tests`

## J. DO NOT COMMIT inventory

- All existing untracked full-path evidence JSON and per-locale release-plan JSON.
- Validation Promotion source files and generated/local candidate material; they belong to the unfinished serial Validation release and a later dedicated Git/evidence gate.
- Production Baseline archives, receipts, expanded trees, `.deploy`, temporary output, and Cloudflare metadata dumps.
- Existing untracked EN/KO/ZH release audits are unchanged and are not implicitly added to this narrowly scoped cleanup commit.

Exact untracked inventory at the gate is `74` files: this audit (`1`, COMMIT), Validation source (`6`, DO NOT COMMIT), JSON evidence/plans (`55`, DO NOT COMMIT), and other existing audit Markdown (`12`, DO NOT COMMIT). Thus the DO NOT COMMIT set is exactly the other `73` untracked files returned by `git ls-files --others --exclude-standard`; none is staged or modified by this cleanup.

Unexpected commit candidate: `0`. Unknown classification: `0`.

## K. Human Gate

- Cleanup implementation: `PASS`
- Formal replacement coverage: `PASS`
- Regression tests: `152/152 PASS`
- Production/Cloudflare/Baseline side effects: `0`
- Commit executed: `NO`
- Push executed: `NO`
- PT preflight started: `NO`

READY TO COMMIT LEGACY TEST CLEANUP — WAITING FOR HUMAN APPROVAL
