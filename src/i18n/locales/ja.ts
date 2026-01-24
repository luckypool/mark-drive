/**
 * Japanese translations
 */

import type { Translations } from './en';

export const ja: Translations = {
  // Home Screen
  home: {
    welcome: 'MD Viewerへようこそ',
    subtitle: 'Google Drive用\nMarkdownビューア',
    feature: {
      drive: {
        title: 'Google Drive連携',
        desc: 'Google Driveから直接Markdownファイルを検索・表示',
      },
      rendering: {
        title: '美しいレンダリング',
        desc: 'シンタックスハイライト、Mermaid図表、美しいタイポグラフィ',
      },
      pdf: {
        title: 'PDF出力',
        desc: 'ドキュメントを美しいPDFとして共有',
      },
    },
    signIn: 'Googleでサインイン',
    or: 'または',
    openLocal: 'ローカルファイルを開く',
    learnMore: 'MD Viewerについて詳しく',
    searchPlaceholder: 'Google Driveを検索...',
    recentFiles: '最近のファイル',
    clear: 'クリア',
    about: 'MD Viewerについて',
    signOut: 'サインアウト',
  },

  // Viewer Screen
  viewer: {
    loading: '読み込み中...',
    retry: '再試行',
    noContent: 'コンテンツがありません',
    authRequired: '認証が必要です。ホームに戻ってサインインしてください。',
    loadFailed: 'ファイルの読み込みに失敗しました',
    errorOccurred: 'エラーが発生しました',
  },

  // Search Screen
  search: {
    placeholder: 'Google Driveを検索...',
    signInPrompt: 'Google Driveを検索するには\nサインインしてください',
    signIn: 'Googleでサインイン',
    emptyTitle: 'Markdownファイルを検索',
    emptyHint: '2文字以上入力して検索を開始',
    minChars: '2文字以上入力してください',
    noResults: '結果が見つかりません',
    noResultsHint: '別のキーワードで検索してみてください',
    resultCount: '{count}件',
    resultsCount: '{count}件',
    privacyTitle: 'プライバシーを守ります',
    privacyDesc: 'ファイルはGoogle Driveから直接取得し、ブラウザ内で表示します。サーバーには一切保存されません。',
  },

  // About Screen
  about: {
    title: 'MD Viewerについて',
    appName: 'MD Viewer',
    version: 'バージョン {version}',
    whatIs: 'MD Viewerとは？',
    description:
      'MD ViewerはGoogle Driveに保存されたMarkdownファイルを美しく表示するWebアプリケーションです。シンタックスハイライト、図表サポート、PDF出力機能により、快適な閲覧体験を提供します。',
    features: '機能',
    feature: {
      drive: {
        title: 'Google Drive連携',
        desc: 'Googleアカウントを接続して、DriveからMarkdownファイルを直接検索。ダウンロード不要でドキュメントにすばやくアクセス。',
      },
      syntax: {
        title: 'シンタックスハイライト',
        desc: 'JavaScript、Python、TypeScriptなど、様々なプログラミング言語のコードブロックをシンタックスハイライト付きで表示。',
      },
      mermaid: {
        title: 'Mermaid図表',
        desc: 'Mermaid記法を使用してフローチャート、シーケンス図などを作成。ドキュメント内で自動的にレンダリング。',
      },
      pdf: {
        title: 'PDF出力',
        desc: 'レンダリングされたMarkdownドキュメントをPDFファイルとして出力。ドキュメント共有や印刷用に最適。',
      },
      local: {
        title: 'ローカルファイル対応',
        desc: 'サインインなしでローカルデバイスからMarkdownファイルを開けます。クイックプレビューやオフライン作業に便利。',
      },
      recent: {
        title: '最近のファイル',
        desc: '最近閲覧したファイルにすばやくアクセス。閲覧履歴はローカルに保存されます。',
      },
    },
    supported: '対応Markdown機能',
    chips: {
      headers: '見出し',
      boldItalic: '太字 / 斜体',
      lists: 'リスト',
      tables: 'テーブル',
      codeBlocks: 'コードブロック',
      links: 'リンク',
      images: '画像',
      blockquotes: '引用',
      taskLists: 'タスクリスト',
      strikethrough: '取り消し線',
      mermaid: 'Mermaid',
      gfm: 'GFM',
    },
    privacy: 'プライバシーとセキュリティ',
    privacyDesc:
      'MD ViewerはGoogle Driveファイルへの読み取り専用アクセスのみを要求します。ドキュメントは当社のサーバーに保存されることはなく、Google Driveから直接取得してブラウザでレンダリングされます。認証トークンはブラウザのローカルストレージに安全に保存されます。',
    license: 'ライセンス',
    licenseDesc: 'MD ViewerはMITライセンスの下で公開されているオープンソースソフトウェアです。',
    viewLicense: 'ライセンスを見る',
    thirdPartyLicenses: 'サードパーティライセンス',
    thirdPartyDesc: 'このアプリケーションは以下のオープンソースライブラリを使用しています。',
    viewThirdPartyLicenses: 'サードパーティライセンスを見る',
    footer: 'Expo と React Native Web で構築',
  },

  // Common
  common: {
    justNow: 'たった今',
    minutesAgo: '{min}分前',
    hoursAgo: '{hours}時間前',
    daysAgo: '{days}日前',
  },

  // Settings Menu
  settings: {
    theme: 'テーマ',
    light: 'ライト',
    dark: 'ダーク',
    language: '言語',
  },

  // Font Settings
  fontSettings: {
    title: '表示設定',
    fontSize: 'フォントサイズ',
    fontFamily: 'フォント',
    small: '小',
    medium: '中',
    large: '大',
    system: 'システム',
    serif: '明朝体',
    sansSerif: 'ゴシック体',
    preview: 'プレビュー',
    previewText: 'あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら。',
  },

  // Menu
  menu: {
    title: 'メニュー',
    account: 'アカウント',
    display: '表示設定',
  },

  // File Info
  fileInfo: {
    title: 'ファイル情報',
    source: 'ソース',
    googleDrive: 'Google Drive',
    local: 'ローカルファイル',
    exportPdf: 'PDF出力',
  },
};
