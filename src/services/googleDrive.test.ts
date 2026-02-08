/**
 * Tests for googleDrive service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  searchMarkdownFiles,
  listRecentMarkdownFiles,
  fetchFileContent,
  fetchFileInfo,
  isMarkdownFile,
} from './googleDrive';
import type { DriveFile } from '../types/googleDrive';

// Mock fetch
const originalFetch = globalThis.fetch;

function mockFetch(response: unknown, ok = true, statusText = 'OK') {
  globalThis.fetch = vi.fn(async () =>
    ({
      ok,
      statusText,
      json: async () => response,
      text: async () => (typeof response === 'string' ? response : JSON.stringify(response)),
    }) as Response
  );
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// Test data
const mockFiles: DriveFile[] = [
  {
    id: '1',
    name: 'readme.md',
    mimeType: 'text/markdown',
    modifiedTime: '2024-01-15T10:00:00Z',
    size: '1024',
  },
  {
    id: '2',
    name: 'notes.markdown',
    mimeType: 'text/markdown',
    modifiedTime: '2024-01-14T10:00:00Z',
    size: '2048',
  },
  {
    id: '3',
    name: 'document.txt',
    mimeType: 'text/plain',
    modifiedTime: '2024-01-13T10:00:00Z',
    size: '512',
  },
];

describe('listRecentMarkdownFiles', () => {
  it('should return only .md and .markdown files', async () => {
    mockFetch({ files: mockFiles });
    const files = await listRecentMarkdownFiles('test-token');
    expect(files).toHaveLength(2);
    expect(files[0].name).toBe('readme.md');
    expect(files[1].name).toBe('notes.markdown');
  });

  it('should return empty array for no files', async () => {
    mockFetch({ files: [] });
    const files = await listRecentMarkdownFiles('test-token');
    expect(files).toHaveLength(0);
  });

  it('should return empty array for null files', async () => {
    mockFetch({ files: null });
    const files = await listRecentMarkdownFiles('test-token');
    expect(files).toHaveLength(0);
  });

  it('should throw on API error', async () => {
    mockFetch({}, false, 'Unauthorized');
    await expect(listRecentMarkdownFiles('invalid-token')).rejects.toThrow();
  });

  it('should accept maxResults parameter', async () => {
    mockFetch({ files: mockFiles });
    await listRecentMarkdownFiles('test-token', 10);
    expect(globalThis.fetch).toHaveBeenCalled();
  });
});

describe('searchMarkdownFiles', () => {
  it('should return filtered markdown files', async () => {
    mockFetch({ files: mockFiles });
    const files = await searchMarkdownFiles('test-token', 'readme');
    expect(files).toHaveLength(2);
  });

  it('should return empty for empty query', async () => {
    const files = await searchMarkdownFiles('test-token', '');
    expect(files).toHaveLength(0);
  });

  it('should return empty for whitespace query', async () => {
    const files = await searchMarkdownFiles('test-token', '   ');
    expect(files).toHaveLength(0);
  });

  it('should handle special characters in query', async () => {
    mockFetch({ files: [] });
    const files = await searchMarkdownFiles('test-token', "test's");
    expect(files).toHaveLength(0);
  });
});

describe('fetchFileContent', () => {
  it('should return file content', async () => {
    mockFetch('# Hello World\n\nThis is content.');
    const content = await fetchFileContent('test-token', 'file-id');
    expect(content).toBe('# Hello World\n\nThis is content.');
  });

  it('should throw on file not found', async () => {
    mockFetch('', false, 'Not Found');
    await expect(fetchFileContent('test-token', 'invalid-id')).rejects.toThrow();
  });
});

describe('fetchFileInfo', () => {
  it('should return file info', async () => {
    mockFetch(mockFiles[0]);
    const info = await fetchFileInfo('test-token', 'file-id');
    expect(info).not.toBeNull();
    expect(info?.name).toBe('readme.md');
  });

  it('should return null on error', async () => {
    mockFetch({}, false, 'Not Found');
    const info = await fetchFileInfo('test-token', 'invalid-id');
    expect(info).toBeNull();
  });
});

describe('isMarkdownFile', () => {
  it('should recognize .md files', () => {
    expect(isMarkdownFile({ id: '1', name: 'readme.md', mimeType: 'text/markdown' })).toBe(true);
  });

  it('should recognize .markdown files', () => {
    expect(isMarkdownFile({ id: '2', name: 'notes.markdown', mimeType: 'text/markdown' })).toBe(true);
  });

  it('should recognize uppercase .MD files', () => {
    expect(isMarkdownFile({ id: '3', name: 'README.MD', mimeType: 'text/markdown' })).toBe(true);
  });

  it('should reject .txt files', () => {
    expect(isMarkdownFile({ id: '4', name: 'document.txt', mimeType: 'text/plain' })).toBe(false);
  });

  it('should reject files without extension', () => {
    expect(isMarkdownFile({ id: '5', name: 'readme', mimeType: 'text/plain' })).toBe(false);
  });
});
