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
  IoClose: (props: any) => <span data-testid="icon-close" {...props} />,
  IoFolderOpenOutline: (props: any) => <span data-testid="icon-folder-open" {...props} />,
}));

vi.mock('../components/ui', () => ({
  GoogleLogo: ({ size }: any) => <span data-testid="google-logo" />,
  OAuthOverlay: () => null,
}));

const mockAuthenticate = vi.fn();
const mockOpenDrivePicker = vi.fn();

const mockAuthState = {
  isAuthenticated: false,
  authenticate: mockAuthenticate,
  openDrivePicker: mockOpenDrivePicker,
};

vi.mock('../hooks', () => ({
  useGoogleAuth: () => mockAuthState,
  useLanguage: () => ({
    t: {
      search: {
        signInPrompt: 'Sign in to search Google Drive',
        signIn: 'Sign in with Google',
        pickFile: 'Pick a file',
        pickFileHint: 'Select a markdown file from Google Drive',
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
  mockOpenDrivePicker.mockClear();

  // Reset auth state to defaults
  Object.assign(mockAuthState, {
    isAuthenticated: false,
    authenticate: mockAuthenticate,
    openDrivePicker: mockOpenDrivePicker,
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
  it('renders header with title', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText('Pick a file')).toBeTruthy();
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

  it('calls authenticate when sign-in button is clicked', () => {
    renderWithProviders(<SearchPage />);
    const signInButton = screen.getByText('Sign in with Google').closest('button')!;
    fireEvent.click(signInButton);
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
  });

  it('shows picker prompt when authenticated', () => {
    mockAuthState.isAuthenticated = true;
    renderWithProviders(<SearchPage />);
    expect(screen.getByText('Select a markdown file from Google Drive')).toBeTruthy();
  });

  it('shows pick file button when authenticated', () => {
    mockAuthState.isAuthenticated = true;
    renderWithProviders(<SearchPage />);
    // Pick a file appears in both header and button
    const pickTexts = screen.getAllByText('Pick a file');
    expect(pickTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('calls openDrivePicker when pick file button is clicked', () => {
    mockAuthState.isAuthenticated = true;
    mockOpenDrivePicker.mockResolvedValue(null);
    renderWithProviders(<SearchPage />);

    // Find the button in the picker prompt (not the header title)
    const buttons = screen.getAllByText('Pick a file');
    const pickerButton = buttons.find(el => el.closest('button')?.className.includes('picker'))
      ?? buttons[buttons.length - 1].closest('button')!;
    fireEvent.click(pickerButton);

    expect(mockOpenDrivePicker).toHaveBeenCalled();
  });

  it('navigates to viewer when file is picked', async () => {
    mockAuthState.isAuthenticated = true;
    mockOpenDrivePicker.mockResolvedValue({ id: 'file-123', name: 'test.md' });
    renderWithProviders(<SearchPage />);

    const buttons = screen.getAllByText('Pick a file');
    const pickerButton = buttons[buttons.length - 1].closest('button')!;
    fireEvent.click(pickerButton);

    // Wait for the async navigation
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/viewer?id=file-123&name=test.md&source=google-drive',
        { replace: true }
      );
    });
  });

  it('does not navigate when picker is cancelled', async () => {
    mockAuthState.isAuthenticated = true;
    mockOpenDrivePicker.mockResolvedValue(null);
    renderWithProviders(<SearchPage />);

    const buttons = screen.getAllByText('Pick a file');
    const pickerButton = buttons[buttons.length - 1].closest('button')!;
    fireEvent.click(pickerButton);

    await vi.waitFor(() => {
      expect(mockOpenDrivePicker).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('closes search when Escape key is pressed', () => {
    renderWithProviders(<SearchPage />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('closes search when clicking the body background', () => {
    const { container } = renderWithProviders(<SearchPage />);
    const bodyDiv = container.querySelector('[class*="body"]');
    if (bodyDiv) {
      fireEvent.click(bodyDiv);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    }
  });

  it('renders folder icon in header', () => {
    renderWithProviders(<SearchPage />);
    const folderIcons = screen.getAllByTestId('icon-folder-open');
    expect(folderIcons.length).toBeGreaterThanOrEqual(1);
  });
});
