/**
 * 共有 hook - Native 版
 * expo-print と expo-sharing を使用
 */

import { useState, useCallback, useMemo } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface UseShareReturn {
  shareContent: (content: string, fileName: string) => Promise<void>;
  exportToPdf: (content: string, fileName: string) => Promise<string | null>;
  isProcessing: boolean;
  error: string | null;
  canShare: boolean;
}

// Markdown コンテンツを HTML に変換（シンプルな変換）
function markdownToHtml(content: string): string {
  let html = content
    // コードブロック
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#f5f5f5;padding:12px;border-radius:4px;overflow-x:auto;"><code>$2</code></pre>')
    // インラインコード
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:2px;">$1</code>')
    // 見出し
    .replace(/^### (.+)$/gm, '<h3 style="color:#000;margin:16px 0 8px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#000;margin:20px 0 10px;border-bottom:1px solid #ddd;padding-bottom:4px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#000;margin:24px 0 12px;border-bottom:2px solid #ddd;padding-bottom:6px;">$1</h1>')
    // 太字
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // リンク
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#0066cc;">$1</a>')
    // リスト
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 水平線
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">')
    // 段落
    .replace(/\n\n/g, '</p><p style="margin:0 0 12px;line-height:1.6;">');

  // リストをラップ
  html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul style="margin:12px 0;padding-left:24px;">$&</ul>');

  return `<p style="margin:0 0 12px;line-height:1.6;">${html}</p>`;
}

export function useShare(): UseShareReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 共有が利用可能かチェック
  const canShare = useMemo(() => {
    return Sharing.isAvailableAsync !== undefined;
  }, []);

  // PDF を生成
  const exportToPdf = useCallback(
    async (content: string, fileName: string): Promise<string | null> => {
      setIsProcessing(true);
      setError(null);

      try {
        const htmlContent = markdownToHtml(content);
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 14px;
                  color: #1a1a1a;
                  line-height: 1.6;
                  padding: 20px;
                  max-width: 800px;
                  margin: 0 auto;
                }
                h1, h2, h3, h4, h5, h6 { color: #000; }
                a { color: #0066cc; }
                pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
                code { font-family: 'Monaco', 'Consolas', monospace; font-size: 13px; }
                table { border-collapse: collapse; width: 100%; margin: 12px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; font-weight: 600; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `;

        const { uri } = await Print.printToFileAsync({
          html: fullHtml,
          base64: false,
        });

        // printToFileAsync が返す uri をそのまま使用
        return uri;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'PDF生成に失敗しました';
        setError(message);
        console.error('PDF export failed:', err);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // コンテンツを共有
  const shareContent = useCallback(
    async (content: string, fileName: string): Promise<void> => {
      const pdfUri = await exportToPdf(content, fileName);
      if (!pdfUri) return;

      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: fileName.replace(/\.(md|markdown)$/i, ''),
            UTI: 'com.adobe.pdf',
          });
        } else {
          setError('共有機能が利用できません');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '共有に失敗しました';
        setError(message);
        console.error('Share failed:', err);
      }
    },
    [exportToPdf]
  );

  return {
    shareContent,
    exportToPdf,
    isProcessing,
    error,
    canShare,
  };
}
