/**
 * Font Settings Panel
 * UI for adjusting font size and family
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useFontSettings, FontSize, FontFamily } from '../../contexts/FontSettingsContext';

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.panel, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t.fontSettings.title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Font Size */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.fontSettings.fontSize}
            </Text>
            <View style={styles.optionGroup}>
              {fontSizeOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    {
                      backgroundColor: settings.fontSize === option.value ? colors.accentMuted : colors.bgTertiary,
                      borderColor: settings.fontSize === option.value ? colors.accent : colors.border,
                    }
                  ]}
                  onPress={() => setFontSize(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    {
                      color: settings.fontSize === option.value ? colors.accent : colors.textSecondary,
                      fontWeight: settings.fontSize === option.value ? '600' : '400',
                    }
                  ]}>
                    {fontSizeLabels[option.labelKey]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Font Family */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.fontSettings.fontFamily}
            </Text>
            <View style={styles.optionGroup}>
              {fontFamilyOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    {
                      backgroundColor: settings.fontFamily === option.value ? colors.accentMuted : colors.bgTertiary,
                      borderColor: settings.fontFamily === option.value ? colors.accent : colors.border,
                    }
                  ]}
                  onPress={() => setFontFamily(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    {
                      color: settings.fontFamily === option.value ? colors.accent : colors.textSecondary,
                      fontWeight: settings.fontFamily === option.value ? '600' : '400',
                    }
                  ]}>
                    {fontFamilyLabels[option.labelKey]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={[styles.preview, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
            <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
              {t.fontSettings.preview}
            </Text>
            <Text style={[styles.previewText, { color: colors.textSecondary }]}>
              {t.fontSettings.previewText}
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: fontSize.sm,
  },
  preview: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  previewText: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.6,
  },
});
