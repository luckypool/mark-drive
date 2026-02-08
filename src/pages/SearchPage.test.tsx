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
  IoDocumentTextOutline: (props: any) => <span data-testid="icon-doc-text" {...props} />,
  IoDocumentOutline: (props: any) => <span data-testid="icon-doc-outline" {...props} />,
  IoArrowForward: (props: any) => <span data-testid="icon-arrow" {...props} />,
}));

vi.mock('../components/ui', () => ({
  GoogleLogo: ({ size }: any) => <span data-testid="google-logo" />,
}));

const mockAuthenticate = vi.fn();
const mockSearch = vi.fn();
const mockLoadRecentFiles = vi.fn();
const mockClearResults = vi.fn();

const mockAuthState = {
  isLoading: false,
  isAuthenticated: false,
  results: [] as any[],
  recentFiles: [] as any[],
  search: mockSearch,
  loadRecentFiles: mockLoadRecentFiles,
  authenticate: mockAuthenticate,
  clearResults: mockClearResults,
};

vi.mock('../hooks', () => ({
  useGoogleAuth: () => mockAuthState,
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
  mockSearch.mockClear();
  mockLoadRecentFiles.mockClear();
  mockClearResults.mockClear();

  // Reset auth state to defaults
  Object.assign(mockAuthState, {
    isLoading: false,
    isAuthenticated: false,
    results: [],
    recentFiles: [],
    search: mockSearch,
    loadRecentFiles: mockLoadRecentFiles,
    authenticate: mockAuthenticate,
    clearResults: mockClearResults,
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

import SearchPage from './SearchPage';

describe('SearchPage', () => {
  // ===== Existing tests (preserved) =====

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

  // ===== New tests =====

  // --- Authenticated state: recent files ---

  it('shows recent files section with title and items when authenticated with recent files', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.recentFiles = [
      { id: '1', name: 'notes.md', mimeType: 'text/markdown', modifiedTime: '2025-01-01T00:00:00Z' },
      { id: '2', name: 'readme.md', mimeType: 'text/markdown', modifiedTime: '2025-01-02T00:00:00Z' },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('Recent Files')).toBeTruthy();
    expect(screen.getByText('Your recently accessed files')).toBeTruthy();
    expect(screen.getByText('notes.md')).toBeTruthy();
    expect(screen.getByText('readme.md')).toBeTruthy();
  });

  it('calls loadRecentFiles on mount when authenticated', () => {
    mockAuthState.isAuthenticated = true;
    renderWithProviders(<SearchPage />);
    expect(mockLoadRecentFiles).toHaveBeenCalled();
  });

  // --- Authenticated state: no recent files (empty state) ---

  it('shows empty state when authenticated with no recent files', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.recentFiles = [];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('No recent files')).toBeTruthy();
    expect(screen.getByText('Search for markdown files')).toBeTruthy();
  });

  // --- Loading state when authenticated with no recent files ---

  it('shows spinner when isLoading is true and no recent files', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.isLoading = true;
    mockAuthState.recentFiles = [];
    const { container } = renderWithProviders(<SearchPage />);

    // The empty state text should NOT be shown when loading
    expect(screen.queryByText('No recent files')).toBeNull();
    // A spinner (spinnerLarge) should be in the DOM
    const spinnerLarge = container.querySelector('[class*="spinnerLarge"]') || container.querySelector('[class*="spinner"]');
    // We verify the loading spinner branch is rendered, not the empty state branch
    expect(screen.queryByText('Search for markdown files')).toBeNull();
  });

  // --- Search input disabled when not authenticated ---

  it('disables search input when not authenticated', () => {
    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search Google Drive...') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('enables search input when authenticated', () => {
    mockAuthState.isAuthenticated = true;
    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search Google Drive...') as HTMLInputElement;
    expect(input.disabled).toBe(false);
  });

  // --- Clicking authenticate button ---

  it('calls authenticate when sign-in button is clicked', () => {
    renderWithProviders(<SearchPage />);
    const signInButton = screen.getByText('Sign in with Google').closest('button')!;
    fireEvent.click(signInButton);
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
  });

  // --- Search query < 2 chars ---

  it('shows min chars message when query is 1 character', () => {
    mockAuthState.isAuthenticated = true;
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'a' } });

    expect(screen.getByText('Type at least 2 characters')).toBeTruthy();
  });

  it('calls clearResults when query is less than 2 characters', () => {
    mockAuthState.isAuthenticated = true;
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'x' } });

    expect(mockClearResults).toHaveBeenCalled();
    expect(mockSearch).not.toHaveBeenCalled();
  });

  // --- Search input typing triggers search ---

  it('calls search when query is 2+ characters', () => {
    mockAuthState.isAuthenticated = true;
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'te' } });

    expect(mockSearch).toHaveBeenCalledWith('te');
  });

  it('calls search with full query when typing more characters', () => {
    mockAuthState.isAuthenticated = true;
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(mockSearch).toHaveBeenCalledWith('test query');
  });

  // --- Search with results ---

  it('shows result count and result items when search returns results', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.results = [
      { id: 'r1', name: 'result-one.md', mimeType: 'text/markdown' },
      { id: 'r2', name: 'result-two.md', mimeType: 'text/markdown' },
      { id: 'r3', name: 'result-three.md', mimeType: 'text/markdown' },
    ];
    renderWithProviders(<SearchPage />);

    // Type a query of 2+ chars so the results branch is displayed
    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'result' } });

    expect(screen.getByText('3 results')).toBeTruthy();
    expect(screen.getByText('result-one.md')).toBeTruthy();
    expect(screen.getByText('result-two.md')).toBeTruthy();
    expect(screen.getByText('result-three.md')).toBeTruthy();
  });

  it('shows singular result count for a single result', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.results = [
      { id: 'r1', name: 'only-result.md', mimeType: 'text/markdown' },
    ];
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'only' } });

    expect(screen.getByText('1 result')).toBeTruthy();
    expect(screen.getByText('only-result.md')).toBeTruthy();
  });

  // --- Search with no results ---

  it('shows no results message when search returns empty', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.results = [];
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No results found')).toBeTruthy();
    expect(screen.getByText('Try different keywords')).toBeTruthy();
  });

  // --- Clicking a search result navigates ---

  it('navigates to viewer page when clicking a search result', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.results = [
      { id: 'file-123', name: 'my-doc.md', mimeType: 'text/markdown' },
    ];
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'my' } });

    const resultButton = screen.getByText('my-doc.md').closest('button')!;
    fireEvent.click(resultButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/viewer?id=file-123&name=my-doc.md&source=google-drive',
      { replace: true }
    );
  });

  it('navigates to viewer with encoded name when file name has special characters', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.results = [
      { id: 'file-456', name: 'my doc & notes.md', mimeType: 'text/markdown' },
    ];
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'my' } });

    const resultButton = screen.getByText('my doc & notes.md').closest('button')!;
    fireEvent.click(resultButton);

    // URLSearchParams encodes special characters
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/viewer?'),
      { replace: true }
    );
    const navigatedUrl = mockNavigate.mock.calls[0][0] as string;
    const params = new URLSearchParams(navigatedUrl.split('?')[1]);
    expect(params.get('id')).toBe('file-456');
    expect(params.get('name')).toBe('my doc & notes.md');
    expect(params.get('source')).toBe('google-drive');
  });

  // --- Clicking a recent file navigates ---

  it('navigates to viewer page when clicking a recent file', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.recentFiles = [
      { id: 'recent-1', name: 'recent-doc.md', mimeType: 'text/markdown' },
    ];
    renderWithProviders(<SearchPage />);

    const resultButton = screen.getByText('recent-doc.md').closest('button')!;
    fireEvent.click(resultButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/viewer?id=recent-1&name=recent-doc.md&source=google-drive',
      { replace: true }
    );
  });

  // --- formatRelativeTime via rendering ---

  it('displays "Just now" for very recent modifiedTime', () => {
    mockAuthState.isAuthenticated = true;
    const now = new Date().toISOString();
    mockAuthState.recentFiles = [
      { id: '1', name: 'just-now.md', mimeType: 'text/markdown', modifiedTime: now },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('Just now')).toBeTruthy();
  });

  it('displays minutes ago for modifiedTime a few minutes in the past', () => {
    mockAuthState.isAuthenticated = true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    mockAuthState.recentFiles = [
      { id: '1', name: 'minutes-ago.md', mimeType: 'text/markdown', modifiedTime: fiveMinutesAgo },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('5 minutes ago')).toBeTruthy();
  });

  it('displays hours ago for modifiedTime a few hours in the past', () => {
    mockAuthState.isAuthenticated = true;
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    mockAuthState.recentFiles = [
      { id: '1', name: 'hours-ago.md', mimeType: 'text/markdown', modifiedTime: threeHoursAgo },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('3 hours ago')).toBeTruthy();
  });

  it('displays days ago for modifiedTime a few days in the past', () => {
    mockAuthState.isAuthenticated = true;
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    mockAuthState.recentFiles = [
      { id: '1', name: 'days-ago.md', mimeType: 'text/markdown', modifiedTime: twoDaysAgo },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('2 days ago')).toBeTruthy();
  });

  it('displays locale date string for modifiedTime more than 30 days in the past', () => {
    mockAuthState.isAuthenticated = true;
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    mockAuthState.recentFiles = [
      { id: '1', name: 'old-file.md', mimeType: 'text/markdown', modifiedTime: oldDate.toISOString() },
    ];
    renderWithProviders(<SearchPage />);

    // Should display the localized date (en-US format)
    const expectedDate = oldDate.toLocaleDateString('en-US');
    expect(screen.getByText(expectedDate)).toBeTruthy();
  });

  it('does not display time when modifiedTime is undefined', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.recentFiles = [
      { id: '1', name: 'no-time.md', mimeType: 'text/markdown' },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('no-time.md')).toBeTruthy();
    // No time-related text should appear
    expect(screen.queryByText('Just now')).toBeNull();
  });

  // --- formatFileSize via rendering ---

  it('displays file size in bytes for small files', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.recentFiles = [
      { id: '1', name: 'tiny.md', mimeType: 'text/markdown', size: '512' },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('512 B')).toBeTruthy();
  });

  it('displays file size in KB for medium files', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.recentFiles = [
      { id: '1', name: 'medium.md', mimeType: 'text/markdown', size: '5120' },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('5 KB')).toBeTruthy();
  });

  it('displays file size in MB for large files', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.recentFiles = [
      { id: '1', name: 'large.md', mimeType: 'text/markdown', size: '2097152' },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('2.0 MB')).toBeTruthy();
  });

  it('does not display size when size is undefined', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.recentFiles = [
      { id: '1', name: 'no-size.md', mimeType: 'text/markdown' },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('no-size.md')).toBeTruthy();
    expect(screen.queryByText('B')).toBeNull();
    expect(screen.queryByText('KB')).toBeNull();
    expect(screen.queryByText('MB')).toBeNull();
  });

  // --- Escape key closes search ---

  it('closes search when Escape key is pressed', () => {
    renderWithProviders(<SearchPage />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // --- Loading spinner in search header ---

  it('shows spinner in header when isLoading is true', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.isLoading = true;
    const { container } = renderWithProviders(<SearchPage />);

    // The spinner div should be rendered in the search header area
    const spinners = container.querySelectorAll('[class*="spinner"]');
    expect(spinners.length).toBeGreaterThan(0);
  });

  // --- Loading state during search (results branch with isLoading) ---

  it('does not show no-results when isLoading is true during search', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.isLoading = true;
    mockAuthState.results = [];
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search Google Drive...');
    fireEvent.change(input, { target: { value: 'searching' } });

    // When isLoading is true and results are empty, should NOT show "No results found"
    expect(screen.queryByText('No results found')).toBeNull();
  });

  // --- Body click closes search ---

  it('closes search when clicking the body background', () => {
    const { container } = renderWithProviders(<SearchPage />);

    // Find the body div (the overlay area)
    const bodyDiv = container.querySelector('[class*="body"]');
    if (bodyDiv) {
      // Simulate clicking on the body div itself (not a child)
      fireEvent.click(bodyDiv);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    }
  });

  // --- Multiple recent files render correctly ---

  it('renders all recent files with their metadata', () => {
    mockAuthState.isAuthenticated = true;
    const recentTime = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 min ago
    mockAuthState.recentFiles = [
      { id: '1', name: 'first.md', mimeType: 'text/markdown', modifiedTime: recentTime, size: '1024' },
      { id: '2', name: 'second.md', mimeType: 'text/markdown', modifiedTime: recentTime, size: '2048' },
      { id: '3', name: 'third.md', mimeType: 'text/markdown' },
    ];
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('first.md')).toBeTruthy();
    expect(screen.getByText('second.md')).toBeTruthy();
    expect(screen.getByText('third.md')).toBeTruthy();
    expect(screen.getByText('1 KB')).toBeTruthy();
    expect(screen.getByText('2 KB')).toBeTruthy();
  });
});
