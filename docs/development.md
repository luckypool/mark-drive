# 開発ガイド

MarkDrive の開発環境セットアップ、テスト、デプロイについて説明します。

## 前提条件

- Node.js 18 以上
- npm
- Google アカウント（Google Drive 連携を使用する場合）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/luckypool/mark-drive.git
cd mark-drive
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集し、Google API キーとクライアント ID を設定します。
取得方法は [セットアップガイド](./setup.md) を参照してください。

```env
EXPO_PUBLIC_GOOGLE_API_KEY=your_api_key_here
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_web_client_id_here
```

> **Note:** Google Drive 連携を使用しない場合は環境変数なしでも起動できます。ローカルファイルのプレビュー機能のみ使用可能です。

### 4. 開発サーバーの起動

```bash
npm start
# または
npm run web
```

ブラウザで http://localhost:8081 を開きます。

## npm スクリプト

| コマンド | 説明 |
|---------|------|
| `npm start` | 開発サーバー起動（Web） |
| `npm run web` | 開発サーバー起動（Web） |
| `npm run build` | 静的ファイルビルド（`dist/` に出力） |
| `npm run build:web` | `build` と同じ |
| `npm run lint` | ESLint によるコード検証 |

## 型チェック

```bash
npx tsc --noEmit
```

## テスト

テストファイルは各モジュールと同じディレクトリに配置されています。

```
src/utils/markdownToHtml.test.ts    # Markdown → HTML 変換テスト
src/utils/pdfSettings.test.ts       # PDF 出力設定テスト
src/services/googleDrive.test.ts    # Google Drive サービステスト
```

## プロジェクト構造の概要

詳細は [アーキテクチャ](./architecture.md) を参照してください。

```
app/          # ページ（Expo Router）
src/
├── components/   # UI コンポーネント
│   ├── ui/       # 汎用 UI（Button, Card 等）
│   ├── editor/   # CodeMirror エディタ
│   └── markdown/ # Markdown レンダラー
├── contexts/     # React Context（テーマ, 言語, フォント）
├── hooks/        # カスタムフック
├── services/     # サービス層（Drive API, Storage）
├── i18n/         # 国際化（EN/JA）
├── theme/        # テーマ定義（カラー, スペーシング）
├── types/        # 型定義
└── utils/        # ユーティリティ
```

## デプロイ

### Vercel

本番環境は Vercel にデプロイされています。`main` ブランチへのマージで自動デプロイされます。

**手動デプロイの場合:**

1. `npm run build` でビルド
2. `dist/` ディレクトリの静的ファイルをホスティング

**環境変数の設定（Vercel）:**

- `EXPO_PUBLIC_GOOGLE_API_KEY`
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`

### Google Cloud Console

デプロイ先ドメインを Google Cloud Console の「承認済みの JavaScript 生成元」に追加する必要があります。詳細は [セットアップガイド](./setup.md) を参照してください。

## トラブルシューティング

### 開発サーバーが起動しない

```bash
# node_modules を再インストール
rm -rf node_modules && npm install
```

### 「このアプリは確認されていません」エラー

OAuth 同意画面が「テスト中」の場合、テストユーザーとして登録されたアカウントのみログイン可能です。テストユーザーの追加方法は [セットアップガイド](./setup.md#3-oauth-同意画面の設定) を参照してください。

### API キーのエラー

```
The request is missing a valid API key
```

- `.env` ファイルに `EXPO_PUBLIC_GOOGLE_API_KEY` が設定されているか確認
- 開発サーバーを再起動（環境変数の変更はサーバー再起動が必要）

### CORS エラー

```
Access to fetch has been blocked by CORS policy
```

- Google Cloud Console の「承認済みの JavaScript 生成元」に `http://localhost:8081` が追加されているか確認

### 編集モードで保存できない

- ローカルファイルの直接上書き保存には File System Access API 対応ブラウザ（Chrome, Edge 等）が必要です
- 非対応ブラウザではダウンロードとして保存されます
- Google Drive ファイルの編集内容はダウンロード保存となります
