/**
 * ストレージサービス
 * Web: localStorage
 */

/**
 * localStorage を使用したストレージ操作
 */
export const storage = {
  /**
   * データを保存
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage setItem error:', error);
      throw error;
    }
  },

  /**
   * データを取得
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return null;
    }
  },

  /**
   * データを削除
   */
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage removeItem error:', error);
    }
  },

  /**
   * 複数のキーを一括削除
   */
  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage multiRemove error:', error);
      }
    });
  },

  /**
   * すべてのキーを取得
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('localStorage getAllKeys error:', error);
      return [];
    }
  },

  /**
   * JSON データを保存
   */
  async setJSON<T>(key: string, value: T): Promise<void> {
    const jsonString = JSON.stringify(value);
    await this.setItem(key, jsonString);
  },

  /**
   * JSON データを取得
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('JSON parse error:', error);
      return null;
    }
  },
};
