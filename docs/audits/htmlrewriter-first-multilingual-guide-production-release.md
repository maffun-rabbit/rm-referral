# First multilingual Guide Production release

Date: 2026-10-01

## Result

PASS. The existing `replacement-program` Guide was released serially for JA, EN, KO, PT, VI and ZH. Each upload contained exactly the approved Guide HTML change. Every Version URL and Production hostname known-path verification matched the approved candidate with zero mismatch, unresolved response, failure or unexpected redirect. No rollback was required.

| Locale | Production version | Deployment | Rollback version | Files / verification | Inventory SHA-256 |
|---|---|---|---|---|---|
| ja | v112 `5beeaa26-85c9-40b4-9714-75291f75f5d8` | `30d03a82-853c-44f3-91ea-c806c770496e` | v109 `695913fe-11d2-4042-8f81-1e4474c60d9d` | 7,980 / 7,980 | `bff1d4df9cc35d25caa8158b0ff4f0a2b145680b6b53496424b1a444d4721f65` |
| en | v70 `ef941fd3-9570-499f-bea7-317ea47e1b7b` | `db21689f-500e-41c8-881f-82de54c5dc9b` | v69 `0ee7449a-ea22-4418-be90-c13ac83b03fd` | 6,855 / 6,855 | `40cc7733a52591d8dce0d59aa2ccacac3905578511a4bfcc00efd3ec6791e08b` |
| ko | v65 `f4bee944-fd09-474b-a16a-1f22e8e969e7` | `0bbd2106-7701-4c5d-a202-f8a929b5f7f9` | v64 `573ed18c-fc27-4887-8f80-54404493ea1a` | 6,855 / 6,855 | `4a08189502da5e557bcfc6cf17c6e0d21198f481bd01e75501f153d7e2558a40` |
| pt | v52 `ad58f270-2380-46a2-bac5-707baa4b39b1` | `3872920b-7b0c-4489-b81f-3556e88bc25f` | v51 `58f48159-f9e2-46b9-a20e-54753dab05dc` | 6,855 / 6,855 | `d8f3c5ed1a2f2c10d42083a87dbb186ccbd4013f72d306effb9a144f75ca142d` |
| vi | v69 `d821755d-25a6-4ed1-bfe8-6a95e6ddb12e` | `e25d3811-b86b-4c3b-82e7-efefee0e29ec` | v68 `55fa4fc5-2aed-44dd-8c09-08e71452dbb1` | 6,855 / 6,855 | `b6b71ae1d26854034c8c90d8c6305953ce7c02cdc3d181a1cc9cf37780690547` |
| zh | v71 `e32ce92d-dca4-4516-9fba-9fa446e83812` | `02f81ca9-f02e-4b4b-9c55-828594072061` | v70 `fab080fe-576e-45c8-97bc-dac491b341c0` | 6,855 / 6,855 | `5a0765e8e491fbeb0420bf54488f0e39ad25acb0b1ca46bb04ecd10e19cf8fb7` |

## Verification and baseline custody

The target Guide bytes cover the approved title, description, H1, canonical, five visible FAQs, matching FAQPage data, internal links and locale-specific referral URL. Exact candidate byte identity on Production therefore binds those reviewed semantics. Existing Promotion edge routes were verified against deterministic edge identities; the retained JA P0 route was verified independently. All other known paths used static byte/SHA-256 identity.

For every locale a deterministic ustar artifact, canonical receipt and Production attestation were saved under `release-artifacts/production-baselines/<locale>/guide-replacement-program-20261001-v<version>/` in canonical durable storage. Each artifact passed clean extraction inventory round-trip. Full build, maintenance full build and legacy prepare-release were not used.

Formal regression: 169/169 PASS. `git diff --check`: PASS. Rollback count: 0.

## Backlog

- JA Version v111 `18e854c5-c8bc-4815-a67c-2bbe14bfba85` is a failed, zero-traffic upload created without the retained Promotion pathname binding. It was never verified or promoted and should be handled under the existing controlled Cloudflare version-retention policy.
- The unused short URL `https://go.mnp-navi.jp/r/e36dc612` remains unchanged; cleanup is outside this release.
- Generic Guide release-path expansion is outside this one-article release.
