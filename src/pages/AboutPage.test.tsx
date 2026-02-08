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

vi.mock('../components/ui', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
  LanguageToggle: () => <div data-testid="language-toggle" />,
}));

vi.mock('react-icons/io5', () => ({
  IoArrowBack: (props: any) => <span data-testid="icon-arrow-back" {...props} />,
  IoLogoGoogle: (props: any) => <span {...props} />,
  IoCodeSlashOutline: (props: any) => <span {...props} />,
  IoGitNetworkOutline: (props: any) => <span {...props} />,
  IoDocumentOutline: (props: any) => <span {...props} />,
  IoFolderOutline: (props: any) => <span {...props} />,
  IoTimeOutline: (props: any) => <span {...props} />,
  IoDocumentTextOutline: (props: any) => <span {...props} />,
  IoLibraryOutline: (props: any) => <span {...props} />,
  IoShieldCheckmarkOutline: (props: any) => <span {...props} />,
  IoLockClosedOutline: (props: any) => <span {...props} />,
}));

const mockT = {
  about: {
    title: 'About',
    appName: 'MarkDrive',
    version: 'Version {version}',
    whatIs: 'What is MarkDrive?',
    description: 'A markdown viewer for Google Drive.',
    features: 'Features',
    feature: {
      drive: { title: 'Google Drive', desc: 'Drive integration' },
      syntax: { title: 'Syntax Highlighting', desc: 'Code highlighting' },
      mermaid: { title: 'Mermaid Diagrams', desc: 'Diagram support' },
      pdf: { title: 'PDF Export', desc: 'Export to PDF' },
      local: { title: 'Local Files', desc: 'Open local files' },
      recent: { title: 'Recent Files', desc: 'Quick access' },
    },
    supported: 'Supported Formats',
    chips: {
      headers: 'Headers',
      boldItalic: 'Bold/Italic',
      lists: 'Lists',
      tables: 'Tables',
      codeBlocks: 'Code Blocks',
      links: 'Links',
      images: 'Images',
      blockquotes: 'Blockquotes',
      taskLists: 'Task Lists',
      strikethrough: 'Strikethrough',
      mermaid: 'Mermaid',
      gfm: 'GFM',
    },
    privacy: 'Privacy',
    privacyDesc: 'Your data stays in your browser.',
    license: 'License',
    licenseDesc: 'MIT License',
    viewLicense: 'View License',
    viewThirdPartyLicenses: 'Third-Party Licenses',
    viewTerms: 'Terms of Service',
    viewPrivacy: 'Privacy Policy',
    footer: 'Made with love',
  },
};

vi.mock('../hooks', () => ({
  useLanguage: () => ({ t: mockT, language: 'en', setLanguage: vi.fn() }),
}));

// ---------- helpers ----------

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

// ---------- tests ----------

import AboutPage from './AboutPage';

describe('AboutPage', () => {
  it('renders page title', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('renders app name "MarkDrive"', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText('MarkDrive')).toBeTruthy();
  });

  it('renders version', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText('Version 2.0.0')).toBeTruthy();
  });

  it('clicking back button calls navigate(-1)', () => {
    renderWithProviders(<AboutPage />);
    const backButton = screen.getByTestId('icon-arrow-back').closest('button')!;
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders features section', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText('Features')).toBeTruthy();
    expect(screen.getByText('Google Drive')).toBeTruthy();
    expect(screen.getByText('Syntax Highlighting')).toBeTruthy();
    expect(screen.getByText('Mermaid Diagrams')).toBeTruthy();
    expect(screen.getByText('PDF Export')).toBeTruthy();
    expect(screen.getByText('Local Files')).toBeTruthy();
    expect(screen.getByText('Recent Files')).toBeTruthy();
  });

  it('clicking license button calls navigate("/license")', () => {
    renderWithProviders(<AboutPage />);
    const licenseButton = screen.getByText('View License').closest('button')!;
    fireEvent.click(licenseButton);
    expect(mockNavigate).toHaveBeenCalledWith('/license');
  });
});
