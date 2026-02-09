/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from './storage';

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

describe('storage', () => {
  let storageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    storageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: storageMock,
      writable: true,
    });
  });

  describe('setItem', () => {
    it('should store a value', async () => {
      await storage.setItem('key1', 'value1');
      expect(storageMock.setItem).toHaveBeenCalledWith('key1', 'value1');
    });

    it('should throw on localStorage error', async () => {
      storageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      await expect(storage.setItem('key1', 'value1')).rejects.toThrow(
        'QuotaExceededError'
      );
    });
  });

  describe('getItem', () => {
    it('should return stored value', async () => {
      storageMock.setItem('key1', 'value1');
      const result = await storage.getItem('key1');
      expect(result).toBe('value1');
    });

    it('should return null for missing key', async () => {
      const result = await storage.getItem('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null on localStorage error', async () => {
      storageMock.getItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      const result = await storage.getItem('key1');
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove a key', async () => {
      await storage.removeItem('key1');
      expect(storageMock.removeItem).toHaveBeenCalledWith('key1');
    });

    it('should not throw on localStorage error', async () => {
      storageMock.removeItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      await expect(storage.removeItem('key1')).resolves.toBeUndefined();
    });
  });

  describe('multiRemove', () => {
    it('should remove multiple keys', async () => {
      await storage.multiRemove(['a', 'b', 'c']);
      expect(storageMock.removeItem).toHaveBeenCalledWith('a');
      expect(storageMock.removeItem).toHaveBeenCalledWith('b');
      expect(storageMock.removeItem).toHaveBeenCalledWith('c');
    });

    it('should continue removing even if one key fails', async () => {
      let callCount = 0;
      storageMock.removeItem.mockImplementation(() => {
        callCount++;
        if (callCount === 2) throw new Error('fail');
      });
      await storage.multiRemove(['a', 'b', 'c']);
      expect(storageMock.removeItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('getAllKeys', () => {
    it('should return all keys from localStorage', async () => {
      // getAllKeys calls Object.keys(localStorage), so we need a mock
      // whose own enumerable keys are the stored data keys
      const keysStorageMock = Object.create(null) as Record<string, unknown>;
      keysStorageMock['k1'] = 'v1';
      keysStorageMock['k2'] = 'v2';
      Object.defineProperty(window, 'localStorage', {
        value: keysStorageMock,
        writable: true,
        configurable: true,
      });
      const keys = await storage.getAllKeys();
      expect(keys).toEqual(expect.arrayContaining(['k1', 'k2']));
      expect(keys).toHaveLength(2);
      // Restore mock
      Object.defineProperty(window, 'localStorage', {
        value: storageMock,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('setJSON', () => {
    it('should store JSON-serialized value', async () => {
      await storage.setJSON('data', { foo: 'bar', count: 42 });
      expect(storageMock.setItem).toHaveBeenCalledWith(
        'data',
        JSON.stringify({ foo: 'bar', count: 42 })
      );
    });

    it('should handle arrays', async () => {
      await storage.setJSON('arr', [1, 2, 3]);
      expect(storageMock.setItem).toHaveBeenCalledWith('arr', '[1,2,3]');
    });
  });

  describe('getJSON', () => {
    it('should return parsed JSON', async () => {
      storageMock.setItem('data', JSON.stringify({ foo: 'bar' }));
      const result = await storage.getJSON<{ foo: string }>('data');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return null for missing key', async () => {
      const result = await storage.getJSON('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', async () => {
      storageMock.setItem('bad', '{invalid json}');
      const result = await storage.getJSON('bad');
      expect(result).toBeNull();
    });
  });
});
