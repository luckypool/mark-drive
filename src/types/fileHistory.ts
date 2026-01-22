/**
 * ファイル履歴機能の型定義
 */

/**
 * ファイルのソース種別
 */
export type FileSource = 'google-drive' | 'local';

/**
 * 履歴に保存されるファイル情報
 */
export interface FileHistoryItem {
  /** ファイルID（Google Drive ファイルID または ローカルファイルパス） */
  id: string;

  /** ファイル名 */
  name: string;

  /** 選択日時（ISO 8601形式） */
  selectedAt: string;

  /** ファイルのソース */
  source: FileSource;
}

/**
 * ファイル履歴の設定
 */
export interface FileHistoryConfig {
  /** 最大保存件数 */
  maxItems: number;

  /** ストレージのキー名 */
  storageKey: string;
}
