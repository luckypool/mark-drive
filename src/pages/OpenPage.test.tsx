/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';

// ---------- mocks ----------

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
  Link: ({ to, children, className }: any) => (
    <a href={to} className={className}>{children}</a>
  ),
}));

vi.mock('../components/ui', () => ({
  GoogleLogo: ({ size }: any) => <span data-testid="google-logo" />,
  OAuthOverlay: () => null,
}));

const mockAuthenticate = vi.fn();
const mockFetchFileInfo = vi.fn();

const mockAuthState = {
  isAuthenticated: false,
  isLoading: false,
  accessToken: null as string | null,
  authenticate: mockAuthenticate,
};

vi.mock('../hooks', () => ({
  useGoogleAuth: () => mockAuthState,
  useLanguage: () => ({
    t: {
      open: {
        loading: 'Opening file...',
        signIn: 'Sign in to open this file',
        signInButton: 'Sign in with Google',
        error: 'Failed to open file',
        invalidState: 'Invalid request from Google Drive',
        retry: 'Retry',
        backToHome: 'Back to Home',
      },
    },
    language: 'en',
    setLanguage: vi.fn(),
  }),
}));

vi.mock('../services/googleDrive', () => ({
  fetchFileInfo: (...args: any[]) => mockFetchFileInfo(...args),
}));

// ---------- helpers ----------

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

function setSearchParams(params: Record<string, string>) {
  mockSearchParams = new URLSearchParams(params);
}

beforeEach(() => {
  cleanup();
  mockNavigate.mockClear();
  mockAuthenticate.mockClear();
  mockFetchFileInfo.mockClear();

  Object.assign(mockAuthState, {
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    authenticate: mockAuthenticate,
  });

  mockSearchParams = new URLSearchParams();

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

import OpenPage from './OpenPage';

describe('OpenPage', () => {
  it('shows invalid state error when no state param', () => {
    renderWithProviders(<OpenPage />);
    expect(screen.getByText('Invalid request from Google Drive')).toBeTruthy();
    expect(screen.getByText('Back to Home')).toBeTruthy();
  });

  it('shows invalid state error when state is invalid JSON', () => {
    setSearchParams({ state: 'not-json' });
    renderWithProviders(<OpenPage />);
    expect(screen.getByText('Invalid request from Google Drive')).toBeTruthy();
  });

  it('shows invalid state error when state has no ids', () => {
    setSearchParams({ state: JSON.stringify({ action: 'open', ids: [], userId: '123' }) });
    renderWithProviders(<OpenPage />);
    expect(screen.getByText('Invalid request from Google Drive')).toBeTruthy();
  });

  it('shows sign-in prompt when not authenticated with valid state', () => {
    setSearchParams({
      state: JSON.stringify({ action: 'open', ids: ['file-123'], userId: 'user-1' }),
    });
    renderWithProviders(<OpenPage />);
    expect(screen.getByText('Sign in to open this file')).toBeTruthy();
    expect(screen.getByText('Sign in with Google')).toBeTruthy();
  });

  it('calls authenticate when sign-in button is clicked', () => {
    setSearchParams({
      state: JSON.stringify({ action: 'open', ids: ['file-123'], userId: 'user-1' }),
    });
    renderWithProviders(<OpenPage />);
    const signInButton = screen.getByText('Sign in with Google').closest('button')!;
    fireEvent.click(signInButton);
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
  });

  it('shows loading when auth is loading', () => {
    setSearchParams({
      state: JSON.stringify({ action: 'open', ids: ['file-123'], userId: 'user-1' }),
    });
    mockAuthState.isLoading = true;
    renderWithProviders(<OpenPage />);
    expect(screen.getByText('Opening file...')).toBeTruthy();
  });

  it('calls fetchFileInfo and navigates when authenticated', async () => {
    setSearchParams({
      state: JSON.stringify({ action: 'open', ids: ['file-123'], userId: 'user-1' }),
    });
    mockAuthState.isAuthenticated = true;
    mockAuthState.accessToken = 'test-token';
    mockFetchFileInfo.mockResolvedValue({ id: 'file-123', name: 'readme.md' });

    renderWithProviders(<OpenPage />);

    await waitFor(() => {
      expect(mockFetchFileInfo).toHaveBeenCalledWith('test-token', 'file-123');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/viewer?id=file-123&name=readme.md&source=google-drive',
        { replace: true }
      );
    });
  });

  it('uses fileId as fallback name when fetchFileInfo returns null', async () => {
    setSearchParams({
      state: JSON.stringify({ action: 'open', ids: ['file-456'], userId: 'user-1' }),
    });
    mockAuthState.isAuthenticated = true;
    mockAuthState.accessToken = 'test-token';
    mockFetchFileInfo.mockResolvedValue(null);

    renderWithProviders(<OpenPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/viewer?id=file-456&name=file-456.md&source=google-drive',
        { replace: true }
      );
    });
  });

  it('shows error when fetchFileInfo throws', async () => {
    setSearchParams({
      state: JSON.stringify({ action: 'open', ids: ['file-err'], userId: 'user-1' }),
    });
    mockAuthState.isAuthenticated = true;
    mockAuthState.accessToken = 'test-token';
    mockFetchFileInfo.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<OpenPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to open file')).toBeTruthy();
    });
    expect(screen.getByText('Retry')).toBeTruthy();
    expect(screen.getByText('Back to Home')).toBeTruthy();
  });

  it('retries when retry button is clicked after error', async () => {
    setSearchParams({
      state: JSON.stringify({ action: 'open', ids: ['file-retry'], userId: 'user-1' }),
    });
    mockAuthState.isAuthenticated = true;
    mockAuthState.accessToken = 'test-token';
    mockFetchFileInfo.mockRejectedValueOnce(new Error('fail'));

    renderWithProviders(<OpenPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to open file')).toBeTruthy();
    });

    mockFetchFileInfo.mockResolvedValueOnce({ id: 'file-retry', name: 'test.md' });
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(mockFetchFileInfo).toHaveBeenCalledTimes(2);
    });
  });

  it('has a link back to home in error state', async () => {
    setSearchParams({
      state: JSON.stringify({ action: 'open', ids: ['file-err'], userId: 'user-1' }),
    });
    mockAuthState.isAuthenticated = true;
    mockAuthState.accessToken = 'test-token';
    mockFetchFileInfo.mockRejectedValue(new Error('fail'));

    renderWithProviders(<OpenPage />);

    await waitFor(() => {
      expect(screen.getByText('Back to Home')).toBeTruthy();
    });
    const link = screen.getByText('Back to Home');
    expect(link.closest('a')?.getAttribute('href')).toBe('/');
  });
});
