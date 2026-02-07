/**
 * Markdown 編集状態管理フック
 */

import { useState, useCallback, useRef, useMemo } from 'react';

interface UseMarkdownEditorOptions {
  initialContent: string | null;
  fileName: string;
  fileHandle: FileSystemFileHandle | null;
  onContentSaved: (newContent: string) => void;
}

export interface UseMarkdownEditorReturn {
  mode: 'preview' | 'edit';
  editContent: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  canEdit: boolean;
  canSave: boolean;

  toggleMode: () => void;
  setEditContent: (content: string) => void;
  save: () => Promise<boolean>;
  discardChanges: () => void;
}

export function useMarkdownEditor({
  initialContent,
  fileName,
  fileHandle,
  onContentSaved,
}: UseMarkdownEditorOptions): UseMarkdownEditorReturn {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const baselineRef = useRef(initialContent || '');
  const saveSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canEdit = true;
  const hasUnsavedChanges = mode === 'edit' && editContent !== baselineRef.current;
  const canSave = hasUnsavedChanges && !isSaving;

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      if (prev === 'preview') {
        // preview → edit: baseline から editContent を初期化
        setEditContent(baselineRef.current);
        setSaveError(null);
        setSaveSuccess(false);
        return 'edit';
      }
      return 'preview';
    });
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (fileHandle) {
        // File System Access API: 上書き保存
        const writable = await fileHandle.createWritable();
        await writable.write(editContent);
        await writable.close();
      } else {
        // フォールバック: ダウンロード
        const blob = new Blob([editContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }

      baselineRef.current = editContent;
      onContentSaved(editContent);
      setSaveSuccess(true);

      // 3秒後に成功メッセージをクリア
      if (saveSuccessTimerRef.current) {
        clearTimeout(saveSuccessTimerRef.current);
      }
      saveSuccessTimerRef.current = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [editContent, fileHandle, fileName, onContentSaved]);

  const discardChanges = useCallback(() => {
    setEditContent(baselineRef.current);
    setSaveError(null);
    setSaveSuccess(false);
    setMode('preview');
  }, []);

  // initialContent が変更されたら baseline を更新
  const prevInitialContent = useRef(initialContent);
  if (initialContent !== prevInitialContent.current) {
    prevInitialContent.current = initialContent;
    baselineRef.current = initialContent || '';
  }

  return useMemo(
    () => ({
      mode,
      editContent,
      hasUnsavedChanges,
      isSaving,
      saveError,
      saveSuccess,
      canEdit,
      canSave,
      toggleMode,
      setEditContent,
      save,
      discardChanges,
    }),
    [
      mode,
      editContent,
      hasUnsavedChanges,
      isSaving,
      saveError,
      saveSuccess,
      canEdit,
      canSave,
      toggleMode,
      save,
      discardChanges,
    ]
  );
}
