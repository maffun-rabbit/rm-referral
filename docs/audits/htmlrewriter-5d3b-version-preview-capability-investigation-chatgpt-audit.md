# HTMLRewriter 工程5-D.3b Version Preview Capability Investigation ChatGPT監査レポート

## A. 結論

PASS — VERSION PREVIEW ROOT CAUSE IDENTIFIED

Version 66のVersion URLが404だった直接原因は、`rm-referral-zh`のWorker単位設定が`previews_enabled: false`であり、Version URL routingが無効だったためである。Production `workers.dev` routeも`enabled: false`だが、Version URLsは独立して有効化できる。今回の分類は主因 **A. VERSION_URLS_DISABLED**、背景 **B. WORKERS_DEV_CONFIGURATION** である。

## B. Current Production

- Worker: `rm-referral-zh`
- deployment: `ebda607e-edf2-4507-9d8e-ee2cc9fb5fca`
- version: `1dcb8a7a-8181-4059-8856-a99166fa2e2a`
- traffic: `100%`
- mixed traffic: `NO`
- drift: `NO`

`wrangler deployments list --config wrangler.zh.jsonc --json`をread-onlyで再取得し、Gate 2後も上記状態が維持されていることを確認した。

## C. Version 66

- ID: `2bc39880-b6a9-4c3b-90d3-b833da9f3c8d`
- number: `66`
- createdAt: `2026-09-25T12:58:01.199233Z`
- Worker: `rm-referral-zh`
- traffic: `0%`（current deploymentの構成要素ではない）
- exists: `YES`
- metadata `has_preview`: `true`
- bindings: `[]`
- assets: `serve_directly: true`, `raw_run_worker_first: false`, `base_path: /`

`has_preview: true`はVersionがpreview-addressableな形で作成されたことを示すmetadataであり、Worker単位のrouting状態`previews_enabled`とは別である。

## D. Wrangler

- repository指定: `4.131.1`
- lockfile resolved: `4.131.1`
- runtime: `4.131.1`
- upgrade: `0`

## E. Repository config

`wrangler.zh.jsonc`:

- Worker name: `rm-referral-zh`
- `workers_dev`: omitted
- `preview_urls`: omitted
- route: `mnp-navi.jp/zh/*` (`zone_name: mnp-navi.jp`)
- custom domain: none
- `run_worker_first`: omitted
- assets directory: `.deploy/zh`

`routes`が存在し`workers_dev`が省略されているため、Cloudflare/Wranglerの既定動作では`workers.dev` production routeは無効側となる。`preview_urls`省略はfalseの宣言ではなく、既存Cloudflare設定を変更しない。

## F. Cloudflare subdomain state

Cloudflare公式read-only APIで確認した実状態：

- account workers.dev subdomain: `maffun`
- Worker subdomain `enabled`: `false`
- Version URLs `previews_enabled`: `false`
- Worker URL metadata: `https://rm-referral-zh.maffun.workers.dev`
- `preview_url_suffix`: `-rm-referral-zh.maffun.workers.dev`

`url`と`preview_url_suffix`が返ることはaccountがworkers.dev subdomainを所有する証拠だが、routingが有効であることを意味しない。実際の有効性は上記booleanで判定した。

## G. Version URL eligibility

**YES, IF VERSION URL ROUTING IS ENABLED.**

Version 66は通常Worker versionで、bindingsは空、Durable Object / Containers / Sandbox Worker / Workers for Platforms user Workerのいずれにも該当しない。Worker reference metadataでも`durable_objects: []`、`dispatch_namespace_outbounds: []`であった。

現状は`previews_enabled: false`のためaddressableではない。

## H. Correct Version URL

Version prefixはVersion ID先頭8文字の`2bc39880`、Cloudflare metadataのsuffixは`-rm-referral-zh.maffun.workers.dev`である。したがって正しいVersion URLは：

`https://2bc39880-rm-referral-zh.maffun.workers.dev`

Gate 2で使用したURL形式は正しかった。原因分類 **C. WRONG_VERSION_URL** ではない。

## I. HTTP sentinel result

Read-only GET:

- URL: `https://2bc39880-rm-referral-zh.maffun.workers.dev/`
- status: `404`
- redirect: `0`
- content type: `text/plain; charset=UTF-8`
- body size: `17 bytes`
- body: `error code: 1042`
- server: `cloudflare`

Worker responseではなくCloudflare routing層の応答である。公式APIの`previews_enabled: false`と整合する。6,851 path検証は再開していない。

## J. Access

- Cloudflare Access: `NOT ENABLED`（read-only APIが`access.api.error.not_enabled`を返した）
- 原因分類 **D. ACCESS_PROTECTED**: `NO`

401/403やAccess login redirectではなく、routing無効による404だった。

## K. Worker limitation

- Durable Object implementation: `NO`
- Containers / Sandbox Worker: `NO EVIDENCE / NOT USED`
- Workers for Platforms user Worker: `NO`
- service-binding references: `0`
- Version URL非対応条件への該当: `NO`

## L. Root cause

- **A. VERSION_URLS_DISABLED: YES（直接原因）**
- **B. WORKERS_DEV_CONFIGURATION: YES（既定値の背景）**
- C. WRONG_VERSION_URL: NO
- D. ACCESS_PROTECTED: NO
- E. WORKER_NOT_ELIGIBLE: NO
- F. VERSION_66_NOT_ADDRESSABLE: CURRENTLY YES BECAUSE ROUTING IS DISABLED; VERSION自体の欠陥ではない
- G. CLOUDFLARE_PLATFORM_LIMITATION: NO
- H. UNKNOWN: NO

Cloudflareは2025年に、`workers.dev`が無効な既存WorkerのVersion URLsを安全のため無効化した。また現行仕様では、明示設定がない場合、Version URLsの既定値は`workers_dev`に従う。このWorkerではcustom routeがあり、実Cloudflare状態も両方falseである。

## M. Existing Version 66 reuse

**YES（公式仕様とAPIモデルに基づく設計上の判定。未変更のため実証は次工程）**

根拠：

1. Version URL enablementはVersion個別ではなくWorker script subdomainの`previews_enabled`設定である。
2. Version 66は存在し、`has_preview: true`で、正しいversion prefixとsuffixを持つ。
3. Cloudflare Dashboard/APIのenable手順はWorker-level toggleであり、新Version作成を必須としていない。
4. aliasだけはupload時限定だが、今回必要なのはaliasではなくversioned URLである。

従って、Worker-level Version URLsを有効化すればVersion 66を再uploadせずrouting可能になると判断する。ただしwrite後の実URL応答確認は未実施であり、次工程では設定変更直後にVersion 66 URLを少数sentinelで確認してから6,851件検証へ進む必要がある。

## N. Version URLs enablement side effects

公式API上の最小writeは、zh Worker script subdomain設定の`previews_enabled`を`true`にするWorker-level setting updateである。

想定される境界：

- new Worker Version生成: `NO`（subdomain setting updateはVersion upload endpointではない）
- Production Deployment生成: `NO`
- current Production Version変更: `NO`
- traffic変更: `NO`
- Version 66 asset bytes変更: `NO`
- custom route `mnp-navi.jp/zh/*`変更: `NO`
- `workers.dev` production route: `enabled:false`を維持可能
- other locale: `NO`, zh Worker固有設定
- public exposure: Version URLsがpublicになる。必要なら別途Accessを導入できるが、本調査時点ではAccess自体が未有効。

Repositoryに`preview_urls: true`を加えるだけではCloudflare側は即時変更されない。Wranglerによる次のupload/deploy時に設定反映writeが発生する。Version 66を保持して最小化するなら、別承認工程でCloudflare Worker subdomain settingだけを更新し、repo configとの将来整合も別途明示管理するのが妥当である。

## O. Cloudflare write

`0`

## P. Version Upload

`0`

## Q. Production Deployment

`0`

## R. Traffic変更

`0`

## S. Astro full build

`0`

`maintenance:full-build`: `0`

## T. 他locale副作用

`0`

ja / en / ko / pt / viへのread/write変更なし。

## U. Git状態

- branch: `main`
- HEAD: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- origin/main: `62c610bfb7ecb759d246dd5502da320e2c5d8c2a`
- staged: `0`
- tracked deletion: `0`
- `git diff --check`: `PASS`
- 既存5-B以降のmodified/untracked差分: 維持、revert/stage/commit/stashなし

## V. 変更ファイル

- `docs/audits/htmlrewriter-5d3b-version-preview-capability-investigation-chatgpt-audit.md` — 本調査レポート

Production code / Wrangler config / artifact / receipt / evidence / candidateの変更なし。

## W. 推奨する最小次工程

**工程5-D.3c — zh Version URLs Enablement**

承認対象を次の1 writeに限定する：

1. `rm-referral-zh`だけのWorker subdomain settingを`enabled:false, previews_enabled:true`へ更新する。
2. Version 66、Production Version 65、current deployment、traffic 100%を維持する。
3. 設定直後にread-only APIでstateを確認する。
4. 同じVersion 66 URLをroot等1〜3 sentinelで確認する。
5. Version 66がaddressableになった場合だけGate 2の6,851 known paths検証を再開する。
6. Production Deploymentは引き続き禁止する。

Version 66の再upload、alias作成、workers.dev production route有効化、Access変更は不要であり、最初の解決策にしない。

## X. Gate 2再開可否

**NO — zh Version URLs Enablementの明示承認・実行が先。**

設定反映後にVersion 66 URLのsentinelが成功すれば、同じVersion 66を使ってGate 2の6,851 path検証を再開できる。

## 公式仕様参照

- Cloudflare Version URLs: https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/
- Cloudflare Worker Script Subdomain API: https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/subdomain/methods/get/
- Cloudflare Workers API Worker metadata: https://developers.cloudflare.com/api/typescript/resources/workers/subresources/beta/subresources/workers/methods/get/
- Preview URLs opt-in change: https://developers.cloudflare.com/changelog/post/2025-09-17-update-preview-url-setting/
- workers.dev routing: https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
