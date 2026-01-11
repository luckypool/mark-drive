import { useState, useCallback, useEffect, useRef } from 'react';
import { loadScript } from '../utils/loadScript';
import type { UserInfo } from '../types/user';

// 環境変数から設定を取得
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Google API のスコープ
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// Markdown ファイルの MIME タイプ
const MARKDOWN_MIME_TYPES = [
  'text/markdown',
  'text/x-markdown',
  'text/plain',
];

// localStorage のキー
const TOKEN_KEY = 'googleDriveAccessToken';
const TOKEN_EXPIRY_KEY = 'googleDriveTokenExpiry';

interface UseGoogleDriveSearchReturn {
  isLoading: boolean;
  isApiLoaded: boolean;
  isAuthenticated: boolean;
  error: string | null;
  results: DriveFile[];
  userInfo: UserInfo | null;
  search: (query: string) => Promise<void>;
  authenticate: () => void;
  logout: () => void;
  fetchFileContent: (fileId: string, signal?: AbortSignal) => Promise<string | null>;
  clearResults: () => void;
}

// 検索クエリをサニタイズ（シングルクォートをエスケープ）
function sanitizeQuery(query: string): string {
  return query.replace(/'/g, "\\'");
}

// localStorageからトークンを復元する関数
function restoreToken(): { token: string; expiry: number } | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (token && expiryStr) {
      const expiry = Number(expiryStr);
      // 有効期限が残っている場合のみ返す（5分のマージンを持つ）
      if (Date.now() < expiry - 5 * 60 * 1000) {
        return { token, expiry };
      }
    }
  } catch {
    // localStorage へのアクセスエラーは無視
  }
  return null;
}

// localStorageにトークンを保存する関数
function saveToken(token: string, expiresIn: number): void {
  try {
    const expiry = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
  } catch {
    // localStorage へのアクセスエラーは無視
  }
}

// localStorageからトークンを削除する関数
function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch {
    // localStorage へのアクセスエラーは無視
  }
}

// ユーザー情報を取得する関数
async function fetchUserInfo(accessToken: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=user(displayName,emailAddress,photoLink)',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      email: data.user.emailAddress,
      displayName: data.user.displayName,
      photoUrl: data.user.photoLink || null,
    };
  } catch {
    return null;
  }
}

export function useGoogleDriveSearch(): UseGoogleDriveSearchReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DriveFile[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const accessTokenRef = useRef<string | null>(null);
  const tokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(null);
  const pickerInited = useRef(false);
  const gisInited = useRef(false);

  // 初期化時にlocalStorageからトークンを復元
  useEffect(() => {
    const stored = restoreToken();
    if (stored) {
      accessTokenRef.current = stored.token;
      setIsAuthenticated(true);
      // ユーザー情報を取得
      fetchUserInfo(stored.token).then(info => {
        if (info) setUserInfo(info);
      });
    }
  }, []);

  // Google API スクリプトを動的に読み込む
  useEffect(() => {
    const loadGoogleApi = async () => {
      try {
        // Google API クライアントライブラリを読み込み
        await loadScript('https://apis.google.com/js/api.js');
        // Google Identity Services を読み込み
        await loadScript('https://accounts.google.com/gsi/client');

        // gapi.client を初期化
        window.gapi.load('client:picker', async () => {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          pickerInited.current = true;
          checkApisLoaded();
        });

        // Token Client を初期化
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: () => {},
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

  // 認証を行う
  const authenticate = useCallback(() => {
    if (!isApiLoaded) {
      setError('Google APIs not loaded yet');
      return;
    }

    if (tokenClientRef.current) {
      tokenClientRef.current.callback = async (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          setError(`Authentication error: ${response.error}`);
          return;
        }
        accessTokenRef.current = response.access_token;
        // トークンをlocalStorageに保存（expires_inは秒単位）
        saveToken(response.access_token, response.expires_in || 3600);
        setIsAuthenticated(true);
        setError(null);
        // ユーザー情報を取得
        const info = await fetchUserInfo(response.access_token);
        if (info) setUserInfo(info);
      };
      tokenClientRef.current.requestAccessToken({ prompt: '' });
    }
  }, [isApiLoaded]);

  // ログアウト（トークンをクリア & revoke）
  const logout = useCallback(() => {
    // Google のトークンを revoke（次回認証時にアカウント選択画面を表示させる）
    if (accessTokenRef.current && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(accessTokenRef.current, () => {
        console.log('Google token revoked');
      });
    }
    accessTokenRef.current = null;
    setIsAuthenticated(false);
    setResults([]);
    setError(null);
    setUserInfo(null);
    clearStoredToken();
  }, []);

  // Markdown ファイルを検索
  const search = useCallback(async (query: string) => {
    if (!accessTokenRef.current) {
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
      // Markdown ファイルのみを検索するクエリを構築
      const mimeTypeQuery = MARKDOWN_MIME_TYPES
        .map(type => `mimeType='${type}'`)
        .join(' or ');

      // ファイル名で検索（.md または .markdown 拡張子を含む）
      const sanitized = sanitizeQuery(query);
      const searchQuery = `(${mimeTypeQuery}) and (name contains '${sanitized}' or name contains '.md' and fullText contains '${sanitized}') and trashed=false`;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?` +
        new URLSearchParams({
          q: searchQuery,
          fields: 'files(id,name,mimeType,modifiedTime,size,iconLink,webViewLink,owners)',
          pageSize: '20',
          orderBy: 'modifiedTime desc',
        }),
        {
          headers: {
            Authorization: `Bearer ${accessTokenRef.current}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();

      // .md または .markdown 拡張子でフィルタリング
      const filteredFiles = (data.files || []).filter((file: DriveFile) =>
        file.name.toLowerCase().endsWith('.md') ||
        file.name.toLowerCase().endsWith('.markdown')
      );

      setResults(filteredFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ファイル内容を取得
  const fetchFileContent = useCallback(async (fileId: string, signal?: AbortSignal): Promise<string | null> => {
    if (!accessTokenRef.current) {
      setError('No access token available');
      return null;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessTokenRef.current}`,
          },
          signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      return await response.text();
    } catch (err) {
      // AbortError の場合は再スロー（呼び出し側で処理）
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch file content');
      console.error('Error fetching file content:', err);
      return null;
    }
  }, []);

  // 検索結果をクリア
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    isLoading,
    isApiLoaded,
    isAuthenticated,
    error,
    results,
    userInfo,
    search,
    authenticate,
    logout,
    fetchFileContent,
    clearResults,
  };
}

