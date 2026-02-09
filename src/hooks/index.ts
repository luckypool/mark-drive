/**
 * Hooks exports
 */

export { useGoogleAuth } from './useGoogleAuth';
export type { UseGoogleAuthReturn, PickerViewSettings, OpenDrivePickerOptions } from './useGoogleAuth';
export { DEFAULT_PICKER_SETTINGS } from './useGoogleAuth';

export { usePickerSettings } from './usePickerSettings';

export { useFilePicker, getFileHandle } from './useFilePicker';
export type { LocalFile } from './useFilePicker';

export { useShare } from './useShare';
export type { UseShareReturn } from './useShare';

export { useTheme } from './useTheme';

export { useLanguage } from './useLanguage';

export { useFontSettings } from '../contexts/FontSettingsContext';
export type { FontSize, FontFamily, FontSettings } from '../contexts/FontSettingsContext';

export { useMarkdownEditor } from './useMarkdownEditor';
export type { UseMarkdownEditorReturn } from './useMarkdownEditor';
