<div align="center">

# MarkDrive

**プライバシーを守る、美しい Markdown ビューア**

Google Drive やローカルに保存された Markdown ファイルを安全にプレビューする Web アプリです。
**ファイルはブラウザ内で直接レンダリング。サーバーには一切保存されません。**

[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)](https://expo.dev/)
[![React Native Web](https://img.shields.io/badge/React%20Native%20Web-0.81-61DAFB?logo=react)](https://necolas.github.io/react-native-web/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Demo](https://mark-drive.com/) · [Documentation](./docs/)

</div>

---

## 特徴

### プライバシーファースト

- **サーバーレス設計**: ファイルは Google Drive から直接取得し、ブラウザ内でレンダリング
- **データ保存なし**: サーバーにファイル内容を送信・保存しません
- **セキュアな認証**: Google OAuth 2.0 による安全な認証

### 美しいレンダリング

- **GitHub Flavored Markdown (GFM)** 完全サポート
- **シンタックスハイライト**: 多言語対応のコードハイライト
- **Mermaid ダイアグラム**: フローチャート、シーケンス図など
- **数式サポート**: KaTeX による数式レンダリング

### 編集モード

- **CodeMirror 6 エディタ**: Markdown シンタックスハイライト付きのエディタ
- **Google Drive 書き戻し**: 編集内容を Google Drive に直接保存
- **未保存検知**: 変更の保存忘れを防ぐ警告表示

### 使いやすさ

- **Google Drive 連携**: ファイル検索・直接プレビュー
- **ローカルファイル対応**: ドラッグ&ドロップでも開ける
- **PDF 出力**: ワンクリックで PDF 変換
- **履歴機能**: 最近使ったファイルに素早くアクセス
- **フルスクリーンモード**: 集中して読むための全画面表示
- **PWA 対応**: iOS Safari でホーム画面に追加可能

### カスタマイズ

- **テーマ切り替え**: ダーク / ライト / システム連動の 3 モード
- **フォント設定**: サイズ・書体を自由に調整
- **多言語対応**: 日本語 / 英語 UI

### キーボードショートカット

| ショートカット | 動作 |
|---------------|------|
| `⌘K` / `Ctrl+K` | 検索画面を開く |
| `E` | 編集モード切り替え |
| `F` | フルスクリーン切り替え |
| `⌘S` / `Ctrl+S` | 編集内容を保存 |
| `Escape` | 検索画面を閉じる |

---

## クイックスタート

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm start
```

ブラウザで http://localhost:8081 を開きます。

> **Note:** Google Drive 連携を使用する場合は、[セットアップガイド](./docs/setup.md)を参照してください。

---

## ドキュメント

詳細なドキュメントは [docs/](./docs/) を参照してください。

- [なぜ MarkDrive か](./docs/why.md) - 解決する課題と提供する価値
- [セットアップガイド](./docs/setup.md) - Google Cloud Console の設定方法
- [アーキテクチャ](./docs/architecture.md) - システム構成と技術スタック
- [機能仕様](./docs/features.md) - 各機能の詳細仕様
- [開発ガイド](./docs/development.md) - 開発環境・テスト・デプロイ
- [プライバシー](./docs/privacy.md) - プライバシーとセキュリティについて

コントリビューションについては [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Expo SDK 54 + React Native Web |
| ルーティング | Expo Router 6 |
| 言語 | TypeScript 5.9 |
| Markdown | react-markdown + remark-gfm |
| エディタ | CodeMirror 6 |
| コードハイライト | react-syntax-highlighter (Prism) |
| ダイアグラム | Mermaid |
| PDF 出力 | html2pdf.js |
| 認証 | Google Identity Services (GIS) |
| API | Google Drive API v3 |

---

## ライセンス

[MIT License](./LICENSE)

Copyright (c) 2025 luckypool
