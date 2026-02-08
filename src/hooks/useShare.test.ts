/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import React from 'react';
import { useShare } from './useShare';
import { FontSettingsProvider } from '../contexts/FontSettingsContext';

// --- localStorage mock ---

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

// --- html2pdf mock ---

const mockOutputPdf = vi.fn(async () => new Blob(['pdf-content'], { type: 'application/pdf' }));
const mockFrom = vi.fn(() => ({ outputPdf: mockOutputPdf }));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSet = vi.fn((_opts: any) => ({ from: mockFrom }));
const mockHtml2pdf = vi.fn(() => ({ set: mockSet }));

vi.mock('html2pdf.js', () => ({
  default: mockHtml2pdf,
}));

// --- markdownToHtml mock ---

vi.mock('../utils/markdownToHtml', () => ({
  markdownToHtml: vi.fn(async (content: string) => `<p>${content}</p>`),
}));

// --- helpers ---

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(FontSettingsProvider, null, children);
}

function renderShareHook() {
  return renderHook(() => useShare(), { wrapper });
}

describe('useShare', () => {
  let storageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    storageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true });
    // URL.createObjectURL mock
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  // --- initial state ---

  describe('initial state', () => {
    it('should have isProcessing=false and error=null', () => {
      const { result } = renderShareHook();
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  // --- exportToPdf ---

  describe('exportToPdf', () => {
    it('should return a blob URL on success', async () => {
      const { result } = renderShareHook();
      let url: string | null = null;

      await act(async () => {
        url = await result.current.exportToPdf('# Test', 'test.md');
      });

      expect(url).toBe('blob:mock-url');
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should generate correct PDF filename from .md', async () => {
      const { result } = renderShareHook();

      await act(async () => {
        await result.current.exportToPdf('content', 'document.md');
      });

      const setCall = mockSet.mock.calls[0]?.[0];
      expect(setCall?.filename).toBe('document.pdf');
    });

    it('should generate correct PDF filename from .markdown', async () => {
      const { result } = renderShareHook();

      await act(async () => {
        await result.current.exportToPdf('content', 'readme.markdown');
      });

      const setCall = mockSet.mock.calls[0]?.[0];
      expect(setCall?.filename).toBe('readme.pdf');
    });

    it('should set error on failure and return null', async () => {
      mockOutputPdf.mockRejectedValueOnce(new Error('PDF engine failed'));

      const { result } = renderShareHook();
      let url: string | null = 'initial';

      await act(async () => {
        url = await result.current.exportToPdf('# Test', 'test.md');
      });

      expect(url).toBeNull();
      expect(result.current.error).toBe('PDF engine failed');
      expect(result.current.isProcessing).toBe(false);
    });

    it('should handle non-Error throw', async () => {
      mockOutputPdf.mockRejectedValueOnce('string error');

      const { result } = renderShareHook();

      await act(async () => {
        await result.current.exportToPdf('# Test', 'test.md');
      });

      expect(result.current.error).toBe('PDF generation failed');
    });

    it('should reset isProcessing after completion', async () => {
      const { result } = renderShareHook();

      expect(result.current.isProcessing).toBe(false);

      await act(async () => {
        await result.current.exportToPdf('# Test', 'test.md');
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });

  // --- shareContent ---

  describe('shareContent', () => {
    it('should create a download link and trigger click', async () => {
      const clickSpy = vi.fn();
      const createElementOriginal = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = createElementOriginal(tag);
        if (tag === 'a') {
          el.click = clickSpy;
        }
        return el;
      });

      const { result } = renderShareHook();

      await act(async () => {
        await result.current.shareContent('# Download', 'doc.md');
      });

      expect(clickSpy).toHaveBeenCalledOnce();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set error on failure', async () => {
      mockOutputPdf.mockRejectedValueOnce(new Error('Download failed'));

      const { result } = renderShareHook();

      await act(async () => {
        await result.current.shareContent('# Test', 'test.md');
      });

      expect(result.current.error).toBe('Download failed');
      expect(result.current.isProcessing).toBe(false);
    });
  });

  // --- PDF options ---

  describe('PDF options', () => {
    it('should use A4 portrait format', async () => {
      const { result } = renderShareHook();

      await act(async () => {
        await result.current.exportToPdf('content', 'test.md');
      });

      const opts = mockSet.mock.calls[0]?.[0];
      expect(opts?.jsPDF).toEqual({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    });

    it('should use correct margins', async () => {
      const { result } = renderShareHook();

      await act(async () => {
        await result.current.exportToPdf('content', 'test.md');
      });

      const opts = mockSet.mock.calls[0]?.[0];
      expect(opts?.margin).toEqual([10, 10, 10, 10]);
    });
  });
});
