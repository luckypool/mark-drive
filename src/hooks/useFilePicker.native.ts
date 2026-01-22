/**
 * ファイルピッカー hook - Native 版
 * expo-document-picker を使用
 */

import { useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export interface LocalFile {
  id: string;
  name: string;
  content: string;
}

export function useFilePicker() {
  const openPicker = useCallback(async (): Promise<LocalFile | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/markdown', 'text/x-markdown', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      const file = result.assets[0];

      // ファイル名が .md または .markdown で終わるかチェック
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.md') && !fileName.endsWith('.markdown')) {
        // 拡張子が異なる場合でも、ユーザーが選択したので読み込む
        console.log('File may not be a markdown file:', fileName);
      }

      // ファイル内容を読み込み
      const content = await FileSystem.readAsStringAsync(file.uri);

      return {
        id: `local-${Date.now()}-${file.name}`,
        name: file.name,
        content,
      };
    } catch (err) {
      console.error('Failed to pick or read file:', err);
      return null;
    }
  }, []);

  return { openPicker };
}
