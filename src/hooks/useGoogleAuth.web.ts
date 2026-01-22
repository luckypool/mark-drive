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
  fetchFileContent as fetchDriveFileContent,
} from '../services/googleDrive';
import { storage } from '../services/storage';

// 環境変数から設定を取得
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';
const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

// Google API のスコープ
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// ストレージのキー
const TOKEN_KEY = 'googleDriveAccessToken';
const TOKEN_EXPIRY_KEY = 'googleDriveTokenExpiry';

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
          }) => TokenClient;
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
      };
    };
  }
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
  callback: (response: TokenResponse) => void;
}

interface TokenResponse {
  access_token: string;
  error?: string;
  expires_in?: number;
}

export interface UseGoogleAuthReturn {
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

// ストレージからトークンを復元
async function restoreToken(): Promise<{ token: string; expiry: number } | null> {
  try {
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

// トークンを保存
async function saveToken(token: string, expiresIn: number): Promise<void> {
  try {
    const expiry = Date.now() + expiresIn * 1000;
    await storage.setItem(TOKEN_KEY, token);
    await storage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
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
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DriveFile[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const accessTokenRef = useRef<string | null>(null);
  const tokenClientRef = useRef<TokenClient | null>(null);
  const pickerInited = useRef(false);
  const gisInited = useRef(false);

  // 初期化時にトークンを復元
  useEffect(() => {
    restoreToken().then((stored) => {
      if (stored) {
        accessTokenRef.current = stored.token;
        setIsAuthenticated(true);
        fetchUserInfo(stored.token).then((info) => {
          if (info) setUserInfo(info);
        });
      }
    });
  }, []);

  // Google API スクリプトを読み込む
  useEffect(() => {
    const loadGoogleApi = async () => {
      try {
        await loadScript('https://apis.google.com/js/api.js');
        await loadScript('https://accounts.google.com/gsi/client');

        window.gapi.load('client:picker', async () => {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            ],
          });
          pickerInited.current = true;
          checkApisLoaded();
        });

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

  // 認証
  const authenticate = useCallback(() => {
    if (!isApiLoaded) {
      setError('Google APIs not loaded yet');
      return;
    }

    if (tokenClientRef.current) {
      tokenClientRef.current.callback = async (response: TokenResponse) => {
        if (response.error) {
          setError(`Authentication error: ${response.error}`);
          return;
        }
        accessTokenRef.current = response.access_token;
        await saveToken(response.access_token, response.expires_in || 3600);
        setIsAuthenticated(true);
        setError(null);
        const info = await fetchUserInfo(response.access_token);
        if (info) setUserInfo(info);
      };
      tokenClientRef.current.requestAccessToken({ prompt: '' });
    }
  }, [isApiLoaded]);

  // ログアウト
  const logout = useCallback(() => {
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

  // 検索
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
      const files = await searchMarkdownFiles(accessTokenRef.current, query);
      setResults(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ファイル内容を取得
  const fetchFileContent = useCallback(
    async (fileId: string, signal?: AbortSignal): Promise<string | null> => {
      if (!accessTokenRef.current) {
        setError('No access token available');
        return null;
      }

      try {
        return await fetchDriveFileContent(
          accessTokenRef.current,
          fileId,
          signal
        );
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }
        setError(
          err instanceof Error ? err.message : 'Failed to fetch file content'
        );
        console.error('Error fetching file content:', err);
        return null;
      }
    },
    []
  );

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
