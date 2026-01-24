/**
 * Markdown Renderer - Web version
 * react-markdown + remark-gfm with theme support
 */

import React, { useId, useRef, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import mermaid from 'mermaid';

import type { Components } from 'react-markdown';
import type { MarkdownRendererProps } from '../../types/markdown';
import { spacing, borderRadius, fontSize } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useFontSettings, fontSizeMultipliers, fontFamilyStacks } from '../../contexts/FontSettingsContext';
import type { ThemeMode, ThemeColors } from '../../contexts/ThemeContext';
import type { FontSettings } from '../../contexts/FontSettingsContext';

// Initialize Mermaid with a theme
const initializeMermaid = (mode: ThemeMode) => {
  const isDark = mode === 'dark';
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    themeVariables: isDark
      ? {
          primaryColor: '#10b981',
          primaryTextColor: '#e2e8f0',
          primaryBorderColor: '#1e2e28',
          lineColor: '#64748b',
          secondaryColor: '#1a2420',
          tertiaryColor: '#111915',
        }
      : {
          primaryColor: '#10b981',
          primaryTextColor: '#1a2e25',
          primaryBorderColor: '#e5e7eb',
          lineColor: '#6b7280',
          secondaryColor: '#f0f4f3',
          tertiaryColor: '#f8faf9',
        },
  });
};

// Mermaid Diagram Component
function MermaidDiagram({ chart, themeMode }: { chart: string; themeMode: ThemeMode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId().replace(/:/g, '-');

  useEffect(() => {
    initializeMermaid(themeMode);
  }, [themeMode]);

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
  }, [chart, id, themeMode]);

  if (error) {
    return <div className="mermaid-error">Mermaid Error: {error}</div>;
  }
  return <div ref={containerRef} className="mermaid-diagram" />;
}

// GitHub Dark Theme for syntax highlighting
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

// GitHub Light Theme for syntax highlighting
const githubLightTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: '#24292f',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  'pre[class*="language-"]': {
    color: '#24292f',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  comment: { color: '#6e7781' },
  prolog: { color: '#6e7781' },
  doctype: { color: '#6e7781' },
  cdata: { color: '#6e7781' },
  punctuation: { color: '#24292f' },
  property: { color: '#0550ae' },
  tag: { color: '#116329' },
  boolean: { color: '#0550ae' },
  number: { color: '#0550ae' },
  constant: { color: '#0550ae' },
  symbol: { color: '#0550ae' },
  deleted: { color: '#82071e' },
  selector: { color: '#116329' },
  'attr-name': { color: '#0550ae' },
  string: { color: '#0a3069' },
  char: { color: '#0a3069' },
  builtin: { color: '#953800' },
  inserted: { color: '#116329' },
  operator: { color: '#cf222e' },
  entity: { color: '#953800' },
  url: { color: '#0a3069' },
  variable: { color: '#953800' },
  atrule: { color: '#0550ae' },
  'attr-value': { color: '#0a3069' },
  function: { color: '#8250df' },
  'class-name': { color: '#953800' },
  keyword: { color: '#cf222e' },
  regex: { color: '#0a3069' },
  important: { color: '#cf222e', fontWeight: 'bold' },
};

// Generate CSS styles based on theme and font settings
const generateWebStyles = (colors: ThemeColors, isDark: boolean, fontSettings: FontSettings) => {
  const multiplier = fontSizeMultipliers[fontSettings.fontSize];
  const fontStack = fontFamilyStacks[fontSettings.fontFamily];
  const baseFontSize = Math.round(fontSize.base * multiplier);

  return `
  .markdown-content {
    color: ${colors.textSecondary};
    font-size: ${baseFontSize}px;
    font-family: ${fontStack};
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
    font-size: ${Math.round(fontSize['3xl'] * multiplier)}px;
    padding-bottom: ${spacing.sm}px;
    border-bottom: 2px solid ${colors.borderLight};
  }

  .markdown-content h2 {
    font-size: ${Math.round(fontSize['2xl'] * multiplier)}px;
    padding-bottom: ${spacing.xs}px;
    border-bottom: 1px solid ${colors.border};
  }

  .markdown-content h3 { font-size: ${Math.round(fontSize.xl * multiplier)}px; }
  .markdown-content h4 { font-size: ${Math.round(fontSize.lg * multiplier)}px; }

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

  /* Fence code block - with syntax highlighting */
  .markdown-content .fence-block-wrapper {
    margin: ${spacing.md}px 0;
    border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
    border-radius: 6px;
    overflow: hidden;
  }

  .markdown-content .fence-block-language {
    background: ${isDark ? '#161b22' : '#f6f8fa'};
    border-bottom: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
    padding: 8px 16px;
    font-size: 0.75rem;
    color: ${isDark ? '#8b949e' : '#57606a'};
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

  /* Indented code block (4 spaces) - simple style */
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
    background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
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
};

interface ExtendedMarkdownRendererProps extends MarkdownRendererProps {
  themeMode?: ThemeMode;
}

export function MarkdownRenderer({ content, onLinkPress, themeMode: propThemeMode }: ExtendedMarkdownRendererProps) {
  const { colors, mode: contextMode } = useTheme();
  const { settings: fontSettings } = useFontSettings();
  const themeMode = propThemeMode ?? contextMode;
  const isDark = themeMode === 'dark';

  const webStyles = useMemo(() => generateWebStyles(colors, isDark, fontSettings), [colors, isDark, fontSettings]);
  const syntaxTheme = isDark ? githubDarkTheme : githubLightTheme;
  const codeBlockBg = isDark ? '#161b22' : '#f6f8fa';

  const components: Components = useMemo(
    () => ({
      // pre tag: fence/indented code block wrapper
      pre({ children, node, ...props }) {
        const child = React.Children.toArray(children)[0];
        if (React.isValidElement(child)) {
          const codeProps = child.props as { className?: string; children?: React.ReactNode };
          const className = codeProps.className || '';
          const match = /language-(\w+)/.exec(className);
          const language = match ? match[1] : null;
          const codeContent = String(codeProps.children || '').replace(/\n$/, '');

          // Mermaid diagram
          if (language === 'mermaid') {
            return <MermaidDiagram chart={codeContent.trim()} themeMode={themeMode} />;
          }

          // Fence code block with language - syntax highlighting
          if (language) {
            return (
              <div className="fence-block-wrapper">
                <div className="fence-block-language">{language}</div>
                <SyntaxHighlighter
                  style={syntaxTheme}
                  language={language}
                  PreTag="div"
                  className="fence-block"
                  customStyle={{
                    background: codeBlockBg,
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

          // Indented code block or fence without language
          return (
            <div className="indented-code-block">
              <code>{codeContent}</code>
            </div>
          );
        }

        return <pre {...props}>{children}</pre>;
      },
      // Inline code
      code({ className, children, ...props }) {
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
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...props}>
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
        return <img src={src} alt={alt || ''} loading="lazy" {...props} />;
      },
    }),
    [themeMode, syntaxTheme, codeBlockBg, onLinkPress]
  );

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
