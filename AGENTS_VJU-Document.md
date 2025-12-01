# VJU Project ドキュメント管理ガイドライン

このファイルは、VJU Project フォルダ内のファイル管理に関する注意事項をまとめています。VJU Project フォルダを操作する際は、このファイルと `~/.codex/AGENTS.md` の両方を確認してください。

---

## 1. ファイル構造と命名規則

### 1.1 ディレクトリ構成

#### 1. Public Report 2025
- `1. Public Report 2025/English/`: 英語版の Markdown
- `1. Public Report 2025/Japanese/`: 日本語版の Markdown
- `1. Public Report 2025/Vietnamese/`: ベトナム語版の Markdown（ファイル名に `_source` を含む）
- `1. Public Report 2025/Source/`: Markdown 以外の原本（PDF など）

#### 2. Quality Assurance
- `2. Quality Assurance/English/`: 英語版の Markdown
- `2. Quality Assurance/Japanese/`: 日本語版の Markdown
- `2. Quality Assurance/Vietnamese/`: ベトナム語版の Markdown（ファイル名に `_source` を含む）
- `2. Quality Assurance/Source/`: Markdown 以外の原本（PDF など）

#### 3. University Regulations
- `3. University Regulations/ToProcess/`: 処理待ちのファイル（現在は使用されていない）
- `3. University Regulations/Vietnamese/`: ベトナム語原文の Markdown（ファイル名に `_source` を含む）
- `3. University Regulations/English/`: 英語訳の Markdown
- `3. University Regulations/Japanese/`: 日本語訳の Markdown
- `3. University Regulations/Source/`: Markdown 以外の原本（PDF・DOCX など）

#### 4. Education Testing
- `4. Education Testing/English/`: 英語版の Markdown
- `4. Education Testing/Japanese/`: 日本語版の Markdown
- `4. Education Testing/Vietnamese/`: ベトナム語版の Markdown（ファイル名に `_source` を含む）
- `4. Education Testing/Source/`: Markdown 以外の原本（PDF など）

#### 5. Guide
- `5. Guide/`: 各種ガイドライン（英語・日本語・ベトナム語版）
- `5. Guide/Google Meet/`: Google Meet ガイド（各言語版と画像ファイル）

### 1.2 ファイル命名規則
- **Markdown**: `文書ID <ベトナム語正式題名>_source.md`（ベトナム語版）、`文書ID <英語正式題名>.md`（英語版）、`文書ID <日本語正式題名>.md`（日本語版）
- **Source PDF**: `文書ID <英語正式題名>.pdf`（必要に応じて `_source` サフィックス付与）
- **通達番号**: アルファベット＋数字を含む正式表記を用い、ファイル名では ASCII のみ（例: `ĐHQGHN-QĐ-4455` → `DHQGHN-QD-4455`）
- **文書ID**: 通達番号に Annex 番号等を付与した表記（例: `DHVN-HD-892 Annex 1`）
- **ベトナム語版のファイル名**: ファイル名に `_source` を含むのが正しい表現（例: `BGDDT-TT-2021-18 Thông tư ban hành Quy chế tuyển sinh và đào tạo trình độ tiến sĩ_source.md`）

### 1.3 フロントマター（Front Matter）の必須項目
各 Markdown ファイルには以下のフロントマターが必要です：

```yaml
---
id: BGDDT-TT-2021-18  # 文書ID（通達番号＋付録情報）
title: 文書の正式題名
issuer: 発行機関名
category: 3. University Regulations
issue_date: null  # 発行日（null 可）
status: active
replaces: []
replaced_by: []
revision_history: []
tags:
  - university-regulations
version:  # 利用可能な言語バージョンのリスト
  - en
  - ja
  - vi
  - source  # Source ファイルが存在する場合
lang: ja  # このファイルの言語（en, ja, vi のいずれか）
---
```

**重要**: `version` フィールドには、実際に存在するすべての言語バージョンを含めること。ベトナム語版が存在する場合は必ず `vi` を含める。

---

## 2. University Regulations ワークフロー

### 2.1 作業フロー
1. **下準備**  
   - 対象は `University Regulations/ToProcess/` の MD / PDF ペア（現在は使用されていない）
2. **ファイル名整理**  
   - Markdown: `文書ID <ベトナム語正式題名>_source.md`（ベトナム語版）、`文書ID <英語正式題名>.md`（英語版）、`文書ID <日本語正式題名>.md`（日本語版）
   - Source PDF: `文書ID <英語正式題名>.pdf`（原本識別が必要な場合は `_source` サフィックスを付与）
   - 通達番号はアルファベット＋数字を含む正式表記を用い、ファイル名では ASCII のみ（例: `ĐHQGHN-QĐ-4455` → `DHQGHN-QD-4455`）
   - 文書ID は通達番号に Annex 番号等を付与した表記（例: `DHVN-HD-892 Annex 1`）
   - リネーム後に一覧を再確認する
3. **MD 冒頭確認**  
   - 注意書き 2 行と区切り線（vanban.chinhphu.vn の URL）を必須化する。政府機関以外は URL をユーザーに確認する
4. **MD 体裁点検**  
   - Markdown 記法・テーブル列数・数値列の `---:` 右揃え・スペルチェックを実施し、修正点は後工程へ共有する
   - 4項目以上の箇条書きのときには改行を入れて、一行1項目にして見やすくする
5. **英語版 MD 作成**  
   - ベトナム語 `_source.md` を基に翻訳し、対応する文書IDと英語正式題名で `文書ID <英語正式題名>.md` を保存する
   - 着手前にタイムアウト対策（作業順・章分割・レビュー確保・途中保存方法）を `~/.codex/conversation-log.md` に記録する
   - 公的文書調の英語で統一し、固有名詞は原文表記＋必要なら括弧補足。完成後に全体を再読する
6. **日本語版 MD 作成**  
   - ベトナム語 `_source.md` を基に翻訳し、`文書ID <日本語正式題名>.md` で保存する
   - 日本語版の作成にあたっては、ベトナム語版を参照し、英語版は参照しない
   - 着手前に英語版同様のタイムアウト対策をログへ記録する
   - 略語は可能な限り日本語へ置換し、必要時は括弧で解説。行政文書調で統一し、完成後に再読する
7. **クロスチェック**  
   - 各言語の章立て・項目順・行数の大きな差異を確認し、理由を説明できるよう整理する。`_source` ファイルは編集禁止
   - ベトナム語、英語、日本語で見出しの内容 (付録を含む)を比較し、異なる場合にはベトナム語版をベースに日本語版や英語版を修正する
8. **ファイル移動**  
   - ベトナム語 MD は `.../Vietnamese/`、英語 MD は `.../English/`、日本語 MD は `.../Japanese/`、その他ファイルは `.../Source/` へ移動する
   - 移動後に重複や欠落がないか確認する
9. **ログ・報告**  
   - 作業ごとに `~/.codex/conversation-log.md` にタイムスタンプ付きで記録し、タイムアウト対策も同ファイルへ追記する
   - 完了報告には対象通達、注意書きの有無、翻訳ポイント、クロスチェック結果、移動先を明記する

### 2.2 表示チェックとレイアウト調整
- University Regulations の Markdown で `title` に文書ID（通達番号＋付録情報）が含まれる場合、リスト表示時は `_includes/doc-label.html` を経由して ID 重複が無いことを確認する。番号体系や命名を変更した際はトップページ・各言語 index を再描画し、文書ID が二重表示になっていないか確認する
- `_includes/doc-label.html` を Markdown から呼び出す際は `{%- ... -%}` でホワイトスペースを抑制し、リンクの `[]()` の間に改行が入らないようにする。修正後はブラウザ／ビルド出力で見た目を確認する
- Liquid の `{% capture %}` で整形すると内部に改行が残りやすいため、ラベル組み立ては `append` 等で文字列を生成する。番号付きタイトル処理後はページが再ビルドされているか確認する
- 言語切替 UI や共通レイアウトを調整した際は `_data` の言語リストと `doc-language-switcher.html`・`_layouts/page.html` をセットで確認し、必要な差分を忘れずにコミットする
- 表示トラブルは GitHub Actions の結果と `_site` で生成される HTML を比較し、`lang` メタデータ不足などデータ起因かビルド遅延かを切り分ける。`python3 scripts/build-index.py` → `python3 -m http.server` や `curl` を活用する
- トップページと言語別 index の言語切替は `_data` のリストと `details.collection-toggle` の構成に依存するため、スタイル変更時は両方の出力を見直して表示を確認する

### 2.3 言語別ディレクトリと ID 管理
- `Vietnamese/`：ベトナム語原文の Markdown。ファイル名は `文書ID <ベトナム語題名>_source.md`
- `English/`：英語訳の Markdown。ファイル名は `文書ID <英語題名>.md`
- `Japanese/`：日本語訳の Markdown。ファイル名は `文書ID <日本語題名>.md`
- `Source/`：Markdown 以外の原本（PDF・DOCX など）。ファイル名は `文書ID <英語題名>.pdf`（必要に応じて `_source` サフィックス付与）
- 通達番号は `<発行機関ベトナム語略称>-<通達の種類略称>-<番号>` で表記する（例: `DHVN-HD-892`）
- 文書ID は通達番号に Annex 番号など付随情報を含めた表記を指す（例: `DHVN-HD-892 Annex 1`）

### 2.4 GAS ワークフロー備考
- `organizeMarkdownDocuments` は English/Japanese/Vietnamese/Source/ToProcess を動的に検出するため、フォルダ構成を変更した場合でも名称を合わせれば自動追従する
- PDF 取り込み時は `_source_<LANG>` 命名で各言語の Markdown を生成し、時間切れ時は pending JSON に処理キューを保存して再開時に優先処理する。ToProcess が空になった際は GitHub Pages workflow（deploy-pages.yml）を API でトリガーする設計を維持する
- `sanitizeTitle` は Unicode を保持しつつ禁止文字のみ除去する。ベース言語ごとの `_source_<LANG>` を `_source.md` に統合し、DHVN-DT-840 系列などの付録でも正式タイトルと ID を保つ
- University Regulations フォルダを操作するときは必ず `/Users/home/GitHub/VJU-Project` 配下で作業し、Git 管理外の別リポジトリへ変更を反映しない

### 2.5 言語切替機能の確認
- 各言語版のファイルが同じ `id` を持っていることを確認
- `version` フィールドにすべての利用可能な言語が含まれていることを確認
- ベトナム語版のファイル名に `_source` が含まれていることを確認（これは正しい表現）

---

## 3. Markdown 編集ルール

### 3.1 HTML タグの使用
- PDF から Markdown を作成する際、GitHub Flavored Markdown で再現が必要なレイアウト要素（左右配置、署名欄、枠線など）がある場合は、適切な範囲で HTML タグとインライン CSS を使用して再現してよい
- 表示崩れを避けるため、`display:flex`、`text-align:center` 等の基本的なプロパティに留め、必要最小限のスタイルで構造を表現する
- Markdown 記法で表現できる場合は Markdown を優先し、HTML の併用はレイアウト再現に不可欠なケースに限定する

### 3.2 注意書きの形式
政府通達向けの注意書きは、以下の形式で冒頭に追加する：

```html
<div class="source-note" role="note" aria-label="出典メモ">このファイルは公開された内容を参考に作成しています。  
技術的な問題で、レイアウトや内容の再現が正確でない可能性があります。  
正確な情報は、通達番号などで調べて発行元にご確認ください。  
発行元が公式に公開している他言語版が存在する場合があります。</div>
```

**重要**: `<div>` タグは必ず閉じタグ `</div>` で閉じること。閉じタグがないとレイアウトが崩れる。

#### 3.2.1 再発防止策（2025-12-01 記録）
- **問題**: 36個のファイルで `<div class="source-note">` タグが閉じられておらず、注意書きの後のコンテンツが注意書きボックス内に表示されていた
- **原因**: 注意書きの最後の文（「発行元が公式に公開している他言語版が存在する場合があります。」など）の後に `</div>` が欠落していた
- **修正方法**: 注意書きの最後の文の直後に `</div>` を追加し、その後に空行を1行入れてから本文を開始する
- **検証方法**: 
  - すべての言語版（英語・日本語・ベトナム語）で `<div class="source-note">` と `</div>` のペアが正しく存在するか確認
  - 注意書きの直後に本文（通常は `**` で始まる）が続く場合は、必ず `</div>` の後に空行を1行入れる
  - 修正後の確認コマンド：
    ```bash
    # 開始タグと閉じタグの数を確認（一致する必要がある）
    grep -c '<div class="source-note"' "ファイル名.md"
    grep -c '</div>' "ファイル名.md"
    ```
- **影響を受けたファイル**: 
  - 英語版: BGDDT-TT-2021-08, BGDDT-TT-2021-18, BGDDT-TT-2021-23, DHQGHN-QD-3626, DHQGHN-QD-3638, DHVN-HD-1534, DHVN-HD-259, DHVN-HD-304, DHVN-HD-483 など（20ファイル）
  - 日本語版: 同様の文書ID（16ファイル）
  - ベトナム語版: DHVN-HD-1534 関連（2ファイル）
- **今後の作業**: 新しいファイルを作成する際は、注意書きの最後に必ず `</div>` を追加し、その後に空行を1行入れてから本文を開始すること

### 3.3 表の編集
- Markdown の表で数値主体の列は `---:` を用いて右揃えにする
- テーブル列数と列揃えを確認し、表やリストが崩れていないかレンダリングを点検する

---

## 4. 表示チェックとレイアウト調整

### 4.1 表示チェック項目
- `title` に文書ID（通達番号＋付録情報）が含まれる場合、リスト表示時は `_includes/doc-label.html` を経由して ID 重複が無いことを確認
- 言語切替 UI が正しく機能しているか確認（すべての言語バージョンへのリンクが表示されるか）
- レイアウトが崩れていないか確認（HTML タグの閉じ忘れ、CSS の誤りなど）

### 4.2 言語切替の確認
- `_includes/doc-language-switcher.html` が正しく動作しているか確認
- 各言語版のファイルが同じ `id` を持ち、`version` フィールドにすべての言語が含まれていることを確認
- ベトナム語版へのリンクが表示されない場合は、ファイル名に `_source` が含まれていないか、`version` フィールドに `vi` が含まれているかを確認

---

## 5. Git / GitHub 運用

### 5.1 基本方針
- GitHub を使用する際は原則として全ファイルを追跡対象から外し、ユーザー指示のあったファイルのみ明示的に add／commit する
- `.tmp.driveupload` フォルダや `.DS_Store` は追跡対象としない
- push 前に `git remote -v` と `git status -sb` で対象リポジトリと差分を確認し、必要なら `cd ~/GitHub/VJU-Project` と明示して誤った場所へ push しない
- push 後は Deploy GitHub Pages workflow の実行結果を確認し、表示異常が出たらソース差分と生成 HTML を突き合わせて原因を切り分ける

### 5.2 作業ディレクトリ
- University Regulations フォルダを操作するときは必ず `/Users/home/GitHub/VJU-Project` 配下で作業し、Git 管理外の別リポジトリへ変更を反映しない

---

## 6. 用語統一

### 6.1 ベトナム語表記
- ベトナム人名は日本語版・英語版の文書でも原文通りのベトナム語表記（ダイアクリティカルマーク含む）を用い、カタカナやローマ字へ置換しない
- ベトナム語 `Quyết định` は公的文書に合わせて「決定」と訳し、「決断」は使用しない

### 6.2 正式名称
- ベトナム語表記「ベトナム国家大学ハノイ校 日越大学」を英訳する際は `VNU – Vietnam-Japan University` のように頭に `VNU` を置く構成を用いる

---

## 7. トラブルシューティング

### 7.1 レイアウトが崩れている場合
1. HTML タグが正しく閉じられているか確認（特に `<div>` タグ）
   - `<div class="source-note">` タグは必ず `</div>` で閉じること
   - 注意書きのテキストの直後に `</div>` を配置し、その後のコンテンツが注意書きボックス内に含まれないようにする
   - 修正例：
     ```html
     <div class="source-note" role="note" aria-label="出典メモ">このファイルは公開された内容を参考に作成しています。  
     技術的な問題で、レイアウトや内容の再現が正確でない可能性があります。  
     正確な情報は、通達番号などで調べて発行元にご確認ください。  
     発行元が公式に公開している他言語版が存在する場合があります。</div>
     
     **次のコンテンツはここから**
     ```
2. CSS の記述に誤りがないか確認
3. Markdown の記法が正しいか確認（テーブル、リストなど）

### 7.1.1 注意書きタグの検証方法
- すべての言語版（英語・日本語・ベトナム語）で `<div class="source-note">` と `</div>` のペアが正しく存在するか確認
- `grep` コマンドで検証：
  ```bash
  # 開始タグの数を確認
  grep -c '<div class="source-note"' "ファイル名.md"
  # 閉じタグの数を確認
  grep -c '</div>' "ファイル名.md"
  # 両者の数が一致することを確認
  ```
- 注意書きの直後に本文が続く場合は、必ず `</div>` の後に空行を1行入れる

### 7.2 ベトナム語版へのリンクが表示されない場合
1. ベトナム語版のファイルが存在するか確認
2. ベトナム語版のファイル名に `_source` が含まれているか確認（含まれているのが正しい表現）
3. すべての言語版のファイルが同じ `id` を持っているか確認
4. すべての言語版のファイルの `version` フィールドに `vi` が含まれているか確認
5. `_config.yml` の `exclude` 設定を確認（`*_source.md` が除外されている場合、ベトナム語版がページとして認識されない可能性がある）

### 7.3 言語切替が機能しない場合
1. `_includes/doc-language-switcher.html` のロジックを確認
2. 各言語版のファイルのフロントマターを確認（`id`、`version`、`lang` が正しく設定されているか）
3. Jekyll のビルド結果を確認（`_site` ディレクトリ）

---

## 8. 参考情報

- 翻訳時の用語統一は `~/.codex/AGENTS.md` の「3. ドキュメント・Markdown・翻訳」セクションを参照
- 用語表: https://docs.google.com/spreadsheets/d/1kfRklEPr2MbZJeKY8Me0lTO68-8G4EtZlviktDpR1pA/edit?gid=962055076#gid=962055076

