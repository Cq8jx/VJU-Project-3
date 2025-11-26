# Codex Agent ガイドライン

## セクション一覧
1. 共通運用ルール
2. Apps Script / GAS 運用
3. ドキュメント・Markdown・翻訳
4. 3. University Regulations ワークフロー
5. LaTeX / Notes 運用
6. その他テンプレート・環境設定
7. 用語集（人名 / 用語）

---

## 1. 共通運用ルール

### 1.1 コミュニケーションと基本姿勢
- ユーザーへのメッセージは日本語で記載する。
- 不明な点がある場合は積極的に質問し、その際は可能な選択肢を提示したうえで各選択肢の推奨度（★★★☆☆ 形式）と理由を併記する。
- ユーザーの提案に安易に同調せず、より良い案の有無を検討したうえで建設的に課題を指摘し、必要なら代替策を示す。
- 箇条書きを提示する際はユーザーが引用しやすいよう常に番号付きリストを用いる。
- ユーザーが再試行済みと伝えた操作を繰り返し依頼せず、別の原因調査や代替案提示を優先する。
- 即答が難しい問い合わせは、未回答の確認事項が1～2件であれば質問し、それ以上不明点がある場合は公式ドキュメントで最新仕様を確認したうえで回答方針を定める。
- 作業中は `~/.codex/AGENTS.md` を定期的に読み返し、最新の指示へ常時追従する。
- Apps Script / GAS に関する作業では、着手前に `~/.codex/AGENTS_GAS.md` を読み直し、同ファイルの手順と注意事項を必ず遵守する。
- 英語で記述する文書・スライドでは句点「。」を使用せず、英語圏向けの句読点に統一する。
- コードレビューや成果物レビューを行う際は、関連ドキュメント（要件・設計・運用メモ等）との整合性を必ず突き合わせ、差異があれば指摘や報告に含める。

### 1.2 計画とログ管理
- 直近1週間の会話ログは `~/.codex/conversation-log.md` に追記し、継続利用できるよう管理する。
- ログが煩雑になった場合は主要イベントのみを要約し直し、最新タスクがすぐ把握できる形へ整理してから作業を再開する。
- `~/.codex/conversation-log.md` は事前承認なしで編集してよい。
- 作業に着手する段階で当日の作業計画を同ログへ記録し、進行中に大きな変更が生じた場合も追記する。
- 作業計画（タスクリスト）は可能な限り細分化し7項目程度を目安とする。5項目以上の計画を提示する場合は着手前にユーザーへ方針確認を取り、その旨を会話で共有する。
- `git status` などで未 push のファイルが30件を超えた場合は、差分整理と push を優先度高く進める。

### 1.3 ファイル操作と新規作成
- 新規に `.tex` ファイルを作成する場合は、着手前に要件定義書と仕様書をまとめてユーザーの確認を得てから実装を開始する（既存 `.tex` の更新では不要）。確認完了後は両文書を削除してよい。
- ファイル削除や大規模変更はバックアップを確保したうえで慎重に実施し、必要に応じて作業経緯を会話ログへ残す。
- 共有ファイルの移動や整理時は既存ファイルの ID が変更されないよう十分注意する。

### 1.4 ファイル指定と表記
- 「AGENTS.md」と指定された場合は `~/.codex/AGENTS.md` を指す。ワーキングディレクトリに同名ファイルが存在する場合は、書き込み指示のたびに対象ファイルを確認する。
- 作業開始時に `~/.codex/AGENTS.md`、`~/.codex/AGENTS_GAS.md` などの指示ファイルをワーキングディレクトリ直下へコピーし、両者の内容が一致しているか確認する。コピー側に差異がある場合は、必ず `~/.codex/` 配下の最新内容を反映して同期してから作業を続行する。
- ベトナム語表記「ベトナム国家大学ハノイ校 日越大学」を英訳する際は `VNU – Vietnam-Japan University` のように頭に `VNU` を置く構成を用いる。
- ベトナム人名は日本語版・英語版の文書でも原文通りのベトナム語表記（ダイアクリティカルマーク含む）を用い、カタカナやローマ字へ置換しない。

### 1.5 API テストと復旧監視
- 有料または利用制限のある API を呼び出す前に、結果を受け取った後に行う後続作業（例: 所定ディレクトリへのファイル作成）が問題なく行えるかローカルで事前にテストする。
- テスト結果が想定通りであることを確認してから API 呼び出しに進む。検証不能な場合はユーザーへ報告し、代替案を検討する。
- Gemini API のクォータ超過時は毎日 08:00 に軽量プロンプトを送信して復旧を自動確認するトリガーを必ず登録し、復旧を検知したら通知メール送信後に当該トリガーを確実に解除する。
- API に制限が発生した場合は、復旧状況を確認するスクリプトを12時間ごとに実行するタイムトリガーを自動設定し、復旧確認時はユーザーへメール通知するとともにトリガーと通知設定内容を `~/.codex/conversation-log.md` に記録する。

### 1.6 UI 表示とメッセージ
- カスタムメニューやダイアログ、通知メール等の UI 文言は英語を基本とし、外国人利用者でも理解しやすい表現に統一する。
- GAS に不慣れな運用者が利用する前提で、専門用語の多用を避け、不可避な技術用語には簡潔な説明や補足を添える。
- ガイドやアラートの文面は、操作手順や次に取るべきアクションが明確になるように記載する。

### 1.7 Git / GitHub 運用
- GitHub を使用する際は原則として全ファイルを追跡対象から外し、ユーザー指示のあったファイルのみ明示的に add／commit する。
- push 前に `git remote -v` と `git status -sb` で対象リポジトリと差分を確認し、必要なら `cd ~/GitHub/VJU-Project` と明示して誤った場所へ push しない。
- push 後は Deploy GitHub Pages workflow の実行結果を確認し、表示異常が出たらソース差分と生成 HTML を突き合わせて原因を切り分ける（`curl` 等で直接確認する）。
- 作業に着手する段階で当日の作業計画を `~/.codex/conversation-log.md` に記録し、進行中に計画へ大きな変更が生じた場合も同ログに追記して再開時の参照に備える。

### 1.8 ExecPlans
- 複雑な機能実装や大規模リファクタリングでは、設計から実装までのすべての工程において `.agent/PLANS.md` で定義された ExecPlan を必ず用い、同ファイルの指示に従って計画・更新・報告を行う。

---

## 2. Apps Script / GAS 運用
Apps Script / GAS に関する詳細な手順や注意事項は `~/.codex/AGENTS_GAS.md` に移動しました。GAS 関連タスクに着手する前に必ず同ファイルを確認し、記載内容に従ってください。


## 3. ドキュメント・Markdown・翻訳

### 3.1 ドキュメント作成方針
- 新規に作成するドキュメントファイルのファイル名は英語とし、内容は日本語を基本とする。
- 例外や別言語を使用する場合はユーザーと合意を取り、文書中に明記する。
- コードレビュー結果など再利用したいレポートは `docs/` 配下へ Markdown で保存し、レビュー観点ごとに章立てしたうえで最終章に総評を記載する。
- レビュー報告書には `Reviewed on: YYYY-MM-DD HH:mm (+TZ)` 形式でレビュー日時を明記し、再実行時も最新日時へ更新する。
- レビュー報告書を修正・追記した場合は、必ず続けて再レビューを実施し、新しい所見を報告書へ反映する（改善→再レビュー→更新のセットで完結させる）。
- レビュー報告書作成時は次の3ステップで情報を整理する。  
  1. `git status -sb` 等で差分とブランチ状態を確認し、リポジトリ全体のディレクトリ構成や主要ファイル群（Apps Script／HTML・JS／ドキュメント等）を把握する。  
  2. Apps Script 本体と関連する UI・ドキュメントを精読し、レガシー API／未使用コード／ガイドラインとの差異／更新漏れを洗い出す。  
  3. 調査結果を重要度順にまとめ、改善提案や追加対応案を含むレビュー報告書を `docs/` 配下へ作成する。  
- 各指摘には必ず `影響範囲` セクションを設け、修正の影響を受ける関数名とファイルパス（例: `Notifier.gs:updateCalendarEvents`）を箇条書きで列挙する。
- 各指摘には 3 系統の生成 AI（AI1/AI2/AI3）へ渡すプロンプト案を追加すること。AI1 は根本原因分析と修正方針整理、AI2 は実装とコード変更、AI3 はテスト・検証・ドキュメント反映を担当する前提で、各プロンプトには作業対象・入力情報・期待するアウトプット・完了条件を明記する。  
  - AI1 用テンプレ例: 「AI1（Root Cause Planner）: 下記 Issue の原因と修正方針を洗い出してください。前提: <ブランチ/リポジトリ>。対象ファイル: <ファイル一覧>。期待アウトプット: 影響関数別の原因分析、修正方針、想定副作用、フォローアップ TODO。」  
  - AI2 用テンプレ例: 「AI2（Implementation Agent）: Issue <ID> を解消するコード修正を行ってください。対象関数: <関数一覧>。制約: コーディング規約・テスト要件。期待アウトプット: 変更 diff、補助関数追加の有無、必要なマイグレーション手順。」  
  - AI3 用テンプレ例: 「AI3（Verification Agent）: Issue <ID> で適用した修正を検証してください。対象テスト: <テスト名>。実施内容: 自動テスト実行、手動確認、ドキュメント更新。期待アウトプット: 実行ログ、確認済みシナリオ、残リスクと追加推奨。」
- 上記 AI1/AI2/AI3 用プロンプトは必ず実装タスクを直接指示する文面にし、他 AI の担当領域と重複しないよう明示せよ（例: 「AI1 は設計変更案のみ提示し、コード修正は行わない」等）。あわせて、他 AI が並行作業しても干渉しないよう注意書きをプロンプト内へ含めること。
- どうしても領域が重なる作業は AI0 が担当する。ただし AI0 のタスクは最小限に抑え、AI1～AI3 へ委譲できる部分を極力分割し、AI0 プロンプトにも「必要最低限のみ対応する」旨を明記すること。
- AI0～AI3 の基本方針:  
  - **AI0 (Integration Steward)**: 他 AI が跨る設計変更・ブランチ戦略・リリース計画のみを扱い、コード修正は最小限。指示には「他 AI の担当領域へ変更を入れない」「完了後にレビュー報告書を更新する」旨を必ず含める。  
  - **AI1 (Trigger & Queue Engineer)**: トリガー／ポーリング／キュー処理などスケジューリング領域のみを担当。Config/Approval/Monitoring に変更を入れないよう指示。  
  - **AI2 (Security & WebApp Engineer)**: WebApp 実行主体・承認フロー・トークン／認証・PII マスキングを担当。他領域へ干渉しない明記と、完了後のレビュー報告更新を指示。  
  - **AI3 (Monitoring & Documentation Engineer)**: 監視・ログ・ドキュメント整備に限定し、業務ロジックには触れない。作業の最後にレビュー報告書更新を必須指示とする。
- プログラミングに関するドキュメント（設計書・手順書などコードに紐づく文書）を作成する場合は必ず Software Design Specification (SDS) を併せて作成する。ただし .tex や .md 形式で文章執筆のみが目的で、プログラミングを伴わない内容であれば SDS は不要とする。

### 3.2 Markdown 編集ルール
- Markdown を編集した場合は、報告前にテーブル列数と列揃えを確認し、表やリストが崩れていないかレンダリングを点検する。
- Markdown 内の用語は正式名称表（https://docs.google.com/spreadsheets/d/1kfRklEPr2MbZJeKY8Me0lTO68-8G4EtZlviktDpR1pA/edit?gid=962055076#gid=962055076）で照合し、表記揺れを防ぐ。
- Markdown の表で数値主体の列は `---:` を用いて右揃えにする。

### 3.3 政府通達向け注意書き
- PDF から Markdown を生成するとき、対象が政府通達であれば次の注意書きを冒頭に追加する（`3. University Regulations/` 配下のベトナム語 `.md` も同様）。  
  ```
  Tệp này là bản chuyển văn bản từ https://vanban.chinhphu.vn/?pageid=473& và thông tin dựa trên nội dung được công bố tại đó.
  Việc nhận dạng bảng gặp khó khăn về mặt kỹ thuật. Bố cục và nội dung của bảng có thể không chính xác.
  【Lưu ý】
  Tệp này chỉ mang tính chất tham khảo và không có giá trị pháp lý. Để có thông tin chính xác, vui lòng tham khảo văn bản gốc. Ngoài ra, có thể có các phiên bản ngôn ngữ khác được đơn vị ban hành công bố chính thức。
  ```
- 政府の通達ではない場合は、適切な参照 URL をユーザーに確認する。

### 3.4 翻訳時の用語統一
- ベトナム語 `Quyết định` は公的文書に合わせて「決定」と訳し、「決断」は使用しない。
- ベトナム人名は他言語の文章でもベトナム語表記のまま記載する。
- 英語→日本語翻訳時の注意  
  1. 英語原文の箇条書き番号（`I.` `II.` など）を一人称と誤訳しない。  
  2. `No.` は文脈に応じて「番号」「第○号」など適切な語に置き換え、「いいえ」と訳さない。  
  3. 原言語の意図を直接確認し、英語経由の誤読を避ける。

### 3.5 Gemini 翻訳パイプライン
1. PDF・スキャンなどからのテキスト抽出も Gemini を用い、既定モデル `gemini-2.5-flash` で `gemini run --model gemini-2.5-flash --prompt "Extract structured text"` を実行して段落・見出し単位のプレーンテキストを取得する。  
2. 段落単位の長文翻訳も `gemini-2.5-flash` を基本とし、`gemini run --model gemini-2.5-flash --prompt "Translate to <言語>" < input.txt` を実行して出力を `codex format --lang <言語コード> --style academic` へパイプし、Markdown 体裁と語彙統一を行う。  
3. Gemini 側で翻訳精度を確保し、Codex 側で Markdown 構造調整・表記揺れ統一・文体整形を担当する。  
4. 入出力は UTF-8 を前提とし、段落区切りを保ったまま取り込む。必要に応じて部分訳を結合する場合も Markdown 構造を壊さない。  
5. 翻訳結果を採用する前に、用語表・注意書きの要否・引用記号の統一を Codex 側で確認する。

### 3.6 PDF→Markdown のレイアウト再現
- PDF から Markdown を作成する際、GitHub Flavored Markdown で再現が必要なレイアウト要素（左右配置、署名欄、枠線など）がある場合は、適切な範囲で HTML タグとインライン CSS を使用して再現してよい。
- 表示崩れを避けるため、`display:flex` や `text-align:center` など基本的なプロパティに留め、必要最小限のスタイルで構造を表現する。
- Markdown 記法で表現できる場合は Markdown を優先し、HTML の併用はレイアウト再現に不可欠なケースに限定する。
- 署名欄が HTML レイアウトの場合は、必要に応じて次のスニペットを利用する。  
  ```
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p>
        <strong><em>配布先:</em></strong><br>
        - 第3条記載先（実施用）；<br>
        - 学長室、大学評議会（報告用）；<br>
        - 保存: 事務局、試験・質保証課、H06
      </p>
    </div>
    <div style="text-align: center;">
      <p>
        <strong>学長 代<br>
        副学長</strong>
      </p>
      <p>
        <em>（署名・押印）</em>
      </p>
      <br>
      <br>
      <p>
        <strong>Nguyễn Hoàng Oanh</strong>
      </p>
    </div>
  </div>
  ```

### 3.7 「内容をチェック」依頼時の対応
1. 指定されたファイルを読み、扱う論点・定義・議論の流れを整理する。  
2. 元ファイルの構成を踏まえて導入事例・まとめ・参考文献の有無を確認しながら十分な分量の A4 原稿を作成する。数式主体なら `.tex`、ほとんど無ければ `.md` を用いる。  
3. 原稿を批判的に見直し、欠落した定義や定理、追加すべき論点、読みやすさを確認して改良する。  
4. 元ファイルに戻り、補強した内容が反映されているか、議論の流れが崩れていないか確認する。基本は加筆・修正を前提とし、内容の削除（位置移動のみを除く）を行った場合は作業完了後に必ず報告する。  
5. `.tex` を用いた場合は `latexmk -xelatex` などでコンパイルし、出力 PDF を確認する。  
6. 手順と結果をユーザーへ報告する。作成した Notes ファイルは削除せず残し、既存の Notes がある場合は上書き更新で対応する。

### 3.8 Google Meet ガイド運用
1. `5. Guide/Google Meet/` には日本語・英語・ベトナム語版を同時に維持し、章構成（目的→全体の流れ→手順セクション）と用語を三言語で揃える。  
2. 端末操作や共同主催者設定などの手順直後に対応スクリーンショットを必ず挿入し、`5. Guide/Google Meet/Fig/` 配下へ用途が分かるファイル名（例: `google-meet-add-cohost.png`）で保存する。  
3. 不要になった画像は `Fig/Unused/` へ移し、本文から参照を外す。差し替え時はキャプションや本文の説明も更新して受講者が画像だけで手順を追えるようにする。  
4. ガイド全体は初学者前提で敬体に揃え、Chrome/PWA 導入・共同主催者設定・ブレイクアウト操作・出欠管理などの主要ユースケースを必ず最新 UI（2025-10 以降）基準で記述する。

---

## 4. 3. University Regulations ワークフロー

### 4.1 作業フロー
1. **下準備**  
   - 対象は `3. University Regulations/Unprossed/` の MD / PDF ペア。  
2. **ファイル名整理**  
   - Markdown: `文書ID <ベトナム語正式題名>.md`。  
   - Source PDF: `文書ID <英語正式題名>.pdf`（原本識別が必要な場合は `_source` サフィックスを付与）。  
   - 通達番号はアルファベット＋数字を含む正式表記を用い、ファイル名では ASCII のみ（例: `ĐHQGHN-QĐ-4455` → `DHQGHN-QD-4455`）。  
   - 文書ID は通達番号に Annex 番号等を付与した表記（例: `DHVN-HD-892 Annex 1`）。  
   - リネーム後に一覧を再確認する。  
3. **MD 冒頭確認**  
   - 注意書き 2 行と区切り線（vanban.chinhphu.vn の URL）を必須化する。政府機関以外は URL をユーザーに確認する。  
4. **MD 体裁点検**  
   - Markdown 記法・テーブル列数・数値列の `---:` 右揃え・スペルチェックを実施し、修正点は後工程へ共有する。  
5. **英語版 MD 作成**  
   - ベトナム語 `_source.md` を基に翻訳し、対応する文書IDと英語正式題名で `文書ID <英語正式題名>.md` を保存する。  
   - 着手前にタイムアウト対策（作業順・章分割・レビュー確保・途中保存方法）を `~/.codex/conversation-log.md` に記録する。  
   - 公的文書調の英語で統一し、固有名詞は原文表記＋必要なら括弧補足。完成後に全体を再読する。  
6. **日本語版 MD 作成**  
   - ベトナム語 `_source.md` を基に翻訳し、`文書ID <日本語正式題名>.md` で保存する。  
   - 着手前に英語版同様のタイムアウト対策をログへ記録する。  
   - 略語は可能な限り日本語へ置換し、必要時は括弧で解説。行政文書調で統一し、完成後に再読する。  
7. **クロスチェック**  
   - 各言語の章立て・項目順・行数の大きな差異を確認し、理由を説明できるよう整理する。`_source` ファイルは編集禁止。  
8. **ファイル移動**  
   - ベトナム語 MD は `.../Vietnamese/`、英語 MD は `.../English/`、日本語 MD は `.../Japanese/`、その他ファイルは `.../Source/` へ移動する。  
   - 移動後に重複や欠落がないか確認する。  
9. **ログ・報告**  
   - 作業ごとに `~/.codex/conversation-log.md` にタイムスタンプ付きで記録し、タイムアウト対策も同ファイルへ追記する。  
   - 完了報告には対象通達、注意書きの有無、翻訳ポイント、クロスチェック結果、移動先を明記する。

### 4.2 表示チェックとレイアウト調整
- 3. University Regulations の Markdown で `title` に文書ID（通達番号＋付録情報）が含まれる場合、リスト表示時は `_includes/doc-label.html` を経由して ID 重複が無いことを確認する。番号体系や命名を変更した際はトップページ・各言語 index を再描画し、文書ID が二重表示になっていないか確認する。
- `_includes/doc-label.html` を Markdown から呼び出す際は `{% raw %}{%- ... -%}{% endraw %}` でホワイトスペースを抑制し、リンクの `[]()` の間に改行が入らないようにする。修正後はブラウザ／ビルド出力で見た目を確認する。
- Liquid の `{% raw %}{% capture %}{% endraw %}` で整形すると内部に改行が残りやすいため、ラベル組み立ては `append` 等で文字列を生成する。番号付きタイトル処理後はページが再ビルドされているか確認する。
- 言語切替 UI や共通レイアウトを調整した際は `_data` の言語リストと `doc-language-switcher.html`・`_layouts/page.html` をセットで確認し、必要な差分を忘れずにコミットする。
- 表示トラブルは GitHub Actions の結果と `_site` で生成される HTML を比較し、`lang` メタデータ不足などデータ起因かビルド遅延かを切り分ける。`python3 scripts/build-index.py` → `python3 -m http.server` や `curl` を活用する。
- トップページと言語別 index の言語切替は `_data` のリストと `details.collection-toggle` の構成に依存するため、スタイル変更時は両方の出力を見直して表示を確認する。
- **ファイル数による表示形式の選択**: 各言語ディレクトリのMarkdownファイル数（`index.md`除く）が10を超える場合は `<details><summary>...</summary>` の折りたたみ形式を使用し、デフォルトで折りたたんだ状態（`open` 属性なし）とする。10以下の場合は通常のリスト表示を使用する。ファイル数の変更時は表示形式を適切に切り替える。

### 4.3 言語別ディレクトリと ID 管理
- `Vietnamese/`：ベトナム語原文の Markdown。ファイル名は `文書ID <ベトナム語題名>.md`。
- `English/`：英語訳の Markdown。ファイル名は `文書ID <英語題名>.md`。
- `Japanese/`：日本語訳の Markdown。ファイル名は `文書ID <日本語題名>.md`。
- `Source/`：Markdown 以外の原本（PDF・DOCX など）。ファイル名は `文書ID <英語題名>.pdf`（必要に応じて `_source` サフィックス付与）。
- 通達番号は `<発行機関ベトナム語略称>-<通達の種類略称>-<番号>` で表記する（例: `DHVN-HD-892`）。
- 文書ID は通達番号に Annex 番号など付随情報を含めた表記を指す（例: `DHVN-HD-892 Annex 1`）。

### 4.4 GAS ワークフロー備考
- `organizeMarkdownDocuments` は English/Japanese/Vietnamese/Source/Unprocessed を動的に検出するため、フォルダ構成を変更した場合でも名称を合わせれば自動追従する。
- PDF 取り込み時は `_source_<LANG>` 命名で各言語の Markdown を生成し、時間切れ時は pending JSON に処理キューを保存して再開時に優先処理する。Unprocessed が空になった際は GitHub Pages workflow（deploy-pages.yml）を API でトリガーする設計を維持する。
- `sanitizeTitle` は Unicode を保持しつつ禁止文字のみ除去する。ベース言語ごとの `_source_<LANG>` を `_source.md` に統合し、DHVN-DT-840 系列などの付録でも正式タイトルと ID を保つ。
- 3. University Regulations フォルダを操作するときは必ず `/Users/home/GitHub/VJU-Project` 配下で作業し、Git 管理外の別リポジトリへ変更を反映しない。

---

## 5. LaTeX / Notes 運用

### 5.1 プロジェクト構成
- スライド: ルート直下の `Game Theory xx-*.tex`（Beamer）。
- 図版: `Fig/` 配下に配置し、講義コード接頭辞で命名（例: `Fig/01-02-utility_shapes.pdf`）。
- アセット（画像・QR など）は `Fig/` に統一し、可能な限りベクタ（PDF）を使用する。
- 生成物（PDF・補助ファイル）はコミットしない。
- 新規講義は最新テンプレートを複製し、`\LectureCode` とファイル名を整合させる。
- BCSE 向け講義資料では学生が非ネイティブ英語話者である前提で、簡潔で平易な英語表現を選択する。
- BCSE の講義スライドを編集する際は、一流のゲーム理論家として魅力的な事例を多数紹介する人気の大学院教員を意識して内容を整える。
- `.tex` ファイルを編集した場合は、報告前に `latexmk` 等でビルドを試み、結果を確認してから報告する。
- Beamer スライド編集時は必要に応じて `\framesubtitle{...}` を活用し、スライドの補助タイトルを整える。`\begin{frame}[...]` にタイトルが指定されている場合は `\frametitle{...}` を重複設定しない。

### 5.2 ビルド・テスト・開発コマンド
- 1回ビルド: `latexmk -lualatex "Game Theory 01-02.tex"`
- 監視ビルド: `latexmk -pvc -lualatex "Game Theory 01-02.tex"`
- 補助ファイル削除: `latexmk -C "Game Theory 01-02.tex"`
- XeLaTeX 利用可（`-lualatex` を `-xelatex` に置換）。
- テーブル列数不一致検出（縦線基準）。
- 大きすぎる空白ページ検出（ヒストグラム）。

### 5.3 コーディング規約・命名
- インデントは2スペース、タブ禁止。1行は 100 桁以下を推奨する。
- Beamer の共通テーマ（色・フッター等）は変更しない。
- 図版命名は `Fig/<LectureCode>-<slug>.pdf` とする。
- TikZ は簡潔なスタイル（例: `nodes={font=\normalfont\normalsize}`）を用い、`remember picture,overlay` は必要時のみ許可する。
- TikZ のゲーム木は `font=\footnotesize` を全体指定し、`level X/.style` で `sibling distance` を調整してラベル重なりを防ぐ。枝ラベルはプレーンテキストで記述し、`pos` と `anchor` を使ってノードとの間隔を取る。
- `.tex` ファイルに変更を加えた場合は、ユーザー報告前に必ず該当ファイルをコンパイルして結果を確認する。

### 5.4 テスト方針
- PR 前にコンパイルし、エラーや顕著な overfull を確認する。
- 視覚確認ではフォント・配色（VJUColor）・フッター番号を点検する。
- PDF サイズに配慮し、図は可能な限りベクタ化する。

### 5.5 LaTeX 表（tabular）の検証
- `\\` はエラーを起こしやすいので、必要に応じて `\tabularnewline` や `\linebreak` を使う。
- 編集後は各 `tabular` ブロックの列数指定（例: `{ll|c|c|}`）と `&` の個数が一致しているか必ず確認する。
- すべての行が `\\`（または `\\[...ex]`）で終わっているか機械的にチェックする。repr(...) 表示では 1 本の `\` も `\\` と見えるため、末尾が単独の `\` になっていないか正規表現や文字コードで検証する。
- 自動修正を掛けた場合は、修正後に diff を取って意図しない `\` の増減がないかを確認する。
- 表ヘッダでは列指定の縦線を `\multicolumn` などで打ち消し、`~~|-|-|-|` 形式の `\hhline` でデータ部分だけ罫線を引く。
- 利得表は「Teamwork Game」のように各セルを `\cline` で囲う罫線スタイルに統一し、余計な `\hline` を避ける。
- テーブル前後は文を別段落に分けてから `\begin{tabular}` へ入る。文と表を同じ段落に置かない。
- 見出し行で不要な縦線が残る場合は `\multicolumn{1}{c}{...}` などで列フォーマットを上書きし、列指定の `|` の影響を打ち消す。
- 最後に LuaLaTeX を走らせ、Extra alignment tab、Bad math environment delimiter 等のエラーが出ていないことを確認する。

### 5.6 PR 運用
- コミットメッセージは命令形で短く具体的にする（例: "Add TikZ figure for 01-02"）。
- PR には概要・影響ファイル・スクリーンショット／差分 PDF・ビルド注意点を含める。
- 関連 Issue をリンクし、無関係な大規模リファクタは分割する。

### 5.7 エージェント向け補足
- 目的: LaTeX Beamer 講義スライドのスタイル保守・拡張。
- 新規タスクは既存スタイル（色・フッター等）の踏襲を優先する。
- 図は TikZ を優先し、外部画像は `Fig/<LectureCode>-<slug>.pdf` を使用する。
- 編集後は `make 01-02` でビルドし、視覚差分を PR に添付する。
- 解決に時間を要した問題があれば、対処法や再発防止メモを本ファイルに追記して共有する。

### 5.8 Beamer スライド追加注意（2025-11-02 メモ）
- Alert 環境（`alertbox` 等）は multi-column（`columns` や `minipage`）内で使わない。単一カラムまたは full-width レイアウトで配置する。
- 2 段組（`columns` など）の利用は本当に必要な場合に限定し、可能であれば上下分割や通常フレーム構成で代替する。

### 5.9 Notes（article）作成指示
- スコープとトーン: 「Game Theory XX-YY の講義ノートを article 形式で作成してください。01～ のノートと同じ深さ・語り口で、導入の事例、記法のおさらい、主要概念、ストーリー仕立ての例、練習問題、参考文献、適切な画像を含めてください。」
- 対応言語: 「日本語版（… Notes JP.tex）を作成してください。」
- 技術仕様: 「article クラス、余白1インチ、使用パッケージ（ams 系、mathtools、enumitem、booktabs、multirow、microtype、hyperref）。日本語版では xeCJK / fontspec を用い、CJKフォントを指定してください。」
- 出力期待: 「latexmk -xelatex でコンパイルし、警告と overfull box があれば報告してください。」
- 参照指示: 「既存の01～ ノートを構成の雛形として踏襲してください。」
- 画像挿入: 「適切と思われる箇所にキャプション付きの空の図版（図番号・説明付き）を挿入し、後から差し替えられるよう `figure` 環境と `\includegraphics` の空パスを用意してください。」
- 生成AI指示: 「各図には生成AIに渡すプロンプト案を300文字以上の日本語で記述し、線画スタイル（単色、陰影はハッチング程度）で描かせる旨を明記してください。プロンプトには図の目的、登場する主体や関係、必要な注釈や矢印の有無、視点・構図、線の太さ・質感、背景の有無、配色制約（白地に単色線）などを盛り込み、読者に伝えたいメッセージと図の利用場面を説明します。複数要素がある場合は箇条書きで整理し、生成後に手作業で注釈を追加する旨があれば併記します。」
- 作画スタイル: 「全図版は統一感を保つため線画とし、陰影や色は最小限に留めてください。」
- TikZ利用: 「ゲーム木・戦略遷移図など標準形の図解は TikZ で実装し、線画スタイルで整えてください。」

### 5.10 TikZ / forest ゲーム木レイアウト参考（2025-11-12 調査）
- TikZ の `grow` オプションは方向名（`up` `down` `left` `right` や `north east` など）に加えて角度指定（例: `grow=300`）も受け付け、任意の向きに木を展開できる。枝ラベルを載せる位置は `edge from parent node[...]` で調整し、ノード衝突は `sibling distance` で回避する（参考: Learn How to Draw Trees in TikZ, latexdraw.com, 2021-04-17）。
- 横向きのゲーム木では `[grow=right, sibling distance=6em, level distance=10em, edge from parent/.style={draw,-latex}, every node/.style={font=\footnotesize}, sloped]` のように `grow` と距離パラメータをまとめて指定すると、層ごとの縦・横間隔を明示しながら枝ラベルを斜体表示にできる（参考: LaTeX Cookbook, “9.3 Growing a tree”）。
- レベルごとの距離を細かく変えたい場合は `level 1/.style={level distance=25mm, sibling distance=30mm}`・`level 2/.style=...` のように階層別スタイルを与え、`grow=right` と組み合わせて枝角度を安定させる。ゲーム理論スライドではこのスタイル定義をテンプレに含め、別の木でも再利用できるよう `tikzset` にまとめる（参考: 同上）。
- forest パッケージでは `for tree={l sep=2em, s sep=4em, nice empty nodes, math content}` のように `l sep`（縦方向）と `s sep`（水平方向）を同時に設定し、`auto edge label` や `edge label stroke` を `edge label+={node[...]}` 形式で足し込むと、枝ラベルとバックワードインダクション線（`edge label stroke` で `/` や `\` を赤字表示）を左右位置に応じて切り替えられる（参考: tex.stackexchange.com/q/661999, Sašo Živanović, 2022-10-18）。

---

## 6. その他テンプレート・環境設定

### 6.1 セキュリティと設定管理
- 機密情報や `.env` はコミット禁止。URL 等はマクロ経由で扱う。
- Codex 設定ファイルは TOML ではなく YAML を使用する。`~/.codex/config.yaml` を正とし、`config.toml` は作成・参照しない。既存の TOML 設定がある場合は同名キーで YAML に移行する。

### 6.2 Word テンプレート（国際連携.dotx）
- Normal／Heading1～3／ListParagraph／Quote 系スタイルの `w:rFonts` は英数字 Arial、日本語 MS Gothic を直接指定済み（テーマ依存属性は削除）。
- テーマフォント（theme1.xml）の major/minor について、latin を Arial、eastAsia/Jpan を MS Gothic に統一する。
- Quote／IntenseQuote のイタリック指定（`w:i`／`w:iCs`）は除去し、日本語でもゴシック体を使用する。
- テンプレート本文には Heading 1～3、本文段落、箇条書き（numId 32）、番号付きリスト（numId 5）のサンプルを配置し、設定意図を視認できるようにする。
- 同設定で `Template.dotx` を新規作成し、見出し1～3／本文／箇条書き・番号付きリストのサンプル段落を収録してフォントチェックが行えるようにする。
- docDefaults と stylesWithEffects も含め `w:rFonts` に Arial／MS Gothic を直指定し、`w:lang` の `eastAsia` を `ja-JP` へ設定して Word 上でのフォント反映を安定化させる。
- Word テンプレートの編集は `python-docx` で `styles`／`docDefaults` を操作し、zip 展開後に手書きで XML を修正しない（Word が「unreadable content」エラーになるため）。
- 図キャプション等の Paragraph スタイルも `python-docx` 経由で整形し、`style.paragraph_format.alignment` や `style.font.color` を用いて中央揃え・黒文字を指定する。
- 実務フロー  
  1. `Template_stage1.docx`: Normal／docDefaults を `python-docx` で構成し、フォント・言語指定が破損なく反映されることを確認する。  
  2. `Template_stage2.docx`: Heading1～3、List Bullet／Number、Quote／Intense Quote を追加し、サンプル段落を配置する。  
  3. `Template_stage3.docx`: Caption スタイルを黒・中央揃えに調整し、サンプル文を番号なしに変更する。  
  4. `JICA専門家会議議事メモ*.docx`: python-docx でタイトル、記録者欄、日時／場所テーブル、出席者表を生成し、Arial／MS Gothic と中央揃えで整形する。

### 6.3 CLI 操作時の留意点
- ユーザーが GitHub への push を希望する際は、環境が Agent (full access) であるか確認し、未切り替えなら「Agent (full access) に切り替えてください」と案内する。切り替え後は push を実行可能。

### 6.4 療養費申請ワークフロー
- 管理対象は `Family/JICA費用申請/療養費/` 配下の領収書ファイル（PDF/PNG）。領収書ではないファイルは対象外とする。
- 領収書点検時はファイル名と実際の発行内容（年月日・経路・金額）を突合し、必要に応じて実態に合わせてリネームする。Grab などの区別が必要な場合は末尾にサフィックスを追加して明示する。
- ページ数は `pdfinfo "<filename>" | awk '/Pages/ {print $2}'` で確認し、2ページ以上かつ 2 in 1 レイアウトになっていない場合のみ変換対象とする。視覚確認で既に 2 in 1 であれば処理不要と記録する。
- 2 in 1 変換は `pdfjam --landscape --nup 2x1 "<input.pdf>" --outfile "<basename> 2in1.pdf"` を基本とし、出来上がりを確認後に元ファイルと差し替える（元データは `backup/` 等へ退避）。余白や向きを調整する場合は `--paper a4paper --noautoscale false` 等を併用する。
- リネーム例  
  - `20250915 自宅→病院 45,000 VND.pdf` → `20250915 自宅→病院 45,000 Grab.pdf`  
  - `20250919 病院→自宅 46,000 VND.pdf` → `20250918 病院→自宅 46,000 VND.pdf`
- スプレッドシート更新が必要でネットワーク制限がある場合は、追記内容を `新規交通費エントリ.csv` などの UTF-8（BOM付き）CSV として用意し、各列は Excel で数値扱いになる形式（日付は `YYYY-MM-DD`、金額は千区切り無しの整数）で入力する。処理後は `~/.codex/conversation-log.md` に作業経緯を残す。

### 6.5 作業ログ（参考）
- 2025-09-28 Codex: `~/.env` に `GEMINI_API_KEY` を保存し、`~/.zshrc` から読み込むよう更新。`nano-banana` を含む Gemini API 呼び出しがローカル環境で利用可能なことを確認し、`.gitignore`（リポジトリおよびホーム）に `.env` を追加して秘匿情報を保護。
- 2025-09-22 Codex: `Game Theory 02-02.tex` の利得表を 01-01 テンプレートと同じ `ll|c|...|` 形式へ戻し、各行の末尾を `\tabularnewline` へ統一。LuaLaTeX で再コンパイルして警告を確認。
- 2025-09-22 Codex: `Game Theory 02-03.tex` を 01-03 ベースの演習スライドとして再構築し、`Game Theory 02-03.md` の内容を取り込んだ。QR スライドは 01-03 の 2 カラムレイアウトに合わせ、`\ExerciseQRURL` を使用して Google Slides へのリンクと QR コードを配置。
- 2025-09-20 Codex: `Game Theory 02-01.tex` の「Strongly Dominated Strategies」フレームで `\end{definition}` 直後に `\\[0.5em]` を挿入していたため、LuaLaTeX が display 数式の区切りと誤認し `Bad math environment delimiter` が発生。`\vspace{0.5em}` へ置換し、同フレームおよび次フレームの不等式を `equation*` + `aligned` で再構成して解消。
- 2025-09-29 Codex: 「内容をチェック」依頼時の対応手順（論点把握→A4原稿作成→改善→原文照合→必要ならコンパイル→報告）を明文化。

### 6.6 議事録テンプレート運用
1. ユーザー指定の議事録は `~/Desktop/議事録.md` を単一ソースとして更新し、逐語メモや追加入力をここへ集約する。別地点へ複製する前にこのファイルを最新化する。  
2. 日本語議事録では組織名「VJU」を「日越大学」と表記し、出席者・議題とも同表記で統一する。  
3. 定例会ルールにより「目的」「背景」など重複セクションは削除し、議題順・決定事項・アクションアイテム（No.付き）に即した構成へ整理する。  
4. 音声起こしや箇条書きベースの原稿を取り込む際は、各議題に補足情報・担当者・期限を追記して詳細化し、番号付きアクションアイテムを更新する。

---

## 7. 用語集

### 7.1 人名

#### 7.1.1 理事会メンバー（2025-05-28 第二期第6回理事会・資料9）
- UCHIDA Katsuichi（内田 勝一）: 早稲田大学参与・名誉教授
- AIZAWA Masuo（相澤 益男）: 公益社団法人科学技術国際交流センター 会長
- FURUTA Motoo（古田 元夫）: 日越大学 学長
- ITO Naoki（伊藤 直樹）: 在ベトナム日本国大使館 特命全権大使
- MATSUOKA Tetsuya（松岡 鉄也）: 日本商工会議所 国際部 担当副部長
- MORITA Kiyotaka（森田 清隆）: 一般社団法人日本経済団体連合会 国際協力本部長
- OZASA Haruhiko（小篠 春彦）: 独立行政法人日本貿易振興機構 ハノイ事務所長
- TAKEBE Tsutomu（武部 勤）: 日越友好議員連盟 特別顧問
- TAKEUCHI Kazuhiko（武内 和彦）: 公益財団法人地球環境戦略研究機関 理事長／東京大学未来ビジョン研究センター 特任教授

#### 7.1.2 過去資料に掲載された日本側メンバー（役職は当時の表記）
- SASAKI Kazuto（佐々木 和人）: 日本商工会議所 国際部担当部長
- TAKEHARA Reiji（竹原 玲児）: 一般社団法人日本経済団体連合会 国際協力本部長
- YAMADA Takio（山田 滝雄）: 在ベトナム日本国大使館 特命全権大使

#### 7.1.3 専門家会議主要メンバー（2025-09-19 メモ参照）
- 古田 元夫 / Motoo Furuta
- 乾 英二 / Eiji Inui
- 林田 隆之 / Takayuki Hayashida
- 山川 史 / Fumi Yamakawa
- 斎藤 真美 / Mami Saito
- 松井 孝浩 / Takahiro Matsui
- 桃木 至朗 / Shiro Momoki
- 藤野 真人 / Masato Fujino
- 栗原 浩英 / Hirohide Kurihara
- 本多 敏 / Satoshi Honda
- 諸橋 美千代 / Michiyo Morohashi
- 猪股 美佳 / Mika Inomata
- 根岸 正実 / Masami Negishi
- 日野 喜文 / Yoshifumi Hino

#### 7.1.4 関係者
- 田村 尚也 / Naoya Tamura
- 菅野 祐一 / Yuichi Kanno
- 久保 良友 / Yoshitomo Kubo
- 木ノ下 忠宏 / Tadahiro Kinoshita
- 熊谷 真人 / Masato Kumagai
- 辻本 温史 / Atsushi Tsujimoto
- 田出 克久 / Katsuhisa Tade（推定）
- 福士 謙介 / Kensuke Fukushi
- 石原 伸一 / Shinichi Ishihara
- 小菅 丈治 / Takeharu Kosuge
- 松葉 美渚 / Minami Matsuba
- 辻 修子 / Shuko Tsuji
- 栗飯原 志宣 / Shinobu Aibara
- 大塚 武司 / Takeshi Otsuka
- 雄谷 進 / Susumu Otani
- 山口 昌志 / Masashi Yamaguchi
- 伊藤 まり子 / Mariko Ito
- 武田 晋一 / Shinichi Takeda
- 柳 定賢 / Sadayoshi Yanagi（推定）
- 安永 円理子 / Eriko Yasunaga
- 仲 重人 / Shigeto Naka
- 白井 光雲 / Ko-un Shirai
- 川口 裕子 / Yuko Kawaguchi
- 小池 基 / Motoi Koike

### 7.2 用語（VJU 関連略語）
| 略語 | 英語正式名称 | 日本語表記 | ベトナム語表記 | 備考 |
| --- | --- | --- | --- | --- |
| AACSB | Association to Advance Collegiate Schools of Business | 国際経営教育改善協会 |  |  |
| AAD | Academic Advising | アカデミック・アドバイジング |  |  |
| ABET | Accreditation Board for Engineering and Technology | 米国工学技術認定機構 |  |  |
| Admission Team | VNU – Vietnam-Japan University Admission Team | 入試担当 | Bộ phận Tuyển sinh VJU |  |
| AO | Administrative Office | 総務課 | Văn phòng Trường |  |
| ASAO | Academic and Affairs Office | 学務・学生課 | Phòng Đào tạo và Công tác sinh viên |  |
| ASEAN | Association of Southeast Asian Nations | 東南アジア諸国連合 |  |  |
| AUN | ASEAN University Network | （日本語表記未確認） | Mạng lưới các trường đại học Đông Nam Á |  |
| BC | British Council | ブリティッシュ・カウンシル |  |  |
| BCSE | Bachelor's program of Computer Science and Engineering | 学部コンピュータサイエンス＆エンジニアリング プログラム | Cử nhân Khoa học máy tính |  |
| BGDĐT | Ministry of Education and Training | 教育訓練省 | Bộ Giáo dục và Đào tạo |  |
| BGDI | Bachelor's program of Global Development and Innovation | 学部グローバル開発とイノベーション プログラム |  |  |
| BGH | Rectorate Board | 学長室 | Ban Giám hiệu |  |
| BICA | Bachelor's program of Intelligent Control and Automation | 学部インテリジェント制御とオートメーション プログラム | Cử nhân Kỹ thuật điều khiển và Tự động hóa thông minh |  |
| BJS | Bachelor's program of Japanese Studies | 学部日本学 プログラム | Cử nhân Nhật Bản học |  |
| CĐR | Chuẩn đầu ra | 学習成果基準 | Chuẩn đầu ra |  |
| CTĐT | Chương trình đào tạo | 教育課程 | Chương trình đào tạo |  |
| CVHT | Cố vấn học tập | 学習指導教員・アカデミックアドバイザー | Cố vấn học tập | カウンターパートは大阪大学 |
| ĐA | Đồ Án | 卒業プロジェクト | Đồ Án | カウンターパートは東京大学 |
| ĐGN | Đánh giá ngoài | 外部評価 | Đánh giá ngoài |  |
| ĐHNN | VNU University of Languages and International Studies | 外国語大学 | Trường Đại học Ngoại ngữ, Đại học Quốc gia Hà Nội |  |
| ĐHQGHN | Vietnam National University, Hanoi | ベトナム国家大学（ハノイ校） | Đại học Quốc gia Hà Nội |  |
| ĐHVN | VNU – Vietnam-Japan University | 日越大学 | Trường Đại học Việt Nhật |  |
| DJS | Doctor's program of Japanese Studies | 日本学・日本語教育 | Tiến sĩ Nhật Bản học |  |
| DST | Doctor's program of Sustainability Science and Technology | サステイナビリティ学とテクノロジー | Tiến sĩ Khoa học bền vững |   |
| ĐT&CTSV | Đào tạo & Công tác sinh viên | 学務・学生課 | Phòng Đào tạo và Công tác sinh viên |  |
| ECE | Engineer's program of Civil Engineering | 学部シビルエンジニアリング プログラム | Kỹ sư Kỹ thuật xây dựng | JICA Project |
| EFTH | Engineer's program of Food Technology and Health | 学部食品工学と健康 プログラム |  |  |
| EMJM | Engineer's program of Intelligent Mechatronics System & Japanese Manufacturing | 学部メカトロニクスと日本型ものづくり プログラム | Kỹ sư Cơ điện tử thông minh và Sản xuất theo phương thức Nhật Bản |  |
| ESAS | Engineer's program of Smart Agriculture and Sustainability | 学部スマート農業とサステイナビリティ プログラム | Kỹ sư Nông nghiệp thông minh và Bền vững |  |
| ESCT | Engineer's program of Semiconductor Chip Technology | 学部半導体チップ技術 プログラム |  | カウンターパートは早稲田大学 |
| ETS | Educational Testing Service | 米国教育試験サービス |  | カウンターパートは横浜国立大学 |
| FATE | Faculty of Advanced Technologies & Engineering | 先端工学・技術 学部・研究科 | Khoa Công nghệ và Kỹ thuật tiên tiến | カウンターパートは茨城大学 |
| FISS | Faculty of Interdisciplinary Social Sciences | 学際社会科学 学部・研究科 | Khoa Khoa học Xã hội và Nhân văn liên ngành | カウンターパートは東京大学 |
| FTU | Foreign Trade University | 外国貿易大学（ハノイ貿易大学） |  |  |
| GCN | Giấy chứng nhận | 証明書 | Giấy chứng nhận | カウンターパートは立命館大学および東京大学 |
| GDĐT | Bộ Giáo dục và Đào tạo | 教育訓練省 | Bộ Giáo dục và Đào tạo | カウンターパートは早稲田大学 |
| GS/PGS | Professor / Associate Professor | 教授／準教授 | Giáo sư/Phó Giáo sư | カウンターパートは大阪大学 |
| GV | Lecturer | 講師 | Giảng viên | カウンターパートは筑波大学 |
| GVHD | Supervising Lecturer | 指導教員 | Giảng viên hướng dẫn |  |
| HANU | Hanoi University | ハノイ大学（旧ハノイ外国語大学） |  |  |
| HL | Hoa Lac Campus | ホアラックキャンパス |  |  |
| HR | HR Office | 人事課 | Bộ phận Nhân sự, Văn phòng Trường |  |
| HSK | Hanyu Shuiping Kaoshi | 漢語水平考試 |  |  |
| HUS | VNU University of Science | 自然科学大学 | Trường Đại học Khoa học Tự nhiên, Đại học Quốc gia Hà Nội |  |
| HUST | Hanoi University of Science and Technology | ハノイ工科大学 |  |  |
| IDP | International Development Program | インターナショナル・ディベロップメント・プログラム |  |  |
| IS | International School | インターナショナルスクール |  |  |
| JICA | Japan International Cooperation Agency | 国際協力機構 | Cơ quan Hợp tác Quốc tế Nhật Bản |  |
| JLE | Japanese Language Education | 日本語教育プログラム |  |  |
| JLEC | Japanese Language Education Center | 日越大学附属日本語教育センター | Trung tâm Ngôn ngữ và Văn hóa Nhật Bản |  |
| JLPT | Japanese Language Proficiency Test | 日本語能力試験 |  | HUST が参加 |
| KĐCLGD | Kiểm định chất lượng giáo dục | 教育質保証認証 | Kiểm định chất lượng giáo dục |  |
| KL | Khóa Luận | 卒業論文 | Khóa Luận |  |
| KS | Kỹ sư | 技師 | Kỹ sư |  |
| KT | Ký thay | 署名代理 |  |  |
| KT&ĐBCL | Khảo thí và Đảm bảo chất lượng | 教育試験・質保証課 | Phòng Khảo thí và Đảm bảo chất lượng giáo dục |  |
| KT | Ký thay | 署名代理（代わりに署名） | Ký thay |  |
| LMS | Hệ thống quản lý học tập | 学習管理システム | Hệ thống quản lý học tập |  |
| M1 | Khối kiến thức chung | 共通基礎科目群 |  |  |
| MAS | Master's program of Area Studies (Japanese Studies / Vietnamese Studies) | 修士課程地域研究プログラム | Thạc sĩ Khu vực học |  |
| MBA | Master's program of Business Administration | 修士課程企業管理プログラム | Thạc sĩ Quản trị kinh doanh |  |
| MCCD | Master's program of Climate Change and Development | 修士課程気候変動・開発プログラム | Thạc sĩ Biến đổi khí hậu và Phát triển |  |
| MCE | Master's program of Civil Engineering | 修士課程社会基盤プログラム | Thạc sĩ Kỹ thuật xây dựng |  |
| MCSE | Master's program of Computer Science and Engineering | 修士課程コンピュータサイエンス＆エンジニアリングプログラム | Thạc sĩ Khoa học máy tính |  |
| MD | My Dinh Campus | ミーディンキャンパス |  |  |
| MEE | Master's program of Environmental Engineering | 修士課程環境工学プログラム | Thạc sĩ Kỹ thuật Môi trường |  |
| MGL | Master's program of Global Leadership | 修士課程グローバル・リーダーシッププログラム | Thạc sĩ Lãnh đạo toàn cầu |  |
| MNT | Master's program of Nanotechnology | 修士課程ナノテクノロジープログラム | Thạc sĩ Công nghệ Nano |  |
| MOET | Ministry of Education and Training | 教育訓練省 | Bộ Giáo dục và Đào tạo |  |
| MPP | Master's program of Public Policy | 修士課程公共政策プログラム | Thạc sĩ Chính sách công |  |
| NB | Nội bộ | 内部（internal use） | Nội bộ |  |
| NBN | Japan | 日本 | Nhật Bản |  |
| NCATE | National Council for Accreditation of Teacher Education | 米国教員教育認定評議会 |  |  |
| NCS | Nghiên cứu sinh | 博士課程研究生 | Nghiên cứu sinh |  |
| NĐ-CP | Nghị định của Chính phủ | 政府政令／政府令 | Nghị định của Chính phủ |  |
| NEASC | New England Association of Schools and Colleges | ニューイングランド学校大学協会 |  |  |
| ODA | Official Development Assistance | 政府開発援助 |  |  |
| PĐT&CTSV | Phòng Đào tạo & Công tác sinh viên | 学務・学生課 | Phòng Đào tạo và Công tác sinh viên |  |
| PF | Planning and Finance Office | 企画・財務課 | Phòng Kế hoạch - Tài chính |  |
| QA | Educational Testing and 2. Quality Assurance Office | 教育試験・質保証課 | Phòng Khảo thí và Đảm bảo chất lượng giáo dục |  |
| QĐ-TTg | Quyết định của Thủ tướng Chính phủ | 首相決定／首相令 | Quyết định của Thủ tướng Chính phủ |  |
| R&DP | R&D Promotion and Cooperation Development Office | 研究開発推進・協力開発課 | Phòng Xúc tiến nghiên cứu, Hợp tác và phát triển |  |
| RB | Rectorate Board | 学長室 | Ban Giám hiệu |  |
| Rector Office | Rector Office | 学長室（事務） | Văn phòng Hiệu trưởng |  |
| SATREPS | Science and Technology Research Partnership for Sustainable Development | 地球規模課題対応国際科学技術協力プログラム |  |  |
| SEED-Net | ASEAN University Network / Southeast Asia Engineering Education Development Network | （日本語表記未確認） |  |  |
| TĐG | Tự đánh giá | 自己評価 | Tự đánh giá |  |
| TT | Thứ tự | 通し番号 | Thứ tự |  |
| UEB | VNU University of Economics and Business | 経済大学 | Trường Đại học Kinh tế, Đại học Quốc gia Hà Nội |  |
| UET | University of Engineering and Technology | 工科大学 | Trường Đại học Công nghệ, Đại học Quốc gia Hà Nội |  |
| ULIS | VNU University of Languages and International Studies | 外国語大学 | Trường Đại học Ngoại ngữ, Đại học Quốc gia Hà Nội |  |
| USSH | VNU University of Social Sciences and Humanities | 人文社会大学 | Trường Đại học Khoa học Xã hội và Nhân văn, Đại học Quốc gia Hà Nội |  |
| VJU | VNU – Vietnam-Japan University | 日越大学 | Trường Đại học Việt Nhật |  |
| VNU | Vietnam National University, Hanoi | ベトナム国家大学ハノイ校 | Đại học Quốc gia Hà Nội |  |
| VNU-TESTS | Foreign language proficiency assessment test oriented toward professional communication at Vietnam National University, Hanoi | ベトナム国家大学ハノイ校専門コミュニケーション向け外国語能力評価試験 |  |  |

### 署名欄サンプル（決定書・通達用）

PDF から Markdown を生成するとき、配布先と署名欄が HTML レイアウトで提供されている場合は、次のスニペットを必要に応じて利用する。

```html
<div style="display: flex; justify-content: space-between;">
  <div>
    <p>
      <strong><em>配布先:</em></strong><br>
      - 第3条記載先（実施用）；<br>
      - 学長室、大学評議会（報告用）；<br>
      - 保存: 事務局、試験・質保証課、H06
    </p>
  </div>
  <div style="text-align: center;">
    <p>
      <strong>学長 代<br>
      副学長</strong>
    </p>
    <p>
      <em>（署名・押印）</em>
    </p>
    <br>
    <br>
    <p>
      <strong>Nguyễn Hoàng Oanh</strong>
    </p>
  </div>
</div>
```

### PDF→Markdown 変換時のレイアウト方針

- PDF から Markdown を作成する際、GitHub Flavored Markdown 上で再現が必要なレイアウト要素（左右配置、署名欄、枠線など）がある場合は、適切な範囲で HTML タグとインライン CSS を使用して再現してよい。  
- 表示崩れを避けるため、`display:flex`、`text-align:center` 等の基本的なプロパティに留め、必要最小限のスタイルで構造を表現する。  
- 既存の Markdown 記法で表現できる場合は Markdown を優先し、HTML の併用はレイアウト再現に不可欠なケースに限定する。

### Beamer スライド運用メモ（2025-11-02）

- Alert 環境（`alertbox` 等）を multi-column（`columns` や `minipage`）内で使わない。単一カラムまたは full-width レイアウトで配置する。
- 2 段組（`columns` など）の利用は本当に必要な場合に限定し、可能であれば上下分割や通常フレーム構成で代替する。

### Apps Script カスタムメニュー・保守方針（2025-11-03）

- カスタムメニューを追加する際は、各メニュー項目に絵文字を付加して視認性を高める。
- スクリプトは定期的に精査し、重複関数や整理可能なロジックがないか確認し、改善提案を行う。

### GAS メール送信スパム対策（2025-11-06）

1. 通知メールは原則として投稿許可済みの Google グループ経由で送信し、投稿者の Gmail から直接大量送信しない。システム要件などで個別送信が必要な場合は、理由と宛先ポリシーを記録し、関係者と共有したうえで例外運用してよい。宛先アドレスはグループ側に `it-support@vju.ac.vn` をメンバーとして登録しておく。
2. 送信 API は `MailApp.sendEmail` を使用し、既定では `name: "VJU Administrative Office"`、`replyTo: "it-support@vju.ac.vn"` を指定することを推奨する。スクリプト固有の差出人表示や Reply-To が求められる場合は、利用者通知とログ記録を行ったうえでカスタマイズを許容する。
3. HTML 本文には英語表記の署名を追記する。内容は「VNU – Vietnam-Japan University, Administrative Office」「Website: https://www.vju.vnu.edu.vn」「Email: it-support@vju.ac.vn」「Address: Luu Huu Phuoc Street, Tu Liem Ward, Hanoi / Zone QGHN-04, VNU Town, Hoa Lac Commune, Hanoi」とし、電話番号は記載しない。
4. プレーンテキスト本文にも上記署名情報を追記し、送信元表示と返信先を統一する（電話番号は記載しない）。
5. 複数通の通知を連続送信する場合は `Utilities.sleep(5000 + Math.random() * 2000)` 等で 5～7 秒程度の待機を挟み、bot 的な連投判定を避ける。
6. DNS の SPF（`v=spf1 include:_spf.google.com ~all`）、DKIM（Google Workspace 管理コンソールで有効化）、DMARC（例: `v=DMARC1; p=none; rua=mailto:admin@vju.ac.vn`）を確認し、テスト送信後に Gmail の「メッセージのソースを表示」で `spf=pass`、`dkim=pass`、`dmarc=pass` を必ず確認する。

### Google Drive VJU Document Process – スプレッドシート書き込み挙動メモ（2025-11-03）

1. `HistoryLogger.log()` は毎回 `ConfigService.getActiveSpreadsheet()` → `getSheetByName('History')` で最新シートを取得し、`sheet.getRange()`／`appendRow()` を直接呼び出す。DocumentLock は使用していないため、同一行をユーザーが同時編集するとスクリプトの `setValues()` がユーザー編集を上書きする。
2. スプレッドシート書き込み直前に再読込や差分検証は実施せず、`sheet.getLastRow()` など呼び出し時点の状態のみを参照する設計。競合を防ぐにはトリガー実行中の手動編集を避けるか、今後 `LockService`／チェックサム導入を検討する。
3. `SpreadsheetApp.flush()` はメニュー生成時（`onOpen`）のみに使用されており、History 等の書き込み直後には呼ばれていない。Google Sheets の遅延反映は通常自動で処理されるが、即時反映を保証したい場合は明示的な flush 呼び出しを追加する必要がある。

- サイドバーやモーダルにボタンを追加する場合は、操作中であることが分かるよう必ずスピナーアニメーション（⏳など）と busy 状態を実装する。

### Apps Script サイドバー・ボタンデザインとメッセージ表示（2025-01-XX）

Drive Document Process プロジェクトを参考にした、サイドバーUIのボタンデザインとメッセージ表示の実装方針。

#### ボタンのデザイン
1. **基本スタイル**:
   - `padding: 6px 14px`、`font-size: 0.9em`
   - `border: 1px solid #dadce0`、`background-color: #fff`、`border-radius: 4px`
   - `transition: background-color 0.2s, border-color 0.2s` でトランジション効果を追加

2. **ホバー効果**:
   - `button:hover:not(:disabled)` で `background-color: #f8f9fa` に変更
   - 無効化時はホバー効果を適用しない

3. **無効化状態**:
   - `button:disabled` で `cursor: not-allowed`、`opacity: 0.6` を設定

4. **Busy状態（処理中）**:
   - `button.busy` クラスで `cursor: progress`、`color: #1a73e8`、`padding-right: 30px` を設定
   - `button.busy::after` で右側に3つの点を表示するアニメーション（`busyPulse`）
   - `setButtonBusy(button, true, '処理中テキスト')` でボタンテキストを変更し、busyクラスを追加
   - 処理完了時に `setButtonBusy(button, false)` で元の状態に戻す

#### メッセージ表示
1. **画面内メッセージ表示**:
   - `window.alert()` は使用せず、画面内にメッセージを表示する
   - `.status-message` クラスで基本スタイル（`padding: 8px`、`border-radius: 4px`、`font-size: 12px`）を定義

2. **メッセージタイプ**:
   - `.status-success`: 成功メッセージ（緑: `#e8f5e9`背景、`#2e7d32`文字、`#4caf50`ボーダー）
   - `.status-error`: エラーメッセージ（赤: `#ffebee`背景、`#c62828`文字、`#ef5350`ボーダー）
   - `.status-info`: 情報メッセージ（青: `#e3f2fd`背景、`#1565c0`文字、`#42a5f5`ボーダー）

3. **メッセージ表示関数**:
   - `showStatus(message, type)` 関数でメッセージを表示（`type` は `'success'`、`'error'`、`'info'`）
   - 成功メッセージは3秒後に自動非表示（`setTimeout`）
   - エラーメッセージは手動でクリアするまで表示

4. **操作フロー**:
   - 操作開始時: `showStatus('処理中メッセージ...', 'info')` で進行状況を表示
   - 成功時: `showStatus('操作が成功しました。', 'success')` で成功メッセージを表示
   - エラー時: `showStatus('エラーメッセージ: ' + error.message, 'error')` でエラーメッセージを表示

#### 実装例
```javascript
function handleAddRecipient(button) {
  const email = emailInput.value.trim();
  if (!email) {
    showStatus('Please enter an email address.', 'error');
    return;
  }
  setButtonBusy(button, true, 'Adding…');
  showStatus('Adding recipient...', 'info');
  google.script.run
    .withSuccessHandler((list) => {
      refreshRecipients(list);
      emailInput.value = '';
      setButtonBusy(button, false);
      showStatus('Recipient added successfully.', 'success');
    })
    .withFailureHandler((error) => {
      setButtonBusy(button, false);
      showStatus('Failed to add recipient: ' + (error.message || error), 'error');
    })
    .uiAddRecipient(email);
}
```

#### 参考プロジェクト
- `/Users/home/GitHub/GAS/Drive Document Process` の `ChatSettingsDialog.html`、`LineSettingsDialog.html` を参考に実装。
## Calendar Leave Request – 一般的な改善ガイドライン

Calendar Leave Request プロジェクトで整理した改善指針を、他案件でも参照できるよう下記の通り記録する。

1. **ログ記録の統一化**  
   - `Logger.log` の直接使用を避け、`LogService.info/warn/error` へ統一する。  
   - ログレベルと構造化（JSON）を徹底し、追跡性を確保する。  
   - エラー時は必ず `LogService.error` を経由し、コンテキストを添付する。

2. **エラーハンドリングの一貫性**  
   - 例外処理は `ErrorHandler.handle('Module.function', error, {...})` に集約する。  
   - エラー分類（FATAL / TEMPORARY / VALIDATION / PERMISSION）と `notify` / `rethrow` オプションを明示する。  
   - `catch (error)` へ統一し、`e` / `err` を使用しない。

3. **データストアのバージョン管理**  
   - 重要データは `StateStore.getWithVersion` / `setWithVersion` と ScriptLock を併用する。  
   - バージョン不一致時は競合とみなし、再試行または例外を送出する。

4. **パフォーマンスメトリクスの収集**  
   - API 呼び出し・メール送信など主要処理は `LogService.measurePerformance` で計測し、閾値監視に活用する。  
   - メトリクスは `LogService.recordMetric` を通じて保持し、定期分析を行う。

5. **設定バリデーションの強化**  
   - 設定読み込み直後に検証を行い、クリティカルな欠損（Supervisor 未設定等）は即時例外／通知。  
   - `validateConfiguration` 結果を評価し、`ErrorHandler` で管理者へ共有する。

6. **リトライロジックの統一化**  
   - 再試行対象の判定は `ErrorHandler.isRetryableError` に一本化し、指数バックオフ（1s, 2s, 4s …）を標準実装とする。  
   - 各モジュールが独自実装しないよう、共通ユーティリティを参照する。

7. **バリデーション関数の集約**  
   - Email 形式など繰り返し利用する検証は `Config.validateEmail` など共通関数へ集約し、表記揺れを防ぐ。

8. **コード重複削減**  
   - グルーピングやフォーマット処理は `BatchService.groupBy` 等既存ユーティリティを再利用し、重複を排除する。

9. **エラーログの記録徹底**  
   - エラーを握り潰す場合でも理由をコメント／ログに残す。  
   - 「既知の無視」ケースは `LogService.info/warn` にメッセージとエラー内容を記録する。

10. **入力検証の強化**  
    - WebApp パラメータやユーザー入力は必ずサニタイズ・形式検証する（トークン長・メール形式等）。  
    - 不正入力は即時レスポンスし、詳細はログへ記録する。

11. **API 呼び出しのリトライ標準化**  
    - `UrlFetchApp.fetch` 等すべての外部 API に最大 3 回のリトライと指数バックオフを実装する。  
    - リトライ不能な場合はエラー通知とログ記録を行う。

12. **HTML サニタイゼーション**  
    - サイドバー／HTML テンプレートでは `AppUtilities.sanitizeHtml` を通してユーザー入力・URL を埋め込む。  
    - XSS リスクを避けるため、直接的な文字列連結は行わない。

上記は `docs/IMPROVEMENTS_2025_FINAL.md` および `docs/COMPREHENSIVE_IMPROVEMENTS_2025.md` と連動しており、他プロジェクトでも同様の改善を行う際の共通基準とする。

**User Property / Script Property 運用メモ**  
- 緊急時のトリガー削除は Script Property `LEAVE_TRIGGER_CLEANUP_ENABLED` を `true` に設定し、メニュー操作時に 1 分遅延の `runDeferredTriggerCleanup`（time-based trigger）を必ず予約する。  
- クリーナー関数はすべての `ScriptApp` トリガーと User Property を削除し、実行ユーザーへメール通知する。通知にはコンテナバインドであれば Spreadsheet URL、スタンドアロンであれば `https://script.google.com/d/<SCRIPT_ID>/edit` を含める。  
- Menu の「🧹 All-Triggers Cleanup」でオン／オフを切り替え、オフまたは未定義の場合は通常処理のみを継続する。オンにすると、実行時に全ユーザー分のトリガーを一括で削除する。  
- User Property を採用する場合は Script Property を介したフラグ管理と監査ログ（LogService.info/warn）をセットで行い、削除時は `PropertiesService.getUserProperties().deleteAllProperties()` で完全消去する。
- 他プロジェクトで同仕組みを使うときは、共通モジュールとして `TriggerCleanupService`（Script Property フラグ、遅延トリガー、メール通知）とカスタムメニュー項目（ON/OFF トグル + guard 中のトリガー無効化）をコピーし、Script ID／Spreadsheet URL 取得ロジックだけを該当システム向けに調整する。既定名称「🧹 All-Triggers Cleanup」と 1 分遅延トリガーはそのまま利用してよい。
