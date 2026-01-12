import { useRef, useCallback } from 'react';

export interface LocalFile {
  name: string;
  content: string;
}

export function useLocalFilePicker() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = useCallback(() => {
    // 既存の input があれば削除
    if (inputRef.current) {
      inputRef.current.remove();
    }

    // 新しい input を作成
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
  }, []);

  return { openPicker };
}
