# Calendar Leave Request レビュー報告書

## 1. Repository Overview
- **構成**: `src/LeaveWorkflow.js` に承認レコードのクリーンアップ処理、`test/cleanupOrphanApprovalRecords.test.js` に Node.js 向けのユニットテストのみが存在します。【F:Calendar Leave Request/src/LeaveWorkflow.js†L1-L240】【F:Calendar Leave Request/test/cleanupOrphanApprovalRecords.test.js†L1-L108】
- **Apps Script 設定**: リポジトリ直下に `appsscript.json` や `clasp.json` が存在せず、OAuth スコープ／Web アプリ設定／デプロイ先プロジェクトが不明です。【47cf87†L1-L3】
- **トリガー**: コード内にもトリガー登録処理が無く、現在の構成では実行トリガーの情報を把握できません。【F:Calendar Leave Request/src/LeaveWorkflow.js†L36-L233】【47cf87†L1-L3】

## 2. Findings（重要度順）

## Issue 1：CommonJS 形式のままでは GAS にデプロイできない

### 概要
`module.exports` を直接使用しており、Apps Script（V8 ランタイム）にそのままアップロードすると `ReferenceError: module is not defined` が発生します。ビルド手順や bundler 設定が同梱されていないため、現在の構成では本番スクリプトに組み込めません。

### 発生箇所
- ファイル: Calendar Leave Request/src/LeaveWorkflow.js
- 関数: cleanupOrphanApprovalRecords

### 影響範囲（必須）
- 直接影響する関数: `cleanupOrphanApprovalRecords`
- 間接的に影響するモジュール: クリーニングバッチ全体
- 依存するトリガー／外部サービス: 予定されていたタイマー実行や承認フロー連携
- 副作用: デプロイ不能、想定ジョブが全停止

### 原因分析
Apps Script では CommonJS の `module.exports` がサポートされないにもかかわらず、ビルド成果物ではなくソースそのものが配置されています。ビルド／デプロイのパイプラインが欠落しています。

### 改善提案
- Webpack や Rollup などで CommonJS を IIFE/Globals へトランスパイルするビルドステップを追加し、成果物のみを Apps Script プロジェクトへ push する。
- もしくは GAS のモジュールパターン（`var LeaveWorkflow = (function(){ ... return { cleanupOrphanApprovalRecords }; })();`）に書き換えて直接実行可能にする。
- clasp を利用する場合は `clasp.json` に build 後ディレクトリを指定し、`appsscript.json` と合わせてバンドルする。

### 追加対応案
- ビルド手順を README/docs に明記してメンテナンス手順を共有する。
- 自動ビルドを GitHub Actions 等で行い、成果物の破損を防ぐ。

## Issue 2：Apps Script プロジェクト設定が欠落しており、権限・トリガーが不明

### 概要
`appsscript.json` や `clasp.json` が同梱されておらず、OAuth スコープ、Web アプリ設定、実行ユーザー、トリガー種別をレビューできません。結果として本番プロジェクトとの齟齬や過剰権限付与を検知できない状態です。

### 発生箇所
- ファイル: （設定ファイル欠如）
- 関数: -

### 影響範囲（必須）
- 直接影響する関数: プロジェクト内すべて
- 間接的に影響するモジュール: 承認フローの UI／バックエンド、トリガー実行バッチ
- 依存するトリガー／外部サービス: Calendar API、メール通知等（スコープ未定）
- 副作用: 過剰権限付与、WebApp 実行ユーザー誤設定、トリガー重複などのリスク

### 原因分析
バージョン管理対象に Apps Script メタデータが追加されていないため、レビュー時に動作要件を把握できず、デプロイ時も手作業で設定する必要が生じています。

### 改善提案
- `appsscript.json` を生成し、`oauthScopes`、`timeZone`、`exceptionLogging`、Web アプリ／トリガー設定を明文化する。
- `clasp.json` を追加し、デプロイ対象のスクリプト ID を共有する。
- docs に権限設計とトリガー方針を記載し、レビュー可能な状態を作る。

### 追加対応案
- トリガー管理用のスクリプト（例: `setupTriggers.gs`）を導入して二重登録を防ぐ。
- 定期的な権限レビュー手順をドキュメント化する。

## Issue 3：`stateStore.remove` の失敗が未捕捉でジョブ全体が中断する

### 概要
不正レコード検知時に `stateStore.remove(key)` を呼び出すが、ここだけ例外処理が無く、PropertiesService 側で例外が発生すると残りのレコード処理が実行されません。

### 発生箇所
- ファイル: Calendar Leave Request/src/LeaveWorkflow.js
- 関数: cleanupOrphanApprovalRecords

### 影響範囲（必須）
- 直接影響する関数: `cleanupOrphanApprovalRecords`
- 間接的に影響するモジュール: トークン破棄／ログ削除ロジック
- 依存するトリガー／外部サービス: タイムドトリガーでのバッチ実行
- 副作用: 途中で停止して未処理レコードが残存、二重トークンが残ることで承認 URL が再利用可能になる

### 原因分析
他の危険操作（トークン削除、ログ削除、承認レコード削除）は try/catch で保護されているが、`stateStore.remove` のみ保護されていないため、例外がそのまま呼び出し側に伝播してしまいます。【F:Calendar Leave Request/src/LeaveWorkflow.js†L113-L229】

### 改善提案
- `stateStore.remove` を try/catch で包み、失敗時は `summary.errors` に記録しつつ後続処理を継続する。
- エラー監視のため、`logger.warn` などで詳細を残し、再実行できるようにする。

### 追加対応案
- 失敗したキーを再処理するためのリトライキューを導入する。
- PropertiesService のステータスを監視するダッシュボードを整備する。

## Issue 4：`eventLookup` の例外伝播によりクリーンアップが停止する

### 概要
イベント存在確認のために `eventLookup(eventId, record)` を直接呼び出しており、`CalendarApp.getEventById` などで例外が発生すると処理が中断します。

### 発生箇所
- ファイル: Calendar Leave Request/src/LeaveWorkflow.js
- 関数: cleanupOrphanApprovalRecords

### 影響範囲（必須）
- 直接影響する関数: `cleanupOrphanApprovalRecords`
- 間接的に影響するモジュール: 期限切れレコードの削除、トークン破棄
- 依存するトリガー／外部サービス: Google Calendar API
- 副作用: 単一イベントの障害で他の孤児レコードが残存、承認リンクの不正利用リスク

### 原因分析
`eventLookup` 実行時に例外を捕捉しておらず、権限不足や削除済みイベント参照時のエラーがバッチ全体を止めてしまいます。【F:Calendar Leave Request/src/LeaveWorkflow.js†L166-L184】

### 改善提案
- `eventLookup` 呼び出しを try/catch で保護し、失敗時は `eventExists=false` とみなしてクリーンアップを継続する。
- 併せてログへ詳細を残し、原因調査を容易にする。

### 追加対応案
- Calendar イベント取得をバッチ化し、API 呼び出し失敗時のリトライや指数バックオフを導入する。
- 例外発生イベントをレポートに追加し、UI で再通知できるようにする。

## 3. Overall Improvement Plan（P1〜P4）
- **P1**
  - Issue 1：CommonJS コードを GAS 互換形式へ変換するビルドパイプラインを導入する。
  - Issue 2：`appsscript.json`・`clasp.json` を整備して権限・トリガーを明文化する。
- **P2**
  - Issue 3：`stateStore.remove` を含むストレージ操作をすべて例外処理で保護する。
  - Issue 4：`eventLookup` の例外を捕捉し、処理継続と監視を実装する。
- **P3**
  - バッチ処理のログフォーマットを統一し、サマリーを Stackdriver などへ送信して監視性を向上する。
  - テストスイートを Apps Script 実行環境（clasp + `@google/clasp`）と統合し、Node 単体テストとの差異を早期検知する。
- **P4**
  - 承認ワークフロー全体のドキュメント整備（シーケンス図、トリガー設計書、UI 連携仕様）を進め、オンボーディングを容易にする。

## 4. Appendix
- ユニットテスト: `test/cleanupOrphanApprovalRecords.test.js`
- 主要関数: `cleanupOrphanApprovalRecords`, `buildLogger`, `coerceTimestamp`
