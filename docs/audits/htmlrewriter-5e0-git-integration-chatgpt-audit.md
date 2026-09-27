# HTMLRewriter 工程5-E.0 Git Integration / Audit

## A. 結論

**PARTIAL — HUMAN GATE 1 READY / WAITING FOR HUMAN COMMIT APPROVAL**

Production・Cloudflare・Baselineに変更を加えず、working tree全93ファイルをinventory化・分類した。UNKNOWNは0。commit候補は本監査文書を含む56ファイル、do-not-commitは38 JSON evidence/plan。commit/stage/pushは未実施。

## B. 開始時Git

- branch: `main`
- HEAD: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- origin/main after fetch: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- merge-base: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- ahead / behind: 0 / 0
- staged: 0
- modified tracked: 17
- untracked before this report: 76
- tracked deletion: 0
- remote drift: NO
- `git diff --check`: PASS

## C. 差分inventory

本表はGate 1開始時の93ファイルをpath / status / size / SHA-256で固定したもの。repository referenceはworking tree path。

| Path | Status | Bytes | SHA-256 | Category | Introduced phase | Production relevance | Recommendation |
|---|---:|---:|---|---|---|---|---|
| astro-site/src/config/site.ts |  M | 2361 | `7fe7a05242bcb3f4549bde77cfe5aca62883d758ea3c63d7690f0d6b991660b1` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| astro-site/src/layouts/BaseLayout.astro |  M | 3431 | `f8c1cfba0c664df3604a39e12a472eb4161e9d2f175da95fb0d2c6691baf5921` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| docs/audits/htmlrewriter-5c-chatgpt-audit.md | ?? | 8687 | `05fbd42abdc339de0dc9b7a4b3299de8c8d7cffa9922fc6ddbaaf7baf86ca267` | AUDIT EVIDENCE — COMMIT | 5-C | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5c-promotion-production-architecture.md | ?? | 5814 | `da505f17ac533b56d9758f300f7b245f0b34ae3bdf84125a4020aa95636f60af` | AUDIT EVIDENCE — COMMIT | 5-C | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d-chatgpt-audit.md | ?? | 8648 | `ebdabc874d864632fa0364a55fcabe4e1f04188d1328fc2ff1303ed1f8a238dd` | AUDIT EVIDENCE — COMMIT | 5-B–5-D.5 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d1-production-baseline-recovery-chatgpt-audit.md | ?? | 12991 | `19f30c5860e7049f07e4b49d69c68e66127b7739bdd4bc84f34999258ebed23f` | AUDIT EVIDENCE — COMMIT | 5-D.1 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d2-chatgpt-audit.md | ?? | 10137 | `ab616e8f6503258ffcdeabcc69685f45527a3c2ac2ba6135a0fe4bbce2b75f68` | AUDIT EVIDENCE — COMMIT | 5-D.2 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d2-initial-baseline-migration-design.md | ?? | 14002 | `e56db820b319e0bb182c9000a9c4f2070414ebd7ff69c3ec9f12eea782ef13ae` | AUDIT EVIDENCE — COMMIT | 5-D.2 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d3-zh-gate1-http-evidence-attempt1.json | ?? | 6441974 | `e001f705326ecbeb956c7e7b8153be3dfcae7b05da2f9e963a281d7e899e78ec` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.3 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d3-zh-gate1-http-evidence.json | ?? | 6435094 | `c611d00bdf0057b7d603973702b1697f36eca0f06864504fc28ea1e73e8cbaea` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.3 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d3-zh-gate1-resumed-chatgpt-audit.md | ?? | 6522 | `9a2af101c5fcb5c3eb674b227c677c0b55aafed0894937e2c13d033008b6b779` | AUDIT EVIDENCE — COMMIT | 5-D.3 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d3-zh-gate2-chatgpt-audit.md | ?? | 8127 | `3a0ad93ccb04c363cedcd39e10793704fd88e19cc006578dd03b1d1b4da02615` | AUDIT EVIDENCE — COMMIT | 5-D.3 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d3a-candidate-inventory-reconciliation-chatgpt-audit.md | ?? | 7529 | `411955cb9e3202fa3a5bfda1b81e105469f66e4f9022f9dbe079f83d50b89944` | AUDIT EVIDENCE — COMMIT | 5-D.3 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d3b-version-preview-capability-investigation-chatgpt-audit.md | ?? | 9606 | `03aa8e9e8e7741bec515cb518ed00f256fc52fa390b28dc54906ff4977330f66` | AUDIT EVIDENCE — COMMIT | 5-D.3 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d3c-zh-gate2-verification-binding.json | ?? | 1901 | `dd927e9eaff02107553a73cbf21e78ecc503b11ff30bf9c6498118579e9f4ec2` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.3 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d3c-zh-gate2-version-url-evidence.json | ?? | 6859939 | `ee1b20fffcafc3603d7fba75cf69516d62a172cfffba63ef3b9f5f344de65b51` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.3 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d3c-zh-version-urls-gate2-chatgpt-audit.md | ?? | 7817 | `8172c3e63cc42978dacb2cb3e2df8b644c25eec7360b3ce5e42a295d9c2a6618` | AUDIT EVIDENCE — COMMIT | 5-D.3 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d3d-zh-production-baseline-establishment-chatgpt-audit.md | ?? | 8346 | `0f02c62a629487fce8f9e76a0e1534937de0c46e229438da7b9539e2e4717402` | AUDIT EVIDENCE — COMMIT | 5-D.3 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d3d-zh-production-full-verification-evidence.json | ?? | 6435093 | `4143a5ff9e767354104900df7554ea9565fd36e99974c00d8bba7ca3a4242a9c` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.3 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-chatgpt-audit.md | ?? | 10053 | `a83314a229048419fa675ec08d07c77c7682515f1e152a5296b44ddda3b785a3` | AUDIT EVIDENCE — COMMIT | 5-D.4 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d4-en-gate1-production-evidence.json | ?? | 6441977 | `3934f6a7cf43d2bbe11a0ddef4022eb089c3fed9a6d0fb7da2ae96fb53269ab2` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-en-gate2-version-url-evidence.json | ?? | 6859928 | `9cfd28185280cc64ac233fac9963b7a39ca51e1e78af452363eba809065dedbe` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-en-production-full-verification-evidence.json | ?? | 6435134 | `e6699cf5ecdfb5228725ca3c87870bafadd0a3c29438569dc2b50b46487a39f6` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-ko-gate1-production-evidence.json | ?? | 6441977 | `576868af2716c8347f273760861e7f58ae5b481e895cc53e461b69607ccf33b5` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-ko-gate2-version-url-evidence.json | ?? | 6859927 | `677993d24ae92de24c7d0a573df61a8ee451031ca3a888abcc9809c0dcd6d2b8` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-ko-production-full-verification-evidence.json | ?? | 6435134 | `03c8ef5470565ab29afaf905da19dc7d6578ca5b8ff7b88fe2cdc88d46ae818e` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-pt-gate1-production-evidence.json | ?? | 6443549 | `4211bab4af80d1ee294976d68f2b08a5546b161538838d664edc2b08651f5f80` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-pt-gate2-version-url-evidence.json | ?? | 6859929 | `00b60c0474f6ea54bf37c102a80c4eaaf9863da97260f924b8340dc6f21edb65` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-pt-production-full-verification-evidence.json | ?? | 6435135 | `b3948dae923e0f548c03f44229cdb8be4c6ae6072af735e6f15473e2e2e8b9c3` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-vi-gate1-production-evidence.json | ?? | 6441985 | `8ca5bba69ccd8a213726cdfe010164b237acef070e550dc54190aa26292697b6` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4-vi-gate2-version-url-evidence.json | ?? | 6918485 | `b09d7663c9c95afdf6036258f532377ef933d7b21329986d6beb851175e92b6e` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4a-vi-version66-investigation-chatgpt-audit.md | ?? | 10995 | `0bf52767d81a96ed93664b8e115a5d5eaa8aafb7f6dc8a9269594d61491ed739` | AUDIT EVIDENCE — COMMIT | 5-D.4 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d4a-vi-version66-recheck-evidence.json | ?? | 6859937 | `a67445191b1dd223275a9b2391aec5ad67a7127eb0d94f31dde0f0a45b6cc6e9` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4a-vi-version66-stability-evidence.json | ?? | 6859935 | `dd3c6fdda0e268623f4e5d3e16737628cf3a5d313da77f298145683e772fd518` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4b-vi-pre-switch-version66-evidence.json | ?? | 6859935 | `41501558f69bb599664ebc4a65f28a36042d506fa675e6285c5dadae488a0609` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d4b-vi-production-baseline-chatgpt-audit.md | ?? | 5288 | `eb5ba085d1b2b687352b2fc4031dd66edf3e6987beca40ee3c78ba65b989fbc8` | AUDIT EVIDENCE — COMMIT | 5-D.4 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d4b-vi-production-full-verification-evidence.json | ?? | 6435142 | `1b8d629fca65a72b7c076448287b7a3218eb3dd8d7ef501cef42821d7ff6e313` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.4 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5-foundation-migration-chatgpt-audit.md | ?? | 7697 | `bbdbbe96ad6555489bebb6dfb10cd012a517709a2aee6570e3baf6d1f8de8243` | AUDIT EVIDENCE — COMMIT | 5-D.5 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d5-zh-foundation-plan.json | ?? | 1244 | `499843622488b493a8c496e7efe726083ee0116e3c997c7b03cf93a70fa771de` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5-zh-production-evidence.json | ?? | 6437596 | `69eb9e679f2e9b3d553af61e5242a957939e88cc310ad075e1af853e24f90aca` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5-zh-version-url-evidence.json | ?? | 6862658 | `59a59c2b720d18995ec3de5d9fe8bb129dabaa7c7bf24e60d384092ec5cae137` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5a-shared-include-route-boundary-chatgpt-audit.md | ?? | 8736 | `9f147220195cd0e6111678e82cd0e8b95e114d707eb3a961c3a61dd3d0381532` | AUDIT EVIDENCE — COMMIT | 5-D.5 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d5a-zh-foundation-plan.json | ?? | 1244 | `27f5934242ca7a67ca7dc7b387358d95b026eeec03f26bf73104466c8f052735` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5a-zh-production-evidence.json | ?? | 6437147 | `6c2884d98c347e34815962e16d4d0b4a5d7b1b44c36eca0e2e13e33bc3d67e36` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5a-zh-version-url-evidence.json | ?? | 6862072 | `ec2056eb4efa5f9313a654e35062adb1c81212943fe501b436fe54b4bbd80cc7` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-en-foundation-plan.json | ?? | 1238 | `9c537cb9dbc036052700b7aacae98c482aa4bcb7bb180effe8bfa6b3045a56d6` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-en-production-evidence.json | ?? | 6437206 | `b5e21962f11f3668efcdad41788ca1052f5223b483d2a7590cd9d29bfc9a5ff6` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-en-version-url-evidence.json | ?? | 6862133 | `49f275c66ff31217262d036feca2f80a9298f27c6a7733becdb56f118e9702d9` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-foundation-migration-chatgpt-audit.md | ?? | 8923 | `78da80d59b55fc815bb8ad3bf99e3296a27368137bf41e739a8e658fef9a281e` | AUDIT EVIDENCE — COMMIT | 5-D.5 | DURABLE AUDIT | COMMIT |
| docs/audits/htmlrewriter-5d5b-ko-foundation-plan.json | ?? | 1238 | `e156167026363fd817d9b8f580f592f7d5cef56f4f1bfde51fdefcf6eb5f1a17` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-ko-production-evidence.json | ?? | 6437206 | `17127843eb3fa1617061f3a62dfbba85ba9df3ec121e9396be33f8fa67f27113` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-ko-version-url-evidence.json | ?? | 6862112 | `6da9c45f50ae4e9872d2bfc2281eb561d6cdf87acfc513213080d52e35fe5075` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-pt-foundation-plan.json | ?? | 1238 | `a75fa6c94ab62b9e11977a9484ded2055e61a3f975063deb4f2328dd1ba0c623` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-pt-production-evidence.json | ?? | 6437206 | `4a8fb95a102fbdb0fc5cab34bcac8c0bc6b1f94324489dbf9169544ac1d5d48a` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-pt-version-url-evidence.json | ?? | 6862115 | `7a8d9ec4c28fc1af3444362a81c62b417f6fc03ff021150b7a48fe28c8a7958d` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-vi-foundation-plan.json | ?? | 1238 | `fe18de2cbc3798668e789fdc27150d1e143f61ba9149e417cf0fcac261670377` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-vi-production-evidence.json | ?? | 6437214 | `7153ea7c786d8684a3e7acbbfdaa101c4e0fb883b8244747e19aeb770bea1907` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5d5b-vi-version-url-evidence.json | ?? | 6862117 | `5edc8d3e45fbb1e8a4ecc7cdb37e7953f6b07757760bfa1acc56f8936a3ace7e` | AUDIT EVIDENCE — DO NOT COMMIT | 5-D.5 | TRANSIENT EVIDENCE | DO NOT COMMIT |
| docs/audits/htmlrewriter-5e-chatgpt-audit.md | ?? | 6620 | `c7896550f33ec954f2cc0f61324ccea5a47b425b46965733fa99b83a422b9a78` | AUDIT EVIDENCE — COMMIT | 5-E | DURABLE AUDIT | COMMIT |
| package.json |  M | 1606 | `d76450ad6d30d61be1a7916cc271135d2d99718c9ba1e877741028e9ff3cbc68` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| schemas/promotion-manifest.schema.json | ?? | 1716 | `df6d656998b5254e2e65c803ac09f07619a23a2e05185db3a24b8e819bc0f161` | REQUIRED SCHEMA | 5-B/5-C | DIRECT | COMMIT |
| schemas/promotion-release-attestation.schema.json | ?? | 972 | `bb80bcc181e00e46b636eba94e080463b7ff41ce1a43f12a0786ca7dbefebc02` | REQUIRED SCHEMA | 5-B/5-C | DIRECT | COMMIT |
| schemas/promotion-release-plan.schema.json | ?? | 2082 | `be8b345eaa3133a8b2493dc18c63fdd947f3e07defd1fd0bf4a1b78718b65891` | REQUIRED SCHEMA | 5-B/5-C | DIRECT | COMMIT |
| schemas/promotion-release-receipt.schema.json | ?? | 1390 | `872d0c0a3c55e50dbc18cd97e153a8d9858c17d6f865e8806d313911c3fb1d93` | REQUIRED SCHEMA | 5-B/5-C | DIRECT | COMMIT |
| scripts/bootstrap-artifact.mjs |  M | 8563 | `5eef1182860c837de26ca6f20eb7835f711c0b73c225dc41fc2d1b2b64d847bb` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/bootstrap-attestation.mjs |  M | 3044 | `4b666fab2bf3a462f66903b2687e05ff385b1268c4e20b3b12af8631ea53a698` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/bootstrap-guard.mjs |  M | 5634 | `670da9dc0870281e52ee064980da92bfa3fe2a0f0793eb6df1df4faaf36e0274` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/bootstrap-locales.mjs | ?? | 4482 | `ef0308b0b92a8223906b215e9f745cb6a82f2c56955f7351f08b98e76d191445` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/build-page.mjs |  M | 3905 | `d614b07468c202b7cfccdf8bfc89b2be73e03685131c104ecf3a14bee17a588c` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/foundation-migration.mjs | ?? | 6375 | `c7caa50fb1f7e4b18e964bbd664e1a002c2154889987cc15e888bdd762a17f4a` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/initial-migration-gate.mjs | ?? | 6952 | `9bd6e193f069f25adb510663e54aa19dbdfed3fb454ac63f6328c4d34b200ee5` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/locale-mapping.mjs | ?? | 1802 | `6d411f3fca7af008658e0021ec26cabbd686705e9ab2384f8a26884550a76fb0` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/page-sources.mjs |  M | 11385 | `9657c67afd63714d22dff8cde8d6769fe3e9d610c27904a4dac15b7bde6ee341` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/production-release-guard.mjs | ?? | 2287 | `75cea853182f4ba177fd5db4b1305b6695349e032406725e2e224a37b3c202a4` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| scripts/promotion-production.mjs | ?? | 4187 | `c9e5b5749aa4ec4b8f24727c4e2659e52181ddb6f9742be9bb8e189be94acac6` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B/5-C | DIRECT | COMMIT |
| scripts/promotion-release.mjs | ?? | 11703 | `b7172b4010d3ab028b1186d3d526d082ef1da3758d8529fe528e755e0316a892` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B/5-C | DIRECT | COMMIT |
| scripts/verify-known-production-paths.mjs | ?? | 9847 | `aa77aa43a5e99e8450c76d3148674ad38890488477621edafac2017428535998` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| tests/bootstrap-locale-recovery.test.mjs | ?? | 6652 | `e8814a1cbf3b73ec4ab30931777faf1e4c9048396b023337461ffa527ddf6947` | REQUIRED TEST | 5-B–5-D.5 | DIRECT | COMMIT |
| tests/foundation-migration.test.mjs | ?? | 5800 | `17733dd9a6565b5a18d1b509a5ab44d46236f8855852803aad7fe83c0002be8e` | REQUIRED TEST | 5-B–5-D.5 | DIRECT | COMMIT |
| tests/initial-migration-gate.test.mjs | ?? | 4164 | `e91a272cb3f2d47d2dfef16cb81d5de738362739cad9493cfb470d841f3232d5` | REQUIRED TEST | 5-B–5-D.5 | DIRECT | COMMIT |
| tests/promotion-build.test.mjs | ?? | 3369 | `612500f93b48c308e434af6b0aca3d26c3818b6d3ce93d9594d817304933eb2e` | REQUIRED TEST | 5-B/5-C | DIRECT | COMMIT |
| tests/promotion-production.test.mjs | ?? | 4980 | `2ce27b35716739f551d36f91f499e20ab2e9345ffe487a4e7b0cf34a07a2e52e` | REQUIRED TEST | 5-B/5-C | DIRECT | COMMIT |
| tests/promotion-release.test.mjs | ?? | 12963 | `abfcd80bcb6ed8962a1ead344cc0092b35cec4ba882c15df0bd9b4f06bf00ee8` | REQUIRED TEST | 5-B/5-C | DIRECT | COMMIT |
| tests/shared-release.test.mjs |  M | 7192 | `8d183d616c7b93961ca22b194660f82d9016df3eca28cf2db3e2007d0fa4fc63` | REQUIRED TEST | 5-B–5-D.5 | DIRECT | COMMIT |
| tests/verify-known-production-paths.test.mjs | ?? | 4336 | `6dc537e551164b42527cce5119cc8717636340506e50da32d192aa7f11a4aa21` | REQUIRED TEST | 5-B–5-D.5 | DIRECT | COMMIT |
| worker/index.mjs |  M | 3208 | `1583dbffff1074ce29a174bdc2e6dae7ca218bd6ebe71550f7f046f133e1525e` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| wrangler.bootstrap.jsonc |  M | 280 | `1a8a9197c7fd513bd5b4816c3ee1140b9367c67174aeb07a6600bf121a0a3516` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| wrangler.en.jsonc |  M | 548 | `7facf9c7a859e9ad1e829da8d5ca5d7fdfd750f9d15d03919d0c509870135111` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| wrangler.jsonc |  M | 512 | `41c07a5507a7b18503d22cc6cf5e1bacc99536e06e4d744cfea1276480f9bea0` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| wrangler.ko.jsonc |  M | 548 | `515023a0027bf91d880cdcd81ac53a4028aa1521b23a285dc06348449ad52a85` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| wrangler.pt.jsonc |  M | 548 | `33f3214655ea2f48f7051df08b6ae71460951a3969201435510f248b86612fdf` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| wrangler.vi.jsonc |  M | 548 | `7c4805f5c143e61ed2255e3ce9bea7fa7109da4ccc2f8fc17a50b6f1c90e93d6` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |
| wrangler.zh.jsonc |  M | 548 | `b5334f8321e2313d20ec3344e756f7f8bd584ce5b9f56cf406e98d4e2470278d` | REQUIRED PRODUCTION IMPLEMENTATION | 5-B–5-D.5 | DIRECT | COMMIT |

## D. Classification summary

| Category | Count |
|---|---:|
| REQUIRED PRODUCTION IMPLEMENTATION | 24 |
| REQUIRED SCHEMA | 4 |
| REQUIRED TEST | 8 |
| REQUIRED OPERATIONAL DOCUMENTATION | 0 |
| AUDIT EVIDENCE — COMMIT | 19 (+ this report) |
| AUDIT EVIDENCE — DO NOT COMMIT | 38 |
| PRODUCTION ARTIFACT — DO NOT COMMIT | 0 |
| LOCAL / TEMPORARY — DO NOT COMMIT | 0 |
| UNKNOWN | 0 |

- proposed commit files: 56
- proposed commit bytes before this report: 316,458
- excluded evidence bytes: 205,566,332

## E. Commit対象

- `astro-site/src/config/site.ts`
- `astro-site/src/layouts/BaseLayout.astro`
- `docs/audits/htmlrewriter-5c-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5c-promotion-production-architecture.md`
- `docs/audits/htmlrewriter-5d-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d1-production-baseline-recovery-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d2-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d2-initial-baseline-migration-design.md`
- `docs/audits/htmlrewriter-5d3-zh-gate1-resumed-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d3-zh-gate2-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d3a-candidate-inventory-reconciliation-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d3b-version-preview-capability-investigation-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d3c-zh-version-urls-gate2-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d3d-zh-production-baseline-establishment-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d4-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d4a-vi-version66-investigation-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d4b-vi-production-baseline-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d5-foundation-migration-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d5a-shared-include-route-boundary-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5d5b-foundation-migration-chatgpt-audit.md`
- `docs/audits/htmlrewriter-5e-chatgpt-audit.md`
- `package.json`
- `schemas/promotion-manifest.schema.json`
- `schemas/promotion-release-attestation.schema.json`
- `schemas/promotion-release-plan.schema.json`
- `schemas/promotion-release-receipt.schema.json`
- `scripts/bootstrap-artifact.mjs`
- `scripts/bootstrap-attestation.mjs`
- `scripts/bootstrap-guard.mjs`
- `scripts/bootstrap-locales.mjs`
- `scripts/build-page.mjs`
- `scripts/foundation-migration.mjs`
- `scripts/initial-migration-gate.mjs`
- `scripts/locale-mapping.mjs`
- `scripts/page-sources.mjs`
- `scripts/production-release-guard.mjs`
- `scripts/promotion-production.mjs`
- `scripts/promotion-release.mjs`
- `scripts/verify-known-production-paths.mjs`
- `tests/bootstrap-locale-recovery.test.mjs`
- `tests/foundation-migration.test.mjs`
- `tests/initial-migration-gate.test.mjs`
- `tests/promotion-build.test.mjs`
- `tests/promotion-production.test.mjs`
- `tests/promotion-release.test.mjs`
- `tests/shared-release.test.mjs`
- `tests/verify-known-production-paths.test.mjs`
- `worker/index.mjs`
- `wrangler.bootstrap.jsonc`
- `wrangler.en.jsonc`
- `wrangler.jsonc`
- `wrangler.ko.jsonc`
- `wrangler.pt.jsonc`
- `wrangler.vi.jsonc`
- `wrangler.zh.jsonc`
- `docs/audits/htmlrewriter-5e0-git-integration-chatgpt-audit.md`

## F. Do-not-commit対象

- `docs/audits/htmlrewriter-5d3-zh-gate1-http-evidence-attempt1.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d3-zh-gate1-http-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d3c-zh-gate2-verification-binding.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d3c-zh-gate2-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d3d-zh-production-full-verification-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-en-gate1-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-en-gate2-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-en-production-full-verification-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-ko-gate1-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-ko-gate2-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-ko-production-full-verification-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-pt-gate1-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-pt-gate2-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-pt-production-full-verification-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-vi-gate1-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4-vi-gate2-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4a-vi-version66-recheck-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4a-vi-version66-stability-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4b-vi-pre-switch-version66-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d4b-vi-production-full-verification-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5-zh-foundation-plan.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5-zh-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5-zh-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5a-zh-foundation-plan.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5a-zh-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5a-zh-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-en-foundation-plan.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-en-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-en-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-ko-foundation-plan.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-ko-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-ko-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-pt-foundation-plan.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-pt-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-pt-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-vi-foundation-plan.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-vi-production-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged
- `docs/audits/htmlrewriter-5d5b-vi-version-url-evidence.json` — transient/environment-specific JSON evidence or plan; retained locally, not staged

除外ファイルは6,851/6,854 known-path HTTP結果、environment-specific Foundation plan、verification binding。Production artifact本体と同様にGitの小容量正本には含めない。削除はせずlocal evidenceとして維持する。

## G. Architecture consistency

- canonical locales: `ja,en,ko,pt,vi,zh`
- JA public prefix: empty string
- foreign prefixes: `/en`, `/ko`, `/pt`, `/vi`, `/zh`
- JA `/ja/` migration: 0
- Topic paths: canonical mapping moduleから決定
- Foundation / Promotion allowlist: 分離
- normal Promotion: Topic HTML 1 + sitemap 0/1
- deletion / shop / guide / other Topic / index / include / root / CSS / JS / image / font / robots: fail-closed

## H. Shared include mapping

- JA: `/_includes/ja/header.html`, `/_includes/ja/footer.html`
- foreign: `/<locale>/_includes/header.html`, `/<locale>/_includes/footer.html`
- old foreign root-level include mappingはcanonical mappingとして使用しない。

## I. Worker exact pathname

`APPROVED_PROMOTION_PATHNAME`とraw pathnameのexact equalityを要求。percent encoding、backslash、double slash、dot segment、missing slash、prefix/suffix collision、other Topic/index/shop/guide/rootを拒否するtestがPASS。

## J. Full-build isolation

- normal Wrangler build: `node scripts/production-release-guard.mjs --wrangler`
- `maintenance:full-build`: maintenance-only explicit script
- normal Wrangler buildから`prepare-release.mjs` / full buildへのfallback: 0
- Astro full build executed in 5-E.0: 0

## K. Wrangler config

6 localeでWorker name / locale / custom route / candidate path / guard buildを分離。`workers_dev=false`、`preview_urls=true`。JAはroot custom route、foreignは`/<locale>/*`。

## L. Schema validation

4 schemaはJSON parse PASS。Manifest/Planは`additionalProperties:false`、6 locale required、SHA-256 pattern、path/runtime/baseline bindingを実装validatorと併用。Receipt/Attestationはlocale enum、traffic 100、hash/time/Production bindingを要求。

## M. Security / contamination scans

- secret candidates: 0
- private key: 0
- Authorization header value: 0
- token/password assignment: 0
- absolute path in Production code/config/schema/test: 0
- historical absolute paths: audit markdown 1ファイル / 2 references（historical evidence only）
- binary/archive in commit candidates: 0
- `.deploy`: commit candidate 0; existing `.gitignore` covers it
- `node_modules`: commit candidate 0; existing `.gitignore` covers it
- tar/zip/baseline artifact/generated mass HTML: commit candidate 0

Gitignore変更は提案しない。audit JSONを一括ignoreするとdurable small bindingまで隠すリスクがあるため、今回はexplicit stagingを使う。

## N. Pre-commit tests

- Promotion: 17/17 PASS
- Shared: 15/15 PASS
- Deploy boundary: 14/14 PASS
- Bootstrap / Recovery: 27/27 PASS
- Foundation / canonical mapping: 7/7 PASS
- Gate helpers: 13/13 PASS
- total: 93/93 PASS
- JavaScript syntax: PASS
- schema/package JSON parse: PASS
- `git diff --check`: PASS
- tracked deletion: 0

## O. Git identity

Existing P0 commit and effective current identity are identical:

- author: `松本雅幸 <masayuki@matsumotomasayukinoMacBook-Air.local>`
- committer: `松本雅幸 <masayuki@matsumotomasayukinoMacBook-Air.local>`

Git configの書き換えは行っていない。

## P. Production read-only confirmation

| Locale | Deployment | Version | Traffic | Drift |
|---|---|---|---:|---|
| ja | `1e0187ef-d4c4-4b08-beca-f02d576f0b5e` | `a47da27c-ebcb-474e-b357-9ec31602a35a` | 100% | NO |
| en | `e4830995-01f6-4d5b-b2a8-3df13aa3e45a` | `e63e3a45-59eb-4abc-97fa-18eb0799d005` | 100% | NO |
| ko | `871192d5-96f5-4031-95e6-2cb2ccbe3e28` | `8883a63e-2390-40c0-8235-ba7867c989e1` | 100% | NO |
| pt | `992eee0f-034c-42db-b42b-6974b41cd4b1` | `531a1a36-5eef-4383-bb15-7a8026510fdb` | 100% | NO |
| vi | `3378d4e7-78c7-4264-8a82-5f89c71d1ca7` | `df23b77c-9099-4665-a09a-ef568c829956` | 100% | NO |
| zh | `4d7b6255-63de-49bf-93cb-b54f2506ee1d` | `c30186cb-6ba9-4242-9a3e-1319ab5e8c75` | 100% | NO |

Cloudflare write: 0。Production Baseline change: 0。

## Q. Human commit approval

- status: **WAITING FOR HUMAN COMMIT APPROVAL**
- proposed commit message: **Integrate six-locale guarded promotion release architecture**
- staging method: explicit paths only; `git add .` / `git add -A` / `git commit -a` prohibited

## R. Post-approval work not yet executed

- stage: NOT EXECUTED
- commit: NOT EXECUTED
- clean detached/worktree verification: NOT EXECUTED
- post-commit 93+ tests: NOT EXECUTED
- HEAD dependency verification: NOT EXECUTED
- push Gate: NOT REACHED
- push: NOT EXECUTED

## S. Gate 1 Yes / No

- ALL WORKING TREE FILES CLASSIFIED: **YES**
- UNKNOWN FILES REMAIN: **NO**
- PRODUCTION IMPLEMENTATION COMMITTED: **NO — WAITING FOR APPROVAL**
- PROMOTION SCHEMAS COMMITTED: **NO — WAITING FOR APPROVAL**
- REQUIRED TESTS COMMITTED: **NO — WAITING FOR APPROVAL**
- PRODUCTION ARTIFACTS COMMITTED: **NO**
- SECRETS DETECTED: **NO**
- ABSOLUTE PATH PRODUCTION DEPENDENCY: **NO**
- TRACKED DELETION: **NO**
- FULL BUILD EXECUTED: **NO**
- CLOUDFLARE WRITE EXECUTED: **NO**
- PRODUCTION BASELINES CHANGED: **NO**
- CLEAN COMMIT TESTS PASS: **NOT YET**
- HEAD CONTAINS COMPLETE PROMOTION RELEASE ARCHITECTURE: **NO — NOT YET COMMITTED**
- PUSH COMPLETE: **NO**
- HEAD EQUALS ORIGIN/MAIN: **YES AT GATE 1, BEFORE COMMIT**
- PRODUCTION DRIFT: **NO**
- READY TO RESUME 5-E: **NO — COMMIT AND PUSH GATES REMAIN**

**WAITING FOR HUMAN COMMIT APPROVAL**
