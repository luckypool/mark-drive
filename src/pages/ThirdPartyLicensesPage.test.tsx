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
        thirdPartyLicenses: 'Third-Party Licenses',
        thirdPartyDesc: 'This app uses the following libraries.',
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
  IoOpenOutline: (props: any) => <span data-testid="icon-open" {...props} />,
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

describe('ThirdPartyLicensesPage', () => {
  const loadComponent = async () => {
    const mod = await import('./ThirdPartyLicensesPage');
    return mod.default;
  };

  it('should render page title from t.about.thirdPartyLicenses', async () => {
    const ThirdPartyLicensesPage = await loadComponent();
    renderWithProviders(<ThirdPartyLicensesPage />);
    expect(screen.getByText('Third-Party Licenses')).toBeTruthy();
  });

  it('should render library names', async () => {
    const ThirdPartyLicensesPage = await loadComponent();
    renderWithProviders(<ThirdPartyLicensesPage />);
    expect(screen.getByText('React')).toBeTruthy();
    expect(screen.getByText('Vite')).toBeTruthy();
    expect(screen.getByText('Mermaid')).toBeTruthy();
    expect(screen.getByText('react-markdown')).toBeTruthy();
    expect(screen.getByText('react-icons')).toBeTruthy();
    expect(screen.getByText('html2pdf.js')).toBeTruthy();
  });

  it('should call navigate(-1) when clicking back button', async () => {
    const ThirdPartyLicensesPage = await loadComponent();
    renderWithProviders(<ThirdPartyLicensesPage />);
    const backButton = screen.getByTestId('icon-arrow-back').closest('button')!;
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should render MIT License notice section', async () => {
    const ThirdPartyLicensesPage = await loadComponent();
    renderWithProviders(<ThirdPartyLicensesPage />);
    expect(screen.getByText('MIT License')).toBeTruthy();
    expect(screen.getByText(/Permission is hereby granted/)).toBeTruthy();
  });
});
