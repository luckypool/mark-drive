/**
 * Font Settings Panel
 * UI for adjusting font size and family
 */

import React, { useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useFontSettings, FontSize, FontFamily } from '../../contexts/FontSettingsContext';
import styles from './FontSettingsPanel.module.css';

interface FontSettingsPanelProps {
  visible: boolean;
  onClose: () => void;
}

const fontSizeOptions: { value: FontSize; labelKey: 'small' | 'medium' | 'large' }[] = [
  { value: 'small', labelKey: 'small' },
  { value: 'medium', labelKey: 'medium' },
  { value: 'large', labelKey: 'large' },
];

const fontFamilyOptions: { value: FontFamily; labelKey: 'system' | 'serif' | 'sansSerif' }[] = [
  { value: 'system', labelKey: 'system' },
  { value: 'serif', labelKey: 'serif' },
  { value: 'sans-serif', labelKey: 'sansSerif' },
];

export function FontSettingsPanel({ visible, onClose }: FontSettingsPanelProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { settings, setFontSize, setFontFamily } = useFontSettings();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  const fontSizeLabels: Record<'small' | 'medium' | 'large', string> = {
    small: t.fontSettings.small,
    medium: t.fontSettings.medium,
    large: t.fontSettings.large,
  };

  const fontFamilyLabels: Record<'system' | 'serif' | 'sansSerif', string> = {
    system: t.fontSettings.system,
    serif: t.fontSettings.serif,
    sansSerif: t.fontSettings.sansSerif,
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.title}>
            {t.fontSettings.title}
          </span>
          <button onClick={onClose} className={styles.closeButton} type="button">
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </button>
        </div>

        {/* Font Size */}
        <div className={styles.section}>
          <span className={styles.sectionTitle}>
            {t.fontSettings.fontSize}
          </span>
          <div className={styles.optionGroup}>
            {fontSizeOptions.map(option => {
              const isActive = settings.fontSize === option.value;
              return (
                <button
                  key={option.value}
                  className={`${styles.option}${isActive ? ` ${styles.optionActive}` : ''}`}
                  onClick={() => setFontSize(option.value)}
                  type="button"
                >
                  <span className={`${styles.optionText}${isActive ? ` ${styles.optionTextActive}` : ''}`}>
                    {fontSizeLabels[option.labelKey]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Family */}
        <div className={styles.section}>
          <span className={styles.sectionTitle}>
            {t.fontSettings.fontFamily}
          </span>
          <div className={styles.optionGroup}>
            {fontFamilyOptions.map(option => {
              const isActive = settings.fontFamily === option.value;
              return (
                <button
                  key={option.value}
                  className={`${styles.option}${isActive ? ` ${styles.optionActive}` : ''}`}
                  onClick={() => setFontFamily(option.value)}
                  type="button"
                >
                  <span className={`${styles.optionText}${isActive ? ` ${styles.optionTextActive}` : ''}`}>
                    {fontFamilyLabels[option.labelKey]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className={styles.preview}>
          <span className={styles.previewLabel}>
            {t.fontSettings.preview}
          </span>
          <p className={styles.previewText}>
            {t.fontSettings.previewText}
          </p>
        </div>
      </div>
    </div>
  );
}
