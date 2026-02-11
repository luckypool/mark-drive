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
    IoSearch: stub('search'),
    IoShieldCheckmarkOutline: stub('shield'),
    IoCodeSlashOutline: stub('code'),
    IoGitNetworkOutline: stub('git-network'),
    IoLogoGoogle: stub('google'),
    IoColorPaletteOutline: stub('palette'),
    IoShareOutline: stub('share'),
    IoFolderOutline: stub('folder'),
    IoFolderOpenOutline: stub('folder-open'),
    IoFlashOutline: stub('flash'),
    IoDocumentTextOutline: stub('doc-text'),
    IoLogInOutline: stub('log-in'),
    IoSearchOutline: stub('search-outline'),
    IoEyeOutline: stub('eye'),
    IoChevronForward: stub('chevron-forward'),
    IoChevronDown: stub('chevron-down'),
    IoDocumentOutline: stub('doc'),
    IoPersonOutline: stub('person'),
    IoLogOutOutline: stub('logout'),
    IoLogoGithub: stub('github'),
    IoSettingsOutline: stub('settings'),
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
  SettingsMenu: () => <div data-testid="settings-menu" />,
  UserMenu: ({ isAuthenticated }: any) => <div data-testid="user-menu" data-authenticated={isAuthenticated} />,
  GoogleLogo: ({ size }: any) => <span data-testid="google-logo" />,
}));

vi.mock('../components/ui/AddToHomeScreenBanner', () => ({
  AddToHomeScreenBanner: () => <div data-testid="pwa-banner" />,
}));

const mockAuthenticate = vi.fn();
const mockLogout = vi.fn();
const mockOpenPicker = vi.fn();
const mockOpenDrivePicker = vi.fn();
const mockUpdatePickerSettings = vi.fn();

const mockAuthState = {
  isLoading: false,
  isApiLoaded: true,
  isAuthenticated: false,
  userInfo: null as any,
  authenticate: mockAuthenticate,
  logout: mockLogout,
  openDrivePicker: mockOpenDrivePicker,
};

const mockPickerState = {
  pickerSettings: { ownedByMe: false, starred: false },
  updatePickerSettings: mockUpdatePickerSettings,
};

vi.mock('../hooks', () => ({
  useGoogleAuth: () => mockAuthState,
  useTheme: () => ({
    resolvedMode: 'light',
    mode: 'light',
    setTheme: vi.fn(),
    colors: {},
  }),
  usePickerSettings: () => mockPickerState,
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
        techTitle: 'Your data\nstays with you',
        stats: {
          clientSide: { value: '100%', label: 'Client-Side' },
          serverStorage: { value: '0', label: 'Server Storage' },
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
        picker: 'Picker',
        pickerOwnedByMe: 'Owned by me',
        pickerStarred: 'Starred',
        on: 'ON',
        off: 'OFF',
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
  mockOpenDrivePicker.mockClear();
  mockOpenPicker.mockClear();
  mockLogout.mockClear();
  mockUpdatePickerSettings.mockClear();

  // Reset auth state to defaults
  Object.assign(mockAuthState, {
    isLoading: false,
    isApiLoaded: true,
    isAuthenticated: false,
    userInfo: null,
    authenticate: mockAuthenticate,
    logout: mockLogout,
    openDrivePicker: mockOpenDrivePicker,
  });

  // Reset picker settings
  Object.assign(mockPickerState, {
    pickerSettings: { ownedByMe: false, starred: false },
    updatePickerSettings: mockUpdatePickerSettings,
  });

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

describe('HomePage - Header brand', () => {
  it('has MarkDrive logo image in header', () => {
    renderWithProviders(<HomePage />);
    // Both header and footer have img with alt="MarkDrive"
    const logos = screen.getAllByAltText('MarkDrive', { exact: true });
    expect(logos.length).toBeGreaterThanOrEqual(1);
    expect(logos[0].tagName.toLowerCase()).toBe('img');
  });

  it('has app name text "MarkDrive" in header', () => {
    renderWithProviders(<HomePage />);
    // "MarkDrive" appears in header brand and footer
    const matches = screen.getAllByText('MarkDrive');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('has settings menu in header', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('settings-menu')).toBeTruthy();
  });
});

describe('HomePage - Stats section', () => {
  it('shows clientSide stat', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText('Client-Side')).toBeTruthy();
  });

  it('shows serverStorage stat', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('Server Storage')).toBeTruthy();
  });

  it('does NOT show license stat', () => {
    renderWithProviders(<HomePage />);
    expect(screen.queryByText('MIT')).toBeNull();
    expect(screen.queryByText('License')).toBeNull();
  });
});

describe('HomePage - techTitle line break', () => {
  it('renders h2 with both lines of techTitle', () => {
    renderWithProviders(<HomePage />);
    // techTitle is "Your data\nstays with you" rendered via .split('\n').map()
    const headings = screen.getAllByRole('heading', { level: 2 });
    const techHeading = headings.find(
      (h) => h.textContent?.includes('Your data') && h.textContent?.includes('stays with you'),
    );
    expect(techHeading).toBeTruthy();
  });
});

// ---------- Authenticated state ----------

describe('HomePage (authenticated)', () => {
  beforeEach(() => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.userInfo = { email: 'test@example.com', name: 'Test User', picture: '' };
  });

  it('renders FAB button when authenticated', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('fab')).toBeTruthy();
  });

  it('FAB click calls openDrivePicker and navigates on result', async () => {
    mockOpenDrivePicker.mockResolvedValueOnce({ id: 'file-1', name: 'test.md' });
    renderWithProviders(<HomePage />);

    fireEvent.click(screen.getByTestId('fab'));

    await vi.waitFor(() => {
      expect(mockOpenDrivePicker).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/viewer?')
      );
    });
  });

  it('FAB click does not navigate when picker is cancelled', async () => {
    mockOpenDrivePicker.mockResolvedValueOnce(null);
    renderWithProviders(<HomePage />);

    fireEvent.click(screen.getByTestId('fab'));

    await vi.waitFor(() => {
      expect(mockOpenDrivePicker).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('Cmd+K shortcut calls openDrivePicker', async () => {
    mockOpenDrivePicker.mockResolvedValueOnce(null);
    renderWithProviders(<HomePage />);

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    await vi.waitFor(() => {
      expect(mockOpenDrivePicker).toHaveBeenCalled();
    });
  });

  it('does not show FAB when not authenticated', () => {
    mockAuthState.isAuthenticated = false;
    renderWithProviders(<HomePage />);
    expect(screen.queryByTestId('fab')).toBeNull();
  });
});

describe('HomePage - Picker settings', () => {
  beforeEach(() => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.userInfo = { email: 'test@example.com', name: 'Test User', picture: '' };
  });

  const openAccordion = () => {
    // Click the accordion trigger to expand picker settings
    fireEvent.click(screen.getByText('Picker').closest('button')!);
  };

  it('shows picker accordion trigger on authenticated home page', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Picker')).toBeTruthy();
  });

  it('expands to show settings when accordion is clicked', () => {
    renderWithProviders(<HomePage />);
    // Settings hidden by default
    expect(screen.queryByText('Owned by me')).toBeNull();
    // Open accordion
    openAccordion();
    expect(screen.getByText('Owned by me')).toBeTruthy();
    expect(screen.getByText('Starred')).toBeTruthy();
  });

  it('shows ON/OFF toggles for picker settings', () => {
    renderWithProviders(<HomePage />);
    openAccordion();
    const onButtons = screen.getAllByText('ON');
    const offButtons = screen.getAllByText('OFF');
    expect(onButtons.length).toBe(2);
    expect(offButtons.length).toBe(2);
  });

  it('calls updatePickerSettings when toggling ownedByMe', () => {
    renderWithProviders(<HomePage />);
    openAccordion();
    const onButtons = screen.getAllByText('ON');
    fireEvent.click(onButtons[0].closest('button')!);
    expect(mockUpdatePickerSettings).toHaveBeenCalledWith({ ownedByMe: true });
  });

  it('calls updatePickerSettings when toggling starred', () => {
    renderWithProviders(<HomePage />);
    openAccordion();
    const onButtons = screen.getAllByText('ON');
    fireEvent.click(onButtons[1].closest('button')!);
    expect(mockUpdatePickerSettings).toHaveBeenCalledWith({ starred: true });
  });
});

describe('HomePage - Recent files', () => {
  beforeEach(() => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.userInfo = { email: 'test@example.com', name: 'Test User', picture: '' };
  });

  it('shows recent files from history', async () => {
    const { getFileHistory } = await import('../services');
    vi.mocked(getFileHistory).mockResolvedValueOnce([
      { id: 'f1', name: 'readme.md', source: 'google-drive', selectedAt: new Date().toISOString() },
    ]);

    renderWithProviders(<HomePage />);

    await vi.waitFor(() => {
      expect(screen.getByText('readme.md')).toBeTruthy();
    });
  });

  it('filters out local files from recent list', async () => {
    const { getFileHistory } = await import('../services');
    vi.mocked(getFileHistory).mockResolvedValueOnce([
      { id: 'f1', name: 'local.md', source: 'local', selectedAt: new Date().toISOString() },
      { id: 'f2', name: 'drive.md', source: 'google-drive', selectedAt: new Date().toISOString() },
    ]);

    renderWithProviders(<HomePage />);

    await vi.waitFor(() => {
      expect(screen.getByText('drive.md')).toBeTruthy();
    });
    expect(screen.queryByText('local.md')).toBeNull();
  });

  it('navigates when clicking a history item', async () => {
    const { getFileHistory } = await import('../services');
    vi.mocked(getFileHistory).mockResolvedValueOnce([
      { id: 'f1', name: 'readme.md', source: 'google-drive', selectedAt: new Date().toISOString() },
    ]);

    renderWithProviders(<HomePage />);

    await vi.waitFor(() => {
      expect(screen.getByText('readme.md')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('readme.md'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/viewer?')
    );
  });
});
