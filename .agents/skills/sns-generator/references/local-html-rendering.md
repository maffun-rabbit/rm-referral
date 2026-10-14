# ローカルHTML描画

既存テンプレートの写真・60%白パネル・配置・文字色・太字を維持する。carousel.jsonはdate、branch、background_mode（ai/user）、絶対パスbackground_images（1または8件）、slides（8件）を持つ。

scripts/render_carousel.py --input <carousel.json> --output-dir <日付フォルダ> で8枚のHTMLを準備する。写真・半透明パネル・文字を別のHTML要素に保つ。108px、900、行間1.5を基本とし、収まらないときだけ縮小。縮小判定は固定幅760ではなく実際の文字領域のclientWidthを使う。

ローカルプレビューを起動し、許可されたChromeブラウザツールで各HTMLを1080×1920として開く。PNGはページ全体のネイティブキャプチャで書き出す。デザインをPillowで再合成しない。PNGを{i}_{date}_{branch}.pngとして個別保存する。ビュー設定は終了時に戻す。

QA：8枚の寸法、DOM内の確定原稿との一致、文字切れ・孤立文字・コントラスト・透明パネル・写真の場面を確認。動画は付属build_slideshow.pyで2秒×8枚、H.264・30fps・16秒。ZIP化しない。
