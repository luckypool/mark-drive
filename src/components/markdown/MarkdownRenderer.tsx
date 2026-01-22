/**
 * Markdown レンダラー
 * プラットフォームに応じて適切な実装を選択
 */

import { Platform } from 'react-native';

// プラットフォーム固有のエクスポート
export { MarkdownRenderer } from './MarkdownRenderer.native';
