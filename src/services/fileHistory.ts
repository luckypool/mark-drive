/**
 * ファイル履歴のストレージ管理サービス
 * プラットフォーム共通で使用可能
 */

import type { FileHistoryItem, FileHistoryConfig, FileSource } from '../types/fileHistory';
import { storage } from './storage';

const DEFAULT_CONFIG: FileHistoryConfig = {
  maxItems: 10,
  storageKey: 'markdrive-file-history',
};

/**
 * 履歴をストレージから取得
 */
export async function getFileHistory(
  config: Partial<FileHistoryConfig> = {}
): Promise<FileHistoryItem[]> {
  const { storageKey } = { ...DEFAULT_CONFIG, ...config };

  try {
    const items = await storage.getJSON<FileHistoryItem[]>(storageKey);
    if (!items) return [];

    // 日付順でソート（新しい順）
    return items.sort(
      (a, b) =>
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
export async function addFileToHistory(
  file: Pick<FileHistoryItem, 'id' | 'name'> & { source?: FileSource },
  config: Partial<FileHistoryConfig> = {}
): Promise<void> {
  const { maxItems, storageKey } = { ...DEFAULT_CONFIG, ...config };

  try {
    const history = await getFileHistory(config);

    // 既存のファイルを除外
    const filteredHistory = history.filter((item) => item.id !== file.id);

    // 新しいファイルを先頭に追加
    const newHistory: FileHistoryItem[] = [
      {
        id: file.id,
        name: file.name,
        selectedAt: new Date().toISOString(),
        source: file.source ?? 'google-drive',
      },
      ...filteredHistory,
    ];

    // 最大件数まで保持
    const trimmedHistory = newHistory.slice(0, maxItems);

    await storage.setJSON(storageKey, trimmedHistory);
  } catch (error) {
    console.error('Failed to save file to history:', error);
  }
}

/**
 * 履歴をクリア
 */
export async function clearFileHistory(
  config: Partial<FileHistoryConfig> = {}
): Promise<void> {
  const { storageKey } = { ...DEFAULT_CONFIG, ...config };

  try {
    await storage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear file history:', error);
  }
}

/**
 * 特定のファイルを履歴から削除
 */
export async function removeFileFromHistory(
  fileId: string,
  config: Partial<FileHistoryConfig> = {}
): Promise<void> {
  const { storageKey } = { ...DEFAULT_CONFIG, ...config };

  try {
    const history = await getFileHistory(config);
    const filteredHistory = history.filter((item) => item.id !== fileId);

    await storage.setJSON(storageKey, filteredHistory);
  } catch (error) {
    console.error('Failed to remove file from history:', error);
  }
}
