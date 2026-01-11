import type { FileHistoryItem, FileHistoryConfig } from '../types/fileHistory';

/**
 * ファイル履歴のlocalStorage管理ユーティリティ
 */

const DEFAULT_CONFIG: FileHistoryConfig = {
  maxItems: 10,
  storageKey: 'md-viewer-file-history',
};

/**
 * 履歴をlocalStorageから取得
 */
export function getFileHistory(config: Partial<FileHistoryConfig> = {}): FileHistoryItem[] {
  const { storageKey } = { ...DEFAULT_CONFIG, ...config };

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];

    const items = JSON.parse(stored) as FileHistoryItem[];

    // 日付順でソート（新しい順）
    return items.sort((a, b) =>
      new Date(b.selectedAt).getTime() - new Date(a.selectedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to load file history:', error);
    return [];
  }
}

/**
 * 履歴にファイルを追加
 * - 既存のファイルは更新（日時を最新に）
 * - 最大件数を超えた場合は古いものから削除
 */
export function addFileToHistory(
  file: Pick<FileHistoryItem, 'id' | 'name'>,
  config: Partial<FileHistoryConfig> = {}
): void {
  const { maxItems, storageKey } = { ...DEFAULT_CONFIG, ...config };

  try {
    const history = getFileHistory(config);

    // 既存のファイルを除外
    const filteredHistory = history.filter(item => item.id !== file.id);

    // 新しいファイルを先頭に追加
    const newHistory: FileHistoryItem[] = [
      {
        id: file.id,
        name: file.name,
        selectedAt: new Date().toISOString(),
      },
      ...filteredHistory,
    ];

    // 最大件数まで保持
    const trimmedHistory = newHistory.slice(0, maxItems);

    localStorage.setItem(storageKey, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save file to history:', error);
  }
}

/**
 * 履歴をクリア
 */
export function clearFileHistory(config: Partial<FileHistoryConfig> = {}): void {
  const { storageKey } = { ...DEFAULT_CONFIG, ...config };

  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear file history:', error);
  }
}

/**
 * 特定のファイルを履歴から削除
 */
export function removeFileFromHistory(
  fileId: string,
  config: Partial<FileHistoryConfig> = {}
): void {
  const { storageKey } = { ...DEFAULT_CONFIG, ...config };

  try {
    const history = getFileHistory(config);
    const filteredHistory = history.filter(item => item.id !== fileId);

    localStorage.setItem(storageKey, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Failed to remove file from history:', error);
  }
}
