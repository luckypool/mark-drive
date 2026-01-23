/**
 * Markdown レンダラー - Web 版
 * react-markdown + remark-gfm を使用
 */

import React, { useId } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

  .markdown-content .code-block {
    margin: ${spacing.md}px 0;
    border-radius: ${borderRadius.md}px !important;
    font-size: 0.9rem !important;
    overflow-x: auto;
    max-width: 100%;
    -webkit-overflow-scrolling: touch;
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
`;

export function MarkdownRenderer({ content, onLinkPress }: MarkdownRendererProps) {
  const id = useId().replace(/:/g, '-');

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : null;
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
          language={language || 'text'}
          PreTag="div"
          className="code-block"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
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
