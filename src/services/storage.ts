/**
 * ストレージサービス
 * Web: localStorage
 * Native: AsyncStorage
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * プラットフォームに応じたストレージ操作を提供
 */
export const storage = {
  /**
   * データを保存
   */
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('localStorage setItem error:', error);
        throw error;
      }
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  /**
   * データを取得
   */
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage getItem error:', error);
        return null;
      }
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  /**
   * データを削除
   */
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage removeItem error:', error);
      }
    } else {
      await AsyncStorage.removeItem(key);
    }
  },

  /**
   * 複数のキーを一括削除
   */
  async multiRemove(keys: string[]): Promise<void> {
    if (Platform.OS === 'web') {
      keys.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('localStorage multiRemove error:', error);
        }
      });
    } else {
      await AsyncStorage.multiRemove(keys);
    }
  },

  /**
   * すべてのキーを取得
   */
  async getAllKeys(): Promise<string[]> {
    if (Platform.OS === 'web') {
      try {
        return Object.keys(localStorage);
      } catch (error) {
        console.error('localStorage getAllKeys error:', error);
        return [];
      }
    } else {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
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
