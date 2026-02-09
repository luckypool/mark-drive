/**
 * Google Picker 表示設定を管理する hook
 * localStorage で永続化
 */

import { useState, useCallback, useEffect } from 'react';
import { storage } from '../services/storage';
import type { PickerViewSettings } from './useGoogleAuth';
import { DEFAULT_PICKER_SETTINGS } from './useGoogleAuth';

const STORAGE_KEY = 'pickerViewSettings';

export function usePickerSettings() {
  const [settings, setSettings] = useState<PickerViewSettings>(DEFAULT_PICKER_SETTINGS);

  useEffect(() => {
    storage.getJSON<PickerViewSettings>(STORAGE_KEY).then((stored) => {
      if (stored) {
        setSettings({ ...DEFAULT_PICKER_SETTINGS, ...stored });
      }
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<PickerViewSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      storage.setJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { pickerSettings: settings, updatePickerSettings: updateSettings };
}
