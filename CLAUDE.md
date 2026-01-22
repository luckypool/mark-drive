# CLAUDE.md - MD Viewer v2 プロジェクト設定

このファイルは Claude Code がプロジェクトを理解するためのガイドです。

## プロジェクト概要

Google Drive に保存された Markdown ファイルをプレビューするアプリケーション。
Expo + React Native Web で Web / iOS / Android に対応。

### 技術スタック

- **フレームワーク**: Expo SDK 54 + React Native 0.81
- **ルーティング**: Expo Router 6
- **言語**: TypeScript 5.9
- **主要ライブラリ**:
  - react-markdown / react-native-markdown-display - Markdown レンダリング
  - expo-auth-session - Native OAuth
  - expo-document-picker - ファイル選択
  - expo-print / expo-sharing - PDF 出力・共有

## 開発コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm start        # 全プラットフォーム
npm run web      # Web のみ
npm run ios      # iOS のみ
npm run android  # Android のみ

# 型チェック
npx tsc --noEmit
```

## プロジェクト構造

```
md-viewer/
├── app/                      # Expo Router
│   ├── _layout.tsx           # ルートレイアウト
│   ├── index.tsx             # ホーム画面
│   ├── viewer.tsx            # Markdown 表示
│   └── search.tsx            # Google Drive 検索
├── src/
│   ├── components/
│   │   ├── ui/               # 共通 UI コンポーネント
│   │   └── markdown/         # Markdown レンダラー（プラットフォーム別）
│   ├── hooks/                # カスタムフック（プラットフォーム別）
│   │   ├── useGoogleAuth     # Google OAuth
│   │   ├── useFilePicker     # ファイル選択
│   │   └── useShare          # PDF 出力・共有
│   ├── services/             # サービス層
│   │   ├── storage.ts        # ストレージ抽象化
│   │   ├── fileHistory.ts    # ファイル履歴
│   │   └── googleDrive.ts    # Drive API
│   ├── theme/                # テーマ定義
│   └── types/                # 型定義
├── app.json                  # Expo 設定
└── package.json
```

## コーディング規約

### プラットフォーム別実装

- Web 専用: `*.web.ts` / `*.web.tsx`
- Native 専用: `*.native.ts` / `*.native.tsx`
- 共通エントリ: `*.ts` / `*.tsx` で適切なものを re-export

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
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx      # iOS 用（オプション）
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx  # Android 用（オプション）
```

## 重要な注意事項

1. **プラットフォーム分岐**: ファイル拡張子で自動分岐（Metro bundler）
2. **OAuth**: Web は GIS、Native は expo-auth-session を使用
3. **ストレージ**: Web は localStorage、Native は AsyncStorage
4. **セキュリティ**: API キーは環境変数から読み込み
