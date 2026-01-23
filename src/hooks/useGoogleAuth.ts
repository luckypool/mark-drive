/**
 * Google OAuth 認証 hook
 * プラットフォーム共通のインターフェース
 * 実際の実装は .web.ts / .native.ts で提供
 */

import type { UserInfo } from '../types/user';
import type { DriveFile } from '../types/googleDrive';

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

// Web 実装をエクスポート
export { useGoogleAuth } from './useGoogleAuth.web';
