/**
 * Theme Toggle Button Component
 * Cycles through: light → dark → system
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Tooltip } from './Tooltip';
import type { ThemeMode } from '../../contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

const cycle: ThemeMode[] = ['light', 'dark', 'system'];

const iconMap: Record<ThemeMode, keyof typeof Ionicons.glyphMap> = {
  light: 'sunny-outline',
  dark: 'moon-outline',
  system: 'phone-portrait-outline',
};

const tooltipMap: Record<ThemeMode, string> = {
  light: 'Theme: Light — Click for Dark',
  dark: 'Theme: Dark — Click for System',
  system: 'Theme: System — Click for Light',
};

export function ThemeToggle() {
  const { mode, setTheme, colors } = useTheme();

  const handlePress = () => {
    const currentIndex = cycle.indexOf(mode);
    const nextIndex = (currentIndex + 1) % cycle.length;
    setTheme(cycle[nextIndex]);
  };

  return (
    <Tooltip label={tooltipMap[mode]}>
      <button
        className={styles.button}
        onClick={handlePress}
        aria-label={tooltipMap[mode]}
        type="button"
      >
        <Ionicons
          name={iconMap[mode]}
          size={20}
          color={colors.accent}
        />
      </button>
    </Tooltip>
  );
}
