/**
 * Theme Toggle Button Component
 * Cycles through: light → dark → system
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../theme';
import type { ThemeMode } from '../../contexts/ThemeContext';

const cycle: ThemeMode[] = ['light', 'dark', 'system'];

const iconMap: Record<ThemeMode, keyof typeof Ionicons.glyphMap> = {
  light: 'sunny-outline',
  dark: 'moon-outline',
  system: 'phone-portrait-outline',
};

const labelMap: Record<ThemeMode, string> = {
  light: 'Switch to dark mode',
  dark: 'Switch to system mode',
  system: 'Switch to light mode',
};

export function ThemeToggle() {
  const { mode, setTheme, colors } = useTheme();

  const handlePress = () => {
    const currentIndex = cycle.indexOf(mode);
    const nextIndex = (currentIndex + 1) % cycle.length;
    setTheme(cycle[nextIndex]);
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={labelMap[mode]}
      accessibilityRole="button"
    >
      <Ionicons
        name={iconMap[mode]}
        size={22}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.sm,
  },
});
