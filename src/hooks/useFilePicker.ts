/**
 * ファイルピッカー hook - Web 版
 * File System Access API を使用（非対応ブラウザは input[type=file] にフォールバック）
 */

import { useRef, useCallback } from 'react';

export interface LocalFile {
  id: string;
  name: string;
  content: string;
}

// FileSystemFileHandle をファイル ID で管理
const fileHandleMap = new Map<string, FileSystemFileHandle>();

export function getFileHandle(fileId: string): FileSystemFileHandle | null {
  return fileHandleMap.get(fileId) ?? null;
}

export function useFilePicker() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = useCallback((): Promise<LocalFile | null> => {
    // File System Access API 対応ブラウザ
    if ('showOpenFilePicker' in window) {
      return openWithFileSystemAccess();
    }
    // フォールバック: input[type=file]
    return openWithInputElement(inputRef);
  }, []);

  return { openPicker };
}

async function openWithFileSystemAccess(): Promise<LocalFile | null> {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'Markdown files',
          accept: {
            'text/markdown': ['.md', '.markdown'],
            'text/plain': ['.txt'],
          },
        },
      ],
      multiple: false,
    });

    const file = await handle.getFile();
    const content = await file.text();
    const id = `local-${Date.now()}-${file.name}`;

    // ハンドルを保存（上書き保存用）
    fileHandleMap.set(id, handle);

    return { id, name: file.name, content };
  } catch (err) {
    // ユーザーがキャンセルした場合
    if (err instanceof DOMException && err.name === 'AbortError') {
      return null;
    }
    console.error('Failed to open file:', err);
    return null;
  }
}

function openWithInputElement(
  inputRef: React.MutableRefObject<HTMLInputElement | null>
): Promise<LocalFile | null> {
  if (inputRef.current) {
    inputRef.current.remove();
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.markdown,text/markdown,text/x-markdown,text/plain';
  input.style.display = 'none';
  inputRef.current = input;

  return new Promise<LocalFile | null>((resolve) => {
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        input.remove();
        return;
      }

      try {
        const content = await file.text();
        resolve({
          id: `local-${Date.now()}-${file.name}`,
          name: file.name,
          content,
        });
      } catch (err) {
        console.error('Failed to read file:', err);
        resolve(null);
      } finally {
        input.remove();
      }
    };

    input.oncancel = () => {
      resolve(null);
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
  });
}
