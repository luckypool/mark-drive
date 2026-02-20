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

  it('should render fence code block with language', () => {
    const md = '```javascript\nconst x = 1;\n```';
    const { container } = render(<MarkdownRenderer content={md} />);
    const wrapper = container.querySelector('.fence-block-wrapper');
    expect(wrapper).toBeTruthy();
    const langLabel = container.querySelector('.fence-block-language');
    expect(langLabel?.textContent).toBe('javascript');
  });

  it('should render indented/fenced code block without language', () => {
    const md = '```\nplain code\n```';
    const { container } = render(<MarkdownRenderer content={md} />);
    const block = container.querySelector('.indented-code-block');
    expect(block).toBeTruthy();
    expect(block?.textContent).toContain('plain code');
  });

  it('should render mermaid diagram block', () => {
    const md = '```mermaid\ngraph TD;\n  A-->B;\n```';
    const { container } = render(<MarkdownRenderer content={md} />);
    const diagram = container.querySelector('.mermaid-diagram');
    expect(diagram).toBeTruthy();
  });

  it('should call onLinkPress when provided and link is clicked', () => {
    const onLinkPress = vi.fn();
    render(<MarkdownRenderer content="[Click](https://example.com)" onLinkPress={onLinkPress} />);
    const link = screen.getByText('Click');
    fireEvent.click(link);
    expect(onLinkPress).toHaveBeenCalledWith('https://example.com');
  });

  it('should render image without alt as empty alt', () => {
    const { container } = render(<MarkdownRenderer content="![](https://example.com/img.png)" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('should use light syntax theme when themeMode is light', () => {
    const md = '```javascript\nconst x = 1;\n```';
    const { container } = render(<MarkdownRenderer content={md} themeMode="light" />);
    const wrapper = container.querySelector('.fence-block-wrapper');
    expect(wrapper).toBeTruthy();
  });
});
