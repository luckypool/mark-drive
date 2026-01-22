import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={colors.accent} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  message: {
    color: colors.textMuted,
    fontSize: fontSize.base,
  },
});
