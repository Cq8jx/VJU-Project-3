# Calendar Leave Request レビュー報告書

## 1. Repository Overview
- **構成**: `src/LeaveWorkflow.js` に承認レコードのクリーンアップロジック、`appsscript.json` にマニフェスト、`clasp.json` に clasp 設定、`test/cleanupOrphanApprovalRecords.test.js` に Node.js 向けユニットテストが格納されています。【F:Calendar Leave Request/src/LeaveWorkflow.js†L1-L285】【F:Calendar Leave Request/appsscript.json†L1-L10】【F:Calendar Leave Request/clasp.json†L1-L4】【F:Calendar Leave Request/test/cleanupOrphanApprovalRecords.test.js†L1-L113】
- **Apps Script 設定**: タイムゾーンは `Asia/Tokyo`、`exceptionLogging` は `STACKDRIVER`、OAuth スコープは Calendar／ScriptApp／Script Storage の 3 つが宣言されています。Web アプリ設定、トリガー設定、アドオン設定は定義されていません。【F:Calendar Leave Request/appsscript.json†L1-L10】
- **トリガー**: コード／マニフェストともにトリガー定義は無く、スクリプトからの登録処理も見当たりません。【F:Calendar Leave Request/src/LeaveWorkflow.js†L37-L284】【F:Calendar Leave Request/appsscript.json†L1-L10】

## 2. Findings（重要度順）

## Issue 1：`clasp.json` とマニフェスト配置の不整合で `appsscript.json` が push されない

### 概要
`clasp.json` の `rootDir` が `src` になっている一方で、`appsscript.json` はリポジトリ直下に置かれています。`clasp push` を実行すると `src/appsscript.json` を探索するため、現在のマニフェストはアップロード対象に含まれません。

### 発生箇所
- ファイル: Calendar Leave Request/clasp.json
- 関数: -

### 影響範囲（必須）
- 直接影響する関数: `cleanupOrphanApprovalRecords`（マニフェストが反映されないと依存スコープが剥落）
- 間接的に影響するモジュール: Calendar 連携、承認トークン管理モジュール
- 依存するトリガー／外部サービス: Google Calendar API、PropertiesService
- 副作用: OAuth スコープがデフォルトに戻り Calendar API 呼び出しが失敗、例外ロギング設定が無効化、WebApp 設定が同期されない

### 原因分析
clasp のルートディレクトリ設計と実際のマニフェスト配置が乖離しており、自動デプロイ時に必要な `appsscript.json` が送信されない構成になっています。【F:Calendar Leave Request/clasp.json†L1-L4】【F:Calendar Leave Request/appsscript.json†L1-L10】

### 改善提案
- `appsscript.json` を `src/` 配下へ移動する、もしくは `clasp.json` の `rootDir` を `"."` に変更してマニフェストを含める。
- CI で `clasp push --dryRun` を実行してマニフェスト欠落を検知する。

### 追加対応案
- ビルド／デプロイ手順書に `rootDir` とマニフェスト配置の規約を明記する。
- 複数環境を扱う場合は `clasp.<env>.json` を用意し、設定ミスを防止する。

## Issue 2：Calendar 取得失敗時に未承認レコードを強制削除してしまう

### 概要
`eventLookup` 呼び出しで例外が発生すると `eventExists=false` とみなし、`!isStale && eventExists` 判定を抜けて強制的にクリーンアップが進行します。Calendar API の一時的な障害でも承認レコード・承認トークンを削除してしまいます。

### 発生箇所
- ファイル: Calendar Leave Request/src/LeaveWorkflow.js
- 関数: cleanupOrphanApprovalRecords

### 影響範囲（必須）
- 直接影響する関数: `cleanupOrphanApprovalRecords`
- 間接的に影響するモジュール: トークン管理、ログ削除処理
- 依存するトリガー／外部サービス: Google Calendar API（`eventLookup` の想定実装）
- 副作用: 一時的な API エラーで承認リンクが無効化、利用者のワークフローが破綻、手動復旧が必要

### 原因分析
例外捕捉自体は行っているが、`eventExists` を `false` に書き換えた後に処理継続してしまうため、エラーと「イベント不存在」を区別できていません。【F:Calendar Leave Request/src/LeaveWorkflow.js†L180-L233】

### 改善提案
- `eventLookup` で例外や `null` が返った場合は `summary.errors` へ記録しつつ `return` で次レコードへ進み、承認データを削除しない。
- 失敗の種類（認可エラー、Rate Limit、HTTP エラー）を詳細にログへ残して再試行判断ができるようにする。

### 追加対応案
- Calendar API 呼び出しに指数バックオフ付きリトライを導入し、一時的な障害を吸収する。
- エラーが一定回数続いた場合に運用者へ通知するモニタリングを追加する。

## Issue 3：PropertiesService を多重更新するが排他制御が無い

### 概要
孤児承認を削除する過程でトークンマッピング削除、承認レコード削除、ペンディングマーカー削除を個別に行っているが、`LockService` 等による排他制御が一切ありません。複数トリガーや手動実行が重なるとプロパティ破損やトークン二重発行の恐れがあります。

### 発生箇所
- ファイル: Calendar Leave Request/src/LeaveWorkflow.js
- 関数: cleanupOrphanApprovalRecords

### 影響範囲（必須）
- 直接影響する関数: `cleanupOrphanApprovalRecords`
- 間接的に影響するモジュール: トークンマップ／承認レコードの保存領域
- 依存するトリガー／外部サービス: 時間主導トリガー、手動実行
- 副作用: 競合により削除漏れ・重複発行・JSON 破損が発生し、次回実行時に例外が増加

### 原因分析
PropertiesService を疑似的に扱う `stateStore` は単純な `remove` 呼び出しを想定しており、競合解決策が組み込まれていません。Apps Script のタイムトリガーは同時並行で起動する場合があり、排他制御無しではデータ不整合を引き起こします。【F:Calendar Leave Request/src/LeaveWorkflow.js†L214-L273】

### 改善提案
- 処理開始時に `LockService.getScriptLock()` を取得し、完了までロックを保持する。
- ロック取得失敗時はリトライまたはスキップを選択し、ログへ記録する。

### 追加対応案
- `stateStore` 実装側でバッチ操作（まとめて削除）を提供し、ロック区間を短縮する。
- テストに並列実行シナリオを追加し、競合発生時の挙動を検証する。

## 3. Overall Improvement Plan（P1〜P4）
- **P1（最優先）**
  - Issue 1：`rootDir` とマニフェスト配置を揃え、`clasp push` でマニフェストが反映されるよう修正する。
  - Issue 2：Calendar API 呼び出し失敗時に承認データを削除しない制御を追加する。
- **P2**
  - Issue 3：PropertiesService 操作を排他制御で保護し、並行実行時のデータ破損を防ぐ。
- **P3**
  - `eventLookup` のリトライ／監視を実装して運用負荷を軽減する。
  - `clasp push --dryRun` や lint を CI に組み込み、設定ミスを即時検知する。
- **P4**
  - 承認ワークフロー全体のデプロイ手順書・シーケンス図を docs/ に追記し、オンボーディングを円滑化する。

## 4. Appendix
- ユニットテスト: `test/cleanupOrphanApprovalRecords.test.js`
- 主要関数: `cleanupOrphanApprovalRecords`, `buildLogger`, `toMilliseconds`
