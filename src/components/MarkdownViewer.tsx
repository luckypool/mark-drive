import { useRef, useEffect, useState, useId } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import mermaid from 'mermaid';
import { usePdfExport } from '../hooks/usePdfExport';

// Mermaid 初期化
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#10b981',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#1e2e28',
    lineColor: '#64748b',
    secondaryColor: '#1a2420',
    tertiaryColor: '#111915',
  },
});

// Mermaid ダイアグラムコンポーネント
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId().replace(/:/g, '-');

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        containerRef.current.innerHTML = svg;
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };
    renderDiagram();
  }, [chart, id]);

  if (error) {
    return <div className="mermaid-error">Mermaid Error: {error}</div>;
  }
  return <div ref={containerRef} className="mermaid-diagram" />;
}

interface MarkdownViewerProps {
  content: string;
  fileName?: string;
  onClose?: () => void;
}

export function MarkdownViewer({ content, fileName, onClose }: MarkdownViewerProps) {
  const contentRef = useRef<HTMLElement>(null);
  const { shareOrDownload, isProcessing, canShareFiles } = usePdfExport();

  // テーブルのスクロール位置を監視して影を制御
  useEffect(() => {
    if (!contentRef.current) return;

    const handleScroll = (e: Event) => {
      const wrapper = e.target as HTMLElement;
      if (!wrapper.classList.contains('table-wrapper')) return;

      const isAtEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 1;

      if (isAtEnd) {
        wrapper.classList.add('scrolled-to-end');
      } else {
        wrapper.classList.remove('scrolled-to-end');
      }
    };

    const tableWrappers = contentRef.current.querySelectorAll('.table-wrapper');
    tableWrappers.forEach((wrapper) => {
      wrapper.addEventListener('scroll', handleScroll);
      // 初期状態をチェック
      const isAtEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 1;
      if (isAtEnd) {
        wrapper.classList.add('scrolled-to-end');
      }
    });

    return () => {
      tableWrappers.forEach((wrapper) => {
        wrapper.removeEventListener('scroll', handleScroll);
      });
    };
  }, [content]);

  const handleShare = async () => {
    if (!contentRef.current || !fileName) return;
    await shareOrDownload(contentRef.current, fileName);
  };

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : null;
      const isInline = !match && !className;

      // Mermaid ダイアグラムの場合
      if (language === 'mermaid') {
        return <MermaidDiagram chart={String(children).trim()} />;
      }
      
      if (isInline) {
        return (
          <code className="inline-code" {...props}>
            {children}
          </code>
        );
      }

      return (
        <SyntaxHighlighter
          style={oneDark}
          language={language || 'text'}
          PreTag="div"
          className="code-block"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    },
    a({ href, children, ...props }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
    table({ children, ...props }) {
      return (
        <div className="table-wrapper">
          <table {...props}>{children}</table>
        </div>
      );
    },
    img({ src, alt, ...props }) {
      return (
        <img 
          src={src} 
          alt={alt || ''} 
          loading="lazy"
          className="markdown-image"
          {...props}
        />
      );
    },
  };

  return (
    <div className="markdown-viewer">
      {fileName && (
        <div className="viewer-header">
          <h2 className="file-title">{fileName}</h2>
          <div className="viewer-header-actions">
            <button
              className="share-button"
              onClick={handleShare}
              disabled={isProcessing}
              title={canShareFiles ? 'PDFとして共有' : 'PDFをダウンロード'}
            >
              {isProcessing ? (
                <span className="share-spinner" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {canShareFiles ? (
                    <>
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </>
                  ) : (
                    <>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </>
                  )}
                </svg>
              )}
            </button>
            {onClose && (
              <button className="close-file-button" onClick={onClose} title="ファイルを閉じる">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      <article className="markdown-content" ref={contentRef}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          components={components}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
