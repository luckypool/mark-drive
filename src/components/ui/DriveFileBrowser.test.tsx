/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

// ---------- mocks ----------

vi.mock('react-icons/io5', () => ({
  IoClose: (props: any) => <span data-testid="icon-close" {...props} />,
  IoDocumentTextOutline: (props: any) => <span data-testid="icon-doc" {...props} />,
  IoChevronForward: (props: any) => <span data-testid="icon-chevron" {...props} />,
}));

const mockListRecentMarkdownFiles = vi.fn();
const mockSearchMarkdownFiles = vi.fn();

vi.mock('../../services/googleDrive', () => ({
  listRecentMarkdownFiles: (...args: unknown[]) => mockListRecentMarkdownFiles(...args),
  searchMarkdownFiles: (...args: unknown[]) => mockSearchMarkdownFiles(...args),
}));

vi.mock('../../hooks', () => ({
  useLanguage: () => ({
    t: {
      driveBrowser: {
        title: 'Select a File',
        searchPlaceholder: 'Search...',
        recentFiles: 'Recent Files',
        noResults: 'No files found',
        loading: 'Loading...',
        error: 'Failed to load files',
        safariHint: 'Open in Safari first.',
      },
    },
    language: 'en',
    setLanguage: vi.fn(),
  }),
}));

// ---------- helpers ----------

import { DriveFileBrowser } from './DriveFileBrowser';

function renderBrowser(overrides = {}) {
  const defaultProps = {
    accessToken: 'test-token',
    onSelect: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  const result = render(<DriveFileBrowser {...defaultProps} />);
  return { ...result, ...defaultProps };
}

// ---------- tests ----------

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockListRecentMarkdownFiles.mockResolvedValue([
    { id: '1', name: 'readme.md', mimeType: 'text/markdown', modifiedTime: '2025-01-01' },
    { id: '2', name: 'notes.md', mimeType: 'text/markdown', modifiedTime: '2025-01-02' },
  ]);
  mockSearchMarkdownFiles.mockResolvedValue([
    { id: '3', name: 'search-result.md', mimeType: 'text/markdown', modifiedTime: '2025-01-03' },
  ]);
});

describe('DriveFileBrowser', () => {
  it('renders title and close button', async () => {
    renderBrowser();
    expect(screen.getByText('Select a File')).toBeTruthy();
    expect(screen.getByLabelText('Close')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('readme.md')).toBeTruthy();
    });
  });

  it('renders search input', async () => {
    renderBrowser();
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('readme.md')).toBeTruthy();
    });
  });

  it('shows loading state initially', () => {
    // Delay the resolution to see loading state
    mockListRecentMarkdownFiles.mockReturnValue(new Promise(() => {}));
    renderBrowser();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('shows recent files after loading', async () => {
    renderBrowser();

    await waitFor(() => {
      expect(screen.getByText('readme.md')).toBeTruthy();
      expect(screen.getByText('notes.md')).toBeTruthy();
    });
    expect(screen.getByText('Recent Files')).toBeTruthy();
  });

  it('calls onSelect when clicking a file', async () => {
    const { onSelect } = renderBrowser();

    await waitFor(() => {
      expect(screen.getByText('readme.md')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('readme.md'));
    expect(onSelect).toHaveBeenCalledWith({ id: '1', name: 'readme.md' });
  });

  it('calls onSelect on Enter key press', async () => {
    const { onSelect } = renderBrowser();

    await waitFor(() => {
      expect(screen.getByText('readme.md')).toBeTruthy();
    });

    const fileItem = screen.getByText('readme.md').closest('[role="button"]')!;
    fireEvent.keyDown(fileItem, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith({ id: '1', name: 'readme.md' });
  });

  it('calls onCancel when clicking close button', async () => {
    const { onCancel } = renderBrowser();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when pressing Escape', async () => {
    const { onCancel } = renderBrowser();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when clicking overlay background', async () => {
    const { onCancel, container } = renderBrowser();
    const overlay = container.querySelector('[class*="overlay"]')!;
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not call onCancel when clicking inside the panel', async () => {
    const { onCancel } = renderBrowser();

    await waitFor(() => {
      expect(screen.getByText('Select a File')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Select a File'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('shows empty state when no files found', async () => {
    mockListRecentMarkdownFiles.mockResolvedValue([]);
    renderBrowser();

    await waitFor(() => {
      expect(screen.getByText('No files found')).toBeTruthy();
      expect(screen.getByText('Open in Safari first.')).toBeTruthy();
    });
  });

  it('shows error state when API fails', async () => {
    mockListRecentMarkdownFiles.mockRejectedValue(new Error('API error'));
    renderBrowser();

    await waitFor(() => {
      expect(screen.getByText('Failed to load files')).toBeTruthy();
    });
  });

  it('searches files with debounce', async () => {
    vi.useFakeTimers();
    renderBrowser();

    // Wait for initial load
    await vi.advanceTimersByTimeAsync(10);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Before debounce
    expect(mockSearchMarkdownFiles).not.toHaveBeenCalled();

    // After debounce (300ms)
    await vi.advanceTimersByTimeAsync(300);

    expect(mockSearchMarkdownFiles).toHaveBeenCalledWith('test-token', 'test');

    vi.useRealTimers();
  });

  it('reloads recent files when search query is cleared', async () => {
    vi.useFakeTimers();
    renderBrowser();

    // Wait for initial load
    await vi.advanceTimersByTimeAsync(10);
    mockListRecentMarkdownFiles.mockClear();

    const input = screen.getByPlaceholderText('Search...');

    // Type then clear
    fireEvent.change(input, { target: { value: 'test' } });
    await vi.advanceTimersByTimeAsync(300);

    fireEvent.change(input, { target: { value: '' } });

    expect(mockListRecentMarkdownFiles).toHaveBeenCalledWith('test-token');

    vi.useRealTimers();
  });
});
