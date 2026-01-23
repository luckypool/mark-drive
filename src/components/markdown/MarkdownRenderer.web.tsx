/**
 * Markdown レンダラー - Web 版
 * react-markdown + remark-gfm を使用
 */

import React, { useId, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
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
    return (
      <div className="mermaid-error">
        Mermaid Error: {error}
      </div>
    );
  }
  return <div ref={containerRef} className="mermaid-diagram" />;
}

// GitHub ダークモード風のカスタムテーマ
const githubDarkTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: '#e6edf3',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  'pre[class*="language-"]': {
    color: '#e6edf3',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  comment: { color: '#8b949e' },
  prolog: { color: '#8b949e' },
  doctype: { color: '#8b949e' },
  cdata: { color: '#8b949e' },
  punctuation: { color: '#e6edf3' },
  property: { color: '#79c0ff' },
  tag: { color: '#7ee787' },
  boolean: { color: '#79c0ff' },
  number: { color: '#79c0ff' },
  constant: { color: '#79c0ff' },
  symbol: { color: '#79c0ff' },
  deleted: { color: '#ffa198' },
  selector: { color: '#7ee787' },
  'attr-name': { color: '#79c0ff' },
  string: { color: '#a5d6ff' },
  char: { color: '#a5d6ff' },
  builtin: { color: '#ffa657' },
  inserted: { color: '#7ee787' },
  operator: { color: '#ff7b72' },
  entity: { color: '#ffa657' },
  url: { color: '#a5d6ff' },
  variable: { color: '#ffa657' },
  atrule: { color: '#79c0ff' },
  'attr-value': { color: '#a5d6ff' },
  function: { color: '#d2a8ff' },
  'class-name': { color: '#ffa657' },
  keyword: { color: '#ff7b72' },
  regex: { color: '#a5d6ff' },
  important: { color: '#ff7b72', fontWeight: 'bold' },
};
import type { Components } from 'react-markdown';
import type { MarkdownRendererProps } from '../../types/markdown';
import { colors, spacing, borderRadius, fontSize } from '../../theme';

// Web 専用のスタイル
const webStyles = `
  .markdown-content {
    color: ${colors.textSecondary};
    font-size: ${fontSize.base}px;
    line-height: 1.6;
    word-wrap: break-word;
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    color: ${colors.textPrimary};
    margin-top: ${spacing.xl}px;
    margin-bottom: ${spacing.md}px;
    font-weight: 600;
    line-height: 1.3;
  }

  .markdown-content h1 {
    font-size: ${fontSize['3xl']}px;
    padding-bottom: ${spacing.sm}px;
    border-bottom: 2px solid ${colors.borderLight};
  }

  .markdown-content h2 {
    font-size: ${fontSize['2xl']}px;
    padding-bottom: ${spacing.xs}px;
    border-bottom: 1px solid ${colors.border};
  }

  .markdown-content h3 { font-size: ${fontSize.xl}px; }
  .markdown-content h4 { font-size: ${fontSize.lg}px; }

  .markdown-content p {
    margin-bottom: ${spacing.md}px;
  }

  .markdown-content a {
    color: ${colors.accent};
    text-decoration: none;
  }

  .markdown-content a:hover {
    text-decoration: underline;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin-bottom: ${spacing.md}px;
    padding-left: ${spacing.xl}px;
  }

  .markdown-content li {
    margin-bottom: ${spacing.xs}px;
  }

  .markdown-content blockquote {
    margin: ${spacing.md}px 0;
    padding: ${spacing.md}px ${spacing.lg}px;
    border-left: 3px solid ${colors.accent};
    background: ${colors.accentMuted};
    border-radius: 0 ${borderRadius.md}px ${borderRadius.md}px 0;
  }

  .markdown-content hr {
    border: none;
    height: 1px;
    background: ${colors.border};
    margin: ${spacing.xl}px 0;
  }

  .markdown-content .inline-code {
    background: ${colors.accentMuted};
    color: ${colors.accent};
    padding: 2px 6px;
    border-radius: ${borderRadius.sm}px;
    font-family: monospace;
    font-size: 0.85em;
  }

  /* Fence コードブロック - シンタックスハイライト付き */
  .markdown-content .fence-block-wrapper {
    margin: ${spacing.md}px 0;
    border: 1px solid #30363d;
    border-radius: 6px;
    overflow: hidden;
  }

  .markdown-content .fence-block-language {
    background: #161b22;
    border-bottom: 1px solid #30363d;
    padding: 8px 16px;
    font-size: 0.75rem;
    color: #8b949e;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  }

  .markdown-content .fence-block {
    font-size: 0.875rem !important;
    overflow-x: auto;
    max-width: 100%;
    -webkit-overflow-scrolling: touch;
  }

  .markdown-content .fence-block code,
  .markdown-content .fence-block span {
    background: transparent !important;
  }

  /* Indented コードブロック (4スペース) - シンプルなスタイル */
  .markdown-content .indented-code-block {
    margin: ${spacing.md}px 0;
    padding: ${spacing.md}px;
    background: ${colors.bgTertiary};
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md}px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .markdown-content .indented-code-block code {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: ${colors.textSecondary};
    background: transparent;
    white-space: pre;
    display: block;
  }

  .markdown-content .table-wrapper {
    overflow-x: auto;
    margin: ${spacing.md}px 0;
    -webkit-overflow-scrolling: touch;
  }

  .markdown-content table {
    min-width: 100%;
    width: max-content;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .markdown-content th,
  .markdown-content td {
    padding: ${spacing.sm}px ${spacing.md}px;
    text-align: left;
    border: 1px solid ${colors.border};
    white-space: nowrap;
  }

  .markdown-content td {
    white-space: normal;
    min-width: 100px;
    max-width: 300px;
  }

  .markdown-content th {
    background: ${colors.bgTertiary};
    color: ${colors.textPrimary};
    font-weight: 600;
  }

  .markdown-content tr:nth-child(even) td {
    background: rgba(255, 255, 255, 0.02);
  }

  .markdown-content img {
    max-width: 100%;
    height: auto;
    border-radius: ${borderRadius.md}px;
    margin: ${spacing.md}px 0;
  }

  .markdown-content .mermaid-diagram {
    margin: ${spacing.md}px 0;
    padding: ${spacing.md}px;
    background: ${colors.bgTertiary};
    border-radius: ${borderRadius.md}px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .markdown-content .mermaid-diagram svg {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    height: auto;
  }

  .markdown-content .mermaid-error {
    margin: ${spacing.md}px 0;
    padding: ${spacing.md}px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: ${borderRadius.md}px;
    color: #ef4444;
    font-family: monospace;
    font-size: ${fontSize.sm}px;
  }
`;

export function MarkdownRenderer({ content, onLinkPress }: MarkdownRendererProps) {
  const id = useId().replace(/:/g, '-');

  const components: Components = {
    // pre タグ: fence/indented code block のラッパー
    pre({ children, node, ...props }) {
      // children が code 要素かチェック（React要素であればOK）
      const child = React.Children.toArray(children)[0];
      if (React.isValidElement(child)) {
        const codeProps = child.props as { className?: string; children?: React.ReactNode };
        const className = codeProps.className || '';
        const match = /language-(\w+)/.exec(className);
        const language = match ? match[1] : null;
        const codeContent = String(codeProps.children || '').replace(/\n$/, '');

        // Mermaid ダイアグラムの場合
        if (language === 'mermaid') {
          return <MermaidDiagram chart={codeContent.trim()} />;
        }

        // Fence コードブロック (``` で囲まれたもの) - 言語指定があればシンタックスハイライト
        if (language) {
          return (
            <div className="fence-block-wrapper">
              <div className="fence-block-language">{language}</div>
              <SyntaxHighlighter
                style={githubDarkTheme}
                language={language}
                PreTag="div"
                className="fence-block"
                customStyle={{
                  background: '#161b22',
                  padding: '16px',
                  margin: 0,
                  overflow: 'auto',
                  borderRadius: '0 0 6px 6px',
                }}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
          );
        }

        // Indented コードブロック (4スペースインデント) または言語指定なしの fence
        // シンプルなスタイルで表示
        return (
          <div className="indented-code-block">
            <code>{codeContent}</code>
          </div>
        );
      }

      // その他の場合はデフォルトの pre タグ
      return <pre {...props}>{children}</pre>;
    },
    // インラインコード
    code({ className, children, ...props }) {
      // pre の中の code は pre コンポーネントで処理されるので、ここに来るのはインラインのみ
      return (
        <code className="inline-code" {...props}>
          {children}
        </code>
      );
    },
    a({ href, children, ...props }) {
      const handleClick = (e: React.MouseEvent) => {
        if (onLinkPress && href) {
          e.preventDefault();
          onLinkPress(href);
        }
      };

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          {...props}
        >
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
          {...props}
        />
      );
    },
  };

  return (
    <View style={styles.container}>
      <style dangerouslySetInnerHTML={{ __html: webStyles }} />
      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
