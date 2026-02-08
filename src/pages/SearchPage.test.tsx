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
}));

vi.mock('react-icons/io5', () => ({
  IoSearch: (props: any) => <span data-testid="icon-search" {...props} />,
  IoClose: (props: any) => <span data-testid="icon-close" {...props} />,
  IoDocumentTextOutline: (props: any) => <span {...props} />,
  IoDocumentOutline: (props: any) => <span {...props} />,
  IoArrowForward: (props: any) => <span {...props} />,
}));

vi.mock('../components/ui', () => ({
  GoogleLogo: ({ size }: any) => <span data-testid="google-logo" />,
}));

const mockAuthenticate = vi.fn();

vi.mock('../hooks', () => ({
  useGoogleAuth: () => ({
    isLoading: false,
    isAuthenticated: false,
    results: [],
    recentFiles: [],
    search: vi.fn(),
    loadRecentFiles: vi.fn(),
    authenticate: mockAuthenticate,
    clearResults: vi.fn(),
  }),
  useTheme: () => ({
    colors: {},
    resolvedMode: 'light',
    mode: 'light',
    setTheme: vi.fn(),
  }),
  useLanguage: () => ({
    t: {
      search: {
        placeholder: 'Search Google Drive...',
        signInPrompt: 'Sign in to search Google Drive',
        signIn: 'Sign in with Google',
        recentTitle: 'Recent Files',
        recentHint: 'Your recently accessed files',
        noRecentFiles: 'No recent files',
        emptyHint: 'Search for markdown files',
        minChars: 'Type at least 2 characters',
        noResults: 'No results found',
        noResultsHint: 'Try different keywords',
        resultCount: '{count} result',
        resultsCount: '{count} results',
        privacyTitle: 'Privacy',
        privacyDesc: 'Your data stays local.',
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

import SearchPage from './SearchPage';

describe('SearchPage', () => {
  it('renders search input', () => {
    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search Google Drive...');
    expect(input).toBeTruthy();
  });

  it('renders close button', () => {
    renderWithProviders(<SearchPage />);
    const closeIcon = screen.getByTestId('icon-close');
    expect(closeIcon.closest('button')).toBeTruthy();
  });

  it('shows auth prompt when not authenticated', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText('Sign in to search Google Drive')).toBeTruthy();
    expect(screen.getByText('Sign in with Google')).toBeTruthy();
  });

  it('clicking close button calls navigate(-1)', () => {
    renderWithProviders(<SearchPage />);
    const closeButton = screen.getByTestId('icon-close').closest('button')!;
    fireEvent.click(closeButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
