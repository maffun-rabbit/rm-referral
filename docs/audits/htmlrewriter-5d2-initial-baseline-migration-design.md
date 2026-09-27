# Foreign Locale Initial Production Baseline Migration Design（工程5-D.2）

## Problem statement

`en / ko / pt / vi / zh`には、current Productionと直接結び付いたimmutable artifact / receipt / attestationがない。一方、`.deploy/<locale>`は各6,851 filesでrelease receiptと全件hash一致し、current Production sentinelも40/40 byte一致する。これは **UNBOUND BUT HIGH-CONFIDENCE CANDIDATE** であり、cryptographically proven baselineではない。

目的は、candidateを再buildせず、site content変更を混ぜず、locale単位のone-time migrationでattested Production Baselineへ正規化し、その後は通常のstrict baseline運用だけを許可すること。

## Known facts and evidence gap

- file count: 各locale 6,851
- receipt/tree mismatch: 各locale 0
- Production sentinel: 各locale 8/8、合計40/40 byte/SHA-256一致
- current Production: 全locale single version / traffic 100%
- receipt generated: 2026-09-21T08:00:39.792Z
- current foreign versions: receipt後約12〜32分に作成
- 欠落: versionと完全treeを結ぶartifact hash、attestation、upload manifest、complete read-only export

時刻近接、receipt一致、sentinel一致は高信頼証拠だが、完全identity proofではない。

## Cloudflare capability

公式仕様ではWorker Versionはcode、static assets、bindings、compatibility settingsを含む完全状態であり、Version URLによる切替前検証ができる。一方、公開されているread-only API/Wrangler操作はversion/deployment metadata参照で、既存versionから全Static Assets manifest、全digest、全contentsをexport/downloadする操作は確認できない。

Direct Uploadはmanifest登録→不足blob upload→version作成というwrite flowであり、既存versionのmanifest exportではない。upload session作成をread-only照合として流用しない。

公式参照:

- [Versions & deployments](https://developers.cloudflare.com/workers/versions-and-deployments/)
- [Wrangler versions commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/#versions)
- [Static Assets Direct Upload](https://developers.cloudflare.com/workers/static-assets/direct-upload/)
- [Workers API](https://developers.cloudflare.com/api/resources/workers/)

## Options

### Option A — Existing tree one-time normalization

既存treeを決定的artifact化し、人間承認後にVersion Upload→Version URL→Production切替→attestationを行う。

- 長所: full build 0、生成変更0、deterministic artifact、rollback容易、locale独立
- 短所: current Productionとの完全binding不足を、限定migrationの人間承認で受容する必要がある
- 判定: 単独では証拠強度が不足

### Option B — Expanded deterministic sampling + normalization

Option Aにcategory別・地域分散の決定論的samplingを追加する。

- 長所: 現行40件より高いconfidence、人間レビュー可能、read-only
- 短所: 未取得pathとProduction側の未知追加assetを証明できない
- 判定: 必須補強だが、samplingだけをcomplete proofとしない

### Option C — Historical evidence reconstruction

Git/stash/worktree/log/backup/Cloudflare metadataからbindingを復元する。

- 長所: writeなしでcryptographic bindingが見つかれば最善
- 短所: 5-D.1でforeign artifact/attestation/upload hashは発見できず、receipt source fingerprintを再現するGit stateも見つからなかった
- 判定: 実施済み。補助証拠として維持するが単独解決しない

### Option D — Fresh full build replacement

sourceから完全releaseを再生成して全面置換する。

- 長所: source provenanceを新規確立可能
- 短所: 約60,000ページ再生成、巨大diff、意図しないcontent/SEO変更、build/deploy boundary後退、review困難
- 判定: **REJECTED**。本工程・通常運用とも採用しない

### Option E — Exhaustive candidate-path HTTP verification + serial normalization

Option Aを基礎に、candidate inventoryの全6,851 pathをcurrent Productionへread-only GETし、status/content-type/bytes/SHA-256を全件比較する。さらにcandidateにない代表unknown pathをnegative probeする。その後も完全exportではない限界を明示し、人間承認されたone-time guardで1 localeだけ正規化する。

- 長所: samplingより強い。既知candidate pathの全件を検証し、full build 0、content変更0、locale独立
- 短所: Production側だけに存在する未知pathを列挙できず、version manifestのcryptographic proofにはならない。HTTP request数とrate/caching管理が必要
- 判定: **推奨**

## Comparison matrix

| 基準 | A | B | C | D | E |
|---|---|---|---|---|---|
| current再現性 | 高 | 高＋ | 証拠発見時は最高 | 新状態へ置換 | 既知path全件で最高 |
| 完全一致証明 | 不可 | 不可 | artifact発見時のみ可 | 新versionのみ可 | 不可だが既知path全件 |
| unexpected risk | 低 | 低 | なし | 高 | 低 |
| full build | 不要 | 不要 | 不要 | 必要 | 不要 |
| Production write | 1 version/locale | 1 version/locale | なしまたは1 | 大 | 1 version/locale |
| rollback | version単位 | version単位 | N/A | version単位だが影響大 | version単位 |
| locale独立 | 可 | 可 | 可 | 容易に崩れる | 必須 |
| fail-closed | 高 | 高 | evidence依存 | diff巨大 | 最高 |
| human review | 可 | 可 | 可 | 困難 | 可 |
| future Promotion整合 | 高 | 高 | 高 | 低 | 高 |
| residual uncertainty | 中 | 中低 | 未発見 | content差分 | 低。ただし0ではない |

## Recommended Migration Strategy

**Option E — Exhaustive candidate-path HTTP verification + human-approved one-time serial normalization** を採用する。

Option Cの既存証拠をprovenanceとして添付し、Option Bのcategory/regional summaryをreview表示に使う。これはOption Aのartifact normalizationを内包するが、全candidate pathのread-only一致を要求する点で単純なA/Bより強い。

推奨理由:

1. Astro full buildも既存tree再生成も不要。
2. 6,851 candidate pathsすべてについてcurrent Production bytesを確認できる。
3. content/foundation変更を混ぜず、baseline normalizationだけをレビューできる。
4. locale単位Version Upload、Version URL、Production切替、rollbackに分離できる。
5. 成功直後からartifact/receipt/attestationで通常strict baselineへ移行できる。

## Residual uncertainty

Exhaustive verificationは「candidate inventoryに存在する全path」の一致を証明する。Cloudflare側だけに存在しcandidate inventoryにないunknown assetは、read-only manifestがないため完全列挙できない。negative probesとsitemap/HTML link closureでリスクを下げるが、数学的・cryptographicなcomplete identity proofとは呼ばない。

この不確実性はinitial migrationの人間承認で一度だけ受容し、migration後のattested baselineには持ち越さない。

## Deterministic artifact and receipt

localeごとに既存treeを変更せず、path lexicographic order、mtime 0、uid/gid 0、mode固定、ustar formatでarchive化する。作成後、別の空directoryへextractして全path/size/SHA-256をreceiptと再照合する。

Receiptは以下を固定する。

- schema、migration type、locale、Worker、config
- source path、receipt provenance、known uncertainty
- file count、category inventory、全path/size/SHA-256
- inventory SHA-256、artifact SHA-256/size
- canonical receipt SHA-256、receipt file SHA-256
- before deployment/version/traffic
- exhaustive verification report SHA-256
- historical evidence report SHA-256

この工程5-D.2ではartifactを作らない。

## Exhaustive HTTP verification design

1. receipt inventoryを唯一のpath inputにする。
2. locale namespace外path、duplicate、traversal、symlink、unsupported overrideがあれば停止。
3. 6,851 pathsをSHA-256(`locale + NUL + path`)順へ固定し、resume可能なchunkへ分割する。
4. canonical public URLへGETし、redirect policyをpath typeごとに固定する。
5. status、content-type、content-length、response bytes、SHA-256、ETag/Last-Modified（存在時）を記録する。
6. HTMLはtitle/canonical/lang/mainも検査する。
7. local bytesと1件でも不一致ならSTOP。retryはnetwork errorだけで、content mismatchを上書きしない。
8. Production current deployment/versionを開始前・完了後に再取得し、driftがあれば全reportを無効化する。
9. candidateにない決定論的unknown pathsをcategoryごとにnegative probeする。

HTTP圧縮はdecode後body bytesを比較し、request header・redirect・queryを固定する。cache purgeは行わない。

## Sampling summary design

全件verificationとは別に、人間レビュー用summaryを作る。

- root、guide、topics、CSS、JS、image、robots、sitemap、その他non-shop: 全件集計
- shop: 47都道府県から最低1件ずつ＋SHA-256順の先頭512件
- uncommon extension/static asset: 全件

samplingはreviewの可読性用であり、全件verificationの代替ではない。件数一致をcomplete identity proofとは記録しない。

## Initial Migration Plan

通常bootstrap planとは別schema/operation `foreign-initial-baseline-normalization`とする。最低限:

- locale/Worker/bootstrap config
- before deployment/version/traffic、rollback version
- source inventory/artifact/receipt hashes
- exhaustive verification/historical evidence hashes
- acknowledged limitation
- expected Version URL checks
- expected resulting versionはupload前`null`。ID先書き禁止
- one-time marker namespace
- human review file/hash

plan hash固定後のsource、receipt、report、config変更を拒否する。

## Human approval model

localeごとに独立したreview recordを要求する。自動生成だけではAPPROVEDにできない。

承認文は少なくとも以下を明示する。

- Cloudflare完全manifest/exportが利用できない
- candidate/receiptが6,851 files全件一致
- candidate path全件HTTP verificationがPASS
- Production側unknown-only assetsは完全列挙できない
- residual uncertaintyを理解し、one-time normalizationを承認する
- artifact、plan、evidence、before versionの各SHA/ID

reviewer、approvedAt、decision=`APPROVED`を固定する。PENDING/REJECTED/欠落はSTOP。

## One-time guard design

通常`bootstrap-guard`を緩和せず、別`initial-baseline-migration-guard`を使う。

- operationとlocaleを固定し、複数locale/`all`を拒否
- normal deploy/Promotionからimport・呼出不能な専用command/config
- 当該localeに正式attestationが既にあれば拒否
- plan/review/artifact/receipt/evidence hashを照合
- current deployment/version/100% trafficを再確認
- source tree/extracted artifact全件照合
- exhaustive HTTP reportが6,851/6,851 PASSかつbefore/after discovery同一versionであること
- wrong Worker/config、cross-locale、unexpected/deleted fileを拒否
- plan hashを一度使用したら再利用禁止。成功attestationのone-time markerで再実行を拒否

## Execution boundary and order

localeを一括処理しない。各localeで次を完結後に停止・レビューする。

1. read-only current state再取得
2. deterministic artifact/receipt作成とextract全件検証
3. exhaustive HTTP verification
4. initial migration plan＋human review固定
5. live preflight/drift check
6. Version Uploadのみ
7. Version URLで同じ6,851 path（または承認済み全件検査方式）＋404を検証
8. production切替直前drift check
9. 100%切替
10. Productionで同一verification
11. artifact/receipt/deployment/versionを結ぶattestation作成
12. new baselineをESTABLISHEDとして保存

5-D.2では1〜12を実行しない。

## Version URL and Production verification

Version URLではcandidate inventoryの全pathを可能な限りbyte/hash照合し、root/guide/shop/static/robots/sitemap/404のHTTP semanticsも確認する。Production切替後も同じreport setを再実行する。Version URLまたはProductionで1件でも不一致、5xx、既存200の404、canonical/lang/main欠落があれば切替禁止またはlocale rollback。

## Rollback

開始直前のdeployment/version/trafficを固定する。重大問題時は当該localeだけをbefore versionへ100% rollbackし、全体buildを使わない。他localeを自動rollbackしない。drift時は盲目的rollbackせず停止する。

## Locale independence and pilot

5 localeは完全独立release unit。pilot候補は **zh** とするが、Execution承認ではない。

根拠:

- 全localeのfile count、receipt mismatch 0、sentinel 8/8、traffic 100%は同等
- zh candidateは111,635,363 bytesで5 locale中最小
- candidate inventory 6,851件は同一規模でroute complexityも同等

ENを優先する技術的証拠はなく、byte volumeが最小という唯一の客観的差でzhをpilot候補とする。Execution時にdriftやverification差があれば再評価する。

## Topics foundation separation

Initial Baseline MigrationにはTopics index、shared includes、Wrangler normal guard migration、Worker exact route、Promotion content、CTA/SEO/CSS/JS/sitemap/hreflang変更を混ぜない。

順序は必ず:

1. current state normalization
2. initial attestation / baseline ESTABLISHED
3. 別planでTopics/shared include foundation migration
4. 別planでnormal Promotion guard/Worker exact route接続

## Approval recommendation

本設計はExecution指示書を作成できる状態。ただしProduction実行承認はまだ与えない。Execution指示書では最初にzh 1 localeだけを対象とし、artifact作成前とCloudflare write前を別approval gateにする。
