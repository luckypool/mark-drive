import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { useGoogleAuth, useLanguage } from '../hooks';
import { fetchFileInfo } from '../services/googleDrive';
import { GoogleLogo } from '../components/ui';
import { trackEvent } from '../utils/analytics';
import styles from './OpenPage.module.css';

interface DriveOpenState {
  action: 'open' | 'create';
  ids: string[];
  resourceKeys?: Record<string, string>;
  userId: string;
}

function parseDriveState(raw: string | null): DriveOpenState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray(parsed.ids) &&
      parsed.ids.length > 0
    ) {
      return parsed as DriveOpenState;
    }
    return null;
  } catch {
    return null;
  }
}

export default function OpenPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading, accessToken, authenticate } = useGoogleAuth();
  const { t } = useLanguage();

  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const stateParam = searchParams.get('state');
  const driveState = parseDriveState(stateParam);
  const fileId = driveState?.ids[0] ?? null;

  const openFile = useCallback(async () => {
    if (!fileId || !accessToken) return;

    setIsRedirecting(true);
    setError(null);

    try {
      const info = await fetchFileInfo(accessToken, fileId);
      const name = info?.name ?? `${fileId}.md`;
      trackEvent('open_drive_file', { source: 'open_with' });
      navigate(`/viewer?id=${encodeURIComponent(fileId)}&name=${encodeURIComponent(name)}&source=google-drive`, {
        replace: true,
      });
    } catch {
      setError(t.open.error);
      setIsRedirecting(false);
    }
  }, [fileId, accessToken, navigate, t.open.error]);

  // 認証済みでファイル ID がある場合、自動的にファイルを開く
  useEffect(() => {
    if (isAuthenticated && fileId && accessToken && !isRedirecting && !error) {
      openFile();
    }
  }, [isAuthenticated, fileId, accessToken, isRedirecting, error, openFile]);

  // state パラメータが無効な場合
  if (!driveState) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{t.open.invalidState}</p>
            <div className={styles.actions}>
              <Link to="/" className={styles.homeLink}>
                {t.open.backToHome}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 認証ロード中またはリダイレクト中
  if (isAuthLoading || isRedirecting) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>{t.open.loading}</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <div className={styles.actions}>
              <button
                className={styles.retryButton}
                onClick={() => {
                  setError(null);
                  openFile();
                }}
              >
                {t.open.retry}
              </button>
              <Link to="/" className={styles.homeLink}>
                {t.open.backToHome}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 未認証: サインインプロンプト
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.authPrompt}>
            <p className={styles.authText}>{t.open.signIn}</p>
            <button className={styles.authButton} onClick={authenticate}>
              <GoogleLogo size={18} />
              {t.open.signInButton}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 認証済み: ローディング（useEffect で自動遷移）
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>{t.open.loading}</p>
      </div>
    </div>
  );
}
