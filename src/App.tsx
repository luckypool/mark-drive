import { useState, useCallback, useEffect } from 'react';
import { MarkdownViewer } from './components/MarkdownViewer';
import { SearchPanel } from './components/SearchPanel';
import { RecentFilesList } from './components/RecentFilesList';
import { FABMenu } from './components/FABMenu';
import { useGoogleDriveSearch } from './hooks/useGoogleDriveSearch';
import { useLocalFilePicker } from './hooks/useLocalFilePicker';
import {
  getFileHistory,
  addFileToHistory,
  clearFileHistory,
} from './utils/fileHistoryStorage';
import type { FileHistoryItem } from './types/fileHistory';
import './App.css';

// サンプル Markdown（API キーが未設定の場合に表示）
const SAMPLE_MARKDOWN = `# Welcome to MD Viewer

This is a **Google Drive Markdown Viewer** app.

## Features

- 📁 Select Markdown files from Google Drive
- 👁️ Preview with syntax highlighting
- 📊 GitHub Flavored Markdown support
  - Tables
  - Task lists
  - Strikethrough

## Getting Started

1. Set up your Google Cloud Console project
2. Enable the **Google Picker API** and **Google Drive API**
3. Create an OAuth 2.0 Client ID
4. Create an API Key
5. Add credentials to your \`.env\` file:

\`\`\`bash
VITE_GOOGLE_API_KEY=your_api_key
VITE_GOOGLE_CLIENT_ID=your_client_id
\`\`\`

## Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

## Table Example

| Feature | Status |
|---------|--------|
| Markdown Preview | ✅ |
| Code Highlighting | ✅ |
| GFM Support | ✅ |
| Dark Mode | ✅ |

---

> **Note:** This sample is displayed when Google API credentials are not configured.
`;

function App() {
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>(() => getFileHistory());

  // Google Drive Search フック（状態を一元管理）
  const {
    fetchFileContent,
    userInfo,
    isAuthenticated,
    isApiLoaded,
    authenticate,
    logout,
    search,
    isLoading,
    results,
    error,
    clearResults,
  } = useGoogleDriveSearch();

  // ローカルファイルピッカーフック
  const { openPicker: openLocalFilePicker } = useLocalFilePicker();

  // 環境変数チェック
  const hasCredentials = Boolean(
    import.meta.env.VITE_GOOGLE_API_KEY &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID
  );

  useEffect(() => {
    // 認証情報がない場合、数秒後にサンプルを表示
    if (!hasCredentials) {
      const timer = setTimeout(() => setShowSample(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasCredentials]);


  const handleShowSample = () => {
    setMarkdownContent(SAMPLE_MARKDOWN);
    setFileName('sample.md');
    setShowSample(false);
  };

  const handleSearchFileSelect = useCallback(
    (file: DriveFile, content: string) => {
      setMarkdownContent(content);
      setFileName(file.name);
      setShowSample(false);

      // 履歴に保存
      addFileToHistory({ id: file.id, name: file.name });
      const updatedHistory = getFileHistory();
      setFileHistory(updatedHistory);
    },
    []
  );

  // 履歴からファイルを読み込む
  const handleHistoryFileClick = useCallback(
    async (item: FileHistoryItem) => {
      try {
        const content = await fetchFileContent(item.id);
        if (content) {
          setMarkdownContent(content);
          setFileName(item.name);
          setShowSample(false);

          // 履歴を更新（日時を最新に）
          addFileToHistory({ id: item.id, name: item.name });
          const updatedHistory = getFileHistory();
          setFileHistory(updatedHistory);
        }
      } catch (err) {
        console.error('Failed to load file from history:', err);
      }
    },
    [fetchFileContent]
  );

  // 履歴をクリア
  const handleClearHistory = useCallback(() => {
    clearFileHistory();
    setFileHistory([]);
  }, []);

  // ローカルファイルを選択して読み込む
  const handleLocalFileSelect = useCallback(async () => {
    const file = await openLocalFilePicker();
    if (file) {
      setMarkdownContent(file.content);
      setFileName(file.name);
      setShowSample(false);
    }
  }, [openLocalFilePicker]);

  // ファイルを閉じる
  const handleCloseFile = useCallback(() => {
    setMarkdownContent(null);
    setFileName(null);
  }, []);

  // Ctrl/Cmd + K で検索パネルを開く
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <img
              src="/icon.svg"
              alt="MD Viewer"
              className="logo-icon"
              style={{ width: '32px', height: '32px' }}
            />
            MD Viewer
          </h1>
        </div>
      </header>

      <main className="app-main">
        {markdownContent ? (
          <MarkdownViewer 
            content={markdownContent} 
            fileName={fileName || undefined}
            onClose={handleCloseFile}
          />
        ) : (
          <div className="empty-state">
            {!hasCredentials ? (
              // 認証情報未設定
              <>
                <div className="empty-icon">📂</div>
                <h2>Markdownファイルをプレビュー</h2>
                <p>ローカルファイルを選択してプレビューできます</p>
                <button className="local-file-button" onClick={handleLocalFileSelect}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  ローカルファイルを開く
                </button>
                <div className="credentials-warning">
                  <p>Google Drive連携を使用するには:</p>
                  <p className="hint">
                    <code>VITE_GOOGLE_API_KEY</code> と <code>VITE_GOOGLE_CLIENT_ID</code> を <code>.env</code> ファイルに設定してください
                  </p>
                </div>
                {showSample && (
                  <button className="sample-button" onClick={handleShowSample}>
                    View Sample
                  </button>
                )}
              </>
            ) : !isApiLoaded ? (
              // API読み込み中
              <div className="loading-state">
                <div className="loading-spinner" />
                <p>読み込み中...</p>
              </div>
            ) : !isAuthenticated ? (
              // 未ログイン
              <div className="login-prompt">
                <div className="empty-icon">🔐</div>
                <h2>Google Driveに接続</h2>
                <p>ログインしてMarkdownファイルを検索・プレビューしましょう</p>
                <button className="login-button" onClick={authenticate}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Googleでログイン
                </button>
                <div className="login-divider">
                  <span>または</span>
                </div>
                <button className="local-file-button" onClick={handleLocalFileSelect}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  ローカルファイルを開く
                </button>
              </div>
            ) : (
              // ログイン済み
              <div className="search-prompt">
                <div className="home-search-form" onClick={() => setIsSearchOpen(true)}>
                  <svg
                    className="home-search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <span className="home-search-placeholder">Markdownファイルを検索...</span>
                  <kbd className="home-search-kbd">⌘K</kbd>
                </div>
                {fileHistory.length > 0 && (
                  <RecentFilesList
                    items={fileHistory}
                    onFileClick={handleHistoryFileClick}
                    onClearHistory={handleClearHistory}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>MD Viewer • Google Drive Markdown Preview</p>
      </footer>

      <FABMenu
        onSearchClick={() => setIsSearchOpen(true)}
        onLocalFileClick={handleLocalFileSelect}
        userInfo={userInfo}
        isAuthenticated={isAuthenticated}
        isApiLoaded={isApiLoaded}
        onLogin={authenticate}
        onLogout={logout}
      />

      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onFileSelect={handleSearchFileSelect}
        isApiLoaded={isApiLoaded}
        isAuthenticated={isAuthenticated}
        authenticate={authenticate}
        search={search}
        fetchFileContent={fetchFileContent}
        isLoading={isLoading}
        results={results}
        error={error}
        clearResults={clearResults}
      />
    </div>
  );
}

export default App;
