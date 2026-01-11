import { useRef, useEffect, useState, useId } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import mermaid from 'mermaid';

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
}

export function MarkdownViewer({ content, fileName }: MarkdownViewerProps) {
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
        </div>
      )}
      <article className="markdown-content">
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
