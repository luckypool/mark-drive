# Google Workspace Marketplace 公開計画

## 概要

MarkDrive を Google Workspace Marketplace に公開し、Google Drive から直接 `.md` ファイルを「Open with（アプリで開く）」で開けるようにする。

## 背景調査

### 技術的な実現可能性: **可能**

Google Drive は「Drive UI Integration」という仕組みを提供しており、サードパーティアプリがファイルの MIME タイプ・拡張子に基づいて「アプリで開く」メニューに登録できる。MarkDrive は既に Google OAuth + Drive API を使用しているため、既存の基盤を拡張する形で対応可能。

### 2段階アプローチ

| | Phase 1: Drive UI Integration | Phase 2: Marketplace 公開 |
|---|---|---|
| 「アプリで開く」 | 対応 | 対応 |
| Drive からの発見 | 不可（既存ユーザーのみ） | 可能（検索・インストール） |
| 組織一括インストール | 不可 | 可能 |
| 審査 | OAuth 同意画面のみ | Marketplace 審査 + OAuth 検証 |
| 費用 | 無料 | 無料 |

### 必要な OAuth スコープ

| スコープ | 用途 | 分類 |
|---|---|---|
| `drive.install` | Drive UI に「アプリで開く」を登録 | 非機密 |
| `drive.file` | ユーザーが開いたファイルの読み書き | 非機密 |

**重要**: `drive.file` + `drive.install` は**非制限スコープ**のため、高額な CASA セキュリティ監査が不要。現在使用中の `drive.readonly`（制限スコープ）からの移行が必要。

### 「アプリで開く」のフロー

```
1. ユーザーが Google Drive で .md ファイルを右クリック
2. 「アプリで開く」→「MarkDrive」を選択
3. Drive がリダイレクト:
   https://markdrive.example.com/open?state={"ids":["FILE_ID"],"action":"open","userId":"USER_ID"}
4. MarkDrive が state パラメータをパース
5. Drive API でファイル内容を取得
6. Markdown をレンダリング
```

---

## 実装計画

### Phase 1: Drive UI Integration（コード変更 + GCP 設定）

#### Issue 1: Drive「アプリで開く」用のルーティング追加

**概要**: Google Drive からのリダイレクトを受け取る `/open` ルートを新設する。

**タスク**:
- [ ] `app/open.tsx` を新規作成
- [ ] URL の `state` クエリパラメータをパース（URL デコード → JSON パース）
- [ ] `state.action === "open"` の場合、`state.ids[0]` からファイル ID を抽出
- [ ] `state.userId` を使用してユーザーセッションを確認
- [ ] 認証済みの場合、ファイル ID と共に `/viewer` へリダイレクト
- [ ] 未認証の場合、OAuth フローを実行後にファイルを開く
- [ ] エラーハンドリング（無効な state、権限なし等）

**技術詳細**:
```typescript
// app/open.tsx
// state パラメータの型
interface DriveOpenState {
  action: 'open' | 'create';
  ids: string[];
  resourceKeys?: Record<string, string>;
  userId: string;
}
```

#### Issue 2: OAuth スコープの変更

**概要**: `drive.readonly` から `drive.file` + `drive.install` への移行。

**タスク**:
- [ ] `useGoogleAuth.web.ts` の OAuth スコープを変更
  - 削除: `https://www.googleapis.com/auth/drive.readonly`
  - 追加: `https://www.googleapis.com/auth/drive.file`
  - 追加: `https://www.googleapis.com/auth/drive.install`
- [ ] `drive.file` スコープでのファイル取得が正常に動作することを確認
- [ ] `drive.install` による Drive UI 登録のテスト
- [ ] Google Cloud Console で OAuth 同意画面のスコープを更新
- [ ] 既存ユーザーの再認証フローを考慮（スコープ変更時の挙動）

**注意**: `drive.file` は「ユーザーがアプリで明示的に開いたファイル」にのみアクセスできるスコープ。現在の検索機能（`search(query)`）や最近のファイル一覧（`loadRecentFiles()`）は `drive.file` では動作しない可能性がある。`drive.readonly` を維持するか、機能を調整する必要がある。

**スコープ戦略の選択肢**:

| 選択肢 | スコープ | メリット | デメリット |
|---|---|---|---|
| A: 最小権限 | `drive.file` + `drive.install` | CASA 監査不要、審査が容易 | 検索・一覧機能が制限される |
| B: 読み取り維持 | `drive.readonly` + `drive.install` | 既存機能を維持 | CASA 監査が必要（制限スコープ） |
| C: ハイブリッド | `drive.file` + `drive.install`（通常）、`drive.readonly`（オプション） | 柔軟 | 実装が複雑 |

**推奨**: 選択肢 A を採用し、検索・一覧は Drive Picker API で代替する。

#### Issue 3: Google Drive Picker API の導入

**概要**: `drive.file` スコープへの移行に伴い、ファイル選択を Google Picker API に置き換える。

**タスク**:
- [ ] Google Picker API の JavaScript ライブラリを読み込み
- [ ] Picker UI を表示するコンポーネント/フックを作成
- [ ] 現在の検索画面（`search.tsx`）を Picker ベースに置き換え or 併用
- [ ] Picker で選択されたファイルは自動的に `drive.file` スコープでアクセス可能になることを確認
- [ ] `.md` / `.markdown` ファイルのフィルタリングを Picker に設定

#### Issue 4: ファイル保存（書き込み）機能の追加

**概要**: `drive.file` スコープでは書き込みも可能。編集内容を Drive に保存する機能を追加。

**タスク**:
- [ ] `googleDrive.ts` に `saveFileContent(accessToken, fileId, content)` を追加
- [ ] Drive API `files.update` でファイル内容を上書き保存
- [ ] エディタ（CodeMirror）に「Google Drive に保存」ボタンを追加
- [ ] 保存前の確認ダイアログ
- [ ] 保存成功/失敗のフィードバック UI
- [ ] 競合検出（`modifiedTime` のチェック）

#### Issue 5: Google Cloud Console の設定

**概要**: Drive UI Integration を Google Cloud Console で設定する。

**タスク**:
- [ ] Google Cloud Console → APIs & Services → Google Drive API → Drive UI Integration タブ
- [ ] **Open URL** を設定: `https://<domain>/open`
- [ ] **Secondary MIME types** を設定: `text/markdown`, `text/plain`, `text/x-markdown`
- [ ] **Secondary file extensions** を設定: `.md`, `.markdown`, `.mdown`, `.mkd`
- [ ] **アプリアイコン**をアップロード: 256x256 PNG、透過背景
- [ ] OAuth 同意画面でスコープを更新
- [ ] テスト用ユーザーを追加して動作確認

### Phase 2: Marketplace 公開

#### Issue 6: 本番デプロイ環境の整備

**概要**: Marketplace 審査にはアクセス可能な URL が必要。本番環境を準備する。

**タスク**:
- [ ] カスタムドメインの取得・設定
- [ ] ホスティング環境の選定（Vercel, Cloudflare Pages, Firebase Hosting 等）
- [ ] HTTPS の設定（必須）
- [ ] ドメイン所有権の確認（Google Search Console）
- [ ] 環境変数（API キー、Client ID）の本番用設定
- [ ] `npm run build` の出力を本番環境にデプロイ

#### Issue 7: Marketplace リスティング用アセットの作成

**概要**: Marketplace 審査に必要なアセットとドキュメントを準備する。

**タスク**:
- [ ] アプリアイコン（128x128, 256x256）
- [ ] スクリーンショット（最低1枚、推奨3-5枚）
  - ファイルを開く流れ
  - Markdown プレビュー画面
  - エディタ画面
  - PDF エクスポート
- [ ] アプリの説明文（短い説明 + 詳細説明）
- [ ] プライバシーポリシー URL
- [ ] 利用規約 URL
- [ ] サポート用 URL / メールアドレス

#### Issue 8: Workspace Marketplace SDK の設定と申請

**概要**: Marketplace SDK を有効化し、審査に提出する。

**タスク**:
- [ ] Google Cloud Console で Workspace Marketplace SDK を有効化
- [ ] アプリの設定:
  - アプリの表示設定（個人向け / 組織向け）
  - カテゴリの選択
  - 対応リージョンの設定
- [ ] OAuth 検証の申請（非機密スコープ → 3-5営業日）
- [ ] Marketplace 審査に提出
- [ ] 審査フィードバックへの対応

---

## 優先順位とマイルストーン

### Milestone 1: Drive「アプリで開く」対応（Phase 1）
1. **Issue 2**: OAuth スコープの変更 ← 最初に着手（影響範囲が大きい）
2. **Issue 3**: Google Drive Picker API の導入 ← スコープ変更に伴う対応
3. **Issue 1**: `/open` ルートの追加 ← コア機能
4. **Issue 4**: ファイル保存機能 ← 付加価値
5. **Issue 5**: GCP 設定 ← コード変更後に実施

### Milestone 2: Marketplace 公開（Phase 2）
6. **Issue 6**: 本番デプロイ環境
7. **Issue 7**: リスティング用アセット
8. **Issue 8**: Marketplace SDK 設定と申請

---

## リスクと考慮事項

1. **スコープ移行の影響**: `drive.readonly` → `drive.file` で検索・一覧機能が変わる
2. **CASA 監査**: `drive.readonly` を維持する場合、高額な監査が必要
3. **審査期間**: Marketplace 審査は 2-3 週間かかる
4. **ドメイン要件**: localhost では Drive UI Integration は動作しない
5. **既存ユーザーへの影響**: スコープ変更時に再認証が必要

## 参考リンク

- [Drive UI Integration: "Open with"](https://developers.google.com/workspace/drive/api/guides/integrate-open)
- [Drive UI Integration の設定](https://developers.google.com/workspace/drive/api/guides/enable-sdk)
- [Workspace Marketplace への公開](https://developers.google.com/workspace/marketplace/how-to-publish)
- [OAuth スコープの選択](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
- [Marketplace 審査プロセス](https://developers.google.com/workspace/marketplace/about-app-review)
