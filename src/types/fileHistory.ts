/**
 * ファイル履歴機能の型定義
 */

/**
 * 履歴に保存されるファイル情報
 */
export interface FileHistoryItem {
  /** Google Drive ファイルID */
  id: string;

  /** ファイル名 */
  name: string;

  /** 選択日時（ISO 8601形式） */
  selectedAt: string;
}

/**
 * ファイル履歴の設定
 */
export interface FileHistoryConfig {
  /** 最大保存件数 */
  maxItems: number;

  /** localStorageのキー名 */
  storageKey: string;
}
