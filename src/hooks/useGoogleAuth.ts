/**
 * Google OAuth 認証 hook - Web 版
 * Google Identity Services (GIS) を使用
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { UserInfo } from '../types/user';
import type { DriveFile } from '../types/googleDrive';
import {
  fetchUserInfo,
  searchMarkdownFiles,
  listRecentMarkdownFiles,
  fetchFileContent as fetchDriveFileContent,
} from '../services/googleDrive';
import { storage } from '../services/storage';
import { trackEvent } from '../utils/analytics';

// 環境変数から設定を取得
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID || '';

// Google API のスコープ（Picker で選択したファイルのみアクセス可能 + Drive「アプリで開く」対応）
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install';

// スコープバージョン（スコープ変更時にインクリメントして旧トークンを無効化）
const SCOPE_VERSION = '3'; // v1: drive.readonly → v2: drive.file → v3: +drive.install

// ストレージのキー
const TOKEN_KEY = 'googleDriveAccessToken';
const TOKEN_EXPIRY_KEY = 'googleDriveTokenExpiry';
const SCOPE_VERSION_KEY = 'googleDriveScopeVersion';
const OAUTH_STATE_KEY = 'oauth_state';

// OAuth ポップアップタイムアウト（秒）
const OAUTH_POPUP_TIMEOUT_MS = 60_000;

// Google API の型定義
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: PopupError) => void;
          }) => TokenClient;
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
        setToken: (token: { access_token: string }) => void;
      };
    };
  }
}

interface PopupError {
  type: string;
  message?: string;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string; state?: string }) => void;
  callback: (response: TokenResponse) => void;
}

interface TokenResponse {
  access_token: string;
  error?: string;
  expires_in?: number;
  state?: string;
}

export interface PickerResult {
  id: string;
  name: string;
}

export interface PickerViewSettings {
  ownedByMe: boolean;
  starred: boolean;
}

export const DEFAULT_PICKER_SETTINGS: PickerViewSettings = {
  ownedByMe: false,
  starred: false,
};

export interface OpenDrivePickerOptions {
  settings?: PickerViewSettings;
  locale?: string;
}

export interface UseGoogleAuthReturn {
  isLoading: boolean;
  isApiLoaded: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  accessToken: string | null;
  error: string | null;
  results: DriveFile[];
  recentFiles: DriveFile[];
  userInfo: UserInfo | null;
  search: (query: string) => Promise<void>;
  loadRecentFiles: () => Promise<void>;
  authenticate: () => void;
  cancelAuth: () => void;
  logout: () => void;
  fetchFileContent: (fileId: string, signal?: AbortSignal) => Promise<string | null>;
  clearResults: () => void;
  openDrivePicker: (options?: OpenDrivePickerOptions) => Promise<PickerResult | null>;
}

// スクリプトを動的に読み込む
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// ストレージからトークンを復元（スコープバージョンチェック付き）
async function restoreToken(): Promise<{ token: string; expiry: number } | null> {
  try {
    // スコープバージョンが変わっていたら旧トークンをクリア
    const storedVersion = await storage.getItem(SCOPE_VERSION_KEY);
    if (storedVersion !== SCOPE_VERSION) {
      console.log('[useGoogleAuth] スコープバージョン変更検出、旧トークンをクリア');
      await clearStoredToken();
      await storage.setItem(SCOPE_VERSION_KEY, SCOPE_VERSION);
      return null;
    }

    const token = await storage.getItem(TOKEN_KEY);
    const expiryStr = await storage.getItem(TOKEN_EXPIRY_KEY);
    if (token && expiryStr) {
      const expiry = Number(expiryStr);
      // 有効期限が残っている場合のみ返す（5分のマージン）
      if (Date.now() < expiry - 5 * 60 * 1000) {
        return { token, expiry };
      }
    }
  } catch {
    // エラーは無視
  }
  return null;
}

// トークンを保存（スコープバージョンも記録）
async function saveToken(token: string, expiresIn: number): Promise<void> {
  try {
    const expiry = Date.now() + expiresIn * 1000;
    await storage.setItem(TOKEN_KEY, token);
    await storage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
    await storage.setItem(SCOPE_VERSION_KEY, SCOPE_VERSION);
  } catch {
    // エラーは無視
  }
}

// トークンをクリア
async function clearStoredToken(): Promise<void> {
  try {
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(TOKEN_EXPIRY_KEY);
  } catch {
    // エラーは無視
  }
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isTokenRestored, setIsTokenRestored] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DriveFile[]>([]);
  const [recentFiles, setRecentFiles] = useState<DriveFile[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const tokenClientRef = useRef<TokenClient | null>(null);
  const pickerInited = useRef(false);
  const gisInited = useRef(false);
  const authTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorCallbackRef = useRef<((err: PopupError) => void) | null>(null);

  // 初期化時にトークンを復元
  useEffect(() => {
    console.log('[useGoogleAuth] トークン復元開始');
    restoreToken().then((stored) => {
      console.log('[useGoogleAuth] restoreToken結果:', stored ? 'トークンあり' : 'トークンなし');
      if (stored) {
        console.log('[useGoogleAuth] トークン設定:', stored.token.substring(0, 20) + '...');
        setAccessToken(stored.token);
        setIsAuthenticated(true);
        fetchUserInfo(stored.token).then((info) => {
          console.log('[useGoogleAuth] ユーザー情報:', info);
          if (info) setUserInfo(info);
        });
      }
      setIsTokenRestored(true);
      console.log('[useGoogleAuth] トークン復元完了');
    });
  }, []);

  // Google API スクリプトを読み込む
  useEffect(() => {
    const loadGoogleApi = async () => {
      try {
        await loadScript('https://apis.google.com/js/api.js');
        await loadScript('https://accounts.google.com/gsi/client');

        window.gapi.load('client:picker', async () => {
          try {
            await window.gapi.client.init({
              apiKey: API_KEY,
              discoveryDocs: [
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
              ],
            });
            pickerInited.current = true;
            checkApisLoaded();
          } catch (initErr) {
            console.error('gapi.client.init failed:', initErr);
            setError('Failed to initialize Google API. Check API key referrer settings.');
          }
        });

        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: () => {},
          error_callback: (err: PopupError) => {
            // ref 経由で最新の error_callback を呼ぶ
            errorCallbackRef.current?.(err);
          },
        });
        gisInited.current = true;
        checkApisLoaded();
      } catch (err) {
        setError('Failed to load Google APIs');
        console.error('Error loading Google APIs:', err);
      }
    };

    const checkApisLoaded = () => {
      if (pickerInited.current && gisInited.current) {
        setIsApiLoaded(true);
      }
    };

    if (!API_KEY || !CLIENT_ID) {
      setError('Google API credentials not configured');
      return;
    }

    loadGoogleApi();
  }, []);

  // 認証タイムアウト・状態をクリア
  const clearAuthState = useCallback(() => {
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }
    setIsAuthenticating(false);
  }, []);

  // 認証キャンセル
  const cancelAuth = useCallback(() => {
    clearAuthState();
    setError(null);
  }, [clearAuthState]);

  // 認証
  const authenticate = useCallback(() => {
    if (!isApiLoaded) {
      setError('Google APIs not loaded yet');
      return;
    }

    if (tokenClientRef.current) {
      // iOS Safari / PWA モードでのポップアップブロック検出
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);

      setIsAuthenticating(true);
      setError(null);

      // CSRF対策: state パラメータを生成して保存
      const state = crypto.randomUUID();
      sessionStorage.setItem(OAUTH_STATE_KEY, state);

      // タイムアウト設定（60秒で自動キャンセル）
      authTimeoutRef.current = setTimeout(() => {
        clearAuthState();
        if (isIOS) {
          setError('auth_timeout_ios');
        } else {
          setError('auth_timeout');
        }
      }, OAUTH_POPUP_TIMEOUT_MS);

      tokenClientRef.current.callback = async (response: TokenResponse) => {
        clearAuthState();

        // state パラメータを検証
        const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
        sessionStorage.removeItem(OAUTH_STATE_KEY);

        if (response.state !== expectedState) {
          setError('Authentication failed: invalid state parameter');
          return;
        }

        if (response.error) {
          // access_denied = ユーザーがキャンセルした
          if (response.error === 'access_denied') {
            setError(null);
          } else {
            setError(`Authentication error: ${response.error}`);
          }
          return;
        }
        setAccessToken(response.access_token);
        await saveToken(response.access_token, response.expires_in || 3600);
        setIsAuthenticated(true);
        trackEvent('login', { method: 'Google' });
        setError(null);
        const info = await fetchUserInfo(response.access_token);
        if (info) setUserInfo(info);
      };

      // error_callback を設定（GIS がポップアップを開けなかった場合等に呼ばれる）
      errorCallbackRef.current = (err: PopupError) => {
        clearAuthState();
        if (err.type === 'popup_failed_to_open') {
          if (isIOS && isStandalone) {
            setError('auth_popup_blocked_pwa');
          } else if (isIOS) {
            setError('auth_popup_blocked_ios');
          } else {
            setError('auth_popup_blocked');
          }
        } else if (err.type === 'popup_closed') {
          // ユーザーがポップアップを閉じた - エラー表示不要
          setError(null);
        } else {
          setError(`Authentication error: ${err.type}`);
        }
      };

      try {
        tokenClientRef.current.requestAccessToken({ prompt: '', state });
      } catch {
        clearAuthState();
        if (isIOS && isStandalone) {
          setError('auth_popup_blocked_pwa');
        } else if (isIOS) {
          setError('auth_popup_blocked_ios');
        } else {
          setError('auth_popup_blocked');
        }
      }
    }
  }, [isApiLoaded, clearAuthState]);

  // ログアウト
  const logout = useCallback(() => {
    if (accessToken && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        console.log('Google token revoked');
      });
    }
    setAccessToken(null);
    setIsAuthenticated(false);
    setResults([]);
    setRecentFiles([]);
    setError(null);
    setUserInfo(null);
    clearStoredToken();
  }, [accessToken]);

  // 検索
  const search = useCallback(async (query: string) => {
    if (!accessToken) {
      setError('Please authenticate first');
      return;
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const files = await searchMarkdownFiles(accessToken, query);
      setResults(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // 最近のファイルを取得
  const loadRecentFiles = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const files = await listRecentMarkdownFiles(accessToken);
      setRecentFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recent files');
      console.error('Load recent files error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // ファイル内容を取得
  const fetchFileContent = useCallback(
    async (fileId: string, signal?: AbortSignal): Promise<string | null> => {
      console.log('[fetchFileContent] 開始 fileId:', fileId);
      console.log('[fetchFileContent] accessToken:', accessToken ? accessToken.substring(0, 20) + '...' : 'null');
      console.log('[fetchFileContent] isTokenRestored:', isTokenRestored);
      console.log('[fetchFileContent] isAuthenticated:', isAuthenticated);

      if (!accessToken) {
        console.error('[fetchFileContent] トークンなし!');
        setError('認証が必要です。再度ログインしてください。');
        return null;
      }

      try {
        console.log('[fetchFileContent] API呼び出し開始');
        const result = await fetchDriveFileContent(
          accessToken,
          fileId,
          signal
        );
        console.log('[fetchFileContent] API呼び出し成功, 長さ:', result?.length);
        return result;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }
        console.error('[fetchFileContent] エラー:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch file content'
        );
        return null;
      }
    },
    [accessToken, isTokenRestored, isAuthenticated]
  );

  // 検索結果をクリア
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  // Google Picker を開いてファイルを選択
  const openDrivePicker = useCallback((options?: OpenDrivePickerOptions): Promise<PickerResult | null> => {
    return new Promise((resolve) => {
      if (!accessToken) {
        setError('認証が必要です');
        resolve(null);
        return;
      }

      if (!pickerInited.current) {
        setError('Picker API が読み込まれていません');
        resolve(null);
        return;
      }

      const s = options?.settings ?? DEFAULT_PICKER_SETTINGS;

      const view = new google.picker.DocsView(google.picker.ViewId.DOCS);
      view.setMimeTypes('text/markdown,text/x-markdown,text/plain');
      view.setMode(google.picker.DocsViewMode.LIST);
      view.setOwnedByMe(s.ownedByMe);
      if (s.starred) {
        view.setStarred(true);
      }

      // ビューポートに合わせたサイズ（モバイル対応）
      const width = Math.min(window.innerWidth - 32, 1051);
      const height = Math.min(window.innerHeight - 64, 650);

      // Picker がサードパーティ Cookie に依存せず OAuth トークンで認証できるよう
      // gapi.client にもトークンをセットする
      if (window.gapi?.client) {
        window.gapi.client.setToken({ access_token: accessToken });
      }

      const builder = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(API_KEY)
        .setAppId(APP_ID)
        .setOrigin(window.location.protocol + '//' + window.location.host)
        .setSize(width, height)
        .setCallback((data: google.picker.CallbackData) => {
          if (data.action === google.picker.Action.PICKED && data.docs?.[0]) {
            const doc = data.docs[0];
            resolve({ id: doc.id, name: doc.name });
          } else if (data.action === google.picker.Action.CANCEL) {
            resolve(null);
          }
        })
        .enableFeature(google.picker.Feature.SUPPORT_DRIVES);

      if (options?.locale) {
        builder.setLocale(options.locale);
      }

      const picker = builder.build();
      picker.setVisible(true);
    });
  }, [accessToken]);

  return {
    isLoading: isLoading || !isTokenRestored,
    isApiLoaded,
    isAuthenticated,
    isAuthenticating,
    accessToken,
    error,
    results,
    recentFiles,
    userInfo,
    search,
    loadRecentFiles,
    authenticate,
    cancelAuth,
    logout,
    fetchFileContent,
    clearResults,
    openDrivePicker,
  };
}
