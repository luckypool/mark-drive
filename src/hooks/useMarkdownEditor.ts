/**
 * Markdown 編集状態管理フック
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { updateFileContent } from '../services/googleDrive';

interface UseMarkdownEditorOptions {
  initialContent: string | null;
  fileId: string;
  source: 'google-drive' | 'local';
  accessToken: string | null;
  onContentSaved: (newContent: string) => void;
}

export interface UseMarkdownEditorReturn {
  mode: 'preview' | 'edit';
  editContent: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  needsReauth: boolean;
  canEdit: boolean;
  canSave: boolean;

  toggleMode: () => void;
  setEditContent: (content: string) => void;
  save: () => Promise<boolean>;
  discardChanges: () => void;
}

export function useMarkdownEditor({
  initialContent,
  fileId,
  source,
  accessToken,
  onContentSaved,
}: UseMarkdownEditorOptions): UseMarkdownEditorReturn {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);

  const baselineRef = useRef(initialContent || '');
  const saveSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canEdit = source === 'google-drive';
  const hasUnsavedChanges = mode === 'edit' && editContent !== baselineRef.current;
  const canSave = hasUnsavedChanges && !isSaving;

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      if (prev === 'preview') {
        // preview → edit: baseline から editContent を初期化
        setEditContent(baselineRef.current);
        setSaveError(null);
        setSaveSuccess(false);
        setNeedsReauth(false);
        return 'edit';
      }
      return 'preview';
    });
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    if (!accessToken || !canEdit) return false;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateFileContent(accessToken, fileId, editContent);
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
      if (err instanceof Error && err.message === 'INSUFFICIENT_SCOPE') {
        setNeedsReauth(true);
      }
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [accessToken, canEdit, editContent, fileId, onContentSaved]);

  const discardChanges = useCallback(() => {
    setEditContent(baselineRef.current);
    setSaveError(null);
    setSaveSuccess(false);
    setNeedsReauth(false);
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
      needsReauth,
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
      needsReauth,
      canEdit,
      canSave,
      toggleMode,
      save,
      discardChanges,
    ]
  );
}
