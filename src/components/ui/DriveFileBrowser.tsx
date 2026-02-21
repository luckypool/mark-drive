/**
 * DriveFileBrowser - iOS PWA モードでの Google Picker 代替
 * Drive REST API を使用したアプリ内ファイルブラウザ
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  IoClose,
  IoDocumentTextOutline,
  IoChevronForward,
} from 'react-icons/io5';
import {
  searchMarkdownFiles,
  listRecentMarkdownFiles,
} from '../../services/googleDrive';
import { useLanguage } from '../../hooks';
import type { DriveFile } from '../../types/googleDrive';
import styles from './DriveFileBrowser.module.css';

export interface DriveFileBrowserProps {
  accessToken: string;
  onSelect: (result: { id: string; name: string }) => void;
  onCancel: () => void;
}

export function DriveFileBrowser({
  accessToken,
  onSelect,
  onCancel,
}: DriveFileBrowserProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 初期表示: 最近のファイルを取得
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    listRecentMarkdownFiles(accessToken)
      .then((result) => {
        if (!cancelled) setFiles(result);
      })
      .catch(() => {
        if (!cancelled) setError(t.driveBrowser.error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, t.driveBrowser.error]);

  // 検索: debounce 300ms
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value.trim()) {
        // 空文字の場合は最近のファイルに戻す
        setIsLoading(true);
        setError(null);
        listRecentMarkdownFiles(accessToken)
          .then(setFiles)
          .catch(() => setError(t.driveBrowser.error))
          .finally(() => setIsLoading(false));
        return;
      }

      debounceRef.current = setTimeout(() => {
        setIsLoading(true);
        setError(null);
        searchMarkdownFiles(accessToken, value)
          .then(setFiles)
          .catch(() => setError(t.driveBrowser.error))
          .finally(() => setIsLoading(false));
      }, 300);
    },
    [accessToken, t.driveBrowser.error],
  );

  // debounce タイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // 入力にフォーカス
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape キーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // オーバーレイ背景クリックで閉じる
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [onCancel],
  );

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.panel}>
        {/* ヘッダー */}
        <div className={styles.header}>
          <h2 className={styles.title}>{t.driveBrowser.title}</h2>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            type="button"
            aria-label="Close"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* 検索 */}
        <div className={styles.searchWrapper}>
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="text"
            placeholder={t.driveBrowser.searchPlaceholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* ファイルリスト */}
        <div className={styles.fileList}>
          {!query.trim() && !isLoading && !error && files.length > 0 && (
            <div className={styles.sectionLabel}>
              {t.driveBrowser.recentFiles}
            </div>
          )}

          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>{t.driveBrowser.loading}</span>
            </div>
          )}

          {error && (
            <div className={styles.errorState}>{error}</div>
          )}

          {!isLoading && !error && files.length === 0 && (
            <div className={styles.emptyState}>
              <p className={styles.emptyMessage}>
                {t.driveBrowser.noResults}
              </p>
              <p className={styles.emptyHint}>
                {t.driveBrowser.safariHint}
              </p>
            </div>
          )}

          {!isLoading &&
            !error &&
            files.map((file) => (
              <div
                key={file.id}
                className={styles.fileItem}
                onClick={() => onSelect({ id: file.id, name: file.name })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    onSelect({ id: file.id, name: file.name });
                }}
              >
                <div className={styles.fileIcon}>
                  <IoDocumentTextOutline size={20} />
                </div>
                <span className={styles.fileName}>{file.name}</span>
                <IoChevronForward size={16} className={styles.chevron} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
