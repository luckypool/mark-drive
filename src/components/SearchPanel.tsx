import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchResults } from './SearchResults';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: DriveFile, content: string) => void;
  // 認証関連のprops（App.tsxから受け取る）
  isApiLoaded: boolean;
  isAuthenticated: boolean;
  authenticate: () => void;
  search: (query: string) => Promise<void>;
  fetchFileContent: (fileId: string, signal?: AbortSignal) => Promise<string | null>;
  isLoading: boolean;
  results: DriveFile[];
  error: string | null;
  clearResults: () => void;
}

export function SearchPanel({
  isOpen,
  onClose,
  onFileSelect,
  isApiLoaded,
  isAuthenticated,
  authenticate,
  search,
  fetchFileContent,
  isLoading,
  results,
  error,
  clearResults,
}: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // パネルが開いたときにフォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ESCキーで閉じる + クリーンアップ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // デバウンスタイマーのクリーンアップ
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      // 進行中のリクエストをキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, onClose]);

  // 入力変更時のハンドラ（デバウンス付き）
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (value.trim()) {
        debounceRef.current = setTimeout(() => {
          search(value);
        }, 300);
      } else {
        clearResults();
      }
    },
    [search, clearResults]
  );

  // ファイル選択ハンドラ
  const handleFileClick = useCallback(
    async (file: DriveFile) => {
      // 前のリクエストをキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoadingContent(true);
      try {
        const content = await fetchFileContent(file.id, abortControllerRef.current.signal);
        if (content) {
          onFileSelect(file, content);
          onClose();
          setQuery('');
          clearResults();
        }
      } catch (err) {
        // キャンセルされた場合は無視
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        throw err;
      } finally {
        setIsLoadingContent(false);
      }
    },
    [fetchFileContent, onFileSelect, onClose, clearResults]
  );

  // パネルを閉じる
  const handleClose = useCallback(() => {
    onClose();
    setQuery('');
    clearResults();
  }, [onClose, clearResults]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="search-overlay" onClick={handleClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Markdown ファイルを検索..."
              value={query}
              onChange={handleInputChange}
              disabled={!isAuthenticated}
            />
            {isLoading && <div className="search-spinner" />}
          </div>
          <button className="search-close-button" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="search-body">
          {!isApiLoaded ? (
            <div className="search-message">
              <div className="search-spinner" />
              <span>Google API を読み込み中...</span>
            </div>
          ) : !isAuthenticated ? (
            <div className="search-auth">
              <p>Google Drive に接続して Markdown ファイルを検索します。</p>
              <button className="search-auth-button" onClick={authenticate}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google で認証
              </button>
            </div>
          ) : error ? (
            <div className="search-error">
              <span>{error}</span>
            </div>
          ) : isLoadingContent ? (
            <div className="search-message">
              <div className="search-spinner" />
              <span>ファイルを読み込み中...</span>
            </div>
          ) : (
            <SearchResults
              results={results}
              query={query}
              onFileClick={handleFileClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
