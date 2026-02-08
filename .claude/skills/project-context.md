# プロジェクトコンテキスト

## アプリケーション概要

MarkDrive は Google Drive に保存された Markdown ファイルをブラウザで表示・編集するための Web アプリケーションです。

### 主要機能

1. **Google Drive 連携**
   - Google Drive API で Markdown ファイルを検索
   - OAuth 2.0 認証でユーザーの Drive にアクセス
   - Drive API でファイル内容を取得

2. **Markdown レンダリング**
   - react-markdown でパース・表示
   - GitHub Flavored Markdown (GFM) サポート
   - シンタックスハイライト付きコードブロック
   - Mermaid ダイアグラム

3. **編集モード**
   - CodeMirror 6 エディタで Markdown を編集
   - File System Access API でローカルファイルを直接上書き保存
   - 未保存変更の検出・確認ダイアログ

4. **PDF 出力**
   - html2pdf.js で Markdown を PDF に変換
   - テーマ・シンタックスハイライトを維持

5. **カスタマイズ**
   - ダーク / ライト / システムテーマ
   - フォントサイズ・書体の設定
   - 日本語 / 英語の多言語対応

6. **ファイル履歴**
   - 最近開いたファイルを最大10件記録
   - ファイルソース（Google Drive / ローカル）を表示

### 技術的な制約

- **ブラウザのみ**: サーバーサイドなし、フルクライアントサイド
- **API キー管理**: 環境変数 (VITE_*) で管理、ビルド時に埋め込み
- **スコープ制限**: `drive.readonly` のみ、ファイル読み取りのみ

## ディレクトリ構造と責務

```
src/
├── main.tsx                 # エントリポイント
├── router.tsx               # React Router ルート定義
├── layouts/
│   └── RootLayout.tsx       # Provider 階層 (Theme, Language, FontSettings) + Outlet
├── pages/                   # ページコンポーネント
│   ├── HomePage.tsx         # ホーム画面（検索・履歴・ランディング）
│   ├── ViewerPage.tsx       # Markdown ビューア / エディタ
│   ├── SearchPage.tsx       # Google Drive 検索
│   ├── AboutPage.tsx        # アプリ情報
│   ├── PrivacyPage.tsx      # プライバシーポリシー
│   ├── TermsPage.tsx        # 利用規約
│   ├── LicensePage.tsx      # ライセンス
│   └── ThirdPartyLicensesPage.tsx  # サードパーティライセンス
├── components/
│   ├── ui/                  # 共通 UI（Button, Card, FAB, IconButton, LoadingSpinner, etc.）
│   ├── editor/              # CodeMirror エディタ
│   └── markdown/            # Markdown レンダラー
├── contexts/                # React Context
│   ├── ThemeContext.tsx      # テーマ（ダーク/ライト/システム）
│   ├── LanguageContext.tsx   # 言語（EN/JA）
│   └── FontSettingsContext.tsx  # フォント設定
├── hooks/                   # カスタムフック
│   ├── useGoogleAuth.ts     # Google 認証・Drive API
│   ├── useFilePicker.ts     # ローカルファイル選択
│   ├── useMarkdownEditor.ts # 編集モード状態管理
│   ├── useShare.ts          # PDF 出力
│   ├── useTheme.ts          # テーマフック
│   ├── useLanguage.ts       # 言語フック
│   └── useAddToHomeScreen.ts # iOS PWA バナー
├── services/                # サービス層
│   ├── storage.ts           # localStorage ラッパー
│   ├── fileHistory.ts       # ファイル履歴管理
│   └── googleDrive.ts       # Drive API ヘルパー
├── styles/
│   └── theme.css            # CSS Variables（--color-*, --spacing-*, etc.）
├── i18n/                    # 国際化（EN/JA）
├── theme/                   # テーマ定義（colors, spacing）
├── types/                   # 型定義
└── utils/                   # ユーティリティ（markdownToHtml, pdfSettings）
```

## コンポーネント関係

```
RootLayout (ThemeProvider, LanguageProvider, FontSettingsProvider)
├── HomePage (useGoogleAuth, useFilePicker)
│   ├── Button (Google Sign-In)
│   ├── FAB (ファイルを開く)
│   └── AddToHomeScreenBanner
├── ViewerPage (useGoogleAuth, useMarkdownEditor, useShare)
│   ├── MarkdownRenderer
│   ├── CodeMirrorEditor
│   └── File Info Dialog (フォント・テーマ設定)
├── SearchPage (useGoogleAuth)
│   └── Search Results → ViewerPage
├── AboutPage
├── PrivacyPage / TermsPage / LicensePage / ThirdPartyLicensesPage
```

## 外部依存関係

### Google APIs

```typescript
// Google Identity Services (OAuth 2.0)
google.accounts.oauth2.initTokenClient
tokenClient.requestAccessToken({ prompt: '', state })

// Google Drive API v3
GET https://www.googleapis.com/drive/v3/files
  ?q=name contains '{query}' and mimeType='text/markdown'
GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media
```

### npm パッケージ

| パッケージ | 用途 |
|-----------|------|
| react + react-dom | UI フレームワーク |
| react-router | ルーティング |
| react-markdown | Markdown → React 変換 |
| remark-gfm | GFM プラグイン |
| react-syntax-highlighter | コードハイライト |
| mermaid | ダイアグラム表示 |
| @codemirror/* | Markdown エディタ |
| html2pdf.js | PDF 出力 |
| react-icons | アイコン（io5） |
| vitest | テストフレームワーク |
| @testing-library/react | コンポーネントテスト |

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| VITE_GOOGLE_API_KEY | Google API キー | ✓ |
| VITE_GOOGLE_CLIENT_ID | OAuth Client ID | ✓ |

## セキュリティ考慮事項

1. **API キーの制限**
   - HTTP リファラーで制限
   - 使用可能な API を制限（Google Drive API のみ）

2. **OAuth スコープ**
   - 最小権限の原則 (drive.readonly のみ)

3. **CSRF 対策**
   - OAuth フローに `state` パラメータ（crypto.randomUUID）を付与

4. **CORS**
   - Google API は CORS 対応済み
