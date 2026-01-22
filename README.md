<div align="center">
  <img src="public/icon.svg" alt="MD Viewer Icon" width="120" height="120">
  
  # MD Viewer
  
  Google Drive やローカルに保存された Markdown ファイルをプレビューする Web アプリです。
  
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
</div>

## 機能

- 📁 Google Drive からファイルを検索・選択
- 💻 ローカルファイルのプレビュー対応
- 👁️ Markdown をリアルタイムプレビュー
- 🎨 シンタックスハイライト付きコードブロック
- 📊 GitHub Flavored Markdown (GFM) サポート
  - テーブル
  - タスクリスト
  - 打ち消し線
- 📈 Mermaid ダイアグラム対応
- 📄 PDF 出力・共有機能（Web Share API 対応）
- 🕐 最近使ったファイルの履歴
- ⌨️ キーボードショートカット（`⌘K` / `Ctrl+K` で検索）

## セットアップ

### 1. 依存パッケージのインストール

```bash
bun install
```

### 2. Google Cloud Console の設定

> **Note:** Google Drive 連携を使用しない場合は、この手順をスキップしてローカルファイルのみでご利用いただけます。

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 以下の API を有効化:
   - **Google Picker API**
   - **Google Drive API**

### 3. OAuth 2.0 クライアント ID の作成

1. **APIs & Services** → **Credentials** に移動
2. **Create Credentials** → **OAuth client ID** を選択
3. **Application type**: Web application
4. **Authorized JavaScript origins** に追加:
   - `http://localhost:5173`（開発用）
   - 本番ドメイン（デプロイ後）
5. **Create** をクリックし、**Client ID** を控える

### 4. API キーの作成

1. **Create Credentials** → **API key** を選択
2. 作成された API キーを控える
3. **API キーを制限** することを推奨:
   - **Application restrictions**: HTTP referrers
   - `http://localhost:5173/*` と本番ドメインを追加
   - **API restrictions**: Google Drive API, Google Picker API

### 5. OAuth 同意画面の設定

1. **APIs & Services** → **OAuth consent screen** に移動
2. **User Type**: External（または Internal、組織内のみの場合）
3. アプリ情報を入力
4. **Scopes**: `https://www.googleapis.com/auth/drive.readonly` を追加
5. テストユーザーを追加（External の場合）

### 6. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成:

```bash
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_APP_ID=your_project_number (optional)
```

### 7. 開発サーバーの起動

```bash
bun dev
```

http://localhost:5173 でアプリにアクセスできます。

## 使い方

### Google Drive から開く

1. 「Google でログイン」ボタンをクリック
2. Google アカウントでログイン
3. `⌘K`（Mac）/ `Ctrl+K`（Windows/Linux）で検索パネルを開く
4. ファイル名を入力して検索
5. ファイルを選択するとプレビューが表示されます

### ローカルファイルを開く

1. 「ローカルファイルを開く」ボタンをクリック
2. Markdown ファイル (`.md`) を選択
3. プレビューが表示されます

### 最近使ったファイル

ログイン後、ホーム画面に最近開いたファイルの履歴が表示されます。
クリックするだけで素早くファイルを開くことができます。

### PDF として出力・共有

1. Markdown ファイルを開いた状態で、共有ボタンをクリック
2. Web Share API 対応デバイス（iOS、Android など）では共有シートが表示されます
3. 非対応デバイスでは PDF ファイルが自動ダウンロードされます

## ビルド

```bash
bun run build
```

`dist/` フォルダに本番用ファイルが生成されます。

## プロジェクト構造

```
md-viewer/
├── src/
│   ├── components/        # React コンポーネント
│   │   ├── MarkdownViewer.tsx   # Markdown 表示
│   │   ├── FABMenu.tsx          # フローティングメニュー
│   │   ├── SearchPanel.tsx      # 検索パネル
│   │   ├── SearchResults.tsx    # 検索結果表示
│   │   └── RecentFilesList.tsx  # 履歴表示
│   ├── hooks/             # カスタムフック
│   │   ├── useGoogleDriveSearch.ts  # Google Drive 連携
│   │   ├── useLocalFilePicker.ts    # ローカルファイル選択
│   │   └── usePdfExport.ts          # PDF 出力・共有
│   ├── types/             # 型定義
│   ├── utils/             # ユーティリティ
│   ├── App.tsx            # メインアプリケーション
│   └── main.tsx           # エントリポイント
├── public/                # 静的ファイル
└── .claude/               # Claude Code 設定
```

## 技術スタック

- **React 19** + **TypeScript**
- **Vite 7** - ビルドツール
- **react-markdown** - Markdown レンダリング
- **remark-gfm** - GFM サポート
- **react-syntax-highlighter** - コードハイライト
- **Mermaid** - ダイアグラム描画
- **html2pdf.js** - PDF 出力
- **Google Drive API** - ファイル検索・取得

## ライセンス

MIT
