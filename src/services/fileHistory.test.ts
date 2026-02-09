import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getFileHistory,
  addFileToHistory,
  removeFileFromHistory,
  clearFileHistory,
} from './fileHistory';
import { storage } from './storage';

vi.mock('./storage', () => ({
  storage: {
    getJSON: vi.fn(),
    setJSON: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const mockedStorage = vi.mocked(storage);

describe('fileHistory', () => {
  const testConfig = { storageKey: 'test-history', maxItems: 3 };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedStorage.getJSON.mockResolvedValue(null);
    mockedStorage.setJSON.mockResolvedValue(undefined);
    mockedStorage.removeItem.mockResolvedValue(undefined);
  });

  describe('getFileHistory', () => {
    it('should return empty array when no history', async () => {
      const result = await getFileHistory(testConfig);
      expect(result).toEqual([]);
    });

    it('should return items sorted by date (newest first)', async () => {
      const items = [
        { id: '1', name: 'old.md', selectedAt: '2025-01-01T00:00:00Z', source: 'google-drive' as const },
        { id: '2', name: 'new.md', selectedAt: '2025-06-01T00:00:00Z', source: 'google-drive' as const },
        { id: '3', name: 'mid.md', selectedAt: '2025-03-01T00:00:00Z', source: 'local' as const },
      ];
      mockedStorage.getJSON.mockResolvedValueOnce(items);

      const result = await getFileHistory(testConfig);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });

    it('should return empty array on storage error', async () => {
      mockedStorage.getJSON.mockRejectedValueOnce(new Error('storage error'));
      const result = await getFileHistory(testConfig);
      expect(result).toEqual([]);
    });
  });

  describe('addFileToHistory', () => {
    it('should add a new file to history', async () => {
      mockedStorage.getJSON.mockResolvedValueOnce([]);

      await addFileToHistory({ id: 'f1', name: 'test.md' }, testConfig);

      expect(mockedStorage.setJSON).toHaveBeenCalledWith(
        'test-history',
        expect.arrayContaining([
          expect.objectContaining({ id: 'f1', name: 'test.md', source: 'google-drive' }),
        ])
      );
    });

    it('should deduplicate existing file (move to top)', async () => {
      const existing = [
        { id: 'f1', name: 'old.md', selectedAt: '2025-01-01T00:00:00Z', source: 'google-drive' },
        { id: 'f2', name: 'other.md', selectedAt: '2025-02-01T00:00:00Z', source: 'google-drive' },
      ];
      mockedStorage.getJSON.mockResolvedValueOnce(existing);

      await addFileToHistory({ id: 'f1', name: 'old.md' }, testConfig);

      const savedHistory = mockedStorage.setJSON.mock.calls[0][1] as Array<{ id: string }>;
      expect(savedHistory[0].id).toBe('f1');
      expect(savedHistory).toHaveLength(2);
    });

    it('should trim history to maxItems', async () => {
      const existing = [
        { id: 'f1', name: 'a.md', selectedAt: '2025-03-01T00:00:00Z', source: 'google-drive' },
        { id: 'f2', name: 'b.md', selectedAt: '2025-02-01T00:00:00Z', source: 'google-drive' },
        { id: 'f3', name: 'c.md', selectedAt: '2025-01-01T00:00:00Z', source: 'google-drive' },
      ];
      mockedStorage.getJSON.mockResolvedValueOnce(existing);

      await addFileToHistory({ id: 'f4', name: 'd.md' }, testConfig);

      const savedHistory = mockedStorage.setJSON.mock.calls[0][1] as Array<{ id: string }>;
      expect(savedHistory).toHaveLength(3); // maxItems = 3
      expect(savedHistory[0].id).toBe('f4');
      expect(savedHistory.find((h) => h.id === 'f3')).toBeUndefined(); // oldest trimmed
    });

    it('should use provided source', async () => {
      mockedStorage.getJSON.mockResolvedValueOnce([]);

      await addFileToHistory({ id: 'f1', name: 'local.md', source: 'local' }, testConfig);

      const savedHistory = mockedStorage.setJSON.mock.calls[0][1] as Array<{ source: string }>;
      expect(savedHistory[0].source).toBe('local');
    });

    it('should not throw on storage error', async () => {
      mockedStorage.getJSON.mockRejectedValueOnce(new Error('fail'));
      await expect(
        addFileToHistory({ id: 'f1', name: 'test.md' }, testConfig)
      ).resolves.toBeUndefined();
    });
  });

  describe('removeFileFromHistory', () => {
    it('should remove a specific file', async () => {
      const existing = [
        { id: 'f1', name: 'a.md', selectedAt: '2025-01-01T00:00:00Z', source: 'google-drive' },
        { id: 'f2', name: 'b.md', selectedAt: '2025-02-01T00:00:00Z', source: 'google-drive' },
      ];
      mockedStorage.getJSON.mockResolvedValueOnce(existing);

      await removeFileFromHistory('f1', testConfig);

      const savedHistory = mockedStorage.setJSON.mock.calls[0][1] as Array<{ id: string }>;
      expect(savedHistory).toHaveLength(1);
      expect(savedHistory[0].id).toBe('f2');
    });

    it('should not throw on storage error', async () => {
      mockedStorage.getJSON.mockRejectedValueOnce(new Error('fail'));
      await expect(
        removeFileFromHistory('f1', testConfig)
      ).resolves.toBeUndefined();
    });
  });

  describe('clearFileHistory', () => {
    it('should call removeItem with correct key', async () => {
      await clearFileHistory(testConfig);
      expect(mockedStorage.removeItem).toHaveBeenCalledWith('test-history');
    });

    it('should not throw on storage error', async () => {
      mockedStorage.removeItem.mockRejectedValueOnce(new Error('fail'));
      await expect(clearFileHistory(testConfig)).resolves.toBeUndefined();
    });
  });
});
