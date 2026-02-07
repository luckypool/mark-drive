# CLAUDE.md - MarkDrive v2 プロジェクト設定

このファイルは Claude Code がプロジェクトを理解するためのガイドです。

## プロジェクト概要

Google Drive に保存された Markdown ファイルをプレビュー・編集するアプリケーション。
Expo + React Native Web で Web に対応。

### 技術スタック

- **フレームワーク**: Expo SDK 54 + React Native Web
- **ルーティング**: Expo Router 6
- **言語**: TypeScript 5.9
- **主要ライブラリ**:
  - react-markdown - Markdown レンダリング
  - react-syntax-highlighter - コードハイライト
  - CodeMirror 6 - Markdown エディタ
  - html2pdf.js - PDF 出力
  - mermaid - ダイアグラム表示

## 開発コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm start        # Web
npm run web      # Web

# ビルド
npm run build    # 静的ファイル出力

# 型チェック
npx tsc --noEmit
```

## プロジェクト構造

```
mark-drive/
├── app/                      # Expo Router
│   ├── _layout.tsx           # ルートレイアウト
│   ├── index.tsx             # ホーム画面
│   ├── viewer.tsx            # Markdown 表示・編集
│   └── search.tsx            # Google Drive 検索
├── src/
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
│   ├── theme/                # テーマ定義
│   ├── types/                # 型定義
│   └── utils/                # ユーティリティ
├── app.json                  # Expo 設定
└── package.json
```

## コーディング規約

### TypeScript

- **厳密な型定義**: `any` の使用を避ける
- **型推論の活用**: 明示的な型注釈は必要な場合のみ

### React / React Native

- **Hooks 優先**: カスタムフックでロジックを分離
- **StyleSheet**: インラインスタイルではなく StyleSheet.create を使用
- **テーマ**: `src/theme` の値を使用（ハードコードしない）

## 環境変数

`.env` ファイルで設定（`.env.example` を参照）:

```
EXPO_PUBLIC_GOOGLE_API_KEY=xxx
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxx
```

## 重要な注意事項

1. **Web 専用**: 現在は Web のみ対応（Native は未実装）
2. **OAuth**: Google Identity Services (GIS) を使用
3. **ストレージ**: localStorage を使用
4. **セキュリティ**: API キーは環境変数から読み込み
