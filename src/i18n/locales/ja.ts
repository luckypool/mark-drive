/**
 * Japanese translations
 */

import type { Translations } from './en';

export const ja: Translations = {
  // Home Screen
  home: {
    welcomeLine1: 'Bring',
    welcomeLine2: 'to Google Drive.',
    welcomeHighlight: 'Markdown Previews',
    subtitle: 'Markdownファイルをダウンロードせずに、ブラウザ上でそのまま確認。あなたの Google Drive をもっと便利にアップグレードします。',
    feature: {
      drive: {
        title: 'Google Drive連携',
        desc: 'Drive内のMarkdownファイルを検索・プレビュー。ダウンロード不要',
      },
      rendering: {
        title: 'プロフェッショナルな表示',
        desc: 'GFMテーブル、タスクリスト、美しいタイポグラフィで共有に最適な出力',
      },
      pdf: {
        title: 'PDF出力',
        desc: 'ワンクリックでPDFを生成。レビューやチーム共有に',
      },
      syntax: {
        title: 'シンタックスハイライト',
        desc: '主要プログラミング言語のコードブロックをハイライト表示',
      },
      mermaid: {
        title: 'Mermaid図表',
        desc: 'フローチャート、シーケンス図、ER図を自動レンダリング',
      },
      local: {
        title: 'ローカルファイル対応',
        desc: 'サインインもアップロードも不要。デバイスのファイルをそのまま開けます',
      },
    },
    tagline: 'プライバシー重視。オープンソース。ファイルはブラウザから出ません。',
    previewTitle: '実際の画面',
    previewCaption: 'ダーク・ライトテーマ対応',
    howItWorks: {
      title: '使い方',
      step1: {
        title: '接続',
        desc: 'Googleアカウントでワンクリックサインイン',
      },
      step2: {
        title: '検索',
        desc: 'Drive内のMarkdownファイルを検索・選択',
      },
      step3: {
        title: '表示',
        desc: '美しくレンダリングされたドキュメントを即座に閲覧',
      },
    },
    featuresTitle: '技術ドキュメントに必要なすべて',
    techTitle: 'サーバーレス設計。\nデータはあなたの手元に。',
    stats: {
      clientSide: { value: '100%', label: 'クライアントサイド' },
      serverStorage: { value: '0', label: 'サーバー保存' },
    },
    benefitsTitle: 'なぜMarkDrive？',
    benefit: {
      privacy: {
        title: 'プライバシーファースト',
        desc: 'ファイルはGoogle Driveからブラウザに直接送信。中間サーバーは介在しません。機密文書も安心して閲覧でき、企業のセキュリティポリシーにも準拠します。',
      },
      instant: {
        title: '即時アクセス',
        desc: 'ダウンロード不要、インストール不要、セットアップ不要。Googleでサインインするだけで、すぐにMarkdownプレビューを始められます。',
      },
      beautiful: {
        title: '美しい出力',
        desc: 'シンタックスハイライト、Mermaid図表、GFMテーブル、ワンクリックPDF出力 — エンジニアやテクニカルライターに必要なものがすべて揃っています。',
      },
    },
    closingCta: {
      title: '最初のMarkdownを開いてみよう',
      subtitle: 'Google Driveに無料で接続 — またはローカルファイルで試す。',
    },
    footer: {
      builtWith: 'Vite + React で構築',
      viewOnGithub: 'GitHubで見る',
    },
    signIn: 'Googleでサインイン',
    or: 'または',
    openLocal: 'ローカルファイルを開く',
    searchDrive: 'Google Drive を検索',
    tryNow: '今すぐ試す — サンプルをプレビュー',
    learnMore: 'MarkDriveについて詳しく',
    searchPlaceholder: 'Google Driveを検索...',
    recentFiles: '最近のファイル',
    clear: 'クリア',
    about: 'MarkDriveについて',
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
    linesCount: '{lines} 行',
    charsCount: '{chars} 文字',
    unsavedLabel: '未保存の変更',
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
    pickFile: 'Google Driveから選択',
    pickFileHint: 'Google DriveからMarkdownファイルを選んでください',
  },

  // About Screen
  about: {
    title: 'MarkDriveについて',
    appName: 'MarkDrive',
    version: 'バージョン {version}',
    whatIs: 'MarkDriveとは？',
    description:
      'MarkDriveはGoogle Driveやローカルデバイスに保存されたMarkdownファイルを美しく表示・編集するWebアプリケーションです。シンタックスハイライト、図表サポート、PDF出力機能により、快適な閲覧・編集体験を提供します。',
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
      'MarkDriveはGoogle Driveファイルへの読み取り専用アクセスのみを要求します。ドキュメントは当社のサーバーに保存されることはなく、Google Driveから直接取得してブラウザでレンダリングされます。サービス改善のためGoogle Analyticsによる匿名のアクセス解析を行っています。',
    license: 'ライセンス',
    licenseDesc: 'MarkDriveはMITライセンスの下で公開されているオープンソースソフトウェアです。',
    viewLicense: 'ライセンスを見る',
    thirdPartyLicenses: 'サードパーティライセンス',
    thirdPartyDesc: 'このアプリケーションは以下のオープンソースライブラリを使用しています。',
    viewThirdPartyLicenses: 'サードパーティライセンスを見る',
    viewTerms: '利用規約',
    viewPrivacy: 'プライバシーポリシー',
    footer: 'Vite + React で構築',
  },

  // Open (Drive「アプリで開く」)
  open: {
    loading: 'ファイルを開いています...',
    signIn: 'このファイルを開くにはサインインしてください',
    signInButton: 'Google でサインイン',
    error: 'ファイルを開けませんでした',
    invalidState: 'Google Drive からのリクエストが無効です',
    retry: '再試行',
    backToHome: 'ホームに戻る',
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
    system: 'システム',
    language: '言語',
    english: 'English',
    japanese: '日本語',
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
    picker: 'Google Drive 検索設定',
    pickerOwnedByMe: '自分のファイルのみ',
    pickerStarred: 'スター付きのみ',
    on: 'ON',
    off: 'OFF',
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
    description: 'MarkDriveをホーム画面に追加してすばやくアクセス',
    instruction: '{shareIcon} をタップして「ホーム画面に追加」を選択',
    dismiss: '今はしない',
  },

  // Legal
  legal: {
    terms: {
      title: '利用規約',
      lastUpdated: '最終更新日: 2026年2月',
      sections: {
        acceptance: {
          title: '1. 利用規約への同意',
          body: 'MarkDrive（以下「本サービス」）にアクセスまたは使用することにより、お客様はこの利用規約に同意したものとみなされます。これらの条件に同意されない場合は、本サービスの使用をお控えください。',
        },
        description: {
          title: '2. サービスの説明',
          body: 'MarkDriveは、Google Driveまたはローカルデバイスに保存されたMarkdownファイルを表示・編集するWebベースのMarkdownビューア・エディタです。本サービスはブラウザ内で完全に動作し、お客様のファイルやデータを外部サーバーに保存することはありません。編集機能では、ローカルファイルの直接上書き保存（File System Access API対応ブラウザ）またはダウンロード保存が可能です。',
        },
        googleApi: {
          title: '3. Google APIの利用',
          body: '本サービスは、読み取り専用権限（drive.readonlyスコープ）でGoogle Drive APIを使用してMarkdownファイルにアクセスします。Google Drive連携を使用することにより、お客様はGoogleの利用規約にも同意するものとします。本サービスは機能に必要な最小限の権限のみを要求し、Google Drive上のファイルを変更・書き込みすることはありません。',
        },
        intellectual: {
          title: '4. 知的財産権',
          body: 'MarkDriveはMITライセンスの下で公開されているオープンソースソフトウェアです。お客様のファイルおよびコンテンツはお客様の所有物です。本サービスは、お客様が閲覧するコンテンツに対していかなる所有権も主張しません。',
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
          url: 'https://github.com/luckypool/mark-drive/issues',
        },
      },
    },
    privacy: {
      title: 'プライバシーポリシー',
      lastUpdated: '最終更新日: 2026年2月',
      sections: {
        intro: {
          title: '1. はじめに',
          body: 'このプライバシーポリシーは、MarkDrive（以下「本サービス」）がお客様の情報をどのように取り扱うかを説明するものです。私たちはお客様のプライバシーを保護し、データの取り扱いについて透明性を確保することに努めています。',
        },
        collect: {
          title: '2. 保存する情報',
          body: '以下のデータがブラウザのlocalStorageにローカル保存されます。',
          items: [
            'Google OAuthアクセストークンと有効期限（Google Driveアクセス用、期限切れ時は自動的に無効化）',
            'テーマ設定（ライト/ダーク/システム）',
            'フォント設定（サイズとファミリー）',
            '言語設定（英語/日本語）',
            '最近閲覧したファイルの履歴（ファイルIDと名前のみ、ファイル内容は含みません）',
            'PWAホーム画面バナーの非表示状態',
          ],
        },
        notCollect: {
          title: '3. 収集しない情報',
          body: '以下の情報は収集、保存、送信しません。\n\nなお、サービス改善のためアナリティクスサービス（Google Analytics、Vercel Analytics、Vercel Speed Insights）を使用し、ページビュー、機能の利用状況（ログイン、ファイルを開く、PDF出力などの操作イベント）、おおよその地域情報、デバイス・ブラウザの種類、Web Vitalsパフォーマンス指標などの匿名データを収集しています。これらのイベントにはファイル名・ファイルID・個人情報は含まれません。Vercel AnalyticsおよびSpeed InsightsはCookieを使用せず、個人を特定する情報は収集しません。',
          items: [
            'Markdownファイルの内容',
            '個人情報やプロフィールデータ',
            'Google Driveのファイル名やファイルID',
          ],
        },
        google: {
          title: '4. Google APIの利用',
          body: '本サービスはGoogle Drive APIを読み取り専用アクセス（drive.readonlyスコープ）で使用します。これにより、Google DriveからMarkdownファイルを検索して読み取ることができます。ファイルの内容はGoogle Driveからブラウザに直接取得され、他のサーバーに送信されることはありません。',
        },
        storage: {
          title: '5. データの保存',
          body: 'ユーザー設定等のデータはブラウザのlocalStorageにのみ保存されます。ブラウザのローカルストレージをクリアするか、本サービスからサインアウトすることで、いつでも保存されたデータを削除できます。なお、Google Analyticsはアクセス解析のためにCookieを使用します。Cookieはブラウザの設定から削除・無効化できます。Vercel AnalyticsおよびSpeed InsightsはCookieを使用しません。',
        },
        thirdParty: {
          title: '6. サードパーティサービス',
          body: '本サービスは以下のサードパーティサービスと連携しています。\n\nGoogleおよびVercelがお客様のデータをどのように取り扱うかについては、それぞれのプライバシーポリシーをご確認ください。',
          items: [
            'Google Drive API: ファイルアクセスに使用。Googleでサインインすると、認証はGoogleのIdentity Servicesによって直接処理されます。',
            'Google Analytics: 匿名のアクセス解析（ページビュー・機能の利用状況）に使用。オプトアウトをご希望の場合は、Google Analytics オプトアウトアドオンをご利用ください。',
            'Vercel Analytics: 匿名のページビュー解析に使用。Cookieは使用せず、個人を特定する情報は収集しません。IPアドレスは国・地域の特定にのみ使用され、保存されません。',
            'Vercel Speed Insights: 匿名のパフォーマンス監視（Web Vitals）に使用。Cookieは使用せず、個人を特定する情報は収集しません。',
          ],
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
          url: 'https://github.com/luckypool/mark-drive/issues',
        },
      },
    },
  },
};
