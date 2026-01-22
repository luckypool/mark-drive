import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

type IconButtonVariant = 'default' | 'accent' | 'danger' | 'ghost';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  onPress,
  icon,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: IconButtonProps) {
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
          color={variant === 'accent' ? colors.bgPrimary : colors.accent}
        />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Variants
  default: {
    backgroundColor: 'transparent',
  },
  accent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  danger: {
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // Sizes
  size_sm: {
    width: 28,
    height: 28,
  },
  size_md: {
    width: 36,
    height: 36,
  },
  size_lg: {
    width: 44,
    height: 44,
  },

  // States
  disabled: {
    opacity: 0.6,
  },
});
