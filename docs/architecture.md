# アーキテクチャ

MarkDrive のシステム構成と技術的な設計について説明します。

## システム概要

```
┌─────────────────────────────────────────────────────────────┐
│                        ブラウザ                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   MarkDrive (SPA)                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Vite +   │  │  Markdown   │  │   PDF       │  │   │
│  │  │   React    │  │  Renderer   │  │   Export    │  │   │
│  │  │            │  │             │  │             │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │         │                │                │         │   │
│  │         └────────────────┼────────────────┘         │   │
│  │                          │                          │   │
│  │  ┌───────────────────────┴───────────────────────┐  │   │
│  │  │              Google Identity Services          │  │   │
│  │  │                 (OAuth 2.0)                    │  │   │
│  │  └───────────────────────┬───────────────────────┘  │   │
│  └──────────────────────────│───────────────────────────┘   │
│                             │                               │
└─────────────────────────────│───────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Google Drive   │
                    │      API        │
                    └─────────────────┘
```

## プロジェクト構造

```
mark-drive/
├── src/
│   ├── main.tsx                  # エントリーポイント
│   ├── router.tsx                # React Router ルート定義
│   │
│   ├── layouts/
│   │   └── RootLayout.tsx        # Provider 階層 + Outlet
│   │
│   ├── pages/                    # ページコンポーネント
│   │   ├── HomePage.tsx + .module.css
│   │   ├── ViewerPage.tsx + .module.css
│   │   ├── SearchPage.tsx + .module.css
│   │   ├── AboutPage.tsx + .module.css
│   │   ├── PrivacyPage.tsx + .module.css
│   │   ├── TermsPage.tsx + .module.css
│   │   ├── LicensePage.tsx + .module.css
│   │   └── ThirdPartyLicensesPage.tsx + .module.css
│   │
│   ├── components/
│   │   ├── ui/                   # 共通 UI コンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── FAB.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── FontSettingsPanel.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── LanguageToggle.tsx
│   │   │   ├── GoogleLogo.tsx
│   │   │   └── AddToHomeScreenBanner.tsx  # iOS PWA バナー
│   │   ├── editor/
│   │   │   └── CodeMirrorEditor.tsx       # CodeMirror 6 エディタ
│   │   └── markdown/
│   │       └── MarkdownRenderer.tsx       # Markdown レンダラー
│   │
│   ├── contexts/                 # React Context
│   │   ├── ThemeContext.tsx      # テーマ（ダーク/ライト/システム）
│   │   ├── LanguageContext.tsx   # 言語（EN/JA）
│   │   └── FontSettingsContext.tsx # フォント設定
│   │
│   ├── hooks/                    # カスタムフック
│   │   ├── useGoogleAuth.ts      # Google 認証・Drive API
│   │   ├── useFilePicker.ts      # ローカルファイル選択
│   │   ├── useMarkdownEditor.ts  # 編集モード状態管理
│   │   ├── useAddToHomeScreen.ts # iOS PWA バナー制御
│   │   ├── useTheme.ts           # テーマフック
│   │   ├── useLanguage.ts        # 言語フック
│   │   └── useShare.ts           # PDF 出力
│   │
│   ├── styles/                   # グローバルスタイル
│   │   └── theme.css             # CSS Variables によるテーマ定義
│   │
│   ├── i18n/                     # 国際化
│   │   ├── en.ts                 # 英語
│   │   └── ja.ts                 # 日本語
│   │
│   ├── services/                 # サービス層
│   │   ├── storage.ts            # localStorage ラッパー
│   │   ├── fileHistory.ts        # ファイル履歴管理
│   │   └── googleDrive.ts        # Drive API ヘルパー
│   │
│   ├── utils/                    # ユーティリティ
│   │   ├── markdownToHtml.ts     # Markdown → HTML 変換
│   │   └── pdfSettings.ts       # PDF 出力設定
│   │
│   ├── theme/                    # テーマ定義（JS）
│   │   ├── colors.ts             # ダークモードカラー
│   │   ├── lightColors.ts        # ライトモードカラー
│   │   ├── spacing.ts            # スペーシング・フォントサイズ
│   │   └── index.ts
│   │
│   └── types/                    # 型定義
│       ├── index.ts
│       └── markdown.ts
│
├── public/                       # 公開ファイル（ビルド時にコピー）
│   ├── app-preview.svg
│   ├── app-preview-light.svg
│   ├── sitemap.xml
│   └── robots.txt
│
├── docs/                         # ドキュメント
├── index.html                    # HTML エントリーポイント
├── vite.config.ts                # Vite 設定
├── vercel.json                   # Vercel デプロイ設定
└── package.json
```

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Vite | - | ビルドツール・開発サーバー |
| React | 19 | UI ライブラリ |
| React Router | 7 | ルーティング |
| TypeScript | 5.9 | 型安全な開発 |
| CSS Modules | - | コンポーネントスコープのスタイリング |
| CSS Variables | - | テーマ（ダーク/ライト）切り替え |

### Markdown レンダリング

| 技術 | 用途 |
|------|------|
| react-markdown | Markdown → React 変換 |
| remark-gfm | GitHub Flavored Markdown 対応 |
| react-syntax-highlighter | コードブロックのシンタックスハイライト |
| mermaid | ダイアグラム（フローチャート、シーケンス図等） |

### 認証・API

| 技術 | 用途 |
|------|------|
| Google Identity Services | OAuth 2.0 認証 |
| Google Drive API v3 | ファイル検索・取得 |

### エディタ

| 技術 | 用途 |
|------|------|
| @codemirror/view | CodeMirror 6 コアビュー |
| @codemirror/state | エディタ状態管理 |
| @codemirror/lang-markdown | Markdown シンタックスハイライト |
| @codemirror/commands | キーバインディング |
| @codemirror/search | エディタ内検索 |

### テスト

| 技術 | 用途 |
|------|------|
| Vitest | テストランナー |
| @testing-library/react | React コンポーネントテスト |

### その他

| 技術 | 用途 |
|------|------|
| html2pdf.js | PDF 出力 |
| react-icons | アイコン（Ionicons 5） |

## データフロー

### Google Drive ファイル読み込み

```
1. ユーザーが検索クエリを入力
   │
2. useGoogleAuth.search() を呼び出し
   │
3. Google Drive API で Markdown ファイルを検索
   │   GET https://www.googleapis.com/drive/v3/files
   │   q: "name contains 'query' and mimeType='text/markdown'"
   │
4. 検索結果を表示
   │
5. ユーザーがファイルを選択
   │
6. useGoogleAuth.fetchFileContent() でファイル内容を取得
   │   GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media
   │
7. Markdown をブラウザ内でレンダリング
   │
8. 履歴に追加（localStorage）
```

### ローカルファイル読み込み

```
1. ユーザーが「ローカルファイルを開く」をクリック
   │
2. useFilePicker.openPicker() でファイル選択ダイアログを表示
   │
3. File API でファイル内容を読み込み
   │   FileReader.readAsText()
   │
4. Markdown をブラウザ内でレンダリング
   │
5. 履歴に追加（localStorage）
```

### ファイル編集・保存

```
1. ユーザーがプレビュー画面で「Edit」モードに切り替え
   │
2. CodeMirror エディタが Markdown ソースを表示
   │
3. ユーザーが内容を編集
   │   （未保存変更はインジケーターで表示）
   │
4. ⌘S / Ctrl+S または保存ボタンで保存
   │
5. useMarkdownEditor.save() を呼び出し
   │
6. 保存処理（ファイルソースによって異なる）
   │   ├─ ローカルファイル（File System Access API 対応）: 元ファイルを直接上書き
   │   └─ その他: 新しいファイルとしてダウンロード
   │
7. 保存成功メッセージを 3 秒間表示
```

> **Note:** 編集モードはすべてのファイルで利用可能です。ローカルファイルは File System Access API 対応ブラウザで直接上書き保存できます。Google Drive ファイルはダウンロード保存となります。

## 状態管理

### React Context

| Context | 用途 | 永続化 |
|---------|------|--------|
| ThemeContext | ダーク/ライト/システムモード | localStorage |
| LanguageContext | UI 言語（EN/JA） | localStorage |
| FontSettingsContext | フォントサイズ・書体 | localStorage |

### ローカルストレージ

| キー | データ |
|------|--------|
| `markdrive-theme-preference` | `"light"`, `"dark"`, or `"system"` |
| `markdrive-language-preference` | `"en"` or `"ja"` |
| `markdrive-font-settings` | `{ fontSize, fontFamily }` |
| `markdrive-file-history` | ファイル履歴（最大10件） |
| `markdrive-a2hs-dismissed` | ホーム画面追加バナーの非表示タイムスタンプ |
| `googleDriveAccessToken` | Google OAuth アクセストークン |
| `googleDriveTokenExpiry` | トークン有効期限タイムスタンプ |

## セキュリティ

### 認証フロー

1. Google Identity Services (GIS) でポップアップ認証
2. アクセストークンを localStorage に保存（セッション間で維持）
3. 有効期限チェック（5分のマージン）で自動失効
4. リフレッシュトークンは使用しない（有効期限切れ時は再認証）

### API アクセス

- `drive.readonly` スコープ（読み取り専用）
- ファイル内容はサーバーを経由せず、ブラウザから直接取得

### CSRF 対策

- OAuth フローに `state` パラメータを付与し、CSRF 攻撃を防止

詳細は [プライバシー](./privacy.md) を参照してください。
