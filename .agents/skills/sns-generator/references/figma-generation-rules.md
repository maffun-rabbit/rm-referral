# Figma MCP生成ルール

Figmaでデザインを生成・編集するときは、見た目だけでなく、ユーザーが後から編集できる意味的なレイヤー構造を実装する。

## ノードの原則

- 文字は必ずネイティブ `TEXT` ノードにする。
- 写真はImage Fillを持つ適切なShapeまたはFrameとして保持する。
- 背景は視覚的に必要な場合だけFrameまたはRectangleにする。
- 区切り線はLINEまたは細いRectangleを使う。
- グルーピングと配置にはFrameまたはGroupを使い、複数要素のレイアウトはAuto Layoutを優先する。
- 見た目合わせやサイズ合わせだけのRectangle、Frame、透明Shapeを作らない。
- 写真と文字を一枚の画像へFlattenしない。

レイヤーは意味に応じて `Hero`、`HeroImage`、`HeroHeading`、`Description`、`CTA`、`SectionTitle`、`BodyText`、`Caption` などと命名する。`Rectangle 123`、`Frame 58` のような自動名を可能な限り残さない。

## TEXTの絶対ルール

`TEXT.fills` は文字（glyph）の色であり、テキストボックスの背景色ではない。

- 「文字を白に」: `TEXT fills = #FFFFFF`
- 「背景を白に」: 必要な背景FrameまたはRectangleのFillを白にする。
- CSSの `color` はTEXT fillに相当する。`background-color` と混同しない。

テキスト周囲は透明をデフォルトとする。写真上に白文字を置く場合は、白い箱を作らず、写真の上へ白いTEXTノードを直接配置する。

```text
HeroFrame
├── Photo
├── Heading       TEXT / fill #FFFFFF
├── SubHeading    TEXT
└── Caption       TEXT
```

文字間、行間、TextNodeの余白から背後の写真が見える状態を保つ。

## 背景を作らない

ユーザーが明示しない限り、次を作らない。

- Textの背後のRectangle
- Fill付きTextContainerまたはFrame
- 半透明の黒帯、白背景、ハイライト
- カード、ラベル、バッジ、ボタン、パネル
- 「画像上の文字」という理由だけのOverlayやグラデーション
- テキスト領域いっぱいの塗り
- 文字色を表現するためのRectangle

背景を生成できるのは、「背景を付けて」「黒い帯」「半透明の帯」「ラベル」「バッジ」「カード」「ボタン」「ボックス」「パネル」「テキスト背景」「文字の後ろを黒く」「グラデーションを敷いて」など、ユーザーが明示した場合だけとする。判断に迷う場合は背景を作らない。

## FrameとAuto Layout

配置、グルーピング、Padding、Alignment、ResizeのためだけのFrameは、`Fill: none` をデフォルトとする。複数テキストは必要に応じ、透明なAuto Layout Frameへまとめてよい。

```text
TextGroup          Auto Layout: Vertical / Fill: none
├── Heading        TEXT
├── Description    TEXT
└── Caption        TEXT
```

既存テンプレートに意図的なFillや背景がある場合は、それを「自動生成された不要物」と誤認して削除しない。このルールは、新規生成または指示対象の編集で余計な背景を追加しないためのものとする。

## 透過・書き出し

Figmaの透過は、主にノード全体の `opacity` と、`fills` 内の各Paintが持つ `opacity` の二段階に存在する。テンプレートを複製・編集するときは両方を保持する。

- Paintを変更する場合は既存Paintを複製し、未変更の `opacity`、`blendMode`、画像設定を残して再代入する。
- 半透明の白いPaintを、同じRGB値の不透明な白いPaintへ置換しない。
- ノード全体の `opacity` を既定値の `1` に戻さない。
- 既存のブレンドモード、背景ぼかし、エフェクトを、明示的な指示なしに削除しない。
- 文字差し替えだけの作業では、TEXT以外のノード属性を変更しない。

最終PNGはFigmaの対象ノードからネイティブにエクスポートする。HTML/CSS、Canvas、Playwrightのスクリーンショット、Pillowなどでデザインを再構築して書き出さない。これらはFigmaのPaint opacity、ブレンド、背景ぼかしを同じ意味で再現できない可能性がある。

エクスポート後は、Figma上の対象フレームのプレビューとPNGを目視比較する。背景写真を含む完成画像はPNG全体のアルファ値が255でも正常な場合があるため、ファイルのアルファチャンネル有無だけで半透明レイヤーの維持を判定しない。中央パネルなど、本来半透明の領域から背後の写真が同程度に見えているかを確認する。

## 生成前の判断

各ノードを作る前に確認する。

1. このRectangleは本当に必要か。
2. このFrameにFillは必要か。
3. ユーザーはテキスト背景を明示したか。
4. 文字色と背景色を混同していないか。
5. ネイティブTEXTだけで表現できないか。

必要性を説明できないノードやFillは作らない。

## 生成後の構造検査

Figma操作を完了する前に確認し、不適合があれば修正する。

- すべての文字が編集可能なTEXTノードである。
- 文字色がTEXTのFillに設定されている。
- 未指定のText背景Rectangleがない。
- Textを囲うレイアウトFrameに不要なFillがない。
- 写真が文字間とテキスト周囲から見える。
- 写真と文字が独立レイヤーである。
- 不要なRectangle、Shape、装飾コンテナがない。
- 各レイヤーが意味のある名前になっている。
- 元テンプレートと作業ノードで、ノードopacity、Paint opacity、blendMode、effectsが意図せず変化していない。
- ネイティブ書き出しPNGで、半透明部分が不透明な白または黒になっていない。

迷った場合は、ネイティブノード、少ないレイヤー、透明なレイアウトFrame、編集可能な構造を優先し、背景・Shape・装飾コンテナ・Fillを発明しない。
