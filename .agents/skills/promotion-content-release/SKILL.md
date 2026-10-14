---
name: promotion-content-release
description: RMリファラルの「プロモーションの制作進行をお願い」や統合プロモーション依頼を、テーマ選定・計測・制作から承認後の公開確認まで進める。説明だけの質問や無関係なプロモーションには使わない。
---

# 統合プロモーションの制作進行

正式リポジトリのAGENTS.md、docs/operations/CURRENT.mdを入口とし、[PROMOTION.md](../../../docs/operations/PROMOTION.md)を通常制作・計測・完了条件の正本として読む。[PROMOTION_STATE.json](../../../docs/operations/PROMOTION_STATE.json)から次工程を把握する。Skillに運用規則を複製しない。

- ページを制作・生成するときだけ既存rm-cloudflare-components Skillを併用する。媒体ごとのSkillは実際にその媒体を扱うときに読む。
- 接続済みの短縮URL管理機能/公開手段を優先し、足りない権限だけ具体的に示す。
- 依頼で指定された媒体・制作/公開の範囲を優先する。原稿確定後にリサーチをやり直さず、主担当が必要な整合確認と公開を担う。
- このSkillの利用は外部への投稿、Cloudflare Upload・Production切替、route変更の承認そのものではない。
- 別エージェントを使うかはPROMOTION.mdの限定委任方針に従う。全履歴の複製と必須の二重監査を加えない。

- Instagram・TikTokの動画制作時はPROMOTION.mdの「SNS動画の標準尺」を適用し、ページ数から総尺を決める。書き出したMP4と配布ZIPの反映を確認してから報告する。

- Instagram・TikTok素材の制作前に `../sns-generator/SKILL.md` を必ず読む。既存の写真・半透明パネル・大きな太字のテイストを使用する。独自カード・番号バッジへ置き換えない。
