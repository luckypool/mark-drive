/**
 * Google OAuth 認証 hook - Native 版
 * expo-auth-session を使用
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { UserInfo } from '../types/user';
import type { DriveFile } from '../types/googleDrive';
import {
  fetchUserInfo,
  searchMarkdownFiles,
  fetchFileContent as fetchDriveFileContent,
} from '../services/googleDrive';
import { storage } from '../services/storage';

// WebBrowser の設定
WebBrowser.maybeCompleteAuthSession();

// 環境変数から設定を取得
const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

// Google API のスコープ
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

// ストレージのキー
const TOKEN_KEY = 'googleDriveAccessToken';
const TOKEN_EXPIRY_KEY = 'googleDriveTokenExpiry';
const REFRESH_TOKEN_KEY = 'googleDriveRefreshToken';

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
    await storage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // エラーは無視
  }
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

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(true); // Native では常に true
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DriveFile[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const accessTokenRef = useRef<string | null>(null);

  // Google OAuth 設定
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

  // プラットフォームに応じたクライアント ID を選択
  const platformClientId = (() => {
    const { Platform } = require('react-native');
    if (Platform.OS === 'ios' && IOS_CLIENT_ID) return IOS_CLIENT_ID;
    if (Platform.OS === 'android' && ANDROID_CLIENT_ID) return ANDROID_CLIENT_ID;
    return CLIENT_ID;
  })();

  // リダイレクト URI を取得
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'mdviewer',
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: platformClientId,
      scopes: SCOPES,
      responseType: AuthSession.ResponseType.Token,
      redirectUri,
    },
    discovery
  );

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

  // 認証レスポンスを処理
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        accessTokenRef.current = authentication.accessToken;
        saveToken(
          authentication.accessToken,
          authentication.expiresIn || 3600
        );
        setIsAuthenticated(true);
        setError(null);
        fetchUserInfo(authentication.accessToken).then((info) => {
          if (info) setUserInfo(info);
        });
      }
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Authentication failed');
    }
  }, [response]);

  // 認証
  const authenticate = useCallback(() => {
    if (!request) {
      setError('Auth request not ready');
      return;
    }

    if (!CLIENT_ID) {
      setError('Google API credentials not configured');
      return;
    }

    promptAsync();
  }, [request, promptAsync]);

  // ログアウト
  const logout = useCallback(async () => {
    // トークンをリボーク
    if (accessTokenRef.current) {
      try {
        await AuthSession.revokeAsync(
          { token: accessTokenRef.current },
          { revocationEndpoint: 'https://oauth2.googleapis.com/revoke' }
        );
      } catch (e) {
        console.log('Token revocation failed:', e);
      }
    }
    accessTokenRef.current = null;
    setIsAuthenticated(false);
    setResults([]);
    setError(null);
    setUserInfo(null);
    await clearStoredToken();
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
