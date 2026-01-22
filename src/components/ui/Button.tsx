import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.bgPrimary : colors.accent}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`text_${size}`],
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
  },

  // Variants
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  size_md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  size_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },

  // States
  disabled: {
    opacity: 0.6,
  },

  // Text styles
  text: {
    fontWeight: fontWeight.semibold,
  },
  text_primary: {
    color: colors.bgPrimary,
  },
  text_secondary: {
    color: colors.textPrimary,
  },
  text_outline: {
    color: colors.accent,
  },
  text_ghost: {
    color: colors.textPrimary,
  },
  text_danger: {
    color: colors.textPrimary,
  },

  // Text sizes
  text_sm: {
    fontSize: fontSize.sm,
  },
  text_md: {
    fontSize: fontSize.base,
  },
  text_lg: {
    fontSize: fontSize.lg,
  },
});
