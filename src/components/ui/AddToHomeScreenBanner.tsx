import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useAddToHomeScreen } from '../../hooks/useAddToHomeScreen';
import styles from './AddToHomeScreenBanner.module.css';

export function AddToHomeScreenBanner() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { shouldShow, dismiss } = useAddToHomeScreen();

  if (!shouldShow) return null;

  // Replace {shareIcon} placeholder with inline icon description
  const instructionParts = t.addToHomeScreen.instruction.split('{shareIcon}');

  return (
    <div className={styles.container}>
      {/* Arrow pointing down to Safari toolbar */}
      <div className={styles.arrow} />

      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
        </div>

        <div className={styles.textContainer}>
          <span className={styles.title}>
            {t.addToHomeScreen.title}
          </span>
          <span className={styles.description}>
            {t.addToHomeScreen.description}
          </span>
          <span className={styles.instruction}>
            {instructionParts[0]}
            <Ionicons
              name="share-outline"
              size={14}
              color={colors.accent}
            />
            {instructionParts[1]}
          </span>
        </div>

        <button
          onClick={dismiss}
          className={styles.closeButton}
          type="button"
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </button>
      </div>
    </div>
  );
}
