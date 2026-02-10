/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useGoogleAuth } from './useGoogleAuth';

// --- mocks ---

vi.mock('../services/googleDrive', () => ({
  fetchUserInfo: vi.fn(async () => ({ email: 'test@example.com', name: 'Test User', picture: '' })),
  searchMarkdownFiles: vi.fn(async () => [
    { id: '1', name: 'result.md', mimeType: 'text/markdown', modifiedTime: '2025-01-01' },
  ]),
  listRecentMarkdownFiles: vi.fn(async () => [
    { id: '2', name: 'recent.md', mimeType: 'text/markdown', modifiedTime: '2025-01-01' },
  ]),
  fetchFileContent: vi.fn(async () => '# File content'),
}));

const googleDrive = await import('../services/googleDrive');

// --- localStorage mock ---

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string): string | null => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number): string | null => Object.keys(store)[i] ?? null),
  };
}

// --- Google API stubs ---

let storageMock: ReturnType<typeof createLocalStorageMock>;

function setupGoogleApis() {
  window.google = {
    accounts: {
      oauth2: {
        initTokenClient: vi.fn(() => ({
          requestAccessToken: vi.fn(),
          callback: vi.fn(),
        })),
        revoke: vi.fn((_token: string, cb: () => void) => cb()),
      },
    },
    picker: {
      PickerBuilder: vi.fn(),
      DocsView: vi.fn(),
      Action: { CANCEL: 'cancel', PICKED: 'picked' },
      ViewId: { DOCS: 'all' },
      DocsViewMode: { GRID: 'grid', LIST: 'list' },
      Feature: { SUPPORT_DRIVES: 'supportDrives' },
    },
  } as unknown as typeof window.google;

  window.gapi = {
    load: vi.fn((_api: string, cb: () => void) => cb()),
    client: {
      init: vi.fn(async () => {}),
    },
  };
}

function setupEnvVars() {
  vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-api-key');
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
}

/**
 * Mock script loading: intercept appendChild on <head> to auto-fire onload
 * for Google API scripts, without recursion.
 */
function stubScriptLoading() {
  const origAppendChild = document.head.appendChild.bind(document.head);
  vi.spyOn(document.head, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
    const result = origAppendChild(node);
    if (node instanceof HTMLScriptElement && node.src) {
      // Auto-trigger onload asynchronously
      setTimeout(() => node.onload?.(new Event('load')), 0);
    }
    return result as T;
  });
}

async function waitForInit() {
  // Allow async effects (token restore, script loading) to settle
  await act(async () => {
    await new Promise(r => setTimeout(r, 50));
  });
}

describe('useGoogleAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true });
    // Pre-set scope version so token restoration doesn't get cleared
    storageMock.setItem('googleDriveScopeVersion', '2');
    setupEnvVars();
    setupGoogleApis();
    stubScriptLoading();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  // --- initial state ---

  describe('initial state', () => {
    it('should start with isAuthenticated=false', async () => {
      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
      // error depends on env vars (API_KEY/CLIENT_ID) which are
      // module-level constants — not controllable via vi.stubEnv
    });
  });

  // --- token restoration ---

  describe('token restoration', () => {
    it('should restore valid token from storage', async () => {
      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'stored-token-value';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.accessToken).toBe('stored-token-value');
    });

    it('should not restore expired token', async () => {
      const pastExpiry = String(Date.now() - 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'old-token';
        if (key === 'googleDriveTokenExpiry') return pastExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
    });

    it('should not restore token expiring within 5 minutes', async () => {
      const nearExpiry = String(Date.now() + 3 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'near-expired-token';
        if (key === 'googleDriveTokenExpiry') return nearExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // --- search ---

  describe('search', () => {
    it('should set error when not authenticated', async () => {
      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      await act(async () => {
        await result.current.search('query');
      });

      expect(result.current.error).toBe('Please authenticate first');
    });

    it('should clear results for empty query', async () => {
      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      await act(async () => {
        await result.current.search('');
      });

      expect(result.current.results).toEqual([]);
      expect(googleDrive.searchMarkdownFiles).not.toHaveBeenCalled();
    });

    it('should return search results when authenticated', async () => {
      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      await act(async () => {
        await result.current.search('test query');
      });

      expect(googleDrive.searchMarkdownFiles).toHaveBeenCalledWith('valid-token', 'test query');
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].name).toBe('result.md');
    });

    it('should handle search error', async () => {
      vi.mocked(googleDrive.searchMarkdownFiles).mockRejectedValueOnce(new Error('API rate limit'));

      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      await act(async () => {
        await result.current.search('query');
      });

      expect(result.current.error).toBe('API rate limit');
    });
  });

  // --- loadRecentFiles ---

  describe('loadRecentFiles', () => {
    it('should load recent files when authenticated', async () => {
      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      await act(async () => {
        await result.current.loadRecentFiles();
      });

      expect(googleDrive.listRecentMarkdownFiles).toHaveBeenCalledWith('valid-token');
      expect(result.current.recentFiles).toHaveLength(1);
      expect(result.current.recentFiles[0].name).toBe('recent.md');
    });

    it('should do nothing when not authenticated', async () => {
      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      await act(async () => {
        await result.current.loadRecentFiles();
      });

      expect(googleDrive.listRecentMarkdownFiles).not.toHaveBeenCalled();
    });
  });

  // --- fetchFileContent ---

  describe('fetchFileContent', () => {
    it('should fetch file content when authenticated', async () => {
      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      let content: string | null = null;
      await act(async () => {
        content = await result.current.fetchFileContent('file-123');
      });

      expect(content).toBe('# File content');
      expect(googleDrive.fetchFileContent).toHaveBeenCalledWith('valid-token', 'file-123', undefined);
    });

    it('should return null when not authenticated', async () => {
      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      let content: string | null = 'initial';
      await act(async () => {
        content = await result.current.fetchFileContent('file-123');
      });

      expect(content).toBeNull();
    });

    it('should re-throw AbortError', async () => {
      vi.mocked(googleDrive.fetchFileContent).mockRejectedValueOnce(
        Object.assign(new Error('Aborted'), { name: 'AbortError' })
      );

      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      await expect(
        act(async () => {
          await result.current.fetchFileContent('file-123');
        })
      ).rejects.toThrow('Aborted');
    });
  });

  // --- logout ---

  describe('logout', () => {
    it('should clear all state on logout', async () => {
      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
      expect(result.current.results).toEqual([]);
      expect(result.current.recentFiles).toEqual([]);
      expect(result.current.userInfo).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should revoke token via Google API', async () => {
      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.logout();
      });

      expect(window.google.accounts.oauth2.revoke).toHaveBeenCalledWith(
        'valid-token',
        expect.any(Function)
      );
    });

    it('should clear stored token from localStorage', async () => {
      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '2';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.logout();
      });

      // Wait for async clearStoredToken
      await act(async () => {
        await new Promise(r => setTimeout(r, 10));
      });

      expect(storageMock.removeItem).toHaveBeenCalledWith('googleDriveAccessToken');
      expect(storageMock.removeItem).toHaveBeenCalledWith('googleDriveTokenExpiry');
    });
  });

  // --- clearResults ---

  describe('clearResults', () => {
    it('should clear results and error', async () => {
      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      // Trigger an error first
      await act(async () => {
        await result.current.search('query');
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearResults();
      });

      expect(result.current.results).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

});
