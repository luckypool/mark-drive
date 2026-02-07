# セットアップガイド

MarkDrive の開発環境セットアップと Google Cloud Console の設定方法について説明します。

## 前提条件

- Node.js 18 以上
- npm または yarn
- Google アカウント（Google Drive 連携を使用する場合）

## 基本セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/luckypool/mark-drive.git
cd mark-drive
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm start
# または
npm run web
```

ブラウザで http://localhost:8081 を開きます。

> **Note:** Google Drive 連携を使用しない場合は、ここまでの手順でローカルファイルのプレビュー機能が使用できます。

---

## Google Cloud Console の設定

Google Drive からファイルを読み込むには、Google Cloud Console での設定が必要です。

### 1. プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 「プロジェクトを選択」→「新しいプロジェクト」をクリック
3. プロジェクト名を入力（例: `mark-drive`）
4. 「作成」をクリック

### 2. Google Drive API の有効化

1. 左メニューから「APIとサービス」→「ライブラリ」を選択
2. 「Google Drive API」を検索
3. 「有効にする」をクリック

### 3. OAuth 同意画面の設定

1. 「APIとサービス」→「OAuth 同意画面」に移動
2. **User Type** を選択:
   - **External**: 一般公開する場合
   - **Internal**: Google Workspace 組織内のみの場合
3. 「作成」をクリック
4. アプリ情報を入力:
   - アプリ名: `MarkDrive`
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
5. 「保存して次へ」をクリック
6. **スコープ** の追加:
   - 「スコープを追加または削除」をクリック
   - `https://www.googleapis.com/auth/drive.readonly` を追加
7. **テストユーザー** の追加（External の場合）:
   - 「Add Users」をクリック
   - テストに使用する Google アカウントのメールアドレスを追加

### 4. OAuth 2.0 クライアント ID の作成

1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「OAuth クライアント ID」を選択
3. **アプリケーションの種類**: 「ウェブ アプリケーション」を選択
4. **名前**: `MarkDrive Web Client`
5. **承認済みの JavaScript 生成元** を追加:
   - `http://localhost:8081`（開発用）
   - `https://your-domain.vercel.app`（本番用）
6. 「作成」をクリック
7. 表示された **クライアント ID** をコピー

### 5. API キーの作成

1. 「認証情報を作成」→「API キー」を選択
2. 作成された API キーをコピー
3. **API キーの制限**（推奨）:
   - 「キーを制限」をクリック
   - **API の制限**: 「キーを制限」を選択し、「Google Drive API」のみを許可

### 6. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成:

```bash
cp .env.example .env
```

`.env` ファイルを編集:

```env
EXPO_PUBLIC_GOOGLE_API_KEY=your_api_key_here
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_web_client_id_here
```

---

## デプロイ

### Vercel へのデプロイ

1. [Vercel](https://vercel.com) でプロジェクトをインポート
2. 環境変数を設定:
   - `EXPO_PUBLIC_GOOGLE_API_KEY`
   - `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
3. デプロイ後、Google Cloud Console で本番ドメインを「承認済みの JavaScript 生成元」に追加

### ビルド

```bash
npm run build
```

`dist/` ディレクトリに静的ファイルが生成されます。

---

## トラブルシューティング

### 「このアプリは確認されていません」エラー

OAuth 同意画面で「公開ステータス」が「テスト中」の場合、テストユーザーとして登録されたアカウントのみがログインできます。

**解決方法:**
- テストユーザーにアカウントを追加する
- または、OAuth 同意画面を「本番環境」に公開する（Google の審査が必要）

### API キーのエラー

```
The request is missing a valid API key
```

**解決方法:**
- `.env` ファイルに `EXPO_PUBLIC_GOOGLE_API_KEY` が設定されているか確認
- 開発サーバーを再起動

### CORS エラー

```
Access to fetch has been blocked by CORS policy
```

**解決方法:**
- Google Cloud Console で「承認済みの JavaScript 生成元」に正しいドメインが追加されているか確認
