# Promotion Production Architecture（工程5-C）

原則は `Generate only what changed. Deploy only what was approved. Prove everything else stayed unchanged.`。Promotion ManifestはWHAT、Release Planは承認対象のProduction state、Receipt/Attestationは実測結果を担当する。

## Decision 1: Topics index

`/topics/`は日本語Production Baselineに存在する。`/en/topics/`、`/ko/topics/`、`/pt/topics/`、`/vi/topics/`、`/zh/topics/`は存在しないため、5-Dで **ONE-TIME SHARED ASSET / ONE-TIME MIGRATION** として作成する（Option B）。通常Promotion allowlistには含めず、各locale baseline確立前にHTTP 200、navigation、SEOを検証する。

## Decision 2: Breadcrumb

全localeで `Home → Topics → Current Topic` とし、Topics hrefはlocale prefix付き`/{locale}/topics/`（jaのみ`/topics/`）。labelは各page.jsonのlocale固有copyを使用する。5-Dでindexが存在するまでは外国語Topicを公開しない。visible breadcrumbと自動生成するBreadcrumbList JSON-LDは同じmappingを正本にし、page.jsonによる別URL上書きを許可しない。

## Decision 3: hreflang

Option Aを採用する。hreflangはProduction receiptで公開確認済みのlocaleだけを出す。sourceやVersion Uploadだけでは公開扱いにしない。selfはそのlocaleのProduction切替時に追加できる。`x-default`は公開確認済み集合にjaがある場合だけja URLへ出す。partial release中は未公開URLを出さず、全locale完了後のhreflang reconciliationは各localeのtarget Topicだけを更新する明示releaseとする。

## Decision 4: Worker exact pathname

Manifestと承認済みRelease Planを検証し、deploy artifact作成時にlocaleごとのexact pathname setを生成する。Worker runtimeは原本filesystemを探索せず、この固定setだけを参照する。`startsWith('/topics/')`やwildcardは禁止。P0の`/guide/rakuten-mobile-three-features/`は独立した既存exact routeとして維持する。percent encoding、backslash、double slash、slash variant、prefix/suffix collision、locale mismatchを拒否し、queryではなく`URL.pathname`を判定する。

## Decision 5: Shared includes

ja baselineには`/_includes/ja/header.html`と`footer.html`があるが、現行Topicはinline header/footer。外国語baseline/includeは未確立。5-Dでlocale固有navigation、language selector、CTA、内部リンク、accessibilityを検証したheader/footerを **ONE-TIME SHARED ASSET MIGRATION** として追加する。通常Promotionではincludeのchanged/added/deletedを全て0とする。

## Decision 6: Wrangler transition

5-Cでは他言語Wranglerを変更しない。5-Dではlocaleごとに、旧`prepare-release.mjs` hookを暗黙fallbackのないProduction Baseline guardへ置換する。必要条件はartifact/receipt/attestation、candidate diff、exact route set、current-version drift、locale/Worker/config binding、Version UploadとProduction切替の分離。切替はbaseline bootstrapと同じlocale作業内でレビューする。

## Decision 7: Production Baseline

| locale | 状態 | current Worker |
| --- | --- | --- |
| ja | ESTABLISHED | rm-referral |
| en | BOOTSTRAP REQUIRED | rm-referral-en |
| ko | BOOTSTRAP REQUIRED | rm-referral-ko |
| pt | BOOTSTRAP REQUIRED | rm-referral-pt |
| vi | BOOTSTRAP REQUIRED | rm-referral-vi |
| zh | BOOTSTRAP REQUIRED | rm-referral-zh |

他5 localeはcurrent deployment/versionが存在しても、完全artifact＋receipt＋attestationがないためESTABLISHEDとは扱わない。

## Decision 8: Release unit

Promotionは6 localeを束ねるが、baseline、candidate、Version、Deployment、Receipt、Attestation、rollback targetはlocaleごとに独立する。Promotion coordinatorは各locale receiptをPromotion IDとManifest hashで集約する。

## Decision 9: Partial failure / rollback

Version URL失敗は当該localeをProductionへ切り替えず、未実行localeも停止して確認する。Production切替後のlocale固有障害は当該localeだけを直前Versionへrollbackする。本文自体のcross-locale重大問題では全localeをpauseし、人間のcoordinatorがrollback範囲を決める。6 locale自動一括rollbackは禁止する。

## Decision 10: Release order

1. 6 locale分のcandidate/preflightを独立完了
2. localeごとにVersion Upload（Production trafficは変更しない）
3. 全Version URLを検証
4. 各localeのcurrent deployment/version driftを再確認
5. locale単位でProductionへ100%切替
6. 直後HTTP regression。失敗localeだけrollback
7. candidateを新baseline化し、receipt/attestationをCloudflare実測値から生成

blind一括deployは行わない。

## Schemas

- Manifest: `schemas/promotion-manifest.schema.json`
- Production Release Plan: `schemas/promotion-release-plan.schema.json`
- Locale Release Receipt: `schemas/promotion-release-receipt.schema.json`
- Attestation: `schemas/promotion-release-attestation.schema.json`

Release Planはbaseline artifact/receipt/attestation、candidate inventory、target/sitemap hash、expected current version、rollback version、Worker/config、差分allowlistを固定する。Receipt/AttestationはVersion/Deployment/traffic/deployedAt/verifiedAtをCloudflare実確認後だけ記録する。

## Sitemap and 60,000-page boundary

locale sitemapは既存bytesへcanonical URL最大1件だけ追加する。既存URL変更・削除、robots、他locale sitemapは変更禁止。candidateはverified baseline全件をpath/size/SHA-256比較し、target HTML＋必要なsitemap以外のchanged/addedと全deletedを拒否する。baseline複製は再生成ではない。Astro生成数は1 localeあたりHTML 1件に固定する。
