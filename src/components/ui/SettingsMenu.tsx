/**
 * Settings Menu - Three-dot dropdown for theme, language, and font settings
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { IoEllipsisHorizontal, IoInformationCircleOutline } from 'react-icons/io5';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useFontSettings, type FontSize, type FontFamily } from '../../contexts/FontSettingsContext';
import type { ThemeMode } from '../../contexts/ThemeContext';
import styles from './SettingsMenu.module.css';

interface SettingsMenuProps {
  variant?: 'full' | 'basic';
}

export function SettingsMenu({ variant = 'full' }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { mode, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { settings: fontSettings, setFontSize, setFontFamily } = useFontSettings();

  const close = useCallback(() => setIsOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, close]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: t.settings.light },
    { value: 'dark', label: t.settings.dark },
    { value: 'system', label: t.settings.system },
  ];

  const languageOptions: { value: 'en' | 'ja'; label: string }[] = [
    { value: 'en', label: t.settings.english },
    { value: 'ja', label: t.settings.japanese },
  ];

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 'small', label: t.fontSettings.small },
    { value: 'medium', label: t.fontSettings.medium },
    { value: 'large', label: t.fontSettings.large },
  ];

  const fontFamilyOptions: { value: FontFamily; label: string }[] = [
    { value: 'system', label: t.fontSettings.system },
    { value: 'serif', label: t.fontSettings.serif },
    { value: 'sans-serif', label: t.fontSettings.sansSerif },
  ];

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Settings"
        type="button"
      >
        <IoEllipsisHorizontal size={20} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* Theme */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t.settings.theme}</span>
            <div className={styles.options}>
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.option}${mode === opt.value ? ` ${styles.optionActive}` : ''}`}
                  onClick={() => setTheme(opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t.settings.language}</span>
            <div className={styles.options}>
              {languageOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.option}${language === opt.value ? ` ${styles.optionActive}` : ''}`}
                  onClick={() => setLanguage(opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font settings (full variant only) */}
          {variant === 'full' && (
            <>
              <div className={styles.section}>
                <span className={styles.sectionLabel}>{t.fontSettings.fontSize}</span>
                <div className={styles.options}>
                  {fontSizeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`${styles.option}${fontSettings.fontSize === opt.value ? ` ${styles.optionActive}` : ''}`}
                      onClick={() => setFontSize(opt.value)}
                      type="button"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <span className={styles.sectionLabel}>{t.fontSettings.fontFamily}</span>
                <div className={styles.options}>
                  {fontFamilyOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`${styles.option}${fontSettings.fontFamily === opt.value ? ` ${styles.optionActive}` : ''}`}
                      onClick={() => setFontFamily(opt.value)}
                      type="button"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* About link */}
          <div className={styles.divider} />
          <button
            className={styles.linkItem}
            onClick={() => {
              close();
              navigate('/about');
            }}
            type="button"
          >
            <IoInformationCircleOutline size={16} />
            {t.home.about}
          </button>
        </div>
      )}
    </div>
  );
}
