/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddToHomeScreen } from './useAddToHomeScreen';

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
}

function setUserAgent(ua: string) {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    writable: true,
    configurable: true,
  });
}

function setPlatform(platform: string) {
  Object.defineProperty(navigator, 'platform', {
    value: platform,
    writable: true,
    configurable: true,
  });
}

function setMaxTouchPoints(count: number) {
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: count,
    writable: true,
    configurable: true,
  });
}

function setStandalone(value: boolean) {
  Object.defineProperty(navigator, 'standalone', {
    value,
    writable: true,
    configurable: true,
  });
}

describe('useAddToHomeScreen', () => {
  let storageMock: ReturnType<typeof createLocalStorageMock>;
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    storageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: storageMock,
      writable: true,
      configurable: true,
    });
    // Default: not standalone
    setStandalone(false);
  });

  afterEach(() => {
    setUserAgent(originalUserAgent);
    setPlatform('');
    setMaxTouchPoints(0);
    setStandalone(false);
  });

  describe('iOS Safari detection', () => {
    it('should show banner on iOS Safari (iPhone)', () => {
      setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      );
      setPlatform('iPhone');

      const { result } = renderHook(() => useAddToHomeScreen());
      expect(result.current.shouldShow).toBe(true);
    });

    it('should show banner on iPad (with MacIntel + touchpoints)', () => {
      setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
      );
      setPlatform('MacIntel');
      setMaxTouchPoints(5);

      const { result } = renderHook(() => useAddToHomeScreen());
      expect(result.current.shouldShow).toBe(true);
    });

    it('should not show banner on Chrome on iOS (CriOS)', () => {
      setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1'
      );
      setPlatform('iPhone');

      const { result } = renderHook(() => useAddToHomeScreen());
      expect(result.current.shouldShow).toBe(false);
    });

    it('should not show banner on desktop browser', () => {
      setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
      );
      setPlatform('MacIntel');
      setMaxTouchPoints(0);

      const { result } = renderHook(() => useAddToHomeScreen());
      expect(result.current.shouldShow).toBe(false);
    });
  });

  describe('standalone detection', () => {
    it('should not show banner when running as standalone app', () => {
      setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      );
      setPlatform('iPhone');
      setStandalone(true);

      const { result } = renderHook(() => useAddToHomeScreen());
      expect(result.current.shouldShow).toBe(false);
    });

    it('should return isStandalone status', () => {
      setStandalone(true);
      const { result } = renderHook(() => useAddToHomeScreen());
      expect(result.current.isStandalone).toBe(true);
    });
  });

  describe('dismiss', () => {
    it('should hide banner and persist dismiss timestamp', () => {
      setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      );
      setPlatform('iPhone');

      const { result } = renderHook(() => useAddToHomeScreen());
      expect(result.current.shouldShow).toBe(true);

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.shouldShow).toBe(false);
      expect(storageMock.setItem).toHaveBeenCalledWith(
        'markdrive-a2hs-dismissed',
        expect.any(String)
      );
    });

    it('should not show banner when recently dismissed', () => {
      setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      );
      setPlatform('iPhone');

      // Simulate recent dismiss (1 day ago)
      const oneDayAgo = String(Date.now() - 1 * 24 * 60 * 60 * 1000);
      storageMock.setItem('markdrive-a2hs-dismissed', oneDayAgo);

      const { result } = renderHook(() => useAddToHomeScreen());
      expect(result.current.shouldShow).toBe(false);
    });

    it('should show banner when dismiss has expired (>7 days)', () => {
      setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      );
      setPlatform('iPhone');

      // Simulate old dismiss (8 days ago)
      const eightDaysAgo = String(Date.now() - 8 * 24 * 60 * 60 * 1000);
      storageMock.setItem('markdrive-a2hs-dismissed', eightDaysAgo);

      const { result } = renderHook(() => useAddToHomeScreen());
      expect(result.current.shouldShow).toBe(true);
    });
  });
});
