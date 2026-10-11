# 公開・復旧の操作境界（設計）

operationsId: `mnp-navi.phase0.operations.v1` / operationsVersion: `1.0.0` / operationsState: `DESIGN_ONLY`
genesisCertified: `false` / productionPublishEnabled: `false`
入口は[CURRENT.md](CURRENT.md)、初期原本は[PHASE0.md](PHASE0.md)、保存は[RETENTION.md](RETENTION.md)。

## 現在の許可

新方式のVersion Upload・Production切り替えは不許可。実行コマンドを提供・実行する段階ではない。
既存公開方式は今回変更しない。既存AGENTS.mdの開発手順・既存ガードを維持するが、今回公開許可はない。
旧Skillの全件比較・全件HTTP・全量artifact復元などは旧方式の手順であり、新方式へ自動継承しない。

## 将来の通常更新

対象記事・言語・Worker・URLと変更範囲を固定し、Currentから派生するplanを作る。
変更記事と必要依存だけを生成・検証する。品質・影響範囲・manifest・bundle・設定・承認対象の対応を確認する。
Version Upload承認とProduction切り替え承認は独立した対象・記録・操作。
Upload承認はplan・parent Current・対象Worker/言語・package/設定・検証結果・期限に束縛する。
切り替え承認は実際に作成・検証されたVersionとtraffic配分にも束縛する。
hashを計算しただけのplanや自己申告された人物名を、人による承認と認定しない。

公開入口は運用仕様ID/hash、認定Genesis ID、使用方式、対象、現在Production、独立承認を確認する。
Upload前と切り替え直前に実Productionと承認されたCurrentを照合し、UNKNOWN/不一致なら停止する。
複数Versionの配分も全件一致させる。対象言語だけの確認で別Workerの状態を置き換えない。
新入口追加だけでは旧CLI・直接Wrangler・Builds・管理画面からの迂回を封じられない。
将来は公開権限・旧入口停止・実行経路を合わせて管理する。今回はどれも変更しない。

## 連続状態と意図的ロールバック

Currentはsequence、直前公開記録hash、Phase 0 ID、Git、manifest、bundle、設定、Deployment、Version/traffic、運用仕様を保持する。
公開結果を確認した後だけCurrentを前進させる。中断・タイムアウト・結果不明は成功扱いせず照合待ちにする。
最新sequence/hashはGit checkoutや台帳コピーと一緒に戻らない信頼済み管理先で保持する設計が必要。
単なるローカルhash chainだけでは台帳全体の巻き戻しを防げない。
Git reset、古いcheckout、artifact復元はProduction反映やCurrent変更を伴わない。
意図的ロールバックは別操作・別承認。現在状態、戻すVersion、理由、影響、検証結果を明示する。
戻した後もsequenceは前進し、古いCurrentへ台帳を戻さない。無承認の自動rollbackは新方式では許可しない。
外部の並行変更への対策は公開権限・実行の直列化・再照合を含めて設計する。
