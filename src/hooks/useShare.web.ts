/**
 * 共有 hook - Web 版
 * Web Share API と html2pdf.js を使用（必要に応じてダウンロード）
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseShareReturn {
  shareContent: (content: string, fileName: string) => Promise<void>;
  exportToPdf: (content: string, fileName: string) => Promise<string | null>;
  isProcessing: boolean;
  error: string | null;
  canShare: boolean;
}

// シンプルな Markdown → HTML 変換
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

  html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul style="margin:12px 0;padding-left:24px;">$&</ul>');

  return `<p style="margin:0 0 12px;line-height:1.6;">${html}</p>`;
}

export function useShare(): UseShareReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Web Share API がファイル共有をサポートしているかチェック
  const canShare = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    if (!navigator.share || !navigator.canShare) return false;
    try {
      const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      return navigator.canShare({ files: [testFile] });
    } catch {
      return false;
    }
  }, []);

  // PDF を生成（html2pdf.js を動的にロード）
  const exportToPdf = useCallback(
    async (content: string, fileName: string): Promise<string | null> => {
      setIsProcessing(true);
      setError(null);

      try {
        // html2pdf.js を動的にインポート
        const html2pdf = (await import('html2pdf.js')).default;

        const htmlContent = markdownToHtml(content);
        const container = document.createElement('div');
        container.innerHTML = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6;padding:20px;">
            ${htmlContent}
          </div>
        `;

        const pdfFileName = fileName.replace(/\.(md|markdown)$/i, '') + '.pdf';

        const blob = await html2pdf()
          .set({
            margin: 10,
            filename: pdfFileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          })
          .from(container)
          .outputPdf('blob');

        // Blob URL を返す
        return URL.createObjectURL(blob);
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
      setIsProcessing(true);
      setError(null);

      try {
        // html2pdf.js を動的にインポート
        const html2pdf = (await import('html2pdf.js')).default;

        const htmlContent = markdownToHtml(content);
        const container = document.createElement('div');
        container.innerHTML = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6;padding:20px;">
            ${htmlContent}
          </div>
        `;

        const pdfFileName = fileName.replace(/\.(md|markdown)$/i, '') + '.pdf';

        const blob = await html2pdf()
          .set({
            margin: 10,
            filename: pdfFileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          })
          .from(container)
          .outputPdf('blob');

        if (canShare) {
          // Web Share API で共有
          const file = new File([blob], pdfFileName, { type: 'application/pdf' });
          await navigator.share({
            files: [file],
            title: pdfFileName.replace('.pdf', ''),
          });
        } else {
          // ダウンロード
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = pdfFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        // ユーザーがキャンセルした場合はエラーとしない
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        const message = err instanceof Error ? err.message : '共有に失敗しました';
        setError(message);
        console.error('Share failed:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [canShare]
  );

  return {
    shareContent,
    exportToPdf,
    isProcessing,
    error,
    canShare,
  };
}
