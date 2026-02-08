/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { ThemeProvider, ThemeContext } from './ThemeContext';
import { useContext } from 'react';
import { colors as darkColors } from '../theme/colors';
import { lightColors } from '../theme/lightColors';

// In-memory localStorage mock (jsdom 28 localStorage is incomplete)
function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
}

// Helper to consume context via renderHook
function useThemeTest() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('missing ThemeProvider');
  return ctx;
}

function renderThemeHook() {
  return renderHook(() => useThemeTest(), {
    wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
  });
}

// Stub matchMedia so getSystemColorScheme() returns 'dark' by default
function stubMatchMedia(prefersDark = true) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    },
    dispatchChange(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
  };
  window.matchMedia = vi.fn(() => mql) as unknown as typeof window.matchMedia;
  return mql;
}

let storageMock: ReturnType<typeof createLocalStorageMock>;

describe('ThemeContext', () => {
  beforeEach(() => {
    storageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true });
    delete document.documentElement.dataset.theme;
    stubMatchMedia(true);
  });

  afterEach(() => {
    cleanup();
  });

  // --- data-theme attribute sync ---

  describe('data-theme attribute', () => {
    it('should not set data-theme when mode is system (default)', () => {
      renderThemeHook();
      expect(document.documentElement.dataset.theme).toBeUndefined();
    });

    it('should set data-theme="dark" when setTheme("dark")', () => {
      const { result } = renderThemeHook();
      act(() => result.current.setTheme('dark'));
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('should set data-theme="light" when setTheme("light")', () => {
      const { result } = renderThemeHook();
      act(() => result.current.setTheme('light'));
      expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('should remove data-theme when switching back to system', () => {
      const { result } = renderThemeHook();
      act(() => result.current.setTheme('dark'));
      expect(document.documentElement.dataset.theme).toBe('dark');

      act(() => result.current.setTheme('system'));
      expect(document.documentElement.dataset.theme).toBeUndefined();
    });
  });

  // --- colors object ---

  describe('colors', () => {
    it('should return dark colors when resolvedMode is dark', () => {
      const { result } = renderThemeHook();
      expect(result.current.colors.bgPrimary).toBe(darkColors.bgPrimary);
    });

    it('should return light colors when mode is light', () => {
      const { result } = renderThemeHook();
      act(() => result.current.setTheme('light'));
      expect(result.current.colors.bgPrimary).toBe(lightColors.bgPrimary);
    });

    it('should return light colors when system prefers light', () => {
      stubMatchMedia(false); // prefers-color-scheme: light
      const { result } = renderThemeHook();
      expect(result.current.resolvedMode).toBe('light');
      expect(result.current.colors.bgPrimary).toBe(lightColors.bgPrimary);
    });
  });

  // --- toggleTheme ---

  describe('toggleTheme', () => {
    it('should toggle from dark to light', () => {
      const { result } = renderThemeHook();
      act(() => result.current.setTheme('dark'));
      act(() => result.current.toggleTheme());
      expect(result.current.mode).toBe('light');
    });

    it('should toggle from light to dark', () => {
      const { result } = renderThemeHook();
      act(() => result.current.setTheme('light'));
      act(() => result.current.toggleTheme());
      expect(result.current.mode).toBe('dark');
    });
  });

  // --- localStorage persistence ---

  describe('localStorage persistence', () => {
    it('should persist mode to localStorage', () => {
      const { result } = renderThemeHook();
      act(() => result.current.setTheme('light'));
      expect(storageMock.setItem).toHaveBeenCalledWith('markdrive-theme-preference', 'light');
    });

    it('should restore mode from localStorage', () => {
      storageMock.getItem.mockReturnValue('light');
      const { result } = renderThemeHook();
      expect(result.current.mode).toBe('light');
    });

    it('should ignore invalid localStorage value', () => {
      storageMock.getItem.mockReturnValue('invalid');
      const { result } = renderThemeHook();
      expect(result.current.mode).toBe('system');
    });
  });

  // --- OS color scheme change ---

  describe('system color scheme change', () => {
    it('should follow OS change when mode is system', () => {
      const mql = stubMatchMedia(true); // starts dark
      const { result } = renderThemeHook();
      expect(result.current.resolvedMode).toBe('dark');

      act(() => mql.dispatchChange(false));
      expect(result.current.resolvedMode).toBe('light');
      expect(result.current.colors.bgPrimary).toBe(lightColors.bgPrimary);
    });
  });
});
