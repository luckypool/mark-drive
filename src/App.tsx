import { useState, useCallback, useEffect } from 'react';
import { MarkdownViewer } from './components/MarkdownViewer';
import { SearchPanel } from './components/SearchPanel';
import { RecentFilesList } from './components/RecentFilesList';
import { FABMenu } from './components/FABMenu';
import { useGoogleDriveSearch } from './hooks/useGoogleDriveSearch';
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
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);

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

  // 履歴を読み込む
  useEffect(() => {
    const history = getFileHistory();
    setFileHistory(history);
  }, []);

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
            <div className="empty-icon">📂</div>
            <h2>No file selected</h2>
            <p>Select a Markdown file from Google Drive to preview it here.</p>
            
            {!hasCredentials && (
              <div className="credentials-warning">
                <p>⚠️ Google API credentials not configured.</p>
                <p className="hint">
                  Set <code>VITE_GOOGLE_API_KEY</code> and <code>VITE_GOOGLE_CLIENT_ID</code> in your <code>.env</code> file.
                </p>
              </div>
            )}
            
            {showSample && (
              <button className="sample-button" onClick={handleShowSample}>
                View Sample
              </button>
            )}

            {hasCredentials && fileHistory.length > 0 && (
              <RecentFilesList
                items={fileHistory}
                onFileClick={handleHistoryFileClick}
                onClearHistory={handleClearHistory}
              />
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>MD Viewer • Google Drive Markdown Preview</p>
      </footer>

      <FABMenu
        onSearchClick={() => setIsSearchOpen(true)}
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
