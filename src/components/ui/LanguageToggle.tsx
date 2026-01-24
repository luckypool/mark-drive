/**
 * Language Toggle Button
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { borderRadius, fontSize, fontWeight, spacing } from '../../theme';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      style={[styles.button, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}
      activeOpacity={0.7}
      accessibilityLabel={language === 'en' ? 'Switch to Japanese' : 'Switch to English'}
      accessibilityRole="button"
    >
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {language === 'en' ? 'JA' : 'EN'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
