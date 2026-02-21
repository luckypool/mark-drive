/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { useContext } from 'react';
import { LanguageProvider, LanguageContext } from './LanguageContext';

// In-memory localStorage mock (jsdom localStorage is incomplete)
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

let storageMock: ReturnType<typeof createLocalStorageMock>;

function TestConsumer() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return <div>No context</div>;
  return (
    <div>
      <span data-testid="language">{ctx.language}</span>
      <button data-testid="toggle" onClick={ctx.toggleLanguage}>Toggle</button>
      <button data-testid="set-ja" onClick={() => ctx.setLanguage('ja')}>Set JA</button>
      <button data-testid="set-en" onClick={() => ctx.setLanguage('en')}>Set EN</button>
    </div>
  );
}

beforeEach(() => {
  storageMock = createLocalStorageMock();
  Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true });
});

afterEach(() => {
  cleanup();
});

describe('LanguageProvider', () => {
  it('should default to English', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('language').textContent).toBe('en');
  });

  it('should restore language from localStorage', () => {
    storageMock.setItem('markdrive-language-preference', 'ja');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('language').textContent).toBe('ja');
  });

  it('should toggle language from en to ja', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => {
      screen.getByTestId('toggle').click();
    });
    expect(screen.getByTestId('language').textContent).toBe('ja');
  });

  it('should toggle language from ja back to en', () => {
    storageMock.setItem('markdrive-language-preference', 'ja');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => {
      screen.getByTestId('toggle').click();
    });
    expect(screen.getByTestId('language').textContent).toBe('en');
  });

  it('should set language via setLanguage', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => {
      screen.getByTestId('set-ja').click();
    });
    expect(screen.getByTestId('language').textContent).toBe('ja');
  });

  it('should ignore invalid stored value and default to en', () => {
    storageMock.setItem('markdrive-language-preference', 'fr');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('language').textContent).toBe('en');
  });

  it('should handle localStorage.getItem throwing', () => {
    storageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('language').textContent).toBe('en');
  });

  it('should handle localStorage.setItem throwing', () => {
    storageMock.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => {
      screen.getByTestId('toggle').click();
    });
    expect(screen.getByTestId('language').textContent).toBe('ja');
  });

  it('should persist language change to localStorage', async () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => {
      screen.getByTestId('set-ja').click();
    });
    await vi.waitFor(() => {
      expect(storageMock.setItem).toHaveBeenCalledWith('markdrive-language-preference', 'ja');
    });
  });
});
