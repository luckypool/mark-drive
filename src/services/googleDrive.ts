/**
 * Google Drive API クライアント
 * プラットフォーム共通で使用
 */

import type { DriveFile, DriveFileListResponse } from '../types/googleDrive';
import type { UserInfo } from '../types/user';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

// Markdown ファイルの MIME タイプ
const MARKDOWN_MIME_TYPES = ['text/markdown', 'text/x-markdown', 'text/plain'];

// フォルダの MIME タイプ
const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

/**
 * 検索クエリをサニタイズ（シングルクォートをエスケープ）
 */
function sanitizeQuery(query: string): string {
  return query.replace(/'/g, "\\'");
}

/**
 * ユーザー情報を取得
 */
export async function fetchUserInfo(
  accessToken: string
): Promise<UserInfo | null> {
  try {
    const response = await fetch(
      `${DRIVE_API_BASE}/about?fields=user(displayName,emailAddress,photoLink)`,
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

/**
 * Markdown ファイルを検索
 */
export async function searchMarkdownFiles(
  accessToken: string,
  query: string
): Promise<DriveFile[]> {
  if (!query.trim()) {
    return [];
  }

  // Markdown ファイルのみを検索するクエリを構築
  const mimeTypeQuery = MARKDOWN_MIME_TYPES.map(
    (type) => `mimeType='${type}'`
  ).join(' or ');

  // ファイル名で検索（.md または .markdown 拡張子を含む）
  const sanitized = sanitizeQuery(query);
  const searchQuery = `(${mimeTypeQuery}) and (name contains '${sanitized}' or name contains '.md' and fullText contains '${sanitized}') and trashed=false`;

  const response = await fetch(
    `${DRIVE_API_BASE}/files?` +
      new URLSearchParams({
        q: searchQuery,
        fields:
          'files(id,name,mimeType,modifiedTime,size,iconLink,webViewLink,owners)',
        pageSize: '20',
        orderBy: 'modifiedTime desc',
      }),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  const data: DriveFileListResponse = await response.json();

  // .md または .markdown 拡張子でフィルタリング
  return (data.files || []).filter(
    (file) =>
      file.name.toLowerCase().endsWith('.md') ||
      file.name.toLowerCase().endsWith('.markdown')
  );
}

/**
 * ファイル内容を取得
 */
export async function fetchFileContent(
  accessToken: string,
  fileId: string,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  return await response.text();
}

/**
 * ファイル情報を取得
 */
export async function fetchFileInfo(
  accessToken: string,
  fileId: string
): Promise<DriveFile | null> {
  try {
    const response = await fetch(
      `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,modifiedTime,size`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * 最近更新されたMarkdownファイルを取得（更新日順）
 */
export async function listRecentMarkdownFiles(
  accessToken: string,
  maxResults: number = 20
): Promise<DriveFile[]> {
  // Markdown ファイルのみを取得するクエリを構築
  const mimeTypeQuery = MARKDOWN_MIME_TYPES.map(
    (type) => `mimeType='${type}'`
  ).join(' or ');

  // .md または .markdown 拡張子を含み、ゴミ箱にないファイル
  const searchQuery = `(${mimeTypeQuery}) and (name contains '.md' or name contains '.markdown') and trashed=false`;

  const response = await fetch(
    `${DRIVE_API_BASE}/files?` +
      new URLSearchParams({
        q: searchQuery,
        fields:
          'files(id,name,mimeType,modifiedTime,size,iconLink,webViewLink,owners)',
        pageSize: String(maxResults),
        orderBy: 'modifiedTime desc',
      }),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list files: ${response.statusText}`);
  }

  const data: DriveFileListResponse = await response.json();

  // .md または .markdown 拡張子でフィルタリング
  return (data.files || []).filter(
    (file) =>
      file.name.toLowerCase().endsWith('.md') ||
      file.name.toLowerCase().endsWith('.markdown')
  );
}

const DRIVE_UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * ファイル内容を更新（書き戻し）
 */
export async function updateFileContent(
  accessToken: string,
  fileId: string,
  content: string,
): Promise<void> {
  const response = await fetch(
    `${DRIVE_UPLOAD_API_BASE}/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/markdown',
      },
      body: content,
    }
  );
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('INSUFFICIENT_SCOPE');
    }
    throw new Error(`Failed to save: ${response.statusText}`);
  }
}

/**
 * Markdown ファイルかどうかを判定
 */
export function isMarkdownFile(file: DriveFile): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.md') || name.endsWith('.markdown');
}
