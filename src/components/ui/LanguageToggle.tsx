/**
 * Language Toggle Button
 */

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Tooltip } from './Tooltip';
import styles from './LanguageToggle.module.css';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  const tooltip = language === 'en'
    ? 'Language: English — Click for 日本語'
    : 'Language: 日本語 — Click for English';

  return (
    <Tooltip label={tooltip}>
      <button
        onClick={toggleLanguage}
        className={styles.button}
        aria-label={tooltip}
        type="button"
      >
        <span className={styles.text}>
          {language === 'en' ? 'EN' : 'JA'}
        </span>
      </button>
    </Tooltip>
  );
}
