# CLAUDE.md - MarkDrive v2 プロジェクト設定

このファイルは Claude Code がプロジェクトを理解するためのガイドです。

## プロジェクト概要

Google Drive に保存された Markdown ファイルをプレビュー・編集する Web アプリケーション。
Vite + React で構築。

### 技術スタック

- **ビルドツール**: Vite
- **フレームワーク**: React 19
- **ルーティング**: React Router 7
- **言語**: TypeScript 5.9
- **スタイリング**: CSS Modules + CSS Variables
- **主要ライブラリ**:
  - react-markdown - Markdown レンダリング
  - react-syntax-highlighter - コードハイライト
  - CodeMirror 6 - Markdown エディタ
  - html2pdf.js - PDF 出力
  - mermaid - ダイアグラム表示
  - react-icons - アイコン

## 開発コマンド

```bash
# 依存関係インストール
bun install

# 開発サーバー起動
bun run dev

# ビルド（型チェック + Vite ビルド）
bun run build

# プレビュー
bun run preview

# 型チェック
bunx tsc --noEmit

# テスト
bun test
```

## プロジェクト構造

```
mark-drive/
├── src/
│   ├── main.tsx              # エントリポイント
│   ├── router.tsx            # React Router ルート定義
│   ├── layouts/              # レイアウト
│   │   └── RootLayout.tsx    # Provider 階層 + Outlet
│   ├── pages/                # ページコンポーネント
│   │   ├── HomePage.tsx      # ホーム画面
│   │   ├── ViewerPage.tsx    # Markdown 表示・編集
│   │   ├── SearchPage.tsx    # Google Drive 検索
│   │   ├── AboutPage.tsx     # アプリ情報
│   │   └── ...               # Privacy, Terms, License 等
│   ├── components/
│   │   ├── ui/               # 共通 UI コンポーネント
│   │   ├── editor/           # CodeMirror エディタ
│   │   └── markdown/         # Markdown レンダラー
│   ├── contexts/             # React Context（テーマ, 言語, フォント）
│   ├── hooks/                # カスタムフック
│   │   ├── useGoogleAuth     # Google OAuth (GIS)
│   │   ├── useFilePicker     # ファイル選択
│   │   ├── useMarkdownEditor # 編集モード状態管理
│   │   └── useShare          # PDF 出力・共有
│   ├── services/             # サービス層
│   │   ├── storage.ts        # localStorage ラッパー
│   │   ├── fileHistory.ts    # ファイル履歴
│   │   └── googleDrive.ts    # Drive API
│   ├── i18n/                 # 国際化（EN/JA）
│   ├── theme/                # テーマ定義（CSS Variables）
│   ├── types/                # 型定義
│   └── utils/                # ユーティリティ
├── index.html                # Vite エントリ HTML
├── vite.config.ts            # Vite 設定
└── package.json
```

## コーディング規約

### TypeScript

- **厳密な型定義**: `any` の使用を避ける
- **型推論の活用**: 明示的な型注釈は必要な場合のみ

### React

- **Hooks 優先**: カスタムフックでロジックを分離
- **CSS Modules**: コンポーネントごとに `.module.css` を使用
- **CSS Variables**: テーマカラーは `var(--color-*)` を使用（ハードコードしない）
- **react-icons**: アイコンは `react-icons/io5` から直接 import

## 環境変数

`.env` ファイルで設定（`.env.example` を参照）:

```
VITE_GOOGLE_API_KEY=xxx
VITE_GOOGLE_CLIENT_ID=xxx
```

## テスト

- **新規コンポーネント・フック・ユーティリティには必ずテストを追加する**
- テストファイルは対象ファイルと同じディレクトリに `*.test.tsx` / `*.test.ts` として配置
- テストフレームワーク: Vitest + @testing-library/react
- jsdom 環境が必要な場合はファイル先頭に `/** @vitest-environment jsdom */` を記述
- hooks や context の mock パターンは既存テストファイルを参考にする
- `bun test` で全テスト通過、`bun run test:coverage` でカバレッジ確認

## 重要な注意事項

1. **Web 専用**: Vite + React による Web アプリケーション
2. **OAuth**: Google Identity Services (GIS) を使用
3. **ストレージ**: localStorage を使用
4. **セキュリティ**: API キーは環境変数から読み込み
