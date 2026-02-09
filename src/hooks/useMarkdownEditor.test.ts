/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMarkdownEditor } from './useMarkdownEditor';

describe('useMarkdownEditor', () => {
  const defaultOptions = {
    initialContent: '# Hello',
    fileName: 'test.md',
    fileHandle: null,
    onContentSaved: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start in preview mode', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));
      expect(result.current.mode).toBe('preview');
    });

    it('should have canEdit true', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));
      expect(result.current.canEdit).toBe(true);
    });

    it('should have no unsaved changes initially', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should have canSave false initially', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));
      expect(result.current.canSave).toBe(false);
    });
  });

  describe('toggleMode', () => {
    it('should switch from preview to edit', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.mode).toBe('edit');
      expect(result.current.editContent).toBe('# Hello');
    });

    it('should switch from edit back to preview', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));

      act(() => {
        result.current.toggleMode();
      });
      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.mode).toBe('preview');
    });
  });

  describe('hasUnsavedChanges / canSave', () => {
    it('should detect unsaved changes when content differs from initial', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));

      act(() => {
        result.current.toggleMode();
      });
      act(() => {
        result.current.setEditContent('# Modified');
      });

      expect(result.current.hasUnsavedChanges).toBe(true);
      expect(result.current.canSave).toBe(true);
    });

    it('should have no unsaved changes when content matches initial', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));

      act(() => {
        result.current.toggleMode();
      });
      act(() => {
        result.current.setEditContent('# Modified');
      });
      act(() => {
        result.current.setEditContent('# Hello');
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.canSave).toBe(false);
    });

    it('should report no unsaved changes in preview mode', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('discardChanges', () => {
    it('should reset content and return to preview mode', () => {
      const { result } = renderHook(() => useMarkdownEditor(defaultOptions));

      act(() => {
        result.current.toggleMode();
      });
      act(() => {
        result.current.setEditContent('# Modified');
      });
      act(() => {
        result.current.discardChanges();
      });

      expect(result.current.mode).toBe('preview');
      expect(result.current.editContent).toBe('# Hello');
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('save', () => {
    it('should download file when no fileHandle (fallback)', async () => {
      const createObjectURL = vi.fn(() => 'blob:test');
      const revokeObjectURL = vi.fn();
      const clickMock = vi.fn();

      Object.defineProperty(window, 'URL', {
        value: { createObjectURL, revokeObjectURL },
        writable: true,
        configurable: true,
      });

      const onContentSaved = vi.fn();
      const { result } = renderHook(() =>
        useMarkdownEditor({ ...defaultOptions, onContentSaved })
      );

      act(() => {
        result.current.toggleMode();
      });
      act(() => {
        result.current.setEditContent('# New Content');
      });

      // Mock createElement AFTER renderHook to avoid interfering with it
      const origCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          return { href: '', download: '', click: clickMock } as unknown as HTMLAnchorElement;
        }
        return origCreateElement(tag);
      });

      let saveResult: boolean;
      await act(async () => {
        saveResult = await result.current.save();
      });

      expect(saveResult!).toBe(true);
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalled();
      expect(onContentSaved).toHaveBeenCalledWith('# New Content');
      expect(result.current.saveSuccess).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(false);

      createElementSpy.mockRestore();
    });

    it('should save via fileHandle when available', async () => {
      const writeMock = vi.fn();
      const closeMock = vi.fn();
      const fileHandle = {
        createWritable: vi.fn(async () => ({
          write: writeMock,
          close: closeMock,
        })),
      } as unknown as FileSystemFileHandle;

      const onContentSaved = vi.fn();
      const { result } = renderHook(() =>
        useMarkdownEditor({
          ...defaultOptions,
          fileHandle,
          onContentSaved,
        })
      );

      act(() => {
        result.current.toggleMode();
      });
      act(() => {
        result.current.setEditContent('# Saved via handle');
      });

      let saveResult: boolean;
      await act(async () => {
        saveResult = await result.current.save();
      });

      expect(saveResult!).toBe(true);
      expect(writeMock).toHaveBeenCalledWith('# Saved via handle');
      expect(closeMock).toHaveBeenCalled();
      expect(onContentSaved).toHaveBeenCalledWith('# Saved via handle');
    });

    it('should handle save error', async () => {
      const fileHandle = {
        createWritable: vi.fn(async () => {
          throw new Error('Permission denied');
        }),
      } as unknown as FileSystemFileHandle;

      const { result } = renderHook(() =>
        useMarkdownEditor({ ...defaultOptions, fileHandle })
      );

      act(() => {
        result.current.toggleMode();
      });
      act(() => {
        result.current.setEditContent('# Will fail');
      });

      let saveResult: boolean;
      await act(async () => {
        saveResult = await result.current.save();
      });

      expect(saveResult!).toBe(false);
      expect(result.current.saveError).toBe('Permission denied');
      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('initialContent change', () => {
    it('should update baseline when initialContent changes', () => {
      const { result, rerender } = renderHook(
        (props) => useMarkdownEditor(props),
        { initialProps: defaultOptions }
      );

      rerender({ ...defaultOptions, initialContent: '# Updated' });

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.editContent).toBe('# Updated');
    });
  });

  describe('null initialContent', () => {
    it('should use empty string as baseline when initialContent is null', () => {
      const { result } = renderHook(() =>
        useMarkdownEditor({ ...defaultOptions, initialContent: null })
      );

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.editContent).toBe('');
    });
  });
});
