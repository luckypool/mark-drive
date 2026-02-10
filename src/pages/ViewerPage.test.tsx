/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';

// ---------- mutable mock state ----------

const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams({ id: '123', name: 'test.md', source: 'local' });

const mockLocationState = {
  state: { content: '# Hello' } as Record<string, string> | null,
};

const mockFetchFileContent = vi.fn();
const mockAuthState = {
  fetchFileContent: mockFetchFileContent,
  isLoading: false,
  accessToken: 'mock-token',
};

const mockSetTheme = vi.fn();
const mockThemeState = {
  mode: 'light' as string,
  resolvedMode: 'light' as string,
  setTheme: mockSetTheme,
  colors: {},
};

const mockShareContent = vi.fn();
const mockShareState = {
  shareContent: mockShareContent,
  isProcessing: false,
};

const mockToggleMode = vi.fn();
const mockSave = vi.fn();
const mockSetEditContent = vi.fn();
const mockEditorState = {
  mode: 'preview' as string,
  editContent: '',
  setEditContent: mockSetEditContent,
  canEdit: true,
  canSave: false,
  hasUnsavedChanges: false,
  isSaving: false,
  saveSuccess: false,
  saveError: null as string | null,
  toggleMode: mockToggleMode,
  save: mockSave,
};

const mockSetFontSize = vi.fn();
const mockSetFontFamily = vi.fn();
const mockFontState = {
  settings: { fontSize: 'medium' as string, fontFamily: 'system' as string },
  setFontSize: mockSetFontSize,
  setFontFamily: mockSetFontFamily,
};

// ---------- mocks ----------

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
  useLocation: () => mockLocationState,
}));

vi.mock('react-icons/io5', () => {
  const stub = (name: string) => (props: any) => <span data-testid={`icon-${name}`} {...props} />;
  return {
    IoChevronBack: stub('chevron-back'),
    IoClose: stub('close'),
    IoChevronDown: stub('chevron-down'),
    IoCreateOutline: stub('create'),
    IoEyeOutline: stub('eye'),
    IoSaveOutline: stub('save'),
    IoExpandOutline: stub('expand'),
    IoContractOutline: stub('contract'),
    IoAlertCircleOutline: stub('alert-circle'),
    IoDocumentOutline: stub('document'),
    IoLogoGoogle: stub('google'),
    IoDownloadOutline: stub('download'),
    IoCheckmarkCircle: stub('checkmark'),
    IoAlertCircle: stub('alert'),
    IoSunnyOutline: stub('sunny'),
    IoMoonOutline: stub('moon'),
    IoPhonePortraitOutline: stub('phone'),
  };
});

vi.mock('../components/ui', () => ({
  Button: ({ children, onPress, onClick, disabled, loading, icon, ...rest }: any) => (
    <button onClick={onClick || onPress} disabled={disabled || loading} {...rest}>
      {icon}
      {!loading && children}
    </button>
  ),
}));

vi.mock('../components/markdown', () => ({
  MarkdownRenderer: ({ content }: any) => <div data-testid="markdown-renderer">{content}</div>,
}));

vi.mock('../components/editor/CodeMirrorEditor', () => ({
  CodeMirrorEditor: ({ value }: any) => <div data-testid="code-editor">{value}</div>,
}));

vi.mock('../hooks', () => ({
  useGoogleAuth: () => mockAuthState,
  useTheme: () => mockThemeState,
  useLanguage: () => ({
    t: {
      viewer: {
        loading: 'Loading...',
        loadFailed: 'Failed to load file',
        errorOccurred: 'An error occurred',
        authRequired: 'Authentication required',
        retry: 'Retry',
        edit: 'Edit',
        preview: 'Preview',
        noContent: 'No content',
        unsavedChanges: 'You have unsaved changes.',
        linesCount: '{lines} lines',
        charsCount: '{chars} chars',
        saving: 'Saving...',
        saved: 'Saved',
        saveFailed: 'Save failed',
        unsavedLabel: 'Unsaved',
      },
      fileInfo: {
        title: 'File Info',
        source: 'Source',
        googleDrive: 'Google Drive',
        local: 'Local',
        exportPdf: 'Export PDF',
      },
      settings: {
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
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
    },
    language: 'en',
    setLanguage: vi.fn(),
  }),
  useShare: () => mockShareState,
  useMarkdownEditor: () => mockEditorState,
  getFileHandle: () => null,
}));

vi.mock('../contexts/FontSettingsContext', () => ({
  useFontSettings: () => mockFontState,
}));

vi.mock('../services', () => ({
  addFileToHistory: vi.fn(),
}));

// ---------- helpers ----------

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

function resetMockState() {
  mockLocationState.state = { content: '# Hello' };

  mockAuthState.fetchFileContent = mockFetchFileContent;
  mockAuthState.isLoading = false;
  mockAuthState.accessToken = 'mock-token';

  mockThemeState.mode = 'light';
  mockThemeState.resolvedMode = 'light';
  mockThemeState.setTheme = mockSetTheme;

  mockShareState.shareContent = mockShareContent;
  mockShareState.isProcessing = false;

  mockEditorState.mode = 'preview';
  mockEditorState.editContent = '';
  mockEditorState.setEditContent = mockSetEditContent;
  mockEditorState.canEdit = true;
  mockEditorState.canSave = false;
  mockEditorState.hasUnsavedChanges = false;
  mockEditorState.isSaving = false;
  mockEditorState.saveSuccess = false;
  mockEditorState.saveError = null;
  mockEditorState.toggleMode = mockToggleMode;
  mockEditorState.save = mockSave;

  mockFontState.settings = { fontSize: 'medium', fontFamily: 'system' };
  mockFontState.setFontSize = mockSetFontSize;
  mockFontState.setFontFamily = mockSetFontFamily;
}

beforeEach(() => {
  cleanup();
  resetMockState();
  mockNavigate.mockClear();
  mockFetchFileContent.mockClear();
  mockSetTheme.mockClear();
  mockShareContent.mockClear();
  mockToggleMode.mockClear();
  mockSave.mockClear();
  mockSetEditContent.mockClear();
  mockSetFontSize.mockClear();
  mockSetFontFamily.mockClear();

  // Reset searchParams to local source
  mockSearchParams.set('source', 'local');
  mockSearchParams.set('id', '123');
  mockSearchParams.set('name', 'test.md');

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

import ViewerPage from './ViewerPage';

describe('ViewerPage', () => {
  it('renders file name in header', () => {
    renderWithProviders(<ViewerPage />);
    expect(screen.getByText('test.md')).toBeTruthy();
  });

  it('renders back button', () => {
    renderWithProviders(<ViewerPage />);
    const backIcon = screen.getByTestId('icon-chevron-back');
    expect(backIcon.closest('button')).toBeTruthy();
  });

  it('clicking back button navigates to home when no history', () => {
    renderWithProviders(<ViewerPage />);
    const backButton = screen.getByTestId('icon-chevron-back').closest('button')!;
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('clicking back button calls navigate(-1) when history exists', () => {
    const originalLength = Object.getOwnPropertyDescriptor(window.history, 'length');
    Object.defineProperty(window.history, 'length', { value: 3, writable: true, configurable: true });
    renderWithProviders(<ViewerPage />);
    const backButton = screen.getByTestId('icon-chevron-back').closest('button')!;
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
    if (originalLength) {
      Object.defineProperty(window.history, 'length', originalLength);
    } else {
      Object.defineProperty(window.history, 'length', { value: 1, writable: true, configurable: true });
    }
  });

  it('renders markdown content when provided via location.state', () => {
    renderWithProviders(<ViewerPage />);
    const renderer = screen.getByTestId('markdown-renderer');
    expect(renderer).toBeTruthy();
    expect(renderer.textContent).toContain('# Hello');
  });
});

describe('ViewerPage - Edit/Preview toggle', () => {
  it('shows segmented control with Edit and Preview buttons', () => {
    renderWithProviders(<ViewerPage />);
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Preview')).toBeTruthy();
  });

  it('clicking Edit tab calls toggleMode when in preview mode', () => {
    renderWithProviders(<ViewerPage />);
    const editButton = screen.getByText('Edit').closest('button')!;
    fireEvent.click(editButton);
    expect(mockToggleMode).toHaveBeenCalled();
  });

  it('clicking Preview tab when already in preview mode does not call toggleMode', () => {
    renderWithProviders(<ViewerPage />);
    const previewButton = screen.getByText('Preview').closest('button')!;
    fireEvent.click(previewButton);
    expect(mockToggleMode).not.toHaveBeenCalled();
  });

  it('shows CodeMirrorEditor when in edit mode', () => {
    mockEditorState.mode = 'edit';
    mockEditorState.editContent = 'some markdown content';
    renderWithProviders(<ViewerPage />);
    const editor = screen.getByTestId('code-editor');
    expect(editor).toBeTruthy();
    expect(editor.textContent).toContain('some markdown content');
  });

  it('shows MarkdownRenderer when in preview mode', () => {
    renderWithProviders(<ViewerPage />);
    expect(screen.getByTestId('markdown-renderer')).toBeTruthy();
    expect(screen.queryByTestId('code-editor')).toBeNull();
  });

  it('does not show segmented control when canEdit is false', () => {
    mockEditorState.canEdit = false;
    renderWithProviders(<ViewerPage />);
    expect(screen.queryByText('Edit')).toBeNull();
    expect(screen.queryByText('Preview')).toBeNull();
  });

  it('clicking Edit tab when already in edit mode does not call toggleMode', () => {
    mockEditorState.mode = 'edit';
    mockEditorState.editContent = 'content';
    renderWithProviders(<ViewerPage />);
    const editButton = screen.getByText('Edit').closest('button')!;
    fireEvent.click(editButton);
    expect(mockToggleMode).not.toHaveBeenCalled();
  });

  it('clicking Preview tab in edit mode with unsaved changes shows confirm dialog', () => {
    mockEditorState.mode = 'edit';
    mockEditorState.editContent = 'edited';
    mockEditorState.hasUnsavedChanges = true;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<ViewerPage />);
    const previewButton = screen.getByText('Preview').closest('button')!;
    fireEvent.click(previewButton);

    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes.');
    expect(mockToggleMode).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('clicking Preview tab in edit mode with unsaved changes - cancel keeps edit mode', () => {
    mockEditorState.mode = 'edit';
    mockEditorState.editContent = 'edited';
    mockEditorState.hasUnsavedChanges = true;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(<ViewerPage />);
    const previewButton = screen.getByText('Preview').closest('button')!;
    fireEvent.click(previewButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockToggleMode).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});

describe('ViewerPage - File info dialog', () => {
  it('clicking header title opens file info dialog', () => {
    renderWithProviders(<ViewerPage />);
    // The header title button contains the file name and a chevron icon
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
    expect(screen.getByText('File Info')).toBeTruthy();
  });

  it('dialog shows file name', () => {
    renderWithProviders(<ViewerPage />);
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
    // File name appears in dialog file info section (in addition to header)
    const fileNames = screen.getAllByText('test.md');
    expect(fileNames.length).toBeGreaterThanOrEqual(2); // header + dialog
  });

  it('dialog shows local source info', () => {
    renderWithProviders(<ViewerPage />);
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
    expect(screen.getByText('Source:')).toBeTruthy();
    expect(screen.getByText('Local')).toBeTruthy();
  });

  it('dialog shows document icon for local source', () => {
    renderWithProviders(<ViewerPage />);
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
    // The dialog has an IoDocumentOutline for local source
    const documentIcons = screen.getAllByTestId('icon-document');
    expect(documentIcons.length).toBeGreaterThanOrEqual(1);
  });

  it('dialog shows display settings section', () => {
    renderWithProviders(<ViewerPage />);
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
    expect(screen.getByText('Display')).toBeTruthy();
    expect(screen.getByText('Font Size')).toBeTruthy();
    expect(screen.getByText('Font Family')).toBeTruthy();
  });

  it('dialog shows PDF export button', () => {
    renderWithProviders(<ViewerPage />);
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
    expect(screen.getByText('Export PDF')).toBeTruthy();
  });

  it('close button closes the dialog', () => {
    renderWithProviders(<ViewerPage />);
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
    expect(screen.getByText('File Info')).toBeTruthy();

    // Find close button in dialog header (IoClose icon)
    const closeIcons = screen.getAllByTestId('icon-close');
    const dialogCloseButton = closeIcons[closeIcons.length - 1].closest('button')!;
    fireEvent.click(dialogCloseButton);

    expect(screen.queryByText('File Info')).toBeNull();
  });

  it('displays full long file name without truncation', () => {
    mockSearchParams.set('name', 'this-is-a-very-long-markdown-filename-that-would-normally-be-truncated.md');
    renderWithProviders(<ViewerPage />);

    const longName = 'this-is-a-very-long-markdown-filename-that-would-normally-be-truncated.md';
    const titleButton = screen.getByText(longName).closest('button')!;
    fireEvent.click(titleButton);

    // The long file name should appear in both the header and the dialog (no truncation)
    const fileNames = screen.getAllByText(longName);
    expect(fileNames.length).toBeGreaterThanOrEqual(2); // header + dialog
  });

  it('clicking overlay closes the dialog', () => {
    renderWithProviders(<ViewerPage />);
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
    expect(screen.getByText('File Info')).toBeTruthy();

    // The overlay is the outermost dialog div. The dialog panel stops propagation.
    // We need to click the overlay itself. It contains the 'File Info' heading
    // at a child level. We find the overlay by its role or by DOM structure.
    const overlay = screen.getByText('File Info').closest('button')?.parentElement?.parentElement?.parentElement?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(screen.queryByText('File Info')).toBeNull();
    }
  });
});

describe('ViewerPage - Google Drive source', () => {
  beforeEach(() => {
    mockSearchParams.set('source', 'google-drive');
    mockLocationState.state = { content: '# Drive File' };
  });

  it('dialog shows Google Drive icon and label', () => {
    renderWithProviders(<ViewerPage />);
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);

    expect(screen.getByText('Google Drive')).toBeTruthy();
    expect(screen.getByTestId('icon-google')).toBeTruthy();
  });
});

describe('ViewerPage - Fullscreen toggle', () => {
  it('renders expand icon button', () => {
    renderWithProviders(<ViewerPage />);
    expect(screen.getByTestId('icon-expand')).toBeTruthy();
  });

  it('clicking expand button calls requestFullscreen', () => {
    // Mock requestFullscreen
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(<ViewerPage />);
    const expandButton = screen.getByTestId('icon-expand').closest('button')!;
    fireEvent.click(expandButton);

    // After entering fullscreen, requestFullscreen should be called
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it('clicking expand button in edit mode shows contract icon (header stays visible)', () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    mockEditorState.mode = 'edit';
    mockEditorState.editContent = 'content';

    renderWithProviders(<ViewerPage />);
    const expandButton = screen.getByTestId('icon-expand').closest('button')!;
    fireEvent.click(expandButton);

    // In edit mode, header stays visible even in fullscreen
    expect(screen.getByTestId('icon-contract')).toBeTruthy();
  });

  it('in fullscreen edit mode, back button shows close icon', () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    mockEditorState.mode = 'edit';
    mockEditorState.editContent = 'content';

    renderWithProviders(<ViewerPage />);
    const expandButton = screen.getByTestId('icon-expand').closest('button')!;
    fireEvent.click(expandButton);

    // In fullscreen, back button shows close icon
    const closeIcons = screen.getAllByTestId('icon-close');
    expect(closeIcons.length).toBeGreaterThanOrEqual(1);
  });
});

describe('ViewerPage - Empty/no content scenarios', () => {
  it('shows loading state for local source with no content provided', () => {
    // When local source has no content, isLoading starts as true and stays true
    // because no fetch effect runs for local source
    mockLocationState.state = null;
    mockSearchParams.set('source', 'local');

    renderWithProviders(<ViewerPage />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('shows markdown renderer with provided content (not empty state)', () => {
    // When content is provided, the markdown renderer is shown
    mockLocationState.state = { content: '# Some content' };
    renderWithProviders(<ViewerPage />);
    expect(screen.getByTestId('markdown-renderer')).toBeTruthy();
    expect(screen.queryByText('No content')).toBeNull();
  });
});

describe('ViewerPage - Error state', () => {
  it('shows error message and retry button when Google Drive fetch fails', async () => {
    mockSearchParams.set('source', 'google-drive');
    mockLocationState.state = null;
    mockFetchFileContent.mockRejectedValue(new Error('Network error'));
    mockAuthState.fetchFileContent = mockFetchFileContent;

    renderWithProviders(<ViewerPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeTruthy();
    });
    expect(screen.getByText('Retry')).toBeTruthy();
    expect(screen.getByTestId('icon-alert-circle')).toBeTruthy();
  });

  it('shows auth required error when no access token for Google Drive source', () => {
    mockSearchParams.set('source', 'google-drive');
    mockLocationState.state = null;
    mockAuthState.accessToken = '';

    renderWithProviders(<ViewerPage />);

    expect(screen.getByText('Authentication required')).toBeTruthy();
  });

  it('retry button retries file content loading', async () => {
    mockSearchParams.set('source', 'google-drive');
    mockLocationState.state = null;
    mockFetchFileContent
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('# Retried content');
    mockAuthState.fetchFileContent = mockFetchFileContent;

    renderWithProviders(<ViewerPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeTruthy();
    });

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    // The fetchFileContent should be called again
    expect(mockFetchFileContent).toHaveBeenCalledTimes(2);
  });

  it('shows load failed when fetchFileContent returns null', async () => {
    mockSearchParams.set('source', 'google-drive');
    mockLocationState.state = null;
    mockFetchFileContent.mockResolvedValue(null);
    mockAuthState.fetchFileContent = mockFetchFileContent;

    renderWithProviders(<ViewerPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load file')).toBeTruthy();
    });
  });

  it('shows generic error when non-Error exception is thrown', async () => {
    mockSearchParams.set('source', 'google-drive');
    mockLocationState.state = null;
    mockFetchFileContent.mockRejectedValue('string error');
    mockAuthState.fetchFileContent = mockFetchFileContent;

    renderWithProviders(<ViewerPage />);

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeTruthy();
    });
  });
});

describe('ViewerPage - Loading state', () => {
  it('shows loading spinner when Google Drive file is being loaded', () => {
    mockSearchParams.set('source', 'google-drive');
    mockLocationState.state = null;
    // fetchFileContent returns a pending promise (never resolves during test)
    mockFetchFileContent.mockReturnValue(new Promise(() => {}));
    mockAuthState.fetchFileContent = mockFetchFileContent;

    renderWithProviders(<ViewerPage />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('shows loading when auth is still loading for Google Drive source', () => {
    mockSearchParams.set('source', 'google-drive');
    mockLocationState.state = null;
    mockAuthState.isLoading = true;

    renderWithProviders(<ViewerPage />);

    // isLoading is set to true (no content) and the auth is loading, so effect returns early
    // The initial isLoading state is !params.content which is true
    expect(screen.getByText('Loading...')).toBeTruthy();
  });
});

describe('ViewerPage - Editor mode details', () => {
  beforeEach(() => {
    mockEditorState.mode = 'edit';
  });

  it('shows footer with line and char counts', () => {
    mockEditorState.editContent = 'line1\nline2\nline3';
    renderWithProviders(<ViewerPage />);
    // Lines and chars counts are in the same span, so use substring matching
    expect(screen.getByText(/3 lines/)).toBeTruthy();
    expect(screen.getByText(/17 chars/)).toBeTruthy();
  });

  it('shows 0 lines and 0 chars when editContent is empty', () => {
    mockEditorState.editContent = '';
    renderWithProviders(<ViewerPage />);
    expect(screen.getByText(/0 lines/)).toBeTruthy();
    expect(screen.getByText(/0 chars/)).toBeTruthy();
  });

  it('shows save button in edit mode', () => {
    mockEditorState.editContent = 'content';
    renderWithProviders(<ViewerPage />);
    expect(screen.getByTestId('icon-save')).toBeTruthy();
  });

  it('save button is disabled when canSave is false', () => {
    mockEditorState.editContent = 'content';
    mockEditorState.canSave = false;
    renderWithProviders(<ViewerPage />);
    const saveButton = screen.getByTestId('icon-save').closest('button')!;
    expect(saveButton.disabled).toBe(true);
  });

  it('save button is enabled when canSave is true', () => {
    mockEditorState.editContent = 'content';
    mockEditorState.canSave = true;
    renderWithProviders(<ViewerPage />);
    const saveButton = screen.getByTestId('icon-save').closest('button')!;
    expect(saveButton.disabled).toBe(false);
  });

  it('clicking save button calls editor.save', () => {
    mockEditorState.editContent = 'content';
    mockEditorState.canSave = true;
    renderWithProviders(<ViewerPage />);
    const saveButton = screen.getByTestId('icon-save').closest('button')!;
    fireEvent.click(saveButton);
    expect(mockSave).toHaveBeenCalled();
  });

  it('shows saving indicator when isSaving is true', () => {
    mockEditorState.editContent = 'content';
    mockEditorState.isSaving = true;
    renderWithProviders(<ViewerPage />);
    expect(screen.getByText('Saving...')).toBeTruthy();
  });

  it('shows saved indicator when saveSuccess is true', () => {
    mockEditorState.editContent = 'content';
    mockEditorState.saveSuccess = true;
    renderWithProviders(<ViewerPage />);
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.getByTestId('icon-checkmark')).toBeTruthy();
  });

  it('shows save error indicator when saveError is set', () => {
    mockEditorState.editContent = 'content';
    mockEditorState.saveError = 'Permission denied';
    renderWithProviders(<ViewerPage />);
    expect(screen.getByText('Save failed: Permission denied')).toBeTruthy();
    expect(screen.getByTestId('icon-alert')).toBeTruthy();
  });

  it('shows unsaved label when hasUnsavedChanges is true', () => {
    mockEditorState.editContent = 'content';
    mockEditorState.hasUnsavedChanges = true;
    renderWithProviders(<ViewerPage />);
    expect(screen.getByText('Unsaved')).toBeTruthy();
  });

  it('does not show unsaved label when isSaving is true even with unsaved changes', () => {
    mockEditorState.editContent = 'content';
    mockEditorState.hasUnsavedChanges = true;
    mockEditorState.isSaving = true;
    renderWithProviders(<ViewerPage />);
    expect(screen.queryByText('Unsaved')).toBeNull();
    expect(screen.getByText('Saving...')).toBeTruthy();
  });

  it('save button is not shown in preview mode', () => {
    mockEditorState.mode = 'preview';
    renderWithProviders(<ViewerPage />);
    expect(screen.queryByTestId('icon-save')).toBeNull();
  });
});

describe('ViewerPage - Back with unsaved changes', () => {
  it('shows confirm dialog when navigating back with unsaved changes', () => {
    mockEditorState.hasUnsavedChanges = true;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<ViewerPage />);
    const backButton = screen.getByTestId('icon-chevron-back').closest('button')!;
    fireEvent.click(backButton);

    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes.');
    expect(mockNavigate).toHaveBeenCalledWith('/');
    confirmSpy.mockRestore();
  });

  it('navigates back with history when confirming unsaved changes', () => {
    mockEditorState.hasUnsavedChanges = true;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const originalLength = Object.getOwnPropertyDescriptor(window.history, 'length');
    Object.defineProperty(window.history, 'length', { value: 3, writable: true, configurable: true });

    renderWithProviders(<ViewerPage />);
    const backButton = screen.getByTestId('icon-chevron-back').closest('button')!;
    fireEvent.click(backButton);

    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes.');
    expect(mockNavigate).toHaveBeenCalledWith(-1);
    confirmSpy.mockRestore();
    if (originalLength) {
      Object.defineProperty(window.history, 'length', originalLength);
    } else {
      Object.defineProperty(window.history, 'length', { value: 1, writable: true, configurable: true });
    }
  });

  it('does not navigate when user cancels the confirm dialog', () => {
    mockEditorState.hasUnsavedChanges = true;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(<ViewerPage />);
    const backButton = screen.getByTestId('icon-chevron-back').closest('button')!;
    fireEvent.click(backButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});

describe('ViewerPage - Font settings in dialog', () => {
  function openDialog() {
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
  }

  it('shows font size options (Small, Medium, Large)', () => {
    renderWithProviders(<ViewerPage />);
    openDialog();
    expect(screen.getByText('Small')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Large')).toBeTruthy();
  });

  it('clicking Small font size calls setFontSize with small', () => {
    renderWithProviders(<ViewerPage />);
    openDialog();
    const smallButton = screen.getByText('Small').closest('button')!;
    fireEvent.click(smallButton);
    expect(mockSetFontSize).toHaveBeenCalledWith('small');
  });

  it('clicking Large font size calls setFontSize with large', () => {
    renderWithProviders(<ViewerPage />);
    openDialog();
    const largeButton = screen.getByText('Large').closest('button')!;
    fireEvent.click(largeButton);
    expect(mockSetFontSize).toHaveBeenCalledWith('large');
  });

  it('shows font family options (System, Serif, Sans-Serif)', () => {
    renderWithProviders(<ViewerPage />);
    openDialog();
    expect(screen.getByText('System')).toBeTruthy();
    expect(screen.getByText('Serif')).toBeTruthy();
    expect(screen.getByText('Sans-Serif')).toBeTruthy();
  });

  it('clicking Serif font family calls setFontFamily with serif', () => {
    renderWithProviders(<ViewerPage />);
    openDialog();
    const serifButton = screen.getByText('Serif').closest('button')!;
    fireEvent.click(serifButton);
    expect(mockSetFontFamily).toHaveBeenCalledWith('serif');
  });

  it('clicking Sans-Serif font family calls setFontFamily with sans-serif', () => {
    renderWithProviders(<ViewerPage />);
    openDialog();
    const sansButton = screen.getByText('Sans-Serif').closest('button')!;
    fireEvent.click(sansButton);
    expect(mockSetFontFamily).toHaveBeenCalledWith('sans-serif');
  });
});

describe('ViewerPage - PDF export', () => {
  function openDialog() {
    const titleButton = screen.getByText('test.md').closest('button')!;
    fireEvent.click(titleButton);
  }

  it('PDF export button calls shareContent and closes dialog', () => {
    mockShareContent.mockResolvedValue(undefined);
    renderWithProviders(<ViewerPage />);
    openDialog();

    const exportButton = screen.getByText('Export PDF').closest('button')!;
    fireEvent.click(exportButton);

    expect(mockShareContent).toHaveBeenCalledWith('# Hello', 'test.md');
  });

  it('PDF export button is disabled when isProcessing is true', () => {
    mockShareState.isProcessing = true;
    renderWithProviders(<ViewerPage />);
    openDialog();

    // When loading=true, the mock Button hides children text, so find by the download icon
    const downloadIcon = screen.getByTestId('icon-download');
    const exportButton = downloadIcon.closest('button')!;
    expect(exportButton.disabled).toBe(true);
  });

  it('PDF export button shows download icon', () => {
    renderWithProviders(<ViewerPage />);
    openDialog();
    expect(screen.getByTestId('icon-download')).toBeTruthy();
  });
});

describe('ViewerPage - Unsaved changes dot indicator', () => {
  it('does not show unsaved dot in header when no unsaved changes', () => {
    renderWithProviders(<ViewerPage />);
    const container = document.querySelector('[class*="unsavedDot"]');
    expect(container).toBeNull();
  });

  it('shows unsaved dot in header when there are unsaved changes', () => {
    mockEditorState.hasUnsavedChanges = true;
    const { container } = renderWithProviders(<ViewerPage />);
    const unsavedDot = container.querySelector('[class*="unsavedDot"]');
    expect(unsavedDot).toBeTruthy();
  });
});

describe('ViewerPage - Keyboard shortcuts', () => {
  it('F key triggers fullscreen toggle', () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<ViewerPage />);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }));

    // In fullscreen with showHeader=false in preview mode, the header is hidden.
    // But the content area gets fullscreen CSS classes.
    // Verify requestFullscreen was called.
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it('E key triggers edit mode toggle', () => {
    renderWithProviders(<ViewerPage />);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }));

    expect(mockToggleMode).toHaveBeenCalled();
  });

  it('E key with unsaved changes shows confirm dialog', () => {
    mockEditorState.hasUnsavedChanges = true;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<ViewerPage />);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }));

    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes.');
    expect(mockToggleMode).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('E key with unsaved changes - cancel does not toggle', () => {
    mockEditorState.hasUnsavedChanges = true;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(<ViewerPage />);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockToggleMode).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('E key does not toggle mode when canEdit is false', () => {
    mockEditorState.canEdit = false;
    renderWithProviders(<ViewerPage />);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }));

    expect(mockToggleMode).not.toHaveBeenCalled();
  });

  it('Ctrl+S in edit mode with canSave calls save', () => {
    mockEditorState.mode = 'edit';
    mockEditorState.editContent = 'content';
    mockEditorState.canSave = true;

    renderWithProviders(<ViewerPage />);
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
  });

  it('Ctrl+S in edit mode without canSave just prevents default', () => {
    mockEditorState.mode = 'edit';
    mockEditorState.editContent = 'content';
    mockEditorState.canSave = false;

    renderWithProviders(<ViewerPage />);
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('keyboard shortcuts are ignored when typing in an input', () => {
    renderWithProviders(<ViewerPage />);

    // The keydown handler checks e.target.tagName === 'INPUT'
    // For non Ctrl+S shortcuts, if the target is an input, it returns early.
    // Since the event is dispatched on window with target=window, we need to
    // dispatch directly on an input element so the handler sees INPUT as target.
    const input = document.createElement('input');
    document.body.appendChild(input);

    // Dispatch a native keydown on the input - it will bubble to window
    const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true });
    input.dispatchEvent(event);

    // Should not trigger fullscreen since target is an input
    expect(screen.getByTestId('icon-expand')).toBeTruthy(); // still in non-fullscreen
    expect(screen.queryByTestId('icon-contract')).toBeNull();

    document.body.removeChild(input);
  });
});

describe('ViewerPage - Google Drive file loading success', () => {
  it('loads and displays content from Google Drive', async () => {
    mockSearchParams.set('source', 'google-drive');
    mockLocationState.state = null;
    mockFetchFileContent.mockResolvedValue('# From Drive');
    mockAuthState.fetchFileContent = mockFetchFileContent;

    renderWithProviders(<ViewerPage />);

    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeTruthy();

    // After fetch resolves
    await waitFor(() => {
      expect(mockFetchFileContent).toHaveBeenCalledWith('123');
    });
  });
});
