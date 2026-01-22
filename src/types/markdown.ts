/**
 * Markdown 関連の型定義
 */

/**
 * 表示するファイルの情報
 */
export interface MarkdownFile {
  /** ファイルID */
  id: string;

  /** ファイル名 */
  name: string;

  /** Markdown コンテンツ */
  content: string;

  /** ファイルのソース */
  source: 'google-drive' | 'local';
}

/**
 * Markdown レンダラーのProps
 */
export interface MarkdownRendererProps {
  content: string;
  onLinkPress?: (url: string) => void;
}
