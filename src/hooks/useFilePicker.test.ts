/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useFilePicker, getFileHandle } from './useFilePicker';

// --- helpers ---

function createMockFile(name: string, content: string) {
  return {
    name,
    text: vi.fn(async () => content),
    size: content.length,
    type: 'text/markdown',
  };
}

function createMockFileHandle(name: string, content: string): FileSystemFileHandle {
  const file = createMockFile(name, content);
  return {
    kind: 'file',
    name,
    getFile: vi.fn(async () => file),
  } as unknown as FileSystemFileHandle;
}

describe('useFilePicker', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // --- File System Access API path ---

  describe('File System Access API', () => {
    it('should return file when user selects a file', async () => {
      const handle = createMockFileHandle('test.md', '# Hello');
      window.showOpenFilePicker = vi.fn(async () => [handle]) as unknown as typeof window.showOpenFilePicker;

      const { result } = renderHook(() => useFilePicker());
      let file: Awaited<ReturnType<typeof result.current.openPicker>>;

      await act(async () => {
        file = await result.current.openPicker();
      });

      expect(file!).not.toBeNull();
      expect(file!.name).toBe('test.md');
      expect(file!.content).toBe('# Hello');
      expect(file!.id).toMatch(/^local-/);
    });

    it('should store FileHandle for later retrieval', async () => {
      const handle = createMockFileHandle('note.md', 'content');
      window.showOpenFilePicker = vi.fn(async () => [handle]) as unknown as typeof window.showOpenFilePicker;

      const { result } = renderHook(() => useFilePicker());
      let file: Awaited<ReturnType<typeof result.current.openPicker>>;

      await act(async () => {
        file = await result.current.openPicker();
      });

      const retrieved = getFileHandle(file!.id);
      expect(retrieved).toBe(handle);
    });

    it('should return null when user cancels (AbortError)', async () => {
      const abortError = new DOMException('User cancelled', 'AbortError');
      window.showOpenFilePicker = vi.fn(async () => { throw abortError; }) as unknown as typeof window.showOpenFilePicker;

      const { result } = renderHook(() => useFilePicker());
      let file: Awaited<ReturnType<typeof result.current.openPicker>>;

      await act(async () => {
        file = await result.current.openPicker();
      });

      expect(file!).toBeNull();
    });

    it('should return null on unexpected errors', async () => {
      window.showOpenFilePicker = vi.fn(async () => { throw new Error('Unknown'); }) as unknown as typeof window.showOpenFilePicker;

      const { result } = renderHook(() => useFilePicker());
      let file: Awaited<ReturnType<typeof result.current.openPicker>>;

      await act(async () => {
        file = await result.current.openPicker();
      });

      expect(file!).toBeNull();
    });
  });

  // --- input[type=file] fallback path ---

  describe('input fallback', () => {
    beforeEach(() => {
      // Remove showOpenFilePicker so fallback is used
      delete (window as unknown as Record<string, unknown>).showOpenFilePicker;
    });

    it('should return file when user selects via input', async () => {
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        const input = node as HTMLInputElement;
        // Create a mock file with .text() support
        const mockFile = createMockFile('fallback.md', '# Fallback');
        Object.defineProperty(input, 'files', { value: [mockFile], configurable: true });
        setTimeout(() => {
          // Dispatch change event with input as target
          const event = new Event('change');
          Object.defineProperty(event, 'target', { value: input });
          input.onchange?.(event as unknown as Event);
        }, 0);
        return node;
      });

      const { result } = renderHook(() => useFilePicker());
      let file: Awaited<ReturnType<typeof result.current.openPicker>>;

      await act(async () => {
        file = await result.current.openPicker();
      });

      expect(file!).not.toBeNull();
      expect(file!.name).toBe('fallback.md');
      expect(file!.content).toBe('# Fallback');
    });

    it('should return null when user cancels input', async () => {
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        const input = node as HTMLInputElement;
        setTimeout(() => (input.oncancel as EventListener)?.(new Event('cancel')), 0);
        return node;
      });

      const { result } = renderHook(() => useFilePicker());
      let file: Awaited<ReturnType<typeof result.current.openPicker>>;

      await act(async () => {
        file = await result.current.openPicker();
      });

      expect(file!).toBeNull();
    });
  });

  // --- getFileHandle ---

  describe('getFileHandle', () => {
    it('should return null for unknown fileId', () => {
      expect(getFileHandle('nonexistent')).toBeNull();
    });
  });
});
