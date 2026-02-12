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
      support: {
        title: 'Support',
        intro: 'Thank you for using MarkDrive.',
        bugReport: {
          title: 'Bug Reports',
          desc: 'Please open an issue on GitHub.',
          button: 'Open GitHub Issues',
        },
        contact: {
          title: 'General Inquiries',
          desc: 'Contact us via email.',
          button: 'Send Email',
        },
        faq: {
          title: 'FAQ',
          items: {
            q1: {
              question: 'How do I sign in?',
              answer: 'Click Sign in with Google.',
            },
            q2: {
              question: 'Is my data stored?',
              answer: 'No, it runs in your browser.',
            },
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
  IoMailOutline: (props: any) => <span data-testid="icon-mail" {...props} />,
  IoOpenOutline: (props: any) => <span data-testid="icon-open" {...props} />,
  IoChevronDown: (props: any) => <span data-testid="icon-chevron-down" {...props} />,
  IoChevronUp: (props: any) => <span data-testid="icon-chevron-up" {...props} />,
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

describe('SupportPage', () => {
  const loadComponent = async () => {
    const mod = await import('./SupportPage');
    return mod.default;
  };

  it('should render page title', async () => {
    const SupportPage = await loadComponent();
    renderWithProviders(<SupportPage />);
    expect(screen.getByText('Support')).toBeTruthy();
  });

  it('should render back button and navigate on click', async () => {
    const SupportPage = await loadComponent();
    renderWithProviders(<SupportPage />);
    const backButton = screen.getByTestId('icon-arrow-back').closest('button')!;
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should render bug report section', async () => {
    const SupportPage = await loadComponent();
    renderWithProviders(<SupportPage />);
    expect(screen.getByText('Bug Reports')).toBeTruthy();
    expect(screen.getByText('Open GitHub Issues')).toBeTruthy();
  });

  it('should render contact section', async () => {
    const SupportPage = await loadComponent();
    renderWithProviders(<SupportPage />);
    expect(screen.getByText('General Inquiries')).toBeTruthy();
    expect(screen.getByText('Send Email')).toBeTruthy();
  });

  it('should render FAQ section with questions', async () => {
    const SupportPage = await loadComponent();
    renderWithProviders(<SupportPage />);
    expect(screen.getByText('FAQ')).toBeTruthy();
    expect(screen.getByText('How do I sign in?')).toBeTruthy();
    expect(screen.getByText('Is my data stored?')).toBeTruthy();
  });

  it('should toggle FAQ answer on click', async () => {
    const SupportPage = await loadComponent();
    renderWithProviders(<SupportPage />);

    // Answer should not be visible initially
    expect(screen.queryByText('Click Sign in with Google.')).toBeNull();

    // Click question to expand
    fireEvent.click(screen.getByText('How do I sign in?'));
    expect(screen.getByText('Click Sign in with Google.')).toBeTruthy();

    // Click again to collapse
    fireEvent.click(screen.getByText('How do I sign in?'));
    expect(screen.queryByText('Click Sign in with Google.')).toBeNull();
  });

  it('should open GitHub Issues when clicking bug report button', async () => {
    const SupportPage = await loadComponent();
    renderWithProviders(<SupportPage />);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.click(screen.getByText('Open GitHub Issues'));
    expect(openSpy).toHaveBeenCalledWith('https://github.com/luckypool/mark-drive/issues', '_blank');
    openSpy.mockRestore();
  });

  it('should render mailto link for contact button', async () => {
    const SupportPage = await loadComponent();
    renderWithProviders(<SupportPage />);
    const link = screen.getByText('Send Email').closest('a');
    expect(link).toBeTruthy();
    expect(link!.getAttribute('href')).toBe('mailto:founder@mark-drive.com');
  });
});
