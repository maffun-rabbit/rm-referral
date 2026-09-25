# HTMLRewriter 工程4-B.1 ChatGPT監査レポート

## A. 結論

**PARTIAL**。原因分析、完全staging方式の設計、独立preflight guard、ローカル検証は完了。本番再deployは未実施。
本番versionに対応する完全ASSETS基準が未確保で、既存deploy経路へのguard組み込みも未完了のため、再パイロット可能とは判定しない。

## B. 20 assetsの内訳

前回の計数を訂正：**guide HTML 18件（代表記事1件＋対象外17件）＋include 2件＝20件**。
「代表記事以外のguide 18件＋include 2件」という以前の報告は誤り。
今回の分類A/Bは由来の証拠に基づく。過去の生成プロセスがラッパーを作ったが、今回の単一記事buildによる対象外副作用Cとは区別する。

| path | type | 原因分類 | local SHA-256 | rollback後の本番HTTP本文 SHA-256 |
|---|---|---|---|---|
| `/_includes/ja/footer.html` | include | B：以前の共通部品抽出物。今回生成なし | `3e0b8e87b7a83371c841dd011c84c31f6f85cbb6b1c286fdde37d994849adceb` | 404（assetの基準checksumなし） |
| `/guide/shop-consultation/index.html` | guide HTML | B：以前のincludeラッパー差分 | `d21e6702526bc5c3a46e57b63302d7375c60fc03c759ed14e0f0224d1060f6e6` | `54351ff87ca9a7cb070b16d9d21129e6ae9ab865ece571216b733e16c0c4eb0d` |
| `/guide/rakuten-link/index.html` | guide HTML | B：以前のincludeラッパー差分 | `043f29d02f7f860f8068f5408af45e435625aade9e638f0e82697899dbdf2d48` | `faf2019fa3da1aba71da8edfa966664579061cb5ea620d6ab78a338884b5959a` |
| `/guide/monthly-cost/index.html` | guide HTML | B：以前のincludeラッパー差分 | `5b7dd7c155a546c940ed5384658b6094638ecc53a0e9a387437111f49bf2ce17` | `ad15d31a81d7e3615a79bf2a8ec215d64c42cd1b13c66924e97818eddc4b191a` |
| `/guide/data-transfer/index.html` | guide HTML | B：以前のincludeラッパー差分 | `7a274bd3e12f227db3335071eaa58bbec6cab49bc24abf22c62deac8944fb60d` | `1d6cfbdb03fb82122570e6b3347b78253dc8553154cf259b89ce8eb8cee7500c` |
| `/guide/minor-senior-contract/index.html` | guide HTML | B：以前のincludeラッパー差分 | `761e6deb4656df35f76db5a726e9884e4ba9044f1f1e176a86b99b458ce3b5ba` | `ed9fd0ac160275037548ac2d15b73e26e73acc79135238b82a4251e027de78cb` |
| `/guide/referral-campaign-how-to/index.html` | guide HTML | B：以前のincludeラッパー差分 | `65c051af69aac770d002f47d9ad1c96467471c9012d07fde5b1cc6964e36d7f8` | `40e49788cceb6665833add70f682ad6d76652dc417444eb56cb8eb66cbfa6813` |
| `/_includes/ja/header.html` | include | B：以前の共通部品抽出物。今回生成なし | `ede7055de835c5059864492e20eb34b2d68d2aca6435621a2d020165d6b54b6f` | 404（assetの基準checksumなし） |
| `/guide/sim-or-esim/index.html` | guide HTML | B：以前のincludeラッパー差分 | `1b704e47985bb84dbb0322d4690cfeb663a22f1be10c11e946c8e93f34b4c859` | `e6a413fba8fb0832082f751cc82a6bde6a78308547eb98ae5f3e490e4ffec8c2` |
| `/guide/activation-time/index.html` | guide HTML | B：以前のincludeラッパー差分 | `8bdb57e4a6160a95ed8790e305abc59e3a5040dee214e42677872621157013b5` | `fc705e7c94bf1294d38900a660375ef8c983062affdaf8b0951e0bb11902e0b2` |
| `/guide/point-schedule/index.html` | guide HTML | B：以前のincludeラッパー差分 | `4090bb1a28f2c29c4bb800ed0d6b5992a853f4e2fdc6b7c483cd95b39822b142` | `0f31c1b46e09ba495568467b1a1f6ea8b097d2267fa2cfd168aab64f900f2524` |
| `/guide/cancellation-and-balance/index.html` | guide HTML | B：以前のincludeラッパー差分 | `f3e59762874ef01c2c752f5344ccaf4c948fc590f62ebe2c45a5ebaafb9b88a9` | `d4f5d1b15564da73586ad5f5a0c15d188946f06ca9092fbc14aed26144f0f58c` |
| `/guide/index.html` | guide HTML | B：以前のincludeラッパー差分 | `15883d2906b5bbb3bc3a3343e85a421417071bc152609c9f5bbea7c30761a73c` | `501bb84472a14d7783ab215211e53a70d2023eb630636fd645b551268c4dad55` |
| `/guide/replacement-program/index.html` | guide HTML | B：以前のincludeラッパー差分 | `57b1c04ae492c8a340353a4d1cbd7d861fc9bfaec6e9762b7dd1f292ed195b7c` | `40ea93943d70cd9778cad9c811dc452ac23738c23e796ae7f156b0282c13369b` |
| `/guide/support/index.html` | guide HTML | B：以前のincludeラッパー差分 | `72e516f3f7fbc4461ea028385d636850c550a3615106a96df58a1dffd9e37c68` | `b8c00ffeaf70745fdf2f08ea66787dfead1e5f0f4946c6b9ee713e3d64eb5d28` |
| `/guide/device-compatibility/index.html` | guide HTML | B：以前のincludeラッパー差分 | `d862b0828edd0044f800181d51ed5bff591d15316a123dc8a861e45c2008d489` | `421f23677e16f9d9784b393a5dad2609781c1db5b149d7f0c7ca0b9dc92aeb45` |
| `/guide/coverage-check/index.html` | guide HTML | B：以前のincludeラッパー差分 | `949c24b493c20711a8e4ab8ae7d18af33a1d287bd2003254f9671998e3b7e9bd` | `171513eb8b782c9ff0881ee127e63e41ee2996b0cead85c7024783b64ae121fc` |
| `/guide/family-total-cost/index.html` | guide HTML | B：以前のincludeラッパー差分 | `53562f399ce6395bb48adbbaeb3b6576512058d3ae55a26b916a231ab223186e` | `285fdde1e0bc9e20f3bbffa81150db20d3bf002b98be49541b6ae6379ac24425` |
| `/guide/referral-points/index.html` | guide HTML | B：以前のincludeラッパー差分 | `47c81a8d88317bb143e4750eee3923b4ad5ba1af583a0cbea373661f40fd75cb` | `40adb892264ce5224f38f34a9e6671a6ecb2e0122eb2bb57a1a01b4601b9f0c5` |
| `/guide/rakuten-mobile-three-features/index.html` | guide HTML | A：正式単一記事生成の意図した出力 | `88836b8d724de5bc76c5f84e0a48fc5fb79b48a8119a6e249efa2ff343882845` | `f38435702452e392001eab15bee8bca57f2276233ab141bc61662b3a22ecb15f` |

全ハッシュ、HTTP status、ローカルreceiptとの一致、mtime、マーカー数を [証拠JSON](htmlrewriter-4b1-evidence.json) に保存。
17件はローカルrelease receiptと一致し、比較用メモリ内でrm-include開始・終了タグだけを除くと現在本番レスポンスとbyte一致する。元ファイルは変更していない。
include 2件もreceiptと一致し、公開URLでは404。404レスポンスのハッシュを「既存assetのハッシュ」と扱っていない。
代表記事だけはreceiptと不一致で、工程4-Bの正式単一記事生成後の出力。
本番HTTPレスポンスは配信後の値であり、raw assets manifestそのものの証拠ではない。

## C. 20差分が発生した根本原因

既存の `.deploy/ja` に過去のHTMLRewriter移行候補が残っていた。commit `aab15b3219` のBaseLayoutは日本語guide全体へrm-includeラッパーを付け、prepare-releaseはheader/footerのincludeを抽出する。
対象外17件とinclude2件はローカルreceipt（記録日時2026-09-20）に存在し、工程4-Bで新規生成されたものではない。代表記事のみ工程4-Bで更新された。

Wranglerは単一記事生成コマンドの入力範囲を引き継がず、設定されたASSETS全体をmanifest化する。前回は生成境界だけ検証し、配信基準との差分境界を事前検証せずdeployした。この確認不足が対象外差分の公開を許した。
「uploadリストを見てからrollback」は予防にならない。また、既にアップロード済みの誤ったassetは再送0でも新manifestから再利用され得るため、upload数だけを安全判定に使わない。

## D. Cloudflare Static Assets deploy仕様

- asset directoryから全体manifestを作り、manifestをversionへ関連付ける。
- manifest登録後にサーバーが要求するhashだけを転送する。転送不要は「現在の本番と同じ」の証明ではなく、以前のversion向けに送った内容の再利用も含む。
- 小さいdirectoryは小さいmanifestになる。旧manifestへの安全なpatch/mergeとは扱えず、省いた既存URLは新versionのASSETSから参照できなくなる。
- `keep_assets` は既存セット全体の再利用であり、1記事だけ追加するpartial deployではない。
- Worker versionにはコード・Static Assets・binding等が含まれる。旧versionへのrollbackでそのversionのStatic Assetsへ戻せる。ただしKV/D1/R2の内容は別管理。

出典：[Direct Uploads](https://developers.cloudflare.com/workers/static-assets/direct-upload/)、[Versions and deployments](https://developers.cloudflare.com/workers/versions-and-deployments/)、[Rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)。
固定されたローカルWrangler 4.131.1の `buildAssetManifest` / `syncAssets` 実装も部分確認した。公式仕様と一致。

## E. 検討したDeploy Boundary方式

| 候補 | 評価 |
|---|---|
| A：現行完全treeへ対象だけ反映 | 正確な本番基準と全差分検査があれば成立。ただし現行treeは既存作業が混在し、そのまま正本にできない。 |
| B：完全な本番基準＋対象だけの別staging | 採用候補。既存作業を保持でき、追加・変更・削除の比較が明確。 |
| C：KV / R2 / Worker response | 別配信境界・binding・rollback・キャッシュ設計が必要。現在のP0に対して変更が大きい。 |
| D：partial asset deploy | 確認した公式仕様に、既存manifestへ1ファイルを安全にマージする機構は見当たらない。差分転送はpartial manifest更新ではない。 |

## F. 採用方式

**B：versionに紐付いた完全ASSETS基準から独立stagingを作り、hashを固定した代表HTMLだけをoverlayする方式**。
Workerのexact pathnameとbuild-pageは維持。新しい配信ストレージは導入しない。
ただし現時点で確保できたのは「完全ローカルtree」であり「完全本番基準」ではない。採用設計は決定したが、本番運用への接続は未完了。

## G. 既存ASSETSをどう維持するか

完全基準manifestの全path / byte数 / SHA-256を記録し、同一bytesのファイルをstagingへコピーする。targetと明示承認されたincludeだけoverlayし、基準にあるpathの削除は一件でも拒否する。
root、他guide、topics、CSS/JS、画像、routing用ファイル等をそのまま保持する。既存 `.deploy/ja` を上書きしない。
本番version由来を確認できないローカルreceiptや一部URLのHTTP採取を、自動的に本番基準へ昇格させない。

## H. preflight guard

実装：`scripts/deploy-boundary.mjs`。

1. 基準receiptのSHA-256と全ファイルの実体hashを検証。
2. 基準とcandidate双方の全path・size・hashを比較。
3. 許可可能なpathは代表HTML、`/_includes/ja/header.html`、`/_includes/ja/footer.html`だけ。
4. overlayにはexact hashと変更理由を必須化。任意のinclude・CSS・他guideは許可できない。
5. target HTML変更が必ず1件、対象外変更/追加が0、削除が0であることを検査。
6. ignore-file、symlink、stagingと基準の重なり、既存stagingへの上書きを拒否。
7. production用関数は独立して固定された基準receipt hash、本番artifact由来、現在versionとの一致、予定configとstagingの一致を要求。基準未確保ならCloudflareアクセス前に停止。

include2件はtargetのHTMLRewriter挿入に必要で、本番404なら将来の初回パイロットで「明示した2新規asset」として許可する。任意の共通部品変更を自動許可しない。今回のローカル検証ではincludeを変更せず保存した。

**重要：guardは独立コマンドとして動作するが、現在の `npm run deploy -- ja` / Wrangler build hookにはまだ組み込まれていない。既存deployコマンドを実行してはいけない。**
本番設定の参照先変更およびhook差し替えは自動承認レビューに拒否されたため適用していない。

## I. 既存20差分の扱い

全て元の `.deploy/ja` に保持。変更・削除・上書きしていない。ローカル検証でも元tree全件の前後hashが一致。
実際の次期本番candidateでは17件の移行用guideをoverlayへ含めず、本番基準版をコピーする。今回それを本番基準未確認のまま実施したとは扱わない。

## J. 変更したファイル

- `package.json`：ローカルstage/check/testコマンド3件を追加。
- `scripts/deploy-boundary.mjs`：新規。完全staging・差分検査・production証拠検査。
- `tests/deploy-boundary.test.mjs`：新規。9回帰テスト。
- `docs/audits/htmlrewriter-4b1-chatgpt-audit.md`：本報告。
- `docs/audits/htmlrewriter-4b1-evidence.json`：20件のchecksumとローカル検証証拠。

一時調査スクリプトとデータ：`/private/tmp/rm-4b1-inspect.mjs`、`/private/tmp/rm-4b1-20-assets.json`、`/private/tmp/rm-4b1-local-check.mjs`、`/private/tmp/rm-4b1-local-result.json`。
既存監査ファイルは上書きしていない。

## K. 追加command

```sh
npm run deploy:stage -- /absolute/path/plan.json
npm run deploy:preflight -- /absolute/path/plan.json
npm run test:deploy-boundary
```

planはschema=1、locale=ja、baseline/candidate/receiptの絶対path、receiptSha256、overlays（asset path → source/sha256/reason）を持つ。
receiptはschema=1、locale=ja、全files（path → sha256/size）を持つ。productionEvidenceは本番version、deployment-artifact由来のreferenceが必要。手書きで信頼を捏造してはいけない。

今回の実行済みplan：`/private/tmp/rm-4b1-local-bWYL1x/plan.json`。これはLOCAL TEST ONLYで、本番deploy用には使用不可。

## L. dry-run / local検証結果

- 新規9件＋既存10件＝**19/19 PASS**。
- 実際のローカル7,975ファイルを別treeへコピーし、targetの旧本番HTTP本文をテスト基準に使用。既存の正式生成HTMLをoverlay。
- candidate 7,975件、target変更1、unexpected変更0、削除0。
- 元の `.deploy/ja` 全件hash不変。
- 未承認の変更・追加・削除、target改ざん、基準改ざん、小規模tree置換、symlink、ignore、偽のローカル本番証拠を拒否。
- production用preflightは `Verified, independently pinned production baseline required` で停止。
- Wrangler deploy --dry-runは未実行。現行hookは単一記事生成を行う旧接続であり、新guardを通る本番準備経路が未統合。dry-run成功を本番manifest一致の証拠として代用しない。
- Cloudflare現在versionの再取得は自動承認レビューの利用上限エラーで拒否。迂回していない。

## M. files scanned

guardの1比較あたり基準7,975 regular files＋candidate7,975 regular filesをハッシュ走査（stage/checkで再検査あり）。
前回Wrangler表示の16,206はrecursive readdirのエントリ数。今回同treeで再計数し16,206を確認。うちregular files 7,975、残り8,231はディレクトリエントリ。走査は全体buildではない。

## N. files generated

公開用assetの新規生成 **0**。既存bytesのコピーは基準tree 7,975件＋candidate tree 7,975件（HTML再生成ではない）。
検証metadata 2件（receipt/plan）と証拠JSONを作成。コード・テスト・監査Markdownは開発成果物として別計上。

## O. files changed

candidate対LOCAL TEST基準：**1**（代表HTMLのみ）。元ASSETS tree：**0**。本番基準との差分は未確定。
開発変更ファイルはJに記載。

## P. files uploaded

**0**。本番・previewともuploadしていない。upload session登録も行っていない。

## Q. HTML generated

**0**。工程4-Bで生成済みの1記事HTMLを再利用。単一記事build方式の変更・再buildは不要だった。

## R. HTML uploaded

**0**。

## S. 他guide/topics/rootの維持確認

完全ローカルtreeではtarget以外の全7,974ファイルがhash一致。root、replacement-program、CSS/JS、include2件は個別sentinelでも確認。
**このローカルtreeに /topics/ HTMLは存在しなかった。** fixtureテストではtopics維持を確認したが、実際の本番topicsの維持は未検証。本番完全基準が必要な理由の一つである。

## T. 他言語への影響

他言語deploy 0、他言語設定変更0。`wrangler.en/ko/pt/vi/zh.jsonc` の開始前後SHA-256が一致。既存差分は4-B対象外のまま保持。

## U. 全体Astro build回数

**0**。

## V. maintenance:full-build回数

**0**。

## W. rollback方法

次回の実行直前に現在100% version IDと完全基準artifactを保存し、異常時はそのWorker versionへ `wrangler rollback <version> --config wrangler.jsonc`。
Static Assetsはversionとともに復元。全体build不要。rollback単位は日本語Worker version全体であり「targetファイルだけのAPI rollback」ではない。対象外hashが不変なら実効的な差分はtargetと許可includeに限定される。
同時deployがあると他者の変更も戻す危険があるため、候補作成〜deploy〜rollback判断の公開作業を排他化し、version driftで停止する。
今回rollback操作なし。前回記録の `6be5618a-cc3b-41c6-8c54-06def5f77c61` を現在versionと未確認のまま決め打ちしない。

## X. 未検証項目

完全本番manifest/artifactとその由来、現在versionの再取得、全本番URLの存在、実本番topics、productionPreflightの認証付き成功分岐、統合後Wrangler dry-run、HTTP E2E、本番deploy。
既存Worker/codeは今回変更していない。

## Y. 残るリスク

1. LOCAL TEST基準は本番の完全性を証明しない。
2. guardが既存deploy経路に未統合のため、従来コマンドを使うと前回の事故を再発し得る。
3. 将来統合時は、検査後からmanifest読み取りまでcandidateを書き換えない排他・保存権限を用意する必要がある。
4. deployment-artifactの由来と基準hashの承認が必要。metadataの自己申告だけで証明にならない。
5. upload数は最近のアップロード内容の再利用に左右され、changed数と一致しない。

## Z. Git状態

開始時：工程3-B/C/4-A.1由来の13 tracked変更、監査dirとbuild-pageがuntracked。
今回追加はJのみ。Worker、build-page、全Wrangler設定、既存sharedテスト、release.mjs、Astroファイルは今回変更なし。
commit / merge / push 0。既存作業のrevertなし。

## AA. 次工程の最小提案

1. 現在本番versionに対応する完全ASSETS artifact＋manifestを、成功deploy時の保存物から確保する。見つからなければ正式な本番基準取得方法を確立する。部分HTTP比較から全体を推定しない。
2. その基準から独立完全stagingを作成し、target＋必要include2件のhash付きallowlistで検証。
3. レビュー済みstagingの完全性を根拠に、日本語build hookとASSETS参照先への統合を承認・実装。現行deploy前にguardを必須化し、同時変更を防止。
4. 統合した正式経路のdry-runと本番基準との差分を確認してから、別工程で再deploy判断。

自動承認レビューは、ASSETS参照先変更を「既存asset消失のリスク」、hook変更を「plan未接続で通常deployを失敗させるリスク」として拒否した。現在version読み取りは利用上限エラーで拒否。いずれも迂回せず、ローカル作業だけを完了した。

## AB. 最終判定

**「日本語1記事だけを安全に再パイロットdeployできるDeploy Boundaryが確立した」：NO。**
方式と独立guardのローカル検証は完了。本番完全基準と既存deploy経路への強制統合が未完了のため、工程4-B.1はPARTIALで停止する。
