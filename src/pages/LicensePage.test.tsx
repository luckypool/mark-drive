/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

vi.mock('../hooks', () => ({
  useLanguage: () => ({
    t: {
      about: {
        license: 'License',
      },
      settings: { theme: 'Theme', light: 'Light', dark: 'Dark', system: 'System', language: 'Language' },
    },
    language: 'en',
    setLanguage: vi.fn(),
  }),
  useTheme: () => ({
    resolvedMode: 'dark',
    mode: 'system',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    colors: { bgPrimary: '#0a0b14' },
  }),
}));

vi.mock('react-icons/io5', () => ({
  IoArrowBack: (props: any) => <span data-testid="icon-arrow-back" {...props} />,
}));

vi.mock('../components/ui', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">ThemeToggle</button>,
  LanguageToggle: () => <button data-testid="language-toggle">LanguageToggle</button>,
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

beforeEach(() => {
  cleanup();
  mockNavigate.mockClear();
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

describe('LicensePage', () => {
  const loadComponent = async () => {
    const mod = await import('./LicensePage');
    return mod.default;
  };

  it('should render page title from t.about.license', async () => {
    const LicensePage = await loadComponent();
    renderWithProviders(<LicensePage />);
    expect(screen.getByText('License')).toBeTruthy();
  });

  it('should render MIT License text', async () => {
    const LicensePage = await loadComponent();
    renderWithProviders(<LicensePage />);
    expect(screen.getByText(/MIT License/)).toBeTruthy();
    expect(screen.getByText(/Copyright \(c\) 2025 luckypool/)).toBeTruthy();
    expect(screen.getByText(/Permission is hereby granted/)).toBeTruthy();
  });

  it('should call navigate(-1) when clicking back button', async () => {
    const LicensePage = await loadComponent();
    renderWithProviders(<LicensePage />);
    const backButton = screen.getByTestId('icon-arrow-back').closest('button')!;
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
