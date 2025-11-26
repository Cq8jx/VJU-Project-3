# Codex Agent ガイドライン（Apps Script / GAS 専用）

## 2. Apps Script / GAS 運用

### 2.1 共通開発プロセス
- Apps Script の変更を push する際は `clasp push --force` を基本とし、反映後にエディタでソースが更新されているか必ず目視確認する。反映されていない場合は強制 push を再実行する。
- スクリプトを編集した際の報告では、追加で対応した方が良い点や改善提案があれば必ず触れ、必要に応じて次のアクション候補を示す。
- 新規にスクリプトを作成または大幅改修する場合は、要件定義書、設計書、テスト仕様書（個人名は記載しない）、操作説明書、運用マニュアルをこの順に作成し、各文書ごとにユーザーの確認と承認を得てから次の文書作成へ進む。
- 通常のスクリプト改修では、必要な要件定義書や設計書などを先に更新してから実際の改修作業に着手してよい（ユーザー確認は不要）。
- ドキュメント作成時にあいまいな点があればユーザーへ確認し、前提を明確化することを優先する。未確定事項・要確認セクションは選択肢（チェックボックス等）を提示し、確認済みの内容は本文へ移して未確定リストから削除する。
- レビュー報告書を更新するときは最新内容で全面置換し、古いバージョン（SDS 含む）や解消済み指摘は削除または「Resolved」と明記して誤読を防ぐ。
- Google Apps Script のファイルは役割が分かる名前を付け、`Code.js` のような汎用名を避ける。
- スクリプト編集に Python を用いるのは、Python を使わないと著しく時間が掛かると判断できる真に必要なケースに限定する。
- 共有ドライブ配下での運用を常に想定し、Drive 関連コードでは `supportsAllDrives` 等の共有ドライブ向けオプションや権限チェックを忘れずに組み込む。
- 「Computers」領域など DriveApp で書き込み権限が取得できない場合は、対象フォルダ（サブフォルダ含む）を My Drive へコピーし、以降の書き込み・リンク参照も My Drive 上のコピーに切り替える。
- Drive 上のファイルを一括で処理するときは、1 つのファイルに対して処理 A / 処理 B / 処理 C など必要な全工程を完了し、ログシート等へ記録を残してから次のファイルへ進む。途中でファイルを切り替えてはいけない（原因調査の遅延や API 無駄呼び出しを避けるため）。

### 2.2 スクリプト構成と分割
- スクリプトのファイル分割は「設定」「共通ユーティリティ」など明確に独立した責務に限定し、緊密に連携する処理は同一ファイルにまとめる。
- 新規ファイルを増やす判断は、既存ファイルが 1200～1300 行を超えて既定の 1500 行上限に迫る場合や、独立したドメインロジックが 3 系統以上混在するときに限定する。200 行未満で 1～2 関数しか持たない細切れファイルを乱立させない。
- 実行エントリを分割する必要がある場合は、当該ファイルが 1500 行を大幅に超えた段階でプロジェクト全体の構成を見直し、どこで責務を再編すべきか検討したうえで必要に応じて再構成する。
- スクリプト数が非常に多くなった場合や、分割理由が曖昧な場合は事前にユーザーへ方針確認を取る。
- トリガー種別や公開 API の都合で分割が必要なときは、各ファイル冒頭に責務をコメントで明示し、分割理由を `~/.codex/conversation-log.md` にメモする。

### 2.3 テスト・デプロイ・CLI 運用
- Apps Script API（旧 Execution API）関連のテストでは名称を「Apps Script API」と統一する。
- `clasp run` テスト手順  
  1. `clasp logout` → `clasp login --creds ~/.config/clasp/client_secret_work.json --no-localhost` を実行する。  
  2. 表示された認可 URL の `scope=` を Apps Script API 用スコープ（`script.external_request` など）と GCP 管理用スコープ（`script.projects` など）をすべて含む形に書き換え、ブラウザで承認する。  
  3. ブラウザが表示した `http://localhost:8888/?code=...` を CLI へ入力し、`tokeninfo` で必要スコープが全て付与されていることを確認する。  
  4. 2025-11-01 現在、スコープは揃ったが `clasp run testExecutionAPI` / `scripts.run` は 403 `PERMISSION_DENIED`。Apps Script API 自体は有効であり、Workspace 管理ポリシーや GCP 紐付け設定の追加調査が必要。  
- Apps Script の Web アプリ URL を固定したまま更新する際は以下を徹底する。  
  1. `clasp deployments` を実行し、更新対象の Web アプリ デプロイの `Deployment ID` を確認する。  
  2. ソースコード更新後に `clasp push` で Apps Script 側へ同期する。  
  3. 既存デプロイを更新する場合は `clasp deploy -i <Deployment ID> -d "<任意の説明>"` を実行する。  
  4. 上記手順で、テスト／sync now 実行時に旧 URL へ戻る問題を防ぎながら最新コードへ更新できる。  
- Web App URL を自動更新する際は `projects.deployments.list` 公式ドキュメント（https://developers.google.com/apps-script/api/reference/rest/v1/projects.deployments/list）を参照し、Apps Script REST API 経由でデプロイ一覧を取得する。  
  - `ScriptApp.getScriptId()` と `ScriptApp.getOAuthToken()` を用い、`https://script.googleapis.com/v1/projects/{scriptId}/deployments` を `UrlFetchApp` で呼び出す。必要に応じて `nextPageToken` で全件取得する。  
  - `entryPointType === 'WEB_APP'` かつ URL を含むエントリを抽出し、バージョン番号と更新日時で最新デプロイを選定する。URL は `https://script.google.com/a/<domain>/macros/s/.../exec` 形式に正規化して State Store へ保存する。  
  - REST API から URL を取得できない場合のみ `ScriptApp.getService().getUrl()` をフォールバックとして使用し、ログへ理由を残す。  
  - 自動更新処理の実装・修正時は API 仕様に破壊的変更がないか常に公式ドキュメントを再確認する。  
- Gmail-Thread-Labeler 向け `clasp run` 準備  
  1. GCP プロジェクト ID `gmail-thread-labeler` で Apps Script API / Cloud Logging API / Drive API を有効化し、OAuth クライアント（Desktop app）を `~/.config/clasp/client_secret.json` に配置する（既存ファイルはバックアップ）。  
  2. 認証情報を更新したら `clasp logout` → `clasp login --creds ~/.config/clasp/client_secret.json --use-project-scopes` を実行し、必要スコープが不足する場合は通常の `clasp login` も併用する。  
  3. `.clasp.json` の `"projectId"` を `gmail-thread-labeler` に設定し、`appsscript.json` の `executionApi.access` を `"ANYONE"` とする。`clasp push --force` → `clasp version` → `clasp deploy` で API 実行用デプロイを作成する。  
  4. 実行時は `clasp run runProcessingNow --params '[]'`（必要に応じて `--nondev`）を用い、追加権限リクエストが表示されたらブラウザで承認する。

### 2.4 Google Calendar 運用
- `OnCalendarUpdate` トリガーではイベント ID が直接渡されないため、Advanced Calendar Service の `Calendar.Events.list` を `syncToken` 付きで呼び出す増分同期で更新対象を突き止める。初回は `timeMin`／`timeMax` でベースラインを取得し、返却された `nextSyncToken` を保存、以後は `syncToken` を指定して差分のみを取得する。`syncToken` が失効（HTTP 410 等）した場合は保存値を破棄し、ベースライン取得から再初期化する。
- Calendar トリガー（例: `onEventUpdated`）から渡されるオブジェクトには `eventId` や `calendarEventId` が含まれないことを前提にし、ID が必要な処理は必ず前述の増分同期ロジックで補う。
- [VJU-IT] VJU Calendar Approval Bound の既知課題  
  1. 管理者が複数いる場合の通知整理（to/cc や言語分岐）を要確認。  
  2. 参加者リストで `Needs action` 等のステータスはそのまま出力せず整形する。  
  3. 自分以外の管理者が決定した際に他管理者へ通知する仕組みが未実装。  
  4. 未決定リクエストの平日朝リマインド（定期通知）が未実装。  
  5. Watcher の役割・通知要件を明文化する必要がある。  
  6. Apps Script の doGet などデプロイが必要な処理は、作業完了時に `clasp deploy` 等で最新バージョンをデプロイし、関連トリガーも更新して即時テスト可能な状態を維持する。

### 2.5 Gmail 連携とスパム対策
1. 通知メールは原則として投稿許可済みの Google グループ経由で送信し、投稿者の Gmail から直接大量送信しない。運用やスクリプト要件上グループ送信が適さない場合は、担当者へ事前共有したうえで個別送信（`to`/`cc`/`bcc` 組み合わせ）を選択してよい。その際は理由と宛先方針をドキュメント化する。宛先アドレスはグループ側に `it-support@vju.ac.vn` をメンバーとして登録しておく。  
2. 送信 API は `MailApp.sendEmail` もしくは `GmailApp.sendEmail` を使用し、既定では `name: "VJU Administrative Office"`、`replyTo: "it-support@vju.ac.vn"` を設定することを推奨する。システム固有の差出人名や Reply-To が必要な場合は、利用者への案内とログへ理由を残したうえで柔軟に変更してよい。  
3. HTML 本文には英語表記の署名を追記する。内容は「VNU – Vietnam-Japan University, Administrative Office」「Website: https://www.vju.vnu.edu.vn」「Email: it-support@vju.ac.vn」「Address: Luu Huu Phuoc Street, Tu Liem Ward, Hanoi / Zone QGHN-04, VNU Town, Hoa Lac Commune, Hanoi」とし、電話番号は記載しない。  
4. プレーンテキスト本文にも上記署名情報を追記し、送信元表示と返信先を統一する。  
5. 複数通の通知を連続送信する場合は `Utilities.sleep(5000 + Math.random() * 2000)` 等で 5～7 秒程度の待機を挟み、bot 的な連投判定を避ける。  
6. DNS の SPF（`v=spf1 include:_spf.google.com ~all`）、DKIM（Google Workspace 管理コンソールで有効化）、DMARC（例: `v=DMARC1; p=none; rua=mailto:admin@vju.ac.vn`）を確認し、テスト送信後に Gmail の「メッセージのソースを表示」で `spf=pass`、`dkim=pass`、`dmarc=pass` を必ず確認する。

### 2.6 Gemini API と生成 AI 運用
- Gemini API 呼び出し前に、応答後に実行する後続処理をダミーで操作して権限不足や失敗がないか必ず確認する。実行できない場合は理由と結果を My Drive に保存し、ユーザーへ報告する。
- 生成AI（Gemini 等）を呼び出す処理では、送信したプロンプト／補助情報（添付テキストの先頭・末尾100語、メタデータ）と応答の先頭・末尾100語を `LoggerService` へ JSON 形式で記録する。
- 応答が不安定・異常・解析不可と判断した場合は、即時に例外を送出して処理を中止する。
- 生成AI関連の例外発生時は追加 API 呼び出しを行わず、ユーザー通知（メール・UI）と Apps Script トリガーの停止／解除を行う。解除対象は当該処理に関連するタイムトリガー・手動待機用トリガーを含む。
- 上記方針は現在の `Google Drive VJU Document Process` スクリプトにも適用済みで、今後の実装でも踏襲する。
- 途中再開時は Markdown の末尾300トークンのみを Gemini へ送信し、`PipelineConstants.RESUME_TOKEN_TAIL_COUNT` を基準に必要最小限の文脈を共有する（過去全文を再送しない）。
- Gemini API の定期チェックと API 復旧監視トリガーについては「1.5 API テストと復旧監視」を参照する。

### 2.7 Google Drive VJU Document Process メモ
1. `HistoryLogger.log()` は毎回 `ConfigService.getActiveSpreadsheet()` → `getSheetByName('History')` で最新シートを取得し、`sheet.getRange()`／`appendRow()` を直接呼び出す。DocumentLock は使用していないため、同一行をユーザーが同時編集すると `setValues()` がユーザー編集を上書きする。  
2. スプレッドシート書き込み直前に再読込や差分検証は行わず、`sheet.getLastRow()` など呼び出し時点の状態のみ参照する設計。競合を防ぐにはトリガー実行中の手動編集を避けるか、今後 `LockService`／チェックサム導入を検討する。  
3. `SpreadsheetApp.flush()` はメニュー生成時（`onOpen`）のみに使用しており、History 等の書き込み直後には呼ばれていない。即時反映が必要な場合は明示的な flush 呼び出しを追加する必要がある。

### 2.8 カスタムメニュー運用
- カスタムメニューを追加する際は各メニュー項目に絵文字を付加して視認性を高める。
- スクリプトは定期的に精査し、重複関数や整理可能なロジックがないか確認し、改善提案を行う。

### 2.9 OAuth と権限管理
- 2025-01-08 以降、Apps Script IDE 実行では OAuth 同意がスコープ単位（グラニュラー同意）となる。IDE 以外（トリガー／ウェブアプリ／アドオン等）は順次対応予定のため、部分同意を想定したハンドリングと旧方式双方を考慮する。
- `ScriptApp.requireScopes(...)` / `requireAllScopes(...)` / `getAuthorizationInfo(...)` を用いて不足スコープを即時検知し、`AuthorizationInfo.getAuthorizationUrl()` で再同意リンクを案内できるようにする。
- `appsscript.json` の `oauthScopes` には実際に必要な最小限のスコープを明示する。特に公開アプリケーションでは不要な権限要求を避ける。
- グラニュラー同意は V8 ランタイムが必須。`runtimeVersion` を `V8` に設定し、`for each (... in ...)`、`Date.prototype.getYear()` など Rhino 固有構文を除去する。
- Rhino ランタイムは 2026-01-31 以降に停止予定。移行計画（テスト・デプロイ更新・利用者周知）を前倒しで進める。
- 各 Apps Script では `ScriptApp.getAuthorizationInfo`／`Auth.ensure()` 等で実行前に権限不足を検知し、`getAuthorizationUrl()` でユーザーへ再同意リンクを提示する。メニュー項目・トリガー・ウェブアプリ入口の直後で必ず呼び出す。

### 2.10 スクリプト改善の一般的な方策（2025-01-XX 追記）
Apps Script プロジェクトの改善作業では、以下の一般的な方策を事前に実施する。

#### 2.10.1 定数の整理と一元管理
- **目的**: マジックナンバーや散在する定数を一元管理し、保守性を向上
- **実施内容**:
  1. `Constants.js` モジュールを作成し、定数をカテゴリ別に整理（State Keys、Time Constants、Decision Types など）
  2. 既存コード内の定数定義を `Constants` モジュールからの参照に置き換え
  3. 定数の使用箇所を検索し、すべて統一
- **効果**: 定数の変更が1箇所で済み、保守性が向上

#### 2.10.2 エラーハンドリングの統一
- **目的**: エラーログの一貫性向上、管理者通知の統一、デバッグの容易化
- **実施内容**:
  1. `ErrorHandler.js` モジュールを作成し、統一されたエラーハンドリング関数を提供
  2. エラー発生の可能性があるすべての箇所で `ErrorHandler.handle` を使用
  3. **ログ記録の統一**: `Logger.log` の直接使用を避け、`LogService` モジュールを使用
     - 情報ログ: `LogService.info(context, data)`
     - 警告ログ: `LogService.warn(context, data)`
     - エラーログ: `LogService.error(context, data)` または `ErrorHandler.handle(context, error, options)`
     - 構造化ログ（JSON形式）により、ログの検索・分析が容易になる
- **効果**: エラーログの形式が統一され、管理者通知も標準化される

#### 2.10.3 セキュリティ強化
- **目的**: 不正な入力による攻撃の防止、セキュリティの向上
- **実施内容**:
  1. WebApp の `doGet` 関数での入力検証を強化
  2. トークン形式の検証（UUID形式、長さ制限）
  3. Decision パラメータの検証（有効な値のみ許可）
  4. Email 形式の検証（正規表現）
  5. 認証済みスーパーバイザーの検証
  6. エラーメッセージの統一（機密情報の漏洩防止）
- **効果**: 不正な入力による攻撃を防止し、セキュリティが向上

#### 2.10.4 パフォーマンス改善
- **目的**: 設定読み込みの効率化、コードの実行効率向上
- **実施内容**:
  1. 設定のキャッシュ戦略を実装（`Config.getCommonConfiguration()` など）
  2. イベント処理中の設定読み込みを1回に制限
  3. **バッチ書き込みの実装**: `BatchService` モジュールを使用してスプレッドシートへの書き込みを最適化
     - 複数行の書き込みは `appendRow()` の繰り返しではなく、`BatchService.writeRowsBatch()` を使用
     - バッチサイズは50-100行を推奨（`{ batchSize: 50 }`）
     - `SpreadsheetApp.flush()` は各バッチ後に自動実行される
  4. 不要なAPI呼び出しの削減
- **効果**: 設定読み込みの効率化、コードの実行効率向上、スプレッドシート書き込みのパフォーマンス改善

#### 2.10.5 コードの重複削減
- **目的**: コードの保守性向上、バグの発生リスク削減
- **実施内容**:
  1. 共通処理を関数として抽出（例: `prepareEventDataForApproval`）
  2. イベント検証ロジックを `EventValidator` モジュールに統一
  3. エラーハンドリングパターンの統一
- **効果**: コードの保守性向上、バグの発生リスク削減

#### 2.10.6 型定義の追加
- **目的**: コードの可読性向上、型安全性の向上
- **実施内容**:
  1. JSDoc の `@typedef` を使用して主要なデータ構造の型定義を追加
  2. 関数のパラメータと戻り値に型情報を追加
  3. 型定義はファイルの先頭にまとめて記載
- **効果**: コードの可読性向上、型安全性の向上

#### 2.10.7 アーキテクチャドキュメントの作成
- **目的**: システムの理解を促進し、保守性を向上
- **実施内容**:
  1. `docs/ARCHITECTURE.md` を作成し、システム構成を文書化
  2. モジュール構造、データフロー、状態管理、依存関係を記載
  3. 改善の歴史と将来の改善候補を記録
- **効果**: システムの理解が促進され、保守性が向上

#### 2.10.8 改善の実施順序
1. **第1段階**: 定数の整理と一元管理、エラーハンドリングの統一
2. **第2段階**: セキュリティ強化、パフォーマンス改善
3. **第3段階**: コードの重複削減、型定義の追加
4. **第4段階**: アーキテクチャドキュメントの作成

#### 2.10.9 メールレート制限の実装（2025-01-XX 追記）
- **目的**: スパム防止、メール送信の適切な制御、Google Workspace のレート制限対策
- **実施内容**:
  1. **定数の定義**: `Constants.js` にレート制限関連の定数を定義
     - ウィンドウ時間（例: 30分）
     - 閾値（例: 5通/ウィンドウ）
     - 履歴の最大件数（例: 50件）
     - State Store キーのプレフィックス
  2. **履歴管理**: 各受信者ごとに送信タイムスタンプを State Store に保存
     - キー形式: `<PREFIX><recipient>`（受信者ごとに独立）
     - 値: JSON配列（タイムスタンプのミリ秒の配列）
     - ウィンドウ外の古いエントリは自動的にプルーニング
  3. **評価ロジック**: メール送信前にレート制限を評価
     - 受信者リストの収集（to, cc, bcc から正規化）
     - 各受信者の履歴を読み込み、ウィンドウ内のエントリ数をカウント
     - 閾値超過の受信者を検出
  4. **ブロック処理**: 閾値超過が検出された場合
     - メール送信をキャンセル
     - スクリプト実行者（`Session.getActiveUser()` または `Session.getEffectiveUser()`）に通知メールを送信
     - 通知メールは `bypassRateLimit: true` オプションで送信（無限ループ防止）
     - ログに記録
  5. **記録**: メール送信成功後、送信タイムスタンプを履歴に追加
- **実装パターン**:
  ```javascript
  // 評価
  const evaluation = evaluateEmailRateLimit(recipients);
  if (evaluation.blocked.length) {
    notifyRateLimitExceeded(evaluation.blocked, recipients, options, context);
    return; // 送信をキャンセル
  }
  
  // 送信成功後
  recordRateLimitHistory(recipients, evaluation.histories, Date.now());
  ```
- **注意事項**:
  - レート制限は受信者単位で管理されるため、異なる受信者への送信は影響を受けない
  - 重要な通知（レート制限通知など）は `bypassRateLimit: true` で送信
  - 履歴のプルーニングは評価時と記録時の両方で実施
  - メールアドレスの正規化（大文字小文字、空白、表示名の除去）を統一
- **効果**: スパム防止、メール送信の適切な制御、Google Workspace のレート制限対策

#### 2.10.10 注意事項
- 既存の機能に影響を与えないよう、テストを十分に実施する必要がある
- 大規模な変更は段階的に実施することを推奨
- 改善内容は `docs/IMPROVEMENTS.md` や `docs/ARCHITECTURE.md` に記録する

### 2.11 サイドバー UI 調査チェックリスト（2025-11-06 追記）
1. `<script>` ブロックを確認するときは `sed -n '1,400p'` と `sed -n '400,800p'` などで全体を必ず通読し、出力を途中で打ち切らない。括弧抜けや未閉じチェーンは末尾に現れるため、`tail` で終端も確認する。
2. DOM 参照は `rg "document.getElementById"` で洗い出し、対応する `const` 宣言と HTML 側の ID が揃っているか突き合わせる。ヒットしない ID があれば未定義変数として直ちに修正する。
3. `google.script.run` のチェーンを編集した際は一時的に `<script>` 内を `tmp.js` へ抜き出して `node --check tmp.js` で構文検証し、`.withSuccessHandler` / `.withFailureHandler` の括弧漏れを検出する。検証後は `rm tmp.js` を忘れない。
4. 関数差し替え時は `rg "function "` やシンボル名検索で重複定義を確認し、旧実装を必ず除去する。特に `setButtonBusy` のように末尾へ再定義した場合は初期定義を削除し、単一の関数に統一する。

### 2.12 スクリプトレビュー標準手順（2025-11-10 追記）
1. **ベースライン固定（15分）**  
   1. `clasp pull` で現行コードを取得し、`baseline-YYYYMMDD` タグを付与してロールバック起点を明示する。  
   2. トリガー一覧、公開 URL、依存スプレッドシート ID をメモ化し、リリース後も即座に戻せる状態を確保する。  
2. **関数インベントリ＋簡易コールグラフ生成（30〜60分）**  
   1. すべての `.gs` / `.ts` から関数定義と呼び出しを抽出し、Markdown 表にまとめる（AST でも正規表現でも可）。  
   2. `onOpen` `onEdit` `doGet` `doPost` など GAS 特有の外部エントリをグラフの起点として可視化する。  
   3. 生成 AI を使う場合は「これらのファイルを解析し、関数一覧とコールグラフ（呼び元→呼び先）をMarkdown表で出力。GAS固有の外部エントリを起点として可視化して。」を指示文に含める。  
3. **静的チェック＋GAS 例外ホワイトリスト**  
   1. 未定義／未使用／重複定義を検出する。`eslint . --rule 'no-undef:error'` を用いる際は `google.script.run.*` など HTML 側からの呼び出しをあらかじめホワイトリストへ登録する。  
   2. `onOpen` `onEdit` `doGet` `doPost` `Triggers` は誤検出しないよう除外する。  
   3. 生成 AI には「未定義・未使用・重複定義を抽出。onOpen/onEdit/doGet/doPost と google.script.run.* 起点は除外。」と明示する。  
   4. この時点で「機械的に削除できる候補」と「人手確認が必要な候補」を分離し、リスト化する。  
4. **安全網の準備（最重要）**  
   1. 主要エントリが例外なく動作するかのスモークテストを用意する。  
   2. フォーマッタやテンプレ出力についてはスナップショットテストを作成し、比較結果を残す。  
   3. 新旧バージョンを即時切り替えられるよう、デプロイを2系統で保持する。  
   4. 生成 AI 活用時は「主要エントリに対するスモークテストと、フォーマッタ/テンプレ出力のスナップショットテストの雛形を生成。」と指示する。  
5. **ランタイム使用計測（1〜2週間の並走可）**  
   1. 迷う関数には軽量テレメトリ（`Logger.log` や `PropertiesService` カウント）を仕込み、実際の呼び出し有無を確認する。  
   2. 平日日中のみ等、最小限でも実施し「静的×動的」の両面で未使用かを裏付ける。  
6. **優先度付けと実施単位の分割**  
   1. 各関数をファンイン（呼び出し元の数）と複雑度、外部依存の有無でスコアリングし、2×2 マトリクス上で整理する。  
   2. 低リスク×低依存から削除し、高ファンインにはラッパーを噛ませて段階移行する。  
   3. 生成 AI 指示例: 「関数ごとにファンイン/複雑度/外部依存でスコアリングし、削除・リネーム・抽出の優先順位を提案。」  
7. **非互換変更の猶予運用**  
   1. 旧関数は即削除せず `@deprecated` コメントを追加したラッパーから新関数へ委譲する。  
   2. 旧 API 呼び出しをログへ記録し、ゼロになった時点で削除する（目安 1〜4 週間）。  
   3. 生成 AI には「@deprecated ラッパーの雛形と、旧API呼び出し検知ログの実装例を出力。」と指示する。  
8. **削除・整形 → 再スキャン → タグ付け**  
   1. 対象を削除後、フォーマッタ／リンタを再実行し、関数在庫・コールグラフを再生成して取りこぼしを無くす。  
   2. `release-YYYYMMDD` タグを付与し、変更点とブレイキングチェンジの有無をまとめて残す。  
   3. 生成 AI 指示例: 「削除後の再スキャン結果と差分サマリ（ブレイキングチェンジの有無）を作って。」  
9. **共通運用ルール**  
   1. 即時削除は禁止。`@deprecated`＋委譲＋ログで段階的に廃止する。  
   2. 影響が読めない変更は 1 リリース 1 種類に留め、原因追跡を容易にする。  
   3. 在庫表・コールグラフ・非互換リストは毎回更新し、可視化を固定枠として扱う。  
   4. 戻せる形（タグ、旧版 URL、トリガー切替手順）で成果物を出す。  
10. **レビュー前の必須確認**  
    1. スクリプトレビューに着手する前に、必ず最新版の `~/.codex/AGENTS.md` を読み直し、上記手順を満たす計画を `~/.codex/conversation-log.md` へ記録する。  


### 2.13 Calendar Leave Request から学ぶ実装パターン（2026-11-16 追記）
Calendar Leave Request プロジェクトで培った実戦的な工夫を、今後の GAS 実装ガイドとして必ず踏襲する。

1. **状態管理とロック手法**  
   - `StateStore` の `getWithVersion`/`setWithVersion` を模倣し、Script Properties を version 付き JSON で扱う。キューやトークンのような並列更新が起きる箇所は ScriptLock とセットで更新し、競合時は再試行ポリシーを決めてログへ記録する。  
   - 配列を Script Properties へ保存するときは `saveJsonArray` 相当のサイズ削減ロジックを実装し、超過時に fallback エントリを挿入して「いつ・何件切り捨てたか」を `LogService.warn` へ残す。

2. **設定キャッシュとフェイルセーフ**  
   - `Config.getCommonConfiguration()` のように Script Cache + Script Properties + Spreadsheet を多層化し、WebApp 実行時でも JSON fallback から最低限の設定を読めるようにする。  
   - `Config.ensureWebAppUrl()` が行うように、WebApp URL の取得は「現行値 → 最終正常値 → API からの強制取得」の順に試み、ドメイン不一致検知時は `StateStore` に `LEAVE_WEBAPP_URL` の署名付き状態を記録して通知する。

3. **トリガー監視と緊急遮断**  
   - `TriggerService` にならい、Script Properties に「現在のキュー処理 Run ID」「次回実行タイムスタンプ」「fallback polling の有無」を記録し、トリガー重複や欠落を検知したらログと Monitoring に一元通知する。  
   - `TriggerCleanupService` を標準装備とし、🧹メニューから 1 分遅延トリガーを仕掛けて全 installable trigger と User Properties を削除、完了後に実行者へメール通知するフローをテンプレ化する。

4. **ログ・監視・エラーハンドリング**  
   - すべてのログは `LogService` 経由の JSON で出力し、`maskSensitiveValues` でメールアドレス等を必ずマスクする。ErrorHandler も `LogService.error('ErrorHandler.handle', …)` を呼ぶ形に統一し、`MonitoringService.recordError` に type/severity/retryable を添付する。  
   - `MonitoringService.performHealthCheck({ recordMetrics })` のようにメトリクス記録可否をパラメータで制御し、スケジュール実行時の多重保存を防ぐ。ヘルスチェックは Spreadsheet/Config/Trigger/ErrorRate の全項目を確認し、不具合検出時は `sendHealthAlert` でメール通知する。

5. **メール・通知の制限**  
   - `EmailService` の rate limit 実装（受信者単位の履歴、バッチ送信間隔、Executor への通知）を標準とする。`waitForSequentialSendSlot` で連続送信には最小遅延を挟み、署名はポリシー通り Website・Email・Address のみを含める。  
   - 通知本文は `MailTemplates` のように `AppUtilities.sanitizeHtml` を通したテンプレートで生成し、承認リンクは `TokenManager.registerTokenMapping` で HMAC 署名を付与したトークンを使う。

6. **WebApp / UI 対応**  
   - WebApp 処理は `Auth.ensure({ webAppMode: true })` を用いて最小スコープで実行し、`Session.getActiveUser()` が得られない場合は即座に警告を返す。  
   - HTML テンプレート（例: `ApprovalResponse.html`）は `HtmlService.createTemplateFromFile` でレンダリングし、サーバサイドで sanitize 済みの値だけを描画する。

これらの設計原則を新しい GAS プロジェクトでも適用し、レビュー時には「StateStore/Config/Trigger/Logging/Email/WebApp の6領域すべてで Calendar Leave Request 相当の仕組みが備わっているか」をチェックリスト化して確認すること。


---
