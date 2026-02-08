/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';

// ---------- mocks ----------

const mockNavigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...rest }: any) => <a href={to} {...rest}>{children}</a>,
}));

vi.mock('../../assets/images/icon.png', () => ({ default: 'icon.png' }));

vi.mock('react-icons/io5', () => {
  const stub = (name: string) => (props: any) => <span data-testid={`icon-${name}`} {...props} />;
  return {
    IoMenu: stub('menu'),
    IoSearch: stub('search'),
    IoShieldCheckmarkOutline: stub('shield'),
    IoCodeSlashOutline: stub('code'),
    IoGitNetworkOutline: stub('git-network'),
    IoLogoGoogle: stub('google'),
    IoColorPaletteOutline: stub('palette'),
    IoShareOutline: stub('share'),
    IoFolderOutline: stub('folder'),
    IoFlashOutline: stub('flash'),
    IoDocumentTextOutline: stub('doc-text'),
    IoLogInOutline: stub('log-in'),
    IoSearchOutline: stub('search-outline'),
    IoEyeOutline: stub('eye'),
    IoChevronForward: stub('chevron-forward'),
    IoChevronDown: stub('chevron-down'),
    IoDocumentOutline: stub('doc'),
    IoPersonOutline: stub('person'),
    IoInformationCircleOutline: stub('info'),
    IoLogOutOutline: stub('logout'),
    IoSunnyOutline: stub('sunny'),
    IoMoonOutline: stub('moon'),
    IoPhonePortraitOutline: stub('phone'),
    IoLogoGithub: stub('github'),
  };
});

vi.mock('../components/ui', () => ({
  Button: ({ children, onPress, onClick, disabled, loading, icon, ...rest }: any) => (
    <button onClick={onClick || onPress} disabled={disabled || loading} {...rest}>
      {icon}
      {!loading && children}
    </button>
  ),
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
  FAB: ({ onPress, icon }: any) => <button data-testid="fab" onClick={onPress}>{icon}</button>,
  ThemeToggle: () => <div data-testid="theme-toggle" />,
  LanguageToggle: () => <div data-testid="language-toggle" />,
  GoogleLogo: ({ size }: any) => <span data-testid="google-logo" />,
}));

vi.mock('../components/ui/AddToHomeScreenBanner', () => ({
  AddToHomeScreenBanner: () => <div data-testid="pwa-banner" />,
}));

const mockAuthenticate = vi.fn();
const mockLogout = vi.fn();
const mockOpenPicker = vi.fn();

vi.mock('../hooks', () => ({
  useGoogleAuth: () => ({
    isLoading: false,
    isApiLoaded: true,
    isAuthenticated: false,
    userInfo: null,
    authenticate: mockAuthenticate,
    logout: mockLogout,
  }),
  useTheme: () => ({
    resolvedMode: 'light',
    mode: 'light',
    setTheme: vi.fn(),
    colors: {},
  }),
  useLanguage: () => ({
    t: {
      home: {
        welcomeLine1: 'Your Markdown files,',
        welcomeLine2: 'beautifully rendered ',
        welcomeHighlight: 'in your browser.',
        subtitle: 'Preview and edit Markdown from Google Drive',
        tagline: 'No server, no upload, pure client-side.',
        signIn: 'Sign in with Google',
        or: 'or',
        openLocal: 'Open Local File',
        searchPlaceholder: 'Search files...',
        recentFiles: 'Recent Files',
        clear: 'Clear',
        about: 'About',
        signOut: 'Sign Out',
        howItWorks: {
          title: 'How It Works',
          step1: { title: 'Sign In', desc: 'Authenticate with Google' },
          step2: { title: 'Search', desc: 'Find your markdown files' },
          step3: { title: 'Preview', desc: 'View beautifully rendered' },
        },
        featuresTitle: 'Features',
        feature: {
          drive: { title: 'Google Drive', desc: 'Direct integration' },
          rendering: { title: 'Beautiful Rendering', desc: 'GFM support' },
          pdf: { title: 'PDF Export', desc: 'Export to PDF' },
          syntax: { title: 'Syntax Highlighting', desc: 'Code blocks' },
          mermaid: { title: 'Mermaid Diagrams', desc: 'Diagram support' },
          local: { title: 'Local Files', desc: 'Open local files' },
        },
        techTitle: 'Technology',
        stats: {
          clientSide: { value: '100%', label: 'Client-Side' },
          serverStorage: { value: '0', label: 'Server Storage' },
          license: { value: 'MIT', label: 'License' },
        },
        benefitsTitle: 'Benefits',
        benefit: {
          privacy: { title: 'Privacy First', desc: 'Data stays local' },
          instant: { title: 'Instant Preview', desc: 'No waiting' },
          beautiful: { title: 'Beautiful Output', desc: 'Clean rendering' },
        },
        closingCta: {
          title: 'Get Started',
          subtitle: 'Start viewing your markdown files now.',
        },
        footer: {
          viewOnGithub: 'View on GitHub',
          builtWith: 'Built with React',
        },
      },
      search: {
        privacyTitle: 'Privacy',
        privacyDesc: 'Your data stays local.',
      },
      about: {
        viewPrivacy: 'Privacy Policy',
        viewTerms: 'Terms of Service',
      },
      settings: {
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        language: 'Language',
      },
      menu: {
        display: 'Display',
      },
      fontSettings: {
        fontSize: 'Font Size',
        fontFamily: 'Font Family',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        system: 'System',
        serif: 'Serif',
        sansSerif: 'Sans-Serif',
      },
      common: {
        justNow: 'Just now',
        minutesAgo: '{min} minutes ago',
        hoursAgo: '{hours} hours ago',
        daysAgo: '{days} days ago',
      },
    },
    language: 'en',
    setLanguage: vi.fn(),
  }),
  useFilePicker: () => ({
    openPicker: mockOpenPicker,
  }),
}));

vi.mock('../contexts/FontSettingsContext', () => ({
  useFontSettings: () => ({
    settings: { fontSize: 'medium', fontFamily: 'system' },
    setFontSize: vi.fn(),
    setFontFamily: vi.fn(),
  }),
}));

vi.mock('../services', () => ({
  getFileHistory: vi.fn().mockResolvedValue([]),
  clearFileHistory: vi.fn(),
  addFileToHistory: vi.fn(),
}));

// ---------- helpers ----------

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

beforeEach(() => {
  cleanup();
  mockNavigate.mockClear();
  mockAuthenticate.mockClear();

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

import HomePage from './HomePage';

describe('HomePage (unauthenticated)', () => {
  it('renders MarkDrive logo text', () => {
    renderWithProviders(<HomePage />);
    // "MarkDrive" appears in both the hero logo and the footer brand
    expect(screen.getAllByText('MarkDrive').length).toBeGreaterThanOrEqual(1);
  });

  it('renders sign-in button', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getAllByText('Sign in with Google').length).toBeGreaterThan(0);
  });

  it('renders hero section with welcome text', () => {
    renderWithProviders(<HomePage />);
    // The welcome text is split across nested elements inside a single <h1>,
    // so we use a broad regex to match against the combined text content.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Your Markdown files,');
    expect(heading.textContent).toContain('beautifully rendered');
    expect(heading.textContent).toContain('in your browser.');
  });

  it('renders features section title', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Features')).toBeTruthy();
  });

  it('renders how it works section title', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('How It Works')).toBeTruthy();
  });
});
