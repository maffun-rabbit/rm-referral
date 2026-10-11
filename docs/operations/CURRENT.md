# 現行運用ルールの入口

- operationsId: `mnp-navi.phase0.operations.v1`
- operationsVersion: `1.0.0`
- operationsState: `DESIGN_ONLY`
- genesisCertified: `false`
- productionPublishEnabled: `false`
- retentionPolicyVersion: `1.0.0`
- 発効範囲: 正式mainへ反映後、正式リポジトリのプロジェクト作業で参照する設計・成果物判定ルール。新公開方式の正式切り替えではない。
- 正式GitHub: https://github.com/maffun-rabbit/rm-referral
- 正式Developer環境: `/Users/masayuki/Developer/projects/RMリファラル/cloudflare-site`
- 今回の作業領域: `/Users/masayuki/Developer/workspaces/mnp-navi-phase0/20261011-operations-rules/repo`
- 開始時ローカルmain・GitHub main: `3530975b70eb77934192e94142d8eb133ff0711b`（2026-10-11に読み取り確認）

## 参照

- [PHASE0.md](PHASE0.md): Genesisの認定、新方式の設計境界。
- [RELEASE.md](RELEASE.md): 公開・復旧の承認境界と将来の連続状態管理。
- [RETENTION.md](RETENTION.md): 保存・期限・削除の唯一の手順正本。
- [operations-policy.json](../../config/operations-policy.json): 機械判定用値・台帳契約。
- [retention-register.json](retention-register.json): 対象ごとの判定・期限・依存関係。

## 適用優先順位と作業許可

システム・開発者の制約とユーザーの現在の明示指示に従い、プロジェクトの運用入口はこの文書とする。
この文書が指定する専門文書とポリシーを一致させ、Skillに手順・保存基準の別正本を作らない。
食い違いを見つけた場合は、該当する変更・公開・削除処理を停止し、根拠を報告する。
新方式の実装方針は、現在のCloudflare ProductionをGenesisとし、変更記事と必要な依存だけを生成・検証・公開すること。
過去の全件生成・全件比較・監査suite・artifact復元方式を、新方式の必須条件として自動継承しない。
品質・完全性・状態の対応をどう保証するかは、新設計で個別に定める。過去の検査が不要だから品質確認を省く、とは扱わない。

現在はGenesis未認定で、新方式のUpload・Production公開は禁止。
許可するのはユーザーが承認した調査・文書・ポリシー・台帳・設計検証の範囲のみ。
文書変更・設計成功・Git変更は、削除・commit・main統合・Push・公開の許可を与えない。
機械ポリシーは既存公開スクリプトに未接続。作成しただけで実行制御が有効になったとは扱わない。

## 旧方式と参考資料

正式Phase 0切り替えまでは、既存AGENTS.mdの開発手順・Skillを無条件に置き換えない。
旧公開経路の存続は、今回の公開承認を意味しない。必要な承認・既存ガードを維持する。
`allowLegacyArtifacts=false` と `allowArchivedInputs=false` は、新Phase 0方式の入力としての採用を禁止する値。
旧方式の既存入力を今回削除したり、既存公開スクリプトの動作を変更したりする値ではない。
参考として旧コードを読むことはできるが、正式採用・認定・実行許可と混同しない。
古いcloneやarchive内のAGENTS.mdを、現行ルールの入口として採用しない。

## 成果物管理と停止

新しい一時成果物はRETENTION.mdに従い、理由・具体的依存・条件・閾値・絶対期限・判定責任・処置を登録してから保留する。
無期限保護、同じ理由での期限再登録、自動削除は禁止。必要性の証拠がなければDELETE_CANDIDATE。
文書・ポリシーの不一致、未登録の保護、承認不足、不明なProduction対応、旧指示との衝突では安全側へ停止する。
正式mainへ反映後は、プロジェクト作業の開始時にAGENTS.mdからこの最新版を参照する。古いclone・既に読み込まれたチャットの指示は自動更新されないため、使用元を確認する。
