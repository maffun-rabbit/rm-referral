# Phase 0：Genesisと再設計の境界

operationsId: `mnp-navi.phase0.operations.v1` / operationsVersion: `1.0.0` / operationsState: `DESIGN_ONLY`
genesisCertified: `false` / productionPublishEnabled: `false`
入口は[CURRENT.md](CURRENT.md)、保存判定は[RETENTION.md](RETENTION.md)。

## 認定前の状態

Genesisは将来認定する現在のCloudflare Productionであり、旧baseline・古いGit commit・過去artifactではない。
今回Cloudflareへアクセスしていない。Genesis IDは未発行、実ProductionのDeployment/Version/trafficは未確認。
fixture、HTTP標本、手書きID、manifest自身の自己申告hashでGenesis認定しない。
ローカルmainのSHAとProduction生成元commitが一致することも未認定。取得不能な生成元はUNKNOWNとして記録し、補う承認・証拠設計が必要。

## 将来固定する初期原本

Phase 0 ID、対象account・Worker・言語・公開URL/route、完全資産manifestと独立した信頼根拠、
Worker最終bundle・全依存module・metadata、実効設定hash、Deployment ID、全Version ID/traffic配分、
生成元Git commitとビルド条件（取得可能性を含む）、運用仕様Version/hash、取得日時・検証結果を対応付ける。
秘密値は通常ログに出さず、設定の固定方法と取得不能項目を区別する。
取得できない項目を推測で補完しない。未認定項目が公開挙動に影響する場合は認定を停止する。

Genesisは固定起点、Currentは直近の正式公開状態。両者を別識別子・別記録で扱う。
通常更新はCurrentからのみ派生する。古いGenesisやarchiveをCurrentへ自動昇格させない。
全Versionへtrafficが分割されている場合は、Versionごとの資産・Worker・設定と配分全体を認定する。

## 新方式の設計原則

変更された記事と必要な依存関係だけを生成・検証・公開する。
完全manifestによる資産集合の対応は保持するが、旧方式の全量candidate copy、全件HTTP、全件hash、
全回帰suite、全量artifact round-tripを通常更新の必須手順として引き継がない。
影響依存の定義、改変検出、差分検証の安全性、必要時の再検証を新設計で根拠付きに決める。
既存オフラインCAS・承認・CFアダプターは未採用の試作であり、新方式への自動再利用は禁止。

## 切り替え条件

Genesis認定、新公開入口・独立承認・連続Current台帳・影響範囲検証・障害時の状態照合を実装し、
旧公開経路の扱いと権限制御を確認してから、ユーザーの別承認で正式切り替えする。
今回の文書・台帳作成はその切り替えではない。旧成果物の移動・削除も別承認。
