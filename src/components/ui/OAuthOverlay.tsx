/**
 * OAuth 認証オーバーレイ
 * 認証中のキャンセルボタンと、エラー時のメッセージ表示を行う
 */

import { useLanguage } from '../../hooks';
import styles from './OAuthOverlay.module.css';

// エラーコード → i18n キーのマッピング
const ERROR_KEY_MAP: Record<string, keyof typeof import('../../i18n/locales/en').en.auth> = {
  auth_timeout: 'timeoutError',
  auth_timeout_ios: 'timeoutErrorIos',
  auth_popup_blocked: 'popupBlocked',
  auth_popup_blocked_ios: 'popupBlockedIos',
  auth_popup_blocked_pwa: 'popupBlockedPwa',
};

// iOS Safari でサードパーティ Cookie のヒントを表示すべきエラー
const IOS_HINT_ERRORS = new Set([
  'auth_timeout_ios',
  'auth_popup_blocked_ios',
  'auth_popup_blocked_pwa',
]);

// PWA モードで「Safari で開く」リンクを表示すべきエラー
const PWA_OPEN_IN_SAFARI_ERRORS = new Set([
  'auth_popup_blocked_pwa',
]);

interface OAuthOverlayProps {
  isAuthenticating: boolean;
  error: string | null;
  onCancel: () => void;
  onRetry: () => void;
  onDismissError: () => void;
}

export function OAuthOverlay({
  isAuthenticating,
  error,
  onCancel,
  onRetry,
  onDismissError,
}: OAuthOverlayProps) {
  const { t } = useLanguage();

  // エラーコードに一致するものがあるかチェック
  const errorKey = error ? ERROR_KEY_MAP[error] : null;

  // 認証中でもエラーでもなければ何も表示しない
  if (!isAuthenticating && !errorKey) {
    return null;
  }

  // エラー表示
  if (errorKey) {
    const showHint = error ? IOS_HINT_ERRORS.has(error) : false;
    const showOpenInSafari = error ? PWA_OPEN_IN_SAFARI_ERRORS.has(error) : false;

    return (
      <div className={styles.overlay} role="dialog" aria-modal="true">
        <div className={styles.errorContent}>
          <p className={styles.errorMessage}>{t.auth[errorKey]}</p>
          {showHint && (
            <p className={styles.hint}>{t.auth.thirdPartyCookieHint}</p>
          )}
          <div className={styles.errorActions}>
            {showOpenInSafari ? (
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.retryButton}
              >
                {t.auth.openInSafari}
              </a>
            ) : (
              <button
                type="button"
                className={styles.retryButton}
                onClick={onRetry}
              >
                {t.viewer.retry}
              </button>
            )}
            <button
              type="button"
              className={styles.dismissButton}
              onClick={onDismissError}
            >
              {t.auth.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 認証中の表示
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.content}>
        <div className={styles.spinner} />
        <p className={styles.message}>{t.auth.authenticating}</p>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          {t.auth.cancel}
        </button>
      </div>
    </div>
  );
}
