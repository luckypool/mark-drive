/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { usePickerSettings } from './usePickerSettings';

// --- storage mock ---

vi.mock('../services/storage', () => {
  let store: Record<string, string> = {};
  return {
    storage: {
      getJSON: vi.fn(async (key: string) => {
        const val = store[key];
        return val ? JSON.parse(val) : null;
      }),
      setJSON: vi.fn(async (key: string, value: unknown) => {
        store[key] = JSON.stringify(value);
      }),
      _reset: () => { store = {}; },
    },
  };
});

const { storage } = await import('../services/storage') as any;

beforeEach(() => {
  vi.clearAllMocks();
  storage._reset();
});

afterEach(() => {
  cleanup();
});

describe('usePickerSettings', () => {
  it('should return default settings initially', () => {
    const { result } = renderHook(() => usePickerSettings());
    expect(result.current.pickerSettings).toEqual({
      ownedByMe: false,
      starred: false,
    });
  });

  it('should restore settings from storage', async () => {
    storage.getJSON.mockResolvedValueOnce({ ownedByMe: true, starred: true });

    const { result } = renderHook(() => usePickerSettings());

    // Wait for useEffect to resolve
    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });

    expect(result.current.pickerSettings).toEqual({
      ownedByMe: true,
      starred: true,
    });
  });

  it('should merge partial stored settings with defaults', async () => {
    storage.getJSON.mockResolvedValueOnce({ starred: true });

    const { result } = renderHook(() => usePickerSettings());

    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });

    expect(result.current.pickerSettings).toEqual({
      ownedByMe: false,
      starred: true,
    });
  });

  it('should update settings and persist to storage', async () => {
    const { result } = renderHook(() => usePickerSettings());

    act(() => {
      result.current.updatePickerSettings({ ownedByMe: true });
    });

    expect(result.current.pickerSettings.ownedByMe).toBe(true);
    expect(result.current.pickerSettings.starred).toBe(false);
    expect(storage.setJSON).toHaveBeenCalledWith('pickerViewSettings', {
      ownedByMe: true,
      starred: false,
    });
  });

  it('should update multiple settings', async () => {
    const { result } = renderHook(() => usePickerSettings());

    act(() => {
      result.current.updatePickerSettings({ ownedByMe: true, starred: true });
    });

    expect(result.current.pickerSettings).toEqual({
      ownedByMe: true,
      starred: true,
    });
  });

  it('should handle null from storage gracefully', async () => {
    storage.getJSON.mockResolvedValueOnce(null);

    const { result } = renderHook(() => usePickerSettings());

    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });

    // Should keep defaults
    expect(result.current.pickerSettings).toEqual({
      ownedByMe: false,
      starred: false,
    });
  });
});
