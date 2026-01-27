import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useAddToHomeScreen } from '../../hooks/useAddToHomeScreen';

export function AddToHomeScreenBanner() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { shouldShow, dismiss } = useAddToHomeScreen();

  if (!shouldShow) return null;

  // Replace {shareIcon} placeholder with inline icon description
  const instructionParts = t.addToHomeScreen.instruction.split('{shareIcon}');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.border,
        },
      ]}
    >
      {/* Arrow pointing down to Safari toolbar */}
      <View style={[styles.arrow, { borderTopColor: colors.accent }]} />

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accentMuted }]}>
          <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t.addToHomeScreen.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t.addToHomeScreen.description}
          </Text>
          <Text style={[styles.instruction, { color: colors.textMuted }]}>
            {instructionParts[0]}
            <Ionicons
              name={Platform.OS === 'web' ? 'share-outline' : 'share-outline'}
              size={14}
              color={colors.accent}
            />
            {instructionParts[1]}
          </Text>
        </View>

        <TouchableOpacity
          onPress={dismiss}
          style={[styles.closeButton, { backgroundColor: colors.bgTertiary }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingBottom: 20, // Safe area for iPhone home indicator
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    zIndex: 1000,
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as '600',
  },
  description: {
    fontSize: fontSize.xs,
  },
  instruction: {
    fontSize: fontSize.xs,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
