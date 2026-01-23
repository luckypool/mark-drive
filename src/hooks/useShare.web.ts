/**
 * PDF Download hook - Web version
 * Uses html2pdf.js for PDF generation and download
 */

import { useState, useCallback } from 'react';
import { markdownToHtml } from '../utils/markdownToHtml';

export interface UseShareReturn {
  shareContent: (content: string, fileName: string) => Promise<void>;
  exportToPdf: (content: string, fileName: string) => Promise<string | null>;
  isProcessing: boolean;
  error: string | null;
}

export function useShare(): UseShareReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate PDF and return Blob URL
  const exportToPdf = useCallback(
    async (content: string, fileName: string): Promise<string | null> => {
      setIsProcessing(true);
      setError(null);

      try {
        const html2pdf = (await import('html2pdf.js')).default;

        const htmlContent = await markdownToHtml(content);
        const container = document.createElement('div');
        container.innerHTML = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:#1a1a1a;line-height:1.6;padding:16px;">
            ${htmlContent}
          </div>
        `;

        const pdfFileName = fileName.replace(/\.(md|markdown)$/i, '') + '.pdf';

        const pdfOptions = {
          margin: [10, 10, 10, 10],
          filename: pdfFileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };

        const blob = await html2pdf()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .set(pdfOptions as any)
          .from(container)
          .outputPdf('blob');

        return URL.createObjectURL(blob);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'PDF generation failed';
        setError(message);
        console.error('PDF export failed:', err);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Generate and download PDF
  const shareContent = useCallback(
    async (content: string, fileName: string): Promise<void> => {
      setIsProcessing(true);
      setError(null);

      try {
        const html2pdf = (await import('html2pdf.js')).default;

        const htmlContent = await markdownToHtml(content);
        const container = document.createElement('div');
        container.innerHTML = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:#1a1a1a;line-height:1.6;padding:16px;">
            ${htmlContent}
          </div>
        `;

        const pdfFileName = fileName.replace(/\.(md|markdown)$/i, '') + '.pdf';

        const pdfOptions = {
          margin: [10, 10, 10, 10],
          filename: pdfFileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };

        const blob = await html2pdf()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .set(pdfOptions as any)
          .from(container)
          .outputPdf('blob');

        // Always download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = pdfFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'PDF download failed';
        setError(message);
        console.error('PDF download failed:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    shareContent,
    exportToPdf,
    isProcessing,
    error,
  };
}
