import { useState, useCallback, useMemo } from 'react';
import html2pdf from 'html2pdf.js';

const PDF_OPTIONS = {
  margin: 10,
  image: { type: 'jpeg' as const, quality: 0.98 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  },
  jsPDF: {
    unit: 'mm' as const,
    format: 'a4' as const,
    orientation: 'portrait' as const,
  },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
};

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ファイル共有がサポートされているかチェック
  const canShareFiles = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    if (!navigator.share || !navigator.canShare) return false;
    try {
      const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      return navigator.canShare({ files: [testFile] });
    } catch {
      return false;
    }
  }, []);

  // HTMLElement から PDF Blob を生成
  const exportToPdf = useCallback(
    async (element: HTMLElement, fileName: string): Promise<Blob | null> => {
      setIsExporting(true);
      setError(null);

      try {
        // 要素をクローンしてライトテーマ用のスタイルを適用
        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.backgroundColor = '#ffffff';
        clone.style.color = '#1a1a1a';
        clone.style.padding = '20px';

        // すべてのテキスト要素に濃い色を設定
        clone.querySelectorAll('p, td, th, li, span, div').forEach((el) => {
          (el as HTMLElement).style.color = '#1a1a1a';
        });

        // 見出しは更に濃く
        clone.querySelectorAll('h1, h2, h3, h4, h5, h6, strong').forEach((el) => {
          (el as HTMLElement).style.color = '#000000';
        });

        // テーブルのヘッダーと境界線を濃く
        clone.querySelectorAll('th').forEach((el) => {
          (el as HTMLElement).style.backgroundColor = '#f5f5f5';
          (el as HTMLElement).style.color = '#000000';
          (el as HTMLElement).style.borderColor = '#cccccc';
        });

        clone.querySelectorAll('td').forEach((el) => {
          (el as HTMLElement).style.color = '#1a1a1a';
          (el as HTMLElement).style.borderColor = '#cccccc';
        });

        // コードブロックの背景色を調整
        clone.querySelectorAll('pre, code').forEach((el) => {
          (el as HTMLElement).style.backgroundColor = '#f5f5f5';
          (el as HTMLElement).style.color = '#1a1a1a';
        });

        // リンクの色を調整
        clone.querySelectorAll('a').forEach((el) => {
          el.style.color = '#0066cc';
        });

        const blob = await html2pdf()
          .set({ ...PDF_OPTIONS, filename: fileName })
          .from(clone)
          .outputPdf('blob');

        return blob;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'PDF生成に失敗しました';
        setError(message);
        console.error('PDF export failed:', err);
        return null;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  // PDF を共有（Web Share API）
  const sharePdf = useCallback(
    async (blob: Blob, fileName: string): Promise<boolean> => {
      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.canShare?.({ files: [file] })) {
        setIsSharing(true);
        setError(null);
        try {
          await navigator.share({
            files: [file],
            title: fileName.replace('.pdf', ''),
          });
          return true;
        } catch (err) {
          // ユーザーがキャンセルした場合はエラーとしない
          if ((err as Error).name !== 'AbortError') {
            setError('共有に失敗しました');
            console.error('Share failed:', err);
          }
          return false;
        } finally {
          setIsSharing(false);
        }
      }
      return false;
    },
    []
  );

  // PDF をダウンロード（フォールバック）
  const downloadPdf = useCallback((blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // 共有またはダウンロード（自動判定）
  const shareOrDownload = useCallback(
    async (element: HTMLElement, fileName: string): Promise<void> => {
      const pdfFileName = fileName.replace(/\.(md|markdown)$/i, '') + '.pdf';
      const blob = await exportToPdf(element, pdfFileName);

      if (!blob) return;

      if (canShareFiles) {
        const shared = await sharePdf(blob, pdfFileName);
        if (!shared) {
          // 共有がキャンセルまたは失敗した場合、ダウンロードは行わない
          // ユーザーが意図的にキャンセルした可能性があるため
        }
      } else {
        downloadPdf(blob, pdfFileName);
      }
    },
    [canShareFiles, exportToPdf, sharePdf, downloadPdf]
  );

  return {
    exportToPdf,
    sharePdf,
    downloadPdf,
    shareOrDownload,
    isExporting,
    isSharing,
    isProcessing: isExporting || isSharing,
    error,
    canShareFiles,
  };
}
