/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

// Mock useTheme
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      bgPrimary: '#0a0b14',
      bgSecondary: '#111320',
      bgTertiary: '#1a1d2e',
      bgCard: '#151729',
      accent: '#6366f1',
      accentHover: '#818cf8',
      accentMuted: 'rgba(99,102,241,0.12)',
      textPrimary: '#e2e8f0',
      textSecondary: '#94a3b8',
      textMuted: '#475569',
      border: '#1e2038',
      borderLight: '#2a2d45',
      error: '#ef4444',
      warning: '#f59e0b',
      warningMuted: 'rgba(245,158,11,0.12)',
      success: '#10b981',
      overlay: 'rgba(0,0,0,0.6)',
      overlayLight: 'rgba(0,0,0,0.3)',
      shadowColor: 'rgba(0,0,0,0.4)',
    },
    resolvedMode: 'dark' as const,
  }),
}));

// Mock useFontSettings
vi.mock('../../contexts/FontSettingsContext', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../contexts/FontSettingsContext')>();
  return {
    ...original,
    useFontSettings: () => ({
      settings: {
        fontSize: 'medium' as const,
        fontFamily: 'system' as const,
      },
      setFontSize: vi.fn(),
      setFontFamily: vi.fn(),
      getMultiplier: () => 1.0,
      getFontStack: () => 'system-ui',
    }),
  };
});

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async () => ({ svg: '<svg>test</svg>' })),
  },
}));

describe('MarkdownRenderer', () => {
  it('should render basic markdown content', () => {
    render(<MarkdownRenderer content="Hello **world**" />);
    expect(screen.getByText('world')).toBeTruthy();
  });

  it('should render headings', () => {
    render(<MarkdownRenderer content="# Title" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Title');
  });

  it('should render links with target blank', () => {
    render(<MarkdownRenderer content="[Link](https://example.com)" />);
    const link = screen.getByText('Link');
    expect(link.closest('a')?.getAttribute('target')).toBe('_blank');
    expect(link.closest('a')?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should render inline code', () => {
    render(<MarkdownRenderer content="Use `code` here" />);
    const code = screen.getByText('code');
    expect(code.className).toBe('inline-code');
  });

  it('should inject generated styles', () => {
    const { container } = render(<MarkdownRenderer content="test" />);
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeTruthy();
    expect(styleTag!.innerHTML).toContain('.markdown-content');
    expect(styleTag!.innerHTML).toContain('font-size:');
  });

  it('should render tables with wrapper', () => {
    const tableMarkdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;
    const { container } = render(<MarkdownRenderer content={tableMarkdown} />);
    const wrapper = container.querySelector('.table-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper!.querySelector('table')).toBeTruthy();
  });

  it('should render images with lazy loading', () => {
    render(<MarkdownRenderer content="![Alt text](https://example.com/image.png)" />);
    const img = screen.getByAltText('Alt text');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('should render inline math with KaTeX', () => {
    const { container } = render(<MarkdownRenderer content="The formula $E=mc^2$ is famous." />);
    const katexSpan = container.querySelector('.katex');
    expect(katexSpan).toBeTruthy();
  });

  it('should render block math with KaTeX', () => {
    const { container } = render(<MarkdownRenderer content={'$$\n\\sum_{i=1}^{n} i\n$$'} />);
    const katexDisplay = container.querySelector('.katex-display');
    expect(katexDisplay).toBeTruthy();
  });

  it('should not crash on invalid math expressions', () => {
    const { container } = render(<MarkdownRenderer content="$\\invalidcommandxyz$" />);
    // Should render without crashing — KaTeX shows error text
    expect(container.querySelector('.markdown-content')).toBeTruthy();
  });

  it('should include KaTeX styles in generated CSS', () => {
    const { container } = render(<MarkdownRenderer content="test" />);
    const styleTag = container.querySelector('style');
    expect(styleTag!.innerHTML).toContain('.katex-display');
    expect(styleTag!.innerHTML).toContain('.katex-error');
  });

  it('should include dark mode KaTeX color override when theme is dark', () => {
    const { container } = render(<MarkdownRenderer content="test" themeMode="dark" />);
    const styleTag = container.querySelector('style');
    expect(styleTag!.innerHTML).toContain('.katex .katex-html');
  });

  it('should not include dark mode KaTeX color override when theme is light', () => {
    const { container } = render(<MarkdownRenderer content="test" themeMode="light" />);
    const styleTag = container.querySelector('style');
    expect(styleTag!.innerHTML).not.toContain('.katex .katex-html');
  });

  it('should render code block with syntax highlighting when language is specified', () => {
    const { container } = render(
      <MarkdownRenderer content={'```javascript\nconst x = 1;\n```'} />
    );
    const wrapper = container.querySelector('.fence-block-wrapper');
    expect(wrapper).toBeTruthy();
    const langLabel = container.querySelector('.fence-block-language');
    expect(langLabel).toBeTruthy();
    expect(langLabel!.textContent).toBe('javascript');
  });

  it('should render code block without language as indented-code-block', () => {
    const { container } = render(
      <MarkdownRenderer content={'```\nplain code\n```'} />
    );
    const indented = container.querySelector('.indented-code-block');
    expect(indented).toBeTruthy();
    expect(indented!.textContent).toContain('plain code');
  });

  it('should render mermaid code block', () => {
    const { container } = render(
      <MarkdownRenderer content={'```mermaid\ngraph TD\n    A-->B\n```'} />
    );
    // Mermaid diagram renders in a div with mermaid-diagram class
    const diagram = container.querySelector('.mermaid-diagram');
    expect(diagram).toBeTruthy();
  });

  it('should call onLinkPress when clicking a link with handler', () => {
    const onLinkPress = vi.fn();
    render(
      <MarkdownRenderer
        content="Click [here](https://example.com)"
        onLinkPress={onLinkPress}
      />
    );
    const link = screen.getByText('here');
    fireEvent.click(link);
    expect(onLinkPress).toHaveBeenCalledWith('https://example.com');
  });

  it('should not call onLinkPress when handler is not provided', () => {
    render(<MarkdownRenderer content="Click [here](https://example.com)" />);
    const link = screen.getByText('here');
    // Should not throw when clicking without handler
    fireEvent.click(link);
    expect(link.closest('a')?.getAttribute('href')).toBe('https://example.com');
  });

  it('should render with light theme', () => {
    const { container } = render(
      <MarkdownRenderer content="# Hello" themeMode="light" />
    );
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeTruthy();
    // Light theme should not contain dark KaTeX override
    expect(styleTag!.innerHTML).not.toContain('.katex .katex-html');
  });

  it('should render blockquote', () => {
    const { container } = render(
      <MarkdownRenderer content="> This is a quote" />
    );
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeTruthy();
    expect(blockquote!.textContent).toContain('This is a quote');
  });

  it('should render unordered list', () => {
    const { container } = render(
      <MarkdownRenderer content={'- Item 1\n- Item 2'} />
    );
    const list = container.querySelector('ul');
    expect(list).toBeTruthy();
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(2);
  });

  it('should render horizontal rule', () => {
    const { container } = render(
      <MarkdownRenderer content={'Above\n\n---\n\nBelow'} />
    );
    const hr = container.querySelector('hr');
    expect(hr).toBeTruthy();
  });
});
