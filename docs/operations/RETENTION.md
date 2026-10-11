# 成果物の期限・維持・削除判定

operationsId: `mnp-navi.phase0.operations.v1` / retentionPolicyVersion: `1.0.0`
入口は[CURRENT.md](CURRENT.md)。ルールはこの文書に集約し、AGENTS.md・Skillで再定義しない。

## 分類と適用範囲

正式ソース・正式に採用された運用文書は、一時成果物と区別する。未コミットだから正式とは判断しない。
試作コード、未コミット差分、検証worktree、検証生成物、キャッシュ、用途不明の一時領域は期限付き対象。
Production証跡は復旧用途・代替手段を期限内に再判定する。旧artifactを新GenesisやCurrentとして採用しない。
参考コードの採用と、その旧実行環境全体の保存は別判断。

## 登録必須項目

id、path（絶対パス）、classification、reason、dependencies（具体的依存関係）、retentionCondition、
threshold（証拠を伴う客観的な指標・演算・値）、deadline（YYYY-MM-DD）、decisionMethod、decisionOwner、
status、onConditionMet、onConditionUnmet、deletionMethod、approvalRequiredを必須とする。
今回の台帳は[retention-register.json](retention-register.json)。機械契約は[ポリシー](../../config/operations-policy.json)。
新規一時成果物は登録してから保護する。期限・条件・閾値・責任の欠落を拒否する。
「念のため」「将来使うかもしれない」「作業時間をかけた」「未コミット」「不安」「判断できない」は保護根拠にならない。
必要性の証拠がない場合はDELETE_CANDIDATE。削除承認済みを意味しない。

## 期限

過去試作・未コミット・worktree・検証出力・用途不明一時領域は登録開始から7日以内。
Production関連証跡は14日以内に再判定する。
既存対象の開始日は2026-10-11、7日対象は2026-10-18、14日対象は2026-10-25。
期限はAsia/Tokyoの日付とし、deadline日の終了（翌日00:00 JST）までに判定を完了する。
deadline日も期限到来判定の対象日。期限後の証拠提出で既存期限を自動延長しない。

## 状態と判定

ACTIVE / TEMPORARILY_PROTECTED / DELETE_CANDIDATE / ADOPTED / DELETED / BLOCKED_BY_SAFETY_DEPENDENCY。
ACTIVEやBLOCKEDへの変更で期限判定を回避しない。BLOCKEDにも解決条件・閾値・責任・期限が必要。
期限までに条件を達成し、期限内の証拠・独立した採用承認があれば正式採用または必要保管先へ移行する。
閾値未達・証拠不足はDELETE_CANDIDATE。DELETE_APPROVED_PENDING_EXECUTIONへ自動変更しない。
候補を台帳更新だけでADOPTEDへ昇格させない。移行先の用途・保管方針・承認記録を必要とする。
条件不成立の削除候補化と、実ファイルの削除実行は分離する。

Production・復旧への実害の可能性は実行前に切り分ける。
2026-10-25までに代替のない復旧依存を解消できなければ、安全上の未解決問題を対象別に記録してユーザーに個別承認を求める。
判定結果はDELETE_CANDIDATEとなっても、実害切り分け・承認なしで破棄しない。安全blockerを別フィールドに保持する。
通常候補を安全依存へ付け替えて無期限に保護しない。

## 例外延長

原則禁止。新しい具体的依存、維持条件、閾値、延長理由、新しい絶対期限、ユーザー承認記録をすべて必要とする。
承認識別子だけで真正な承認と認定しない。ユーザーの指示または信頼済み承認入力で確認する。
同じ理由の再登録、無期限延長、過去日付の期限、延長を重ねて期限を隠す行為は禁止。

## 削除実行と確認

対象の正規絶対パス、種類、symlink、Git管理関係、影響、親子重複、除外対象を確認して対象別承認を得る。
parentディレクトリの承認で、除外されたchildや未判定ファイルを削除しない。
worktreeはGit登録と共有管理情報を確認し、必要な変更の採用・保存判定後、承認されたGit worktree管理手順で解除する。
git reset/cleanや共有.gitの削除を整理の代用にしない。symlink先を辿って削除しない。
通常ファイル・CAS・候補は承認されたallowlistだけを削除し、公開正本・復旧依存・別作業領域を対象に含めない。
削除後に対象消失、正式main不変、必要な登録・依存関係維持を確認し、実行承認・日時・結果・証拠を記録してDELETEDへ更新する。
今回の検証は判定だけであり、削除executor・自動期限処理・自動通知は作成していない。
期限管理担当はユーザー（まさゆき）と、その明示依頼に基づくCodexの読み取り判定。予定日を記載しただけでは自動再判定されない。
