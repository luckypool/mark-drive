import React from 'react';
import { IoAddCircleOutline, IoShareOutline, IoClose } from 'react-icons/io5';
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
          <IoAddCircleOutline size={24} color={colors.accent} />
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
            <IoShareOutline size={14} color={colors.accent} />
            {instructionParts[1]}
          </span>
        </div>

        <button
          onClick={dismiss}
          className={styles.closeButton}
          type="button"
        >
          <IoClose size={16} color={colors.textMuted} />
        </button>
      </div>
    </div>
  );
}
