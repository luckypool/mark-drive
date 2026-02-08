import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress?: () => void;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  icon?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: styles.textSm,
  md: styles.textMd,
  lg: styles.textLg,
};

export function Button({
  onPress,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const handleClick = onClick ?? onPress;

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: { backgroundColor: colors.accent },
    secondary: { backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}` },
    outline: { backgroundColor: 'transparent', border: `1px solid ${colors.accent}` },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error },
  };

  const textVariantColors: Record<ButtonVariant, string> = {
    primary: colors.bgPrimary,
    secondary: colors.textPrimary,
    outline: colors.accent,
    ghost: colors.textPrimary,
    danger: colors.textPrimary,
  };

  const className = [
    styles.base,
    sizeClasses[size],
    isDisabled && styles.disabled,
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      style={{ ...variantStyles[variant], ...style }}
      type="button"
    >
      {loading ? (
        <div className={`${styles.spinner}${variant === 'primary' ? ` ${styles.spinnerPrimary}` : ''}`} />
      ) : (
        <>
          {icon}
          <span
            className={`${styles.text} ${textSizeClasses[size]}`}
            style={{ color: textVariantColors[variant], ...textStyle }}
          >
            {children}
          </span>
        </>
      )}
    </button>
  );
}
