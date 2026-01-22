/**
 * html2pdf.js 型定義
 */

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: 'jpeg' | 'png' | 'webp';
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      logging?: boolean;
      backgroundColor?: string;
    };
    jsPDF?: {
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: string | [number, number];
      orientation?: 'portrait' | 'landscape';
    };
    pagebreak?: {
      mode?: string | string[];
    };
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement | string): Html2Pdf;
    save(): Promise<void>;
    outputPdf(type: 'blob'): Promise<Blob>;
    outputPdf(type: 'datauristring'): Promise<string>;
  }

  function html2pdf(): Html2Pdf;
  export default html2pdf;
}
