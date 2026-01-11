import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownViewerProps {
  content: string;
  fileName?: string;
  onClose?: () => void;
}

export function MarkdownViewer({ content, fileName, onClose }: MarkdownViewerProps) {
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match && !className;
      
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
          language={match ? match[1] : 'text'}
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
          {onClose && (
            <button className="close-file-button" onClick={onClose} title="ファイルを閉じる">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
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
