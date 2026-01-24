# アーキテクチャ

MD Viewer のシステム構成と技術的な設計について説明します。

## システム概要

```
┌─────────────────────────────────────────────────────────────┐
│                        ブラウザ                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   MD Viewer (SPA)                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   React     │  │  Markdown   │  │   PDF       │  │   │
│  │  │   Native    │  │  Renderer   │  │   Export    │  │   │
│  │  │   Web       │  │             │  │             │  │   │
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
md-viewer/
├── app/                          # Expo Router ページ
│   ├── _layout.tsx               # ルートレイアウト（プロバイダー設定）
│   ├── index.tsx                 # ホーム画面
│   ├── viewer.tsx                # Markdown ビューア
│   ├── search.tsx                # Google Drive 検索
│   ├── about.tsx                 # アプリについて
│   ├── license.tsx               # ライセンス
│   └── third-party-licenses.tsx  # サードパーティライセンス
│
├── src/
│   ├── components/
│   │   ├── ui/                   # 共通 UI コンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── FAB.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── FontSettingsPanel.tsx
│   │   └── markdown/
│   │       ├── MarkdownRenderer.tsx      # エントリーポイント
│   │       └── MarkdownRenderer.web.tsx  # Web 実装
│   │
│   ├── contexts/                 # React Context
│   │   ├── ThemeContext.tsx      # テーマ（ダーク/ライト）
│   │   ├── LanguageContext.tsx   # 言語（EN/JA）
│   │   └── FontSettingsContext.tsx # フォント設定
│   │
│   ├── hooks/                    # カスタムフック
│   │   ├── useGoogleAuth.ts      # Google 認証・Drive API
│   │   ├── useFilePicker.ts      # ローカルファイル選択
│   │   ├── useTheme.ts           # テーマフック
│   │   ├── useLanguage.ts        # 言語フック
│   │   └── useShare.ts           # PDF 出力
│   │
│   ├── i18n/                     # 国際化
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.ts             # 英語
│   │       └── ja.ts             # 日本語
│   │
│   ├── services/                 # サービス層
│   │   ├── storage.ts            # localStorage ラッパー
│   │   ├── fileHistory.ts        # ファイル履歴管理
│   │   └── googleDrive.ts        # Drive API ヘルパー
│   │
│   ├── theme/                    # テーマ定義
│   │   ├── colors.ts             # ダークモードカラー
│   │   ├── lightColors.ts        # ライトモードカラー
│   │   ├── spacing.ts            # スペーシング・フォントサイズ
│   │   └── index.ts
│   │
│   └── types/                    # 型定義
│       ├── index.ts
│       └── markdown.ts
│
├── assets/                       # 静的アセット
│   └── images/
│       ├── icon.png
│       ├── logo.png
│       └── ...
│
├── public/                       # 公開ファイル（ビルド時にコピー）
│   ├── app-preview.svg
│   └── app-preview-light.svg
│
├── docs/                         # ドキュメント
├── app.json                      # Expo 設定
├── vercel.json                   # Vercel デプロイ設定
└── package.json
```

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Expo SDK | 54 | React Native フレームワーク |
| React Native Web | 0.81 | Web プラットフォーム対応 |
| Expo Router | 6 | ファイルベースルーティング |
| TypeScript | 5.9 | 型安全な開発 |

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

### その他

| 技術 | 用途 |
|------|------|
| html2pdf.js | PDF 出力 |
| @expo/vector-icons | アイコン |
| react-native-safe-area-context | セーフエリア対応 |

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

## 状態管理

### React Context

| Context | 用途 | 永続化 |
|---------|------|--------|
| ThemeContext | ダーク/ライトモード | localStorage |
| LanguageContext | UI 言語（EN/JA） | localStorage |
| FontSettingsContext | フォントサイズ・書体 | localStorage |

### ローカルストレージ

| キー | データ |
|------|--------|
| `md-viewer-theme` | `"light"` or `"dark"` |
| `md-viewer-language` | `"en"` or `"ja"` |
| `md-viewer-font-settings` | `{ fontSize, fontFamily }` |
| `md-viewer-file-history` | ファイル履歴（最大10件） |

## セキュリティ

### 認証フロー

1. Google Identity Services (GIS) でポップアップ認証
2. アクセストークンをメモリに保持（ストレージに保存しない）
3. リフレッシュトークンは使用しない（セッション単位の認証）

### API アクセス

- Google Drive API へのアクセスは `drive.readonly` スコープのみ
- ファイル内容はサーバーを経由せず、ブラウザから直接取得

詳細は [プライバシー](./privacy.md) を参照してください。
