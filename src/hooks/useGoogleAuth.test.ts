/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useGoogleAuth } from './useGoogleAuth';

// --- mocks ---

const mockTrackEvent = vi.fn();
vi.mock('../utils/analytics', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

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
      PickerBuilder: vi.fn(() => ({
        addView: vi.fn().mockReturnThis(),
        setOAuthToken: vi.fn().mockReturnThis(),
        setDeveloperKey: vi.fn().mockReturnThis(),
        setAppId: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        setSize: vi.fn().mockReturnThis(),
        setCallback: vi.fn().mockReturnThis(),
        enableFeature: vi.fn().mockReturnThis(),
        setLocale: vi.fn().mockReturnThis(),
        build: vi.fn(() => ({ setVisible: vi.fn() })),
      })),
      DocsView: vi.fn(() => ({
        setMimeTypes: vi.fn(),
        setMode: vi.fn(),
        setOwnedByMe: vi.fn(),
        setStarred: vi.fn(),
      })),
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
      setToken: vi.fn(),
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
    mockTrackEvent.mockClear();
    storageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true });
    // Pre-set scope version so token restoration doesn't get cleared
    storageMock.setItem('googleDriveScopeVersion', '3');
    setupEnvVars();
    setupGoogleApis();
    stubScriptLoading();
    // matchMedia mock (used by authenticate for iOS detection)
    window.matchMedia = vi.fn(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
        if (key === 'googleDriveAccessToken') return 'near-expired-token';
        if (key === 'googleDriveTokenExpiry') return nearExpiry;
        return null;
      });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // --- authenticate ---

  describe('authenticate', () => {
    it('should call trackEvent with login on successful auth', async () => {
      // Capture the tokenClient so we can trigger the callback
      const mockRequestAccessToken = vi.fn();
      let tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      // Mock crypto.randomUUID and sessionStorage for state verification
      const mockState = 'test-state-uuid';
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockState as `${string}-${string}-${string}-${string}-${string}`);
      const sessionStorageMock = {
        getItem: vi.fn((key: string) => key === 'oauth_state' ? mockState : null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      // Call authenticate
      act(() => {
        result.current.authenticate();
      });

      // Simulate Google OAuth returning a token
      await act(async () => {
        tokenClient.callback({
          access_token: 'new-token-123',
          expires_in: 3600,
          state: mockState,
        });
        await new Promise(r => setTimeout(r, 50));
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(mockTrackEvent).toHaveBeenCalledWith('login', { method: 'Google' });
    });

    it('should set isAuthenticating=true during auth flow', async () => {
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      expect(result.current.isAuthenticating).toBe(false);

      act(() => {
        result.current.authenticate();
      });

      expect(result.current.isAuthenticating).toBe(true);
    });

    it('should clear isAuthenticating after successful auth', async () => {
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const mockState = 'test-state-uuid-2';
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockState as `${string}-${string}-${string}-${string}-${string}`);
      const sessionStorageMock = {
        getItem: vi.fn((key: string) => key === 'oauth_state' ? mockState : null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      expect(result.current.isAuthenticating).toBe(true);

      await act(async () => {
        tokenClient.callback({
          access_token: 'new-token',
          expires_in: 3600,
          state: mockState,
        });
        await new Promise(r => setTimeout(r, 50));
      });

      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear isAuthenticating on cancelAuth', async () => {
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      expect(result.current.isAuthenticating).toBe(true);

      act(() => {
        result.current.cancelAuth();
      });

      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set timeout error after OAUTH_POPUP_TIMEOUT_MS', async () => {
      vi.useFakeTimers();
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const { result } = renderHook(() => useGoogleAuth());

      // Wait for init with fake timers
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        result.current.authenticate();
      });

      expect(result.current.isAuthenticating).toBe(true);

      // Advance past the 60s timeout
      act(() => {
        vi.advanceTimersByTime(60_000);
      });

      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.error).toBe('auth_timeout');

      vi.useRealTimers();
    });

    it('should handle error_callback popup_closed without showing error', async () => {
      let errorCallback: ((err: { type: string }) => void) | undefined;
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn((config: any) => {
        errorCallback = config.error_callback;
        return tokenClient;
      }) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      expect(result.current.isAuthenticating).toBe(true);

      act(() => {
        errorCallback?.({ type: 'popup_closed' });
      });

      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle error_callback popup_failed_to_open', async () => {
      let errorCallback: ((err: { type: string }) => void) | undefined;
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn((config: any) => {
        errorCallback = config.error_callback;
        return tokenClient;
      }) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      act(() => {
        errorCallback?.({ type: 'popup_failed_to_open' });
      });

      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.error).toBe('auth_popup_blocked');
    });

    it('should set auth_timeout_ios on iOS when timeout occurs', async () => {
      vi.useFakeTimers();
      // Simulate iOS environment
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        result.current.authenticate();
      });

      act(() => {
        vi.advanceTimersByTime(60_000);
      });

      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.error).toBe('auth_timeout_ios');

      vi.useRealTimers();
      // Reset userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (X11; Linux x86_64)',
        writable: true,
        configurable: true,
      });
    });

    it('should set auth_popup_blocked_ios on iOS popup_failed_to_open', async () => {
      // Simulate iOS environment
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      let errorCallback: ((err: { type: string }) => void) | undefined;
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn((config: any) => {
        errorCallback = config.error_callback;
        return tokenClient;
      }) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      act(() => {
        errorCallback?.({ type: 'popup_failed_to_open' });
      });

      expect(result.current.error).toBe('auth_popup_blocked_ios');

      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (X11; Linux x86_64)',
        writable: true,
        configurable: true,
      });
    });

    it('should set auth_popup_blocked_pwa in iOS standalone mode', async () => {
      // Simulate iOS + standalone (PWA) environment
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });
      window.matchMedia = vi.fn((query: string) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as unknown as typeof window.matchMedia;

      let errorCallback: ((err: { type: string }) => void) | undefined;
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn((config: any) => {
        errorCallback = config.error_callback;
        return tokenClient;
      }) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      act(() => {
        errorCallback?.({ type: 'popup_failed_to_open' });
      });

      expect(result.current.error).toBe('auth_popup_blocked_pwa');

      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (X11; Linux x86_64)',
        writable: true,
        configurable: true,
      });
    });

    it('should handle requestAccessToken throwing (catch block)', async () => {
      const mockRequestAccessToken = vi.fn(() => {
        throw new Error('popup blocked');
      });
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.error).toBe('auth_popup_blocked');
    });

    it('should handle requestAccessToken throwing on iOS (catch block)', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      const mockRequestAccessToken = vi.fn(() => {
        throw new Error('popup blocked');
      });
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      expect(result.current.error).toBe('auth_popup_blocked_ios');

      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (X11; Linux x86_64)',
        writable: true,
        configurable: true,
      });
    });

    it('should handle unknown error_callback type', async () => {
      let errorCallback: ((err: { type: string }) => void) | undefined;
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn((config: any) => {
        errorCallback = config.error_callback;
        return tokenClient;
      }) as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      act(() => {
        errorCallback?.({ type: 'some_unknown_error' });
      });

      expect(result.current.error).toBe('Authentication error: some_unknown_error');
    });

    it('should set error on invalid state parameter', async () => {
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const mockState = 'valid-state';
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockState as `${string}-${string}-${string}-${string}-${string}`);
      const sessionStorageMock = {
        getItem: vi.fn((key: string) => key === 'oauth_state' ? mockState : null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      // Callback with mismatched state
      await act(async () => {
        tokenClient.callback({
          access_token: 'token',
          expires_in: 3600,
          state: 'wrong-state',
        });
        await new Promise(r => setTimeout(r, 50));
      });

      expect(result.current.error).toBe('Authentication failed: invalid state parameter');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set error on non-access_denied auth error', async () => {
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const mockState = 'test-state-err';
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockState as `${string}-${string}-${string}-${string}-${string}`);
      const sessionStorageMock = {
        getItem: vi.fn((key: string) => key === 'oauth_state' ? mockState : null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      await act(async () => {
        tokenClient.callback({
          error: 'server_error',
          state: mockState,
        });
        await new Promise(r => setTimeout(r, 50));
      });

      expect(result.current.error).toBe('Authentication error: server_error');
    });

    it('should not show error on access_denied (user cancelled)', async () => {
      const mockRequestAccessToken = vi.fn();
      const tokenClient: any = {
        requestAccessToken: mockRequestAccessToken,
        callback: vi.fn(),
      };
      window.google.accounts.oauth2.initTokenClient = vi.fn(() => tokenClient) as any;

      const mockState = 'test-state-cancel';
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockState as `${string}-${string}-${string}-${string}-${string}`);
      const sessionStorageMock = {
        getItem: vi.fn((key: string) => key === 'oauth_state' ? mockState : null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      act(() => {
        result.current.authenticate();
      });

      await act(async () => {
        tokenClient.callback({
          error: 'access_denied',
          state: mockState,
        });
        await new Promise(r => setTimeout(r, 50));
      });

      expect(result.current.isAuthenticating).toBe(false);
      expect(result.current.error).toBeNull();
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
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
        if (key === 'googleDriveScopeVersion') return '3';
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

  // --- openDrivePicker ---

  describe('openDrivePicker', () => {
    function authenticateHook() {
      const futureExpiry = String(Date.now() + 60 * 60 * 1000);
      storageMock.getItem.mockImplementation((key: string) => {
        if (key === 'googleDriveScopeVersion') return '3';
        if (key === 'googleDriveAccessToken') return 'valid-token';
        if (key === 'googleDriveTokenExpiry') return futureExpiry;
        return null;
      });
    }

    it('should return null and set error when not authenticated', async () => {
      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      let pickerResult: any;
      await act(async () => {
        pickerResult = await result.current.openDrivePicker();
      });

      expect(pickerResult).toBeNull();
      expect(result.current.error).toBe('認証が必要です');
    });

    it('should build and show picker when authenticated', async () => {
      authenticateHook();

      const mockSetVisible = vi.fn();
      const mockBuild = vi.fn(() => ({ setVisible: mockSetVisible }));
      const mockSetLocale = vi.fn().mockReturnThis();

      const mockBuilderInstance = {
        addView: vi.fn().mockReturnThis(),
        setOAuthToken: vi.fn().mockReturnThis(),
        setDeveloperKey: vi.fn().mockReturnThis(),
        setAppId: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        setSize: vi.fn().mockReturnThis(),
        setCallback: vi.fn().mockReturnThis(),
        enableFeature: vi.fn().mockReturnThis(),
        setLocale: mockSetLocale,
        build: mockBuild,
      };

      const mockDocsViewInstance = {
        setMimeTypes: vi.fn(),
        setMode: vi.fn(),
        setOwnedByMe: vi.fn(),
        setStarred: vi.fn(),
      };

      window.google.picker.PickerBuilder = function() { return mockBuilderInstance; } as any;
      window.google.picker.DocsView = function() { return mockDocsViewInstance; } as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      await act(async () => {
        result.current.openDrivePicker({ locale: 'ja' });
      });

      expect(mockBuild).toHaveBeenCalled();
      expect(mockSetVisible).toHaveBeenCalledWith(true);
      expect(mockSetLocale).toHaveBeenCalledWith('ja');
    });

    it('should resolve with file when PICKED action', async () => {
      authenticateHook();

      let pickerCallback: (data: any) => void;

      const mockBuilderInstance = {
        addView: vi.fn().mockReturnThis(),
        setOAuthToken: vi.fn().mockReturnThis(),
        setDeveloperKey: vi.fn().mockReturnThis(),
        setAppId: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        setSize: vi.fn().mockReturnThis(),
        setCallback: vi.fn((cb: any) => {
          pickerCallback = cb;
          return mockBuilderInstance;
        }),
        enableFeature: vi.fn().mockReturnThis(),
        build: vi.fn(() => ({ setVisible: vi.fn() })),
      };

      window.google.picker.PickerBuilder = function() { return mockBuilderInstance; } as any;
      window.google.picker.DocsView = function() { return { setMimeTypes: vi.fn(), setMode: vi.fn(), setOwnedByMe: vi.fn() }; } as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      let pickerResult: any;
      await act(async () => {
        const p = result.current.openDrivePicker();
        setTimeout(() => {
          pickerCallback!({
            action: google.picker.Action.PICKED,
            docs: [{ id: 'doc-1', name: 'picked.md' }],
          });
        }, 10);
        pickerResult = await p;
      });

      expect(pickerResult).toEqual({ id: 'doc-1', name: 'picked.md' });
    });

    it('should resolve null when CANCEL action', async () => {
      authenticateHook();

      let pickerCallback: (data: any) => void;

      const mockBuilderInstance = {
        addView: vi.fn().mockReturnThis(),
        setOAuthToken: vi.fn().mockReturnThis(),
        setDeveloperKey: vi.fn().mockReturnThis(),
        setAppId: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        setSize: vi.fn().mockReturnThis(),
        setCallback: vi.fn((cb: any) => {
          pickerCallback = cb;
          return mockBuilderInstance;
        }),
        enableFeature: vi.fn().mockReturnThis(),
        build: vi.fn(() => ({ setVisible: vi.fn() })),
      };

      window.google.picker.PickerBuilder = function() { return mockBuilderInstance; } as any;
      window.google.picker.DocsView = function() { return { setMimeTypes: vi.fn(), setMode: vi.fn(), setOwnedByMe: vi.fn() }; } as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      let pickerResult: any;
      await act(async () => {
        const p = result.current.openDrivePicker();
        setTimeout(() => {
          pickerCallback!({ action: google.picker.Action.CANCEL });
        }, 10);
        pickerResult = await p;
      });

      expect(pickerResult).toBeNull();
    });

    it('should work without gapi.client (skip setToken)', async () => {
      authenticateHook();

      const mockBuilderInstance = {
        addView: vi.fn().mockReturnThis(),
        setOAuthToken: vi.fn().mockReturnThis(),
        setDeveloperKey: vi.fn().mockReturnThis(),
        setAppId: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        setSize: vi.fn().mockReturnThis(),
        setCallback: vi.fn().mockReturnThis(),
        enableFeature: vi.fn().mockReturnThis(),
        build: vi.fn(() => ({ setVisible: vi.fn() })),
      };

      window.google.picker.PickerBuilder = function() { return mockBuilderInstance; } as any;
      window.google.picker.DocsView = function() { return { setMimeTypes: vi.fn(), setMode: vi.fn(), setOwnedByMe: vi.fn() }; } as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      // 初期化完了後に gapi.client を未定義にして falsy ブランチをテスト
      const originalClient = window.gapi.client;
      (window.gapi as any).client = undefined;

      await act(async () => {
        result.current.openDrivePicker();
      });

      // picker は正常にビルドされることを確認
      expect(mockBuilderInstance.build).toHaveBeenCalled();

      // 元に戻す
      window.gapi.client = originalClient;
    });

    it('should apply starred setting when enabled', async () => {
      authenticateHook();

      const mockSetStarred = vi.fn();
      const mockDocsViewInstance = {
        setMimeTypes: vi.fn(),
        setMode: vi.fn(),
        setOwnedByMe: vi.fn(),
        setStarred: mockSetStarred,
      };

      window.google.picker.PickerBuilder = function() { return {
        addView: vi.fn().mockReturnThis(),
        setOAuthToken: vi.fn().mockReturnThis(),
        setDeveloperKey: vi.fn().mockReturnThis(),
        setAppId: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        setSize: vi.fn().mockReturnThis(),
        setCallback: vi.fn().mockReturnThis(),
        enableFeature: vi.fn().mockReturnThis(),
        build: vi.fn(() => ({ setVisible: vi.fn() })),
      }; } as any;
      window.google.picker.DocsView = function() { return mockDocsViewInstance; } as any;

      const { result } = renderHook(() => useGoogleAuth());
      await waitForInit();

      await act(async () => {
        result.current.openDrivePicker({
          settings: { ownedByMe: false, starred: true },
        });
      });

      expect(mockSetStarred).toHaveBeenCalledWith(true);
    });
  });

});
