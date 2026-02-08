/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// ---------- mocks ----------

vi.mock('react-router', () => ({
  Outlet: () => <div data-testid="outlet">outlet content</div>,
}));

vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />,
}));

vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

vi.mock('../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="language-provider">{children}</div>
  ),
}));

const mockFontSettings = {
  settings: { fontSize: 'medium' as string, fontFamily: 'system' as string },
  setFontSize: vi.fn(),
  setFontFamily: vi.fn(),
  getMultiplier: () => 1.0,
  getFontStack: () => '"Noto Sans JP", sans-serif',
};

vi.mock('../contexts/FontSettingsContext', () => ({
  FontSettingsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="font-settings-provider">{children}</div>
  ),
  useFontSettings: () => mockFontSettings,
  fontFamilyStacks: {
    system: '"Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: '"Noto Serif JP", Georgia, "Times New Roman", Times, serif',
    'sans-serif': '"Noto Sans JP", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}));

beforeEach(() => {
  cleanup();
  mockFontSettings.settings = { fontSize: 'medium', fontFamily: 'system' };

  window.matchMedia = vi.fn(() => ({
    matches: true,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

// ---------- tests ----------

import RootLayout from './RootLayout';

describe('RootLayout', () => {
  it('renders Outlet for child routes', () => {
    render(<RootLayout />);
    expect(screen.getByTestId('outlet')).toBeTruthy();
  });

  it('renders SpeedInsights', () => {
    render(<RootLayout />);
    expect(screen.getByTestId('speed-insights')).toBeTruthy();
  });

  it('wraps content with ThemeProvider', () => {
    render(<RootLayout />);
    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toBeTruthy();
    // Outlet should be inside ThemeProvider
    expect(themeProvider.querySelector('[data-testid="outlet"]')).toBeTruthy();
  });

  it('wraps content with LanguageProvider', () => {
    render(<RootLayout />);
    const langProvider = screen.getByTestId('language-provider');
    expect(langProvider).toBeTruthy();
    expect(langProvider.querySelector('[data-testid="outlet"]')).toBeTruthy();
  });

  it('wraps content with FontSettingsProvider', () => {
    render(<RootLayout />);
    const fontProvider = screen.getByTestId('font-settings-provider');
    expect(fontProvider).toBeTruthy();
    expect(fontProvider.querySelector('[data-testid="outlet"]')).toBeTruthy();
  });

  it('has correct provider nesting order: Theme > Language > FontSettings', () => {
    render(<RootLayout />);
    const theme = screen.getByTestId('theme-provider');
    const lang = screen.getByTestId('language-provider');
    const font = screen.getByTestId('font-settings-provider');
    // Theme contains Language
    expect(theme.contains(lang)).toBe(true);
    // Language contains FontSettings
    expect(lang.contains(font)).toBe(true);
  });
});

describe('RootLayout - Font family application', () => {
  it('applies system font family stack to container by default', () => {
    const { container } = render(<RootLayout />);
    const innerDiv = container.querySelector('[style]');
    expect(innerDiv).toBeTruthy();
    expect(innerDiv!.getAttribute('style')).toContain('Noto Sans JP');
  });

  it('applies serif font family stack when fontFamily is serif', () => {
    mockFontSettings.settings = { fontSize: 'medium', fontFamily: 'serif' };
    const { container } = render(<RootLayout />);
    const innerDiv = container.querySelector('[style]');
    expect(innerDiv).toBeTruthy();
    expect(innerDiv!.getAttribute('style')).toContain('Noto Serif JP');
  });

  it('applies sans-serif font family stack when fontFamily is sans-serif', () => {
    mockFontSettings.settings = { fontSize: 'medium', fontFamily: 'sans-serif' };
    const { container } = render(<RootLayout />);
    const innerDiv = container.querySelector('[style]');
    expect(innerDiv).toBeTruthy();
    expect(innerDiv!.getAttribute('style')).toContain('Noto Sans JP');
    expect(innerDiv!.getAttribute('style')).toContain('Helvetica Neue');
  });
});
