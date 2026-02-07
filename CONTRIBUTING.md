# Contributing

MarkDrive へのコントリビューションに関するガイドラインです。

## 開発環境のセットアップ

[開発ガイド](./docs/development.md) を参照してください。

## Issue

バグ報告や機能リクエストは [GitHub Issues](https://github.com/luckypool/mark-drive/issues) で受け付けています。

### バグ報告

以下の情報を含めてください:

- 再現手順
- 期待される動作
- 実際の動作
- ブラウザ・OS のバージョン

### 機能リクエスト

- 解決したい課題や背景
- 提案する解決方法（あれば）

## Pull Request

### ブランチ戦略

- `main` ブランチが本番環境にデプロイされます
- 機能開発は `feat/機能名` ブランチで行います
- バグ修正は `fix/修正内容` ブランチで行います

### PR の作成

1. リポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feat/my-feature`
3. 変更をコミット（[コミットメッセージ規約](#コミットメッセージ規約)に従う）
4. プッシュ: `git push origin feat/my-feature`
5. Pull Request を作成

### コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) に従います:

```
<type>: <description>

[body]
```

**type:**

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの意味に影響しない変更（空白、フォーマット等） |
| `refactor` | バグ修正も機能追加もしないコード変更 |
| `test` | テストの追加・修正 |
| `chore` | ビルドプロセスやツールの変更 |
| `security` | セキュリティに関する変更 |

**例:**

```
feat: Add fullscreen mode to viewer
fix: Resolve PWA standalone mode spacing issues
docs: Update architecture documentation
```

## コーディング規約

### TypeScript

- `any` の使用を避け、適切な型を定義する
- 型推論が可能な場合は明示的な型注釈を省略

### React / React Native

- ロジックはカスタムフックに分離
- `StyleSheet.create` を使用（インラインスタイルは避ける）
- テーマカラーは `src/theme` から参照（ハードコードしない）
- 新しい翻訳キーは `src/i18n/locales/` の en.ts と ja.ts の両方に追加

### ファイル配置

| 種別 | 配置先 |
|------|--------|
| ページ | `app/` |
| UI コンポーネント | `src/components/ui/` |
| Markdown 関連 | `src/components/markdown/` |
| エディタ関連 | `src/components/editor/` |
| カスタムフック | `src/hooks/` |
| サービス層 | `src/services/` |
| 型定義 | `src/types/` |

## ライセンス

コントリビューションは [MIT License](./LICENSE) のもとで提供されます。
