/**
 * Google Drive API 関連の型定義
 * プラットフォーム共通で使用
 */

/**
 * Google Drive ファイル情報
 */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
  webViewLink?: string;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
  }>;
}

/**
 * Google Drive ファイル一覧レスポンス
 */
export interface DriveFileListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

/**
 * OAuth トークンレスポンス
 */
export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

/**
 * 認証状態
 */
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
}
