# CLAUDE.md - MD Viewer プロジェクト設定

このファイルは Claude Code がプロジェクトを理解するためのガイドです。

## プロジェクト概要

Google Drive に保存された Markdown ファイルをプレビューする Web アプリケーション。

### 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite 7
- **Linter**: ESLint 9
- **主要ライブラリ**:
  - react-markdown - Markdown レンダリング
  - remark-gfm - GitHub Flavored Markdown サポート
  - react-syntax-highlighter - コードハイライト
  - Google Picker API / Drive API - ファイル選択・取得

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック + ビルド
npm run build

# Lint チェック
npm run lint

# プレビュー (ビルド後)
npm run preview
```

## プロジェクト構造

```
md-viewer/
├── src/
│   ├── components/     # React コンポーネント
│   │   ├── MarkdownViewer.tsx  # Markdown 表示コンポーネント
│   │   └── PickerButton.tsx    # Google Picker ボタン
│   ├── hooks/          # カスタムフック
│   │   └── useGooglePicker.ts  # Google Picker 連携
│   ├── types/          # 型定義
│   │   └── google.d.ts         # Google API 型定義
│   ├── App.tsx         # メインアプリケーション
│   └── main.tsx        # エントリポイント
├── public/             # 静的ファイル
└── .claude/            # Claude Code 設定
    ├── settings.json   # Claude 設定
    ├── skills/         # スキル定義
    └── commands/       # スラッシュコマンド
```

## コーディング規約

### TypeScript

- **厳密な型定義**: `any` の使用を避け、適切な型を定義する
- **型推論の活用**: 明示的な型注釈は必要な場合のみ
- **関数コンポーネント**: クラスコンポーネントではなく関数コンポーネントを使用

### React

- **Hooks 優先**: カスタムフックでロジックを分離
- **コンポーネント分割**: 単一責任の原則に従う
- **Props の型定義**: interface で明示的に定義

### 命名規則

- **コンポーネント**: PascalCase (`MarkdownViewer`)
- **フック**: `use` プレフィックス (`useGooglePicker`)
- **ファイル**: コンポーネントは PascalCase、その他は camelCase

## 環境変数

`.env` ファイルで以下を設定（機密情報のためコミット不可）:

```
VITE_GOOGLE_API_KEY=xxx
VITE_GOOGLE_CLIENT_ID=xxx
VITE_GOOGLE_APP_ID=xxx
```

## 重要な注意事項

1. **Google API 認証**: OAuth 2.0 を使用、`drive.readonly` スコープのみ
2. **セキュリティ**: API キーは環境変数から読み込み、ハードコードしない
3. **エラーハンドリング**: API エラーは適切にハンドリングしてユーザーに通知
