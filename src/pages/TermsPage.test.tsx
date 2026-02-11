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
      legal: {
        terms: {
          title: 'Terms of Service',
          lastUpdated: 'Last updated: 2025-01-01',
          sections: {
            acceptance: { title: 'Acceptance', body: 'Acceptance body text' },
            usage: { title: 'Usage', body: 'Usage body text' },
          },
        },
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
  IoLogoGithub: (props: any) => <span data-testid="icon-github" {...props} />,
  IoOpenOutline: (props: any) => <span data-testid="icon-open" {...props} />,
}));

vi.mock('../components/ui', () => ({
  SettingsMenu: () => <div data-testid="settings-menu" />,
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

describe('TermsPage', () => {
  const loadComponent = async () => {
    const mod = await import('./TermsPage');
    return mod.default;
  };

  it('should render page title from t.legal.terms.title', async () => {
    const TermsPage = await loadComponent();
    renderWithProviders(<TermsPage />);
    expect(screen.getByText('Terms of Service')).toBeTruthy();
  });

  it('should render back button', async () => {
    const TermsPage = await loadComponent();
    renderWithProviders(<TermsPage />);
    const backButton = screen.getByTestId('icon-arrow-back').closest('button');
    expect(backButton).toBeTruthy();
  });

  it('should call navigate(-1) when clicking back button', async () => {
    const TermsPage = await loadComponent();
    renderWithProviders(<TermsPage />);
    const backButton = screen.getByTestId('icon-arrow-back').closest('button')!;
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should render terms sections', async () => {
    const TermsPage = await loadComponent();
    renderWithProviders(<TermsPage />);
    expect(screen.getByText('Acceptance')).toBeTruthy();
    expect(screen.getByText('Acceptance body text')).toBeTruthy();
    expect(screen.getByText('Usage')).toBeTruthy();
    expect(screen.getByText('Usage body text')).toBeTruthy();
  });
});
