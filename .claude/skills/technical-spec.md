# 技術仕様

## 開発環境

### 必須要件

- Bun 1.2+

### 推奨エディタ設定

- VSCode / Cursor
- ESLint 拡張機能
- TypeScript 拡張機能

## ビルド設定

### Vite 設定

```typescript
// vite.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 8081 },
  preview: { port: 8081 },
})
```

### TypeScript 設定

```json
// tsconfig.app.json (主要設定)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `bun run dev` | 開発サーバー起動 (localhost:8081) |
| `bun run build` | 型チェック + プロダクションビルド |
| `bun run preview` | ビルド結果のプレビュー (localhost:8081) |
| `bun test` | テスト実行 (Vitest) |
| `bun run test:watch` | テスト (watch モード) |
| `bun run test:coverage` | テストカバレッジ |
| `bun run lint` | ESLint チェック |

## コード品質

### ESLint ルール

```javascript
// eslint.config.js
export default [
  // React Hooks ルール
  reactHooks.configs['recommended-latest'],
  // React Refresh ルール
  reactRefresh.configs.vite
]
```

### 型チェック

```bash
# ビルド時に型チェック
bun run build  # tsc -b && vite build
```

## デプロイ

### ビルド成果物

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

### 環境変数の扱い

```typescript
// 開発時: .env ファイルから読み込み
// ビルド時: 環境変数がバンドルに埋め込まれる

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
```

## トラブルシューティング

### Google API 関連

| エラー | 原因 | 対処 |
|--------|------|------|
| `idpiframe_initialization_failed` | 3rd party cookies ブロック | ブラウザ設定を確認 |
| `popup_closed_by_user` | ユーザーがポップアップを閉じた | 正常動作、再試行を促す |
| `access_denied` | スコープ未承認 | OAuth 同意画面を確認 |

### ビルド関連

| エラー | 原因 | 対処 |
|--------|------|------|
| 型エラー | TypeScript strict mode | 型定義を修正 |
| モジュール解決エラー | パス設定 | tsconfig を確認 |
