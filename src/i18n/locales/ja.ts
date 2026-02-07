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
    fullscreen: '全画面',
    exitFullscreen: '全画面を終了',
    edit: '編集',
    preview: 'プレビュー',
    saving: '保存中...',
    saved: '保存しました',
    saveFailed: '保存に失敗しました',
    unsavedChanges: '未保存の変更があります。破棄しますか？',
    save: '保存',
    reauthRequired: '編集を有効にするには、サインアウトして再度サインインしてください',
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
    recentTitle: '最近更新されたファイル',
    recentHint: '更新日順で表示しています',
    noRecentFiles: 'Markdownファイルが見つかりません',
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
      'MD ViewerはGoogle Driveファイルへの読み取り専用アクセスのみを要求します。ドキュメントは当社のサーバーに保存されることはなく、Google Driveから直接取得してブラウザでレンダリングされます。サービス改善のためGoogle Analyticsによる匿名のアクセス解析を行っています。',
    license: 'ライセンス',
    licenseDesc: 'MD ViewerはMITライセンスの下で公開されているオープンソースソフトウェアです。',
    viewLicense: 'ライセンスを見る',
    thirdPartyLicenses: 'サードパーティライセンス',
    thirdPartyDesc: 'このアプリケーションは以下のオープンソースライブラリを使用しています。',
    viewThirdPartyLicenses: 'サードパーティライセンスを見る',
    viewTerms: '利用規約',
    viewPrivacy: 'プライバシーポリシー',
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

  // Add to Home Screen
  addToHomeScreen: {
    title: 'ホーム画面に追加',
    description: 'MD Viewerをホーム画面に追加してすばやくアクセス',
    instruction: '{shareIcon} をタップして「ホーム画面に追加」を選択',
    dismiss: '今はしない',
  },

  // Legal
  legal: {
    terms: {
      title: '利用規約',
      lastUpdated: '最終更新日: 2025年1月',
      sections: {
        acceptance: {
          title: '1. 利用規約への同意',
          body: 'MD Viewer（以下「本サービス」）にアクセスまたは使用することにより、お客様はこの利用規約に同意したものとみなされます。これらの条件に同意されない場合は、本サービスの使用をお控えください。',
        },
        description: {
          title: '2. サービスの説明',
          body: 'MD Viewerは、Google Driveまたはローカルデバイスに保存されたMarkdownファイルを表示するWebベースのMarkdownビューアです。本サービスはブラウザ内で完全に動作し、お客様のファイルやデータを外部サーバーに保存することはありません。',
        },
        googleApi: {
          title: '3. Google APIの利用',
          body: '本サービスは、読み取り専用権限（drive.readonlyスコープ）でGoogle Drive APIを使用してMarkdownファイルにアクセスします。Google Drive連携を使用することにより、お客様はGoogleの利用規約にも同意するものとします。本サービスは機能に必要な最小限の権限のみを要求します。',
        },
        intellectual: {
          title: '4. 知的財産権',
          body: 'MD ViewerはMITライセンスの下で公開されているオープンソースソフトウェアです。お客様のファイルおよびコンテンツはお客様の所有物です。本サービスは、お客様が閲覧するコンテンツに対していかなる所有権も主張しません。',
        },
        disclaimer: {
          title: '5. 免責事項',
          body: '本サービスは「現状のまま」かつ「利用可能な状態で」提供され、明示的または黙示的を問わず、いかなる種類の保証もありません。本サービスが中断なく、エラーなく、または有害なコンポーネントなく提供されることを保証するものではありません。本サービスの使用はお客様自身の責任において行ってください。',
        },
        changes: {
          title: '6. 規約の変更',
          body: '当社はいつでもこの利用規約を変更する権利を留保します。変更は「最終更新日」の日付を更新することにより反映されます。変更後も本サービスを継続して使用することにより、変更された規約に同意したものとみなされます。',
        },
        contact: {
          title: '7. お問い合わせ',
          body: 'この利用規約に関するご質問は、プロジェクトのGitHubリポジトリをご覧ください。',
          url: 'https://github.com/luckypool/md-viewer/issues',
        },
      },
    },
    privacy: {
      title: 'プライバシーポリシー',
      lastUpdated: '最終更新日: 2025年1月',
      sections: {
        intro: {
          title: '1. はじめに',
          body: 'このプライバシーポリシーは、MD Viewer（以下「本サービス」）がお客様の情報をどのように取り扱うかを説明するものです。私たちはお客様のプライバシーを保護し、データの取り扱いについて透明性を確保することに努めています。',
        },
        collect: {
          title: '2. 保存する情報',
          body: '以下のデータがブラウザのlocalStorageにローカル保存されます。\n\n• Google OAuth認証トークン（Google Driveアクセス用）\n• テーマ設定（ライト/ダーク）\n• フォント設定（サイズとファミリー）\n• 言語設定（英語/日本語）\n• 最近閲覧したファイルの履歴',
        },
        notCollect: {
          title: '3. 収集しない情報',
          body: '以下の情報は収集、保存、送信しません。\n\n• Markdownファイルの内容\n• 個人情報やプロフィールデータ\n• Google Driveのファイル名やファイルID\n\nなお、サービス改善のためGoogle Analyticsを使用し、ページビュー、おおよその地域情報、デバイス・ブラウザの種類などの匿名データを収集しています。',
        },
        google: {
          title: '4. Google APIの利用',
          body: '本サービスはGoogle Drive APIを読み取り専用アクセス（drive.readonlyスコープ）で使用します。これにより、Google DriveからMarkdownファイルを検索して読み取ることができます。ファイルの内容はGoogle Driveからブラウザに直接取得され、他のサーバーに送信されることはありません。',
        },
        storage: {
          title: '5. データの保存',
          body: 'ユーザー設定等のデータはブラウザのlocalStorageにのみ保存されます。ブラウザのローカルストレージをクリアするか、本サービスからサインアウトすることで、いつでも保存されたデータを削除できます。なお、Google Analyticsはアクセス解析のためにCookieを使用します。Cookieはブラウザの設定から削除・無効化できます。',
        },
        thirdParty: {
          title: '6. サードパーティサービス',
          body: '本サービスはファイルアクセスのためにGoogle Drive APIと連携しています。Googleでサインインすると、認証はGoogleのIdentity Servicesによって直接処理されます。また、サービス改善のためGoogle Analyticsを使用しており、匿名のアクセスデータがGoogleに送信されます。Google Analyticsのオプトアウトをご希望の場合は、Google Analytics オプトアウトアドオンをご利用ください。Googleがお客様のデータをどのように取り扱うかについては、Googleのプライバシーポリシーをご確認ください。',
        },
        children: {
          title: '7. お子様のプライバシー',
          body: '本サービスは13歳未満のお子様を対象としていません。13歳未満のお子様から故意に情報を収集することはありません。',
        },
        changes: {
          title: '8. ポリシーの変更',
          body: 'このプライバシーポリシーは随時更新される場合があります。変更は「最終更新日」の日付を更新することにより反映されます。変更後も本サービスを継続して使用することにより、更新されたポリシーに同意したものとみなされます。',
        },
        contact: {
          title: '9. お問い合わせ',
          body: 'このプライバシーポリシーに関するご質問は、プロジェクトのGitHubリポジトリをご覧ください。',
          url: 'https://github.com/luckypool/md-viewer/issues',
        },
      },
    },
  },
};
