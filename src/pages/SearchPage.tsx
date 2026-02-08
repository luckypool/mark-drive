/**
 * MarkDrive - Search Page
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  IoSearch,
  IoClose,
  IoDocumentTextOutline,
  IoDocumentOutline,
  IoArrowForward,
} from 'react-icons/io5';
import { GoogleLogo } from '../components/ui';
import { useGoogleAuth, useTheme, useLanguage } from '../hooks';
import type { DriveFile } from '../types';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const {
    isLoading,
    isAuthenticated,
    results,
    recentFiles,
    search,
    loadRecentFiles,
    authenticate,
    clearResults,
  } = useGoogleAuth();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      loadRecentFiles();
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loadRecentFiles]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.length >= 2) {
        search(text);
      } else {
        clearResults();
      }
    },
    [search, clearResults]
  );

  const handleSelectFile = useCallback((file: DriveFile) => {
    const params = new URLSearchParams({
      id: file.id,
      name: file.name,
      source: 'google-drive',
    });
    navigate(`/viewer?${params.toString()}`, { replace: true });
  }, [navigate]);

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 30) return date.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US');
    if (days > 0) return t.common.daysAgo.replace('{days}', String(days));
    if (hours > 0) return t.common.hoursAgo.replace('{hours}', String(hours));
    if (minutes > 0) return t.common.minutesAgo.replace('{min}', String(minutes));
    return t.common.justNow;
  };

  const formatFileSize = (sizeString?: string): string => {
    if (!sizeString) return '';
    const bytes = parseInt(sizeString, 10);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderResultItem = (item: DriveFile) => (
    <button
      key={item.id}
      className={styles.resultItem}
      onClick={() => handleSelectFile(item)}
    >
      <div className={styles.resultIcon}>
        <IoDocumentTextOutline size={20} />
      </div>
      <div className={styles.resultContent}>
        <span className={styles.resultName}>{item.name}</span>
        <div className={styles.resultMeta}>
          {item.modifiedTime && (
            <span className={styles.resultMetaText}>
              {formatRelativeTime(item.modifiedTime)}
            </span>
          )}
          {item.size && (
            <span className={styles.resultMetaText}>
              {formatFileSize(item.size)}
            </span>
          )}
        </div>
      </div>
      <span className={styles.resultArrow}>
        <IoArrowForward size={18} />
      </span>
    </button>
  );

  const displayItems = query.length >= 2 ? results : recentFiles;

  return (
    <div className={styles.container}>
      {/* Search Header */}
      <div className={styles.header}>
        <div className={styles.searchInputWrapper}>
          <IoSearch size={20} />
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder={t.search.placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            disabled={!isAuthenticated}
          />
          {isLoading && <div className={styles.spinner} />}
        </div>
        <button className={styles.closeButton} onClick={handleClose}>
          <IoClose size={22} />
        </button>
      </div>

      {/* Search Body */}
      <div className={styles.body} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        {!isAuthenticated ? (
          <div className={styles.authPrompt}>
            <p className={styles.authText}>{t.search.signInPrompt}</p>
            <button className={styles.authButton} onClick={authenticate}>
              <GoogleLogo size={20} />
              <span>{t.search.signIn}</span>
            </button>
          </div>
        ) : query.length === 0 ? (
          recentFiles.length > 0 ? (
            <div className={styles.resultsList}>
              <div className={styles.recentHeader}>
                <h3 className={styles.recentTitle}>{t.search.recentTitle}</h3>
                <p className={styles.recentHint}>{t.search.recentHint}</p>
              </div>
              {recentFiles.map(renderResultItem)}
            </div>
          ) : isLoading ? (
            <div className={styles.emptyState}>
              <div className={styles.spinnerLarge} />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <IoDocumentOutline size={48} />
              </div>
              <h3 className={styles.emptyTitle}>{t.search.noRecentFiles}</h3>
              <p className={styles.emptyHint}>{t.search.emptyHint}</p>
            </div>
          )
        ) : query.length < 2 ? (
          <div className={styles.messageContainer}>
            <p className={styles.messageText}>{t.search.minChars}</p>
          </div>
        ) : results.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <IoDocumentOutline size={48} />
            </div>
            <h3 className={styles.emptyTitle}>{t.search.noResults}</h3>
            <p className={styles.emptyHint}>{t.search.noResultsHint}</p>
          </div>
        ) : (
          <div className={styles.resultsList}>
            {results.length > 0 && (
              <p className={styles.resultsHeader}>
                {results.length === 1
                  ? t.search.resultCount.replace('{count}', '1')
                  : t.search.resultsCount.replace('{count}', String(results.length))}
              </p>
            )}
            {results.map(renderResultItem)}
          </div>
        )}
      </div>
    </div>
  );
}
