/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { isIOS, isStandaloneMode, isIosPwa } from './platform';

function setUserAgent(ua: string) {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    writable: true,
    configurable: true,
  });
}

function setStandaloneMediaQuery(matches: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query === '(display-mode: standalone)' ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  setUserAgent('Mozilla/5.0 (X11; Linux x86_64)');
  setStandaloneMediaQuery(false);
  // Remove navigator.standalone if set
  if ('standalone' in navigator) {
    Object.defineProperty(navigator, 'standalone', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  }
});

describe('isIOS', () => {
  it('returns true for iPhone user agent', () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)');
    expect(isIOS()).toBe(true);
  });

  it('returns true for iPad user agent', () => {
    setUserAgent('Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)');
    expect(isIOS()).toBe(true);
  });

  it('returns true for Mac with touch (iPad desktop mode)', () => {
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    Object.defineProperty(document, 'ontouchend', {
      value: null,
      writable: true,
      configurable: true,
    });
    expect(isIOS()).toBe(true);
    delete (document as any).ontouchend;
  });

  it('returns false for desktop Chrome', () => {
    setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');
    expect(isIOS()).toBe(false);
  });

  it('returns false for Android', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 13)');
    expect(isIOS()).toBe(false);
  });
});

describe('isStandaloneMode', () => {
  it('returns true when display-mode: standalone matches', () => {
    setStandaloneMediaQuery(true);
    expect(isStandaloneMode()).toBe(true);
  });

  it('returns true when navigator.standalone is true', () => {
    setStandaloneMediaQuery(false);
    Object.defineProperty(navigator, 'standalone', {
      value: true,
      writable: true,
      configurable: true,
    });
    expect(isStandaloneMode()).toBe(true);
  });

  it('returns false in normal browser mode', () => {
    setStandaloneMediaQuery(false);
    expect(isStandaloneMode()).toBe(false);
  });
});

describe('isIosPwa', () => {
  it('returns true for iOS + standalone', () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)');
    setStandaloneMediaQuery(true);
    expect(isIosPwa()).toBe(true);
  });

  it('returns false for iOS + non-standalone', () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)');
    setStandaloneMediaQuery(false);
    expect(isIosPwa()).toBe(false);
  });

  it('returns false for non-iOS + standalone', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 13)');
    setStandaloneMediaQuery(true);
    expect(isIosPwa()).toBe(false);
  });

  it('returns false for desktop browser', () => {
    setUserAgent('Mozilla/5.0 (X11; Linux x86_64)');
    setStandaloneMediaQuery(false);
    expect(isIosPwa()).toBe(false);
  });
});
