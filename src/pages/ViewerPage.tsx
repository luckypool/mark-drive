/**
 * MarkDrive - Viewer Page
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router';
import {
  IoChevronBack,
  IoClose,
  IoChevronDown,
  IoCreateOutline,
  IoEyeOutline,
  IoSaveOutline,
  IoExpandOutline,
  IoContractOutline,
  IoAlertCircleOutline,
  IoDocumentOutline,
  IoLogoGoogle,
  IoDownloadOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoLinkOutline,
} from 'react-icons/io5';
import { Button, SettingsMenu, GoogleLogo, OAuthOverlay } from '../components/ui';
import { MarkdownRenderer } from '../components/markdown';
import { useGoogleAuth, useShare, useTheme, useLanguage, useMarkdownEditor, getFileHandle } from '../hooks';
import { CodeMirrorEditor } from '../components/editor/CodeMirrorEditor';
import { addFileToHistory, fetchFileInfo } from '../services';
import { trackEvent } from '../utils/analytics';
import styles from './ViewerPage.module.css';

type ViewerParams = {
  id: string;
  name: string;
  content?: string;
  source: 'google-drive' | 'local';
};

export default function ViewerPage() {
  const { resolvedMode } = useTheme();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    if (location.state && typeof location.state === 'object') {
      for (const [key, value] of Object.entries(location.state as Record<string, string>)) {
        result[key] = value;
      }
    }
    // Default source to google-drive when not provided (shared link)
    if (!result.source) {
      result.source = 'google-drive';
    }
    return result as unknown as ViewerParams;
  }, [searchParams, location.state]);

  const { fetchFileContent, isLoading: isAuthLoading, isAuthenticating, error: authError, accessToken, authenticate, cancelAuth } = useGoogleAuth();
  const { shareContent, isProcessing } = useShare();

  const [content, setContent] = useState<string | null>(params.content || null);
  const [fileName, setFileName] = useState<string>(params.name || '');
  const [linkCopied, setLinkCopied] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  const fileHandle = useMemo(() => getFileHandle(params.id), [params.id]);

  const editor = useMarkdownEditor({
    initialContent: content,
    fileName,
    fileHandle,
    onContentSaved: (newContent) => setContent(newContent),
  });

  const [isLoading, setIsLoading] = useState(!params.content);
  const [error, setError] = useState<string | null>(null);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [headerOpacityValue, setHeaderOpacityValue] = useState(1);
  const hideHeaderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch file name when not provided (shared link)
  useEffect(() => {
    if (!params.name && params.id && params.source === 'google-drive' && accessToken) {
      fetchFileInfo(accessToken, params.id).then((info) => {
        if (info?.name) {
          setFileName(info.name);
        } else {
          setFileName(`${params.id}.md`);
        }
      });
    }
  }, [params.name, params.id, params.source, accessToken]);

  const loadFileContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fileContent = await fetchFileContent(params.id);
      if (fileContent) {
        setContent(fileContent);
      } else {
        setError(t.viewer.loadFailed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.viewer.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFileContent, params.id, t.viewer.loadFailed, t.viewer.errorOccurred]);

  // Add to file history when content and fileName are both available
  useEffect(() => {
    if (content && fileName && params.source === 'google-drive') {
      addFileToHistory({
        id: params.id,
        name: fileName,
        source: 'google-drive',
      });
    }
  }, [content, fileName, params.id, params.source]);

  useEffect(() => {
    if (params.source === 'google-drive' && !params.content) {
      if (isAuthLoading) {
        return;
      }
      if (!accessToken) {
        setNeedsAuth(true);
        setIsLoading(false);
        return;
      }
      loadFileContent();
    }
  }, [params.id, params.source, params.content, isAuthLoading, accessToken, loadFileContent]);

  // Fullscreen mode handlers
  const enterFullscreen = useCallback(async () => {
    setIsFullscreen(true);
    setShowHeader(false);
    setHeaderOpacityValue(0);

    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen API not supported or blocked, continue with header-hide mode
      }
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    setIsFullscreen(false);
    setShowHeader(true);
    setHeaderOpacityValue(1);

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore errors
      }
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Handle content tap in fullscreen mode
  const handleContentTap = useCallback(() => {
    if (!isFullscreen) return;

    // Clear existing timeout
    if (hideHeaderTimeout.current) {
      clearTimeout(hideHeaderTimeout.current);
    }

    if (showHeader) {
      // Hide header
      setHeaderOpacityValue(0);
      // After the CSS transition completes, hide the element
      setTimeout(() => setShowHeader(false), 200);
    } else {
      // Show header
      setShowHeader(true);
      // Use requestAnimationFrame to ensure the element is rendered before transitioning
      requestAnimationFrame(() => {
        setHeaderOpacityValue(1);
      });

      // Auto-hide after 3 seconds
      hideHeaderTimeout.current = setTimeout(() => {
        if (isFullscreen) {
          setHeaderOpacityValue(0);
          setTimeout(() => setShowHeader(false), 200);
        }
      }, 3000);
    }
  }, [isFullscreen, showHeader]);

  // Listen for fullscreen change events (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        setShowHeader(true);
        setHeaderOpacityValue(1);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  // Keyboard shortcut: F to toggle fullscreen, E to toggle edit, Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;

      // Ctrl+S / Cmd+S: save in edit mode
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (editor.mode === 'edit' && editor.canSave) {
          e.preventDefault();
          editor.save();
        } else if (editor.mode === 'edit') {
          e.preventDefault();
        }
        return;
      }

      if (isTyping) return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }

      // E: toggle edit mode
      if ((e.key === 'e' || e.key === 'E') && editor.canEdit) {
        e.preventDefault();
        if (editor.hasUnsavedChanges) {
          const confirmed = window.confirm(t.viewer.unsavedChanges);
          if (!confirmed) return;
        }
        editor.toggleMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, editor, t.viewer.unsavedChanges]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideHeaderTimeout.current) {
        clearTimeout(hideHeaderTimeout.current);
      }
    };
  }, []);

  // beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editor.hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editor.hasUnsavedChanges]);

  const handleDownloadPdf = async () => {
    if (content && fileName) {
      setShowFileInfo(false);
      trackEvent('export_pdf');
      await shareContent(content, fileName);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/view?id=${encodeURIComponent(params.id)}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleBack = () => {
    if (editor.hasUnsavedChanges) {
      const confirmed = window.confirm(t.viewer.unsavedChanges);
      if (!confirmed) return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleLinkPress = (url: string) => {
    window.open(url, '_blank');
  };

  const editorStats = useMemo(() => {
    const text = editor.editContent;
    const lines = text ? text.split('\n').length : 0;
    const chars = text ? text.length : 0;
    return { lines, chars };
  }, [editor.editContent]);

  return (
    <div className={styles.container}>
      {/* Header */}
      {(!isFullscreen || showHeader || editor.mode === 'edit') && (
        <div
          className={`${styles.header}${isFullscreen && editor.mode !== 'edit' ? ` ${styles.headerFullscreen}` : ''}`}
          style={{
            opacity: isFullscreen && editor.mode !== 'edit' ? headerOpacityValue : 1,
          }}
        >
          <button
            className={styles.backButton}
            onClick={isFullscreen ? exitFullscreen : handleBack}
            type="button"
          >
            {isFullscreen ? <IoClose size={28} /> : <IoChevronBack size={28} />}
          </button>

          <button
            className={styles.headerTitle}
            onClick={() => setShowFileInfo(true)}
            type="button"
          >
            <span className={styles.fileName}>
              {fileName || t.viewer.loading}
            </span>
            {editor.hasUnsavedChanges && (
              <span className={styles.unsavedDot} />
            )}
            <span className={styles.headerTitleChevron}>
              <IoChevronDown size={16} />
            </span>
          </button>

          <div className={styles.headerActions}>
            {editor.canEdit && (
              <div className={styles.segmentedControl}>
                <button
                  className={`${styles.segmentedTab}${editor.mode === 'edit' ? ` ${styles.segmentedTabActive}` : ''}`}
                  onClick={() => {
                    if (editor.mode !== 'edit') editor.toggleMode();
                  }}
                  type="button"
                >
                  <IoCreateOutline
                    size={14}
                    className={editor.mode === 'edit' ? styles.segmentedIconActive : styles.segmentedIcon}
                  />
                  <span
                    className={`${styles.segmentedLabel}${editor.mode === 'edit' ? ` ${styles.segmentedLabelActive}` : ''}`}
                  >
                    {t.viewer.edit}
                  </span>
                </button>
                <button
                  className={`${styles.segmentedTab}${editor.mode === 'preview' ? ` ${styles.segmentedTabActive}` : ''}`}
                  onClick={() => {
                    if (editor.mode === 'edit') {
                      if (editor.hasUnsavedChanges) {
                        const confirmed = window.confirm(t.viewer.unsavedChanges);
                        if (!confirmed) return;
                      }
                      editor.toggleMode();
                    }
                  }}
                  type="button"
                >
                  <IoEyeOutline
                    size={14}
                    className={editor.mode === 'preview' ? styles.segmentedIconActive : styles.segmentedIcon}
                  />
                  <span
                    className={`${styles.segmentedLabel}${editor.mode === 'preview' ? ` ${styles.segmentedLabelActive}` : ''}`}
                  >
                    {t.viewer.preview}
                  </span>
                </button>
              </div>
            )}
            {editor.mode === 'edit' && (
              <button
                className={styles.headerActionButton}
                onClick={() => editor.save()}
                disabled={!editor.canSave}
                style={{ opacity: editor.canSave ? 1 : 0.4 }}
                type="button"
              >
                <IoSaveOutline
                  size={24}
                  style={{ color: editor.canSave ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                />
              </button>
            )}
            <button
              className={styles.headerActionButton}
              onClick={toggleFullscreen}
              type="button"
            >
              {isFullscreen ? <IoContractOutline size={24} /> : <IoExpandOutline size={24} />}
            </button>
            <SettingsMenu variant="full" />
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>{t.viewer.loading}</span>
        </div>
      ) : needsAuth ? (
        <div className={styles.authPromptContainer}>
          <span className={styles.authPromptText}>{t.viewer.signInToView}</span>
          <button
            className={styles.authButton}
            onClick={authenticate}
            type="button"
          >
            <GoogleLogo size={18} />
            {t.viewer.signInButton}
          </button>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <IoAlertCircleOutline size={48} className={styles.errorIcon} />
          <span className={styles.errorText}>{error}</span>
          <button
            className={styles.retryButton}
            onClick={loadFileContent}
            type="button"
          >
            {t.viewer.retry}
          </button>
        </div>
      ) : content || editor.mode === 'edit' ? (
        editor.mode === 'edit' ? (
          <div className={styles.editorContainer}>
            <CodeMirrorEditor
              value={editor.editContent}
              onChange={editor.setEditContent}
              onSave={() => { if (editor.canSave) editor.save(); }}
              autoFocus
            />
            {/* Footer Status Bar */}
            <div className={styles.editorFooter}>
              <span className={styles.editorFooterText}>
                {t.viewer.linesCount.replace('{lines}', String(editorStats.lines))}
                {' \u00b7 '}
                {t.viewer.charsCount.replace('{chars}', String(editorStats.chars))}
              </span>
              <div className={styles.editorFooterRight}>
                {editor.isSaving && (
                  <>
                    <div className={styles.spinnerSmall} />
                    <span className={styles.editorFooterText}>
                      {t.viewer.saving}
                    </span>
                  </>
                )}
                {editor.saveSuccess && !editor.isSaving && (
                  <>
                    <IoCheckmarkCircle size={14} style={{ color: 'var(--color-accent)' }} />
                    <span className={styles.saveSuccessText}>
                      {t.viewer.saved}
                    </span>
                  </>
                )}
                {editor.saveError && !editor.isSaving && (
                  <>
                    <IoAlertCircle size={14} style={{ color: 'var(--color-error)' }} />
                    <span className={styles.saveErrorText}>
                      {`${t.viewer.saveFailed}: ${editor.saveError}`}
                    </span>
                  </>
                )}
                {editor.hasUnsavedChanges && !editor.isSaving && !editor.saveSuccess && !editor.saveError && (
                  <>
                    <span className={styles.unsavedDotSmall} />
                    <span className={styles.unsavedText}>
                      {t.viewer.unsavedLabel}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={styles.contentPressable}
            onClick={handleContentTap}
          >
            <div
              className={`${styles.scrollView}${isFullscreen ? ` ${styles.scrollViewFullscreen}` : ''}`}
            >
              <div className={isFullscreen ? `${styles.contentContainer} ${styles.fullscreenCard}` : styles.contentContainer}>
                <MarkdownRenderer content={content!} onLinkPress={handleLinkPress} themeMode={resolvedMode} />
              </div>
            </div>
          </div>
        )
      ) : (
        <div className={styles.emptyContainer}>
          <IoDocumentOutline size={48} className={styles.emptyIcon} />
          <span className={styles.emptyText}>{t.viewer.noContent}</span>
        </div>
      )}

      {/* File Info Dialog */}
      {showFileInfo && (
        <div className={styles.dialogOverlay} onClick={() => setShowFileInfo(false)}>
          <div
            className={styles.dialogPanel}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className={styles.dialogHeader}>
              <span className={styles.dialogTitle}>
                {t.fileInfo.title}
              </span>
              <button
                className={styles.dialogClose}
                onClick={() => setShowFileInfo(false)}
                type="button"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* File Info */}
            <div className={`${styles.dialogSection} ${styles.dialogSectionWithBorder}`}>
              <div className={styles.fileInfoRow}>
                {params.source === 'google-drive' ? (
                  <IoLogoGoogle size={20} className={styles.fileInfoIcon} />
                ) : (
                  <IoDocumentOutline size={20} className={styles.fileInfoIcon} />
                )}
                <span className={styles.fileInfoName}>
                  {fileName}
                </span>
              </div>
              <div className={styles.fileInfoRow}>
                <span className={styles.fileInfoLabel}>
                  {t.fileInfo.source}:
                </span>
                <span className={styles.fileInfoValue}>
                  {params.source === 'google-drive' ? t.fileInfo.googleDrive : t.fileInfo.local}
                </span>
              </div>
            </div>

            {/* Copy Link */}
            {params.source === 'google-drive' && (
              <div className={`${styles.dialogSection} ${styles.dialogSectionWithBorder}`}>
                <Button
                  onPress={handleCopyLink}
                  variant="outline"
                  icon={<IoLinkOutline size={20} />}
                  style={{ width: '100%' }}
                >
                  {linkCopied ? t.fileInfo.linkCopied : t.fileInfo.copyLink}
                </Button>
              </div>
            )}

            {/* PDF Export */}
            <div className={`${styles.dialogSection} ${styles.pdfSection}`}>
              <Button
                onPress={handleDownloadPdf}
                disabled={isProcessing || !content}
                loading={isProcessing}
                icon={<IoDownloadOutline size={20} style={{ color: 'var(--color-bg-primary)' }} />}
                style={{ width: '100%' }}
              >
                {t.fileInfo.exportPdf}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OAuth 認証オーバーレイ */}
      <OAuthOverlay
        isAuthenticating={isAuthenticating}
        error={authError}
        onCancel={cancelAuth}
        onRetry={authenticate}
        onDismissError={cancelAuth}
      />
    </div>
  );
}
