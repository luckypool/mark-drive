import React from 'react';
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

const variantClasses: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  ghost: styles.ghost,
  danger: styles.danger,
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
  const isDisabled = disabled || loading;
  const handleClick = onClick ?? onPress;

  const className = [
    styles.base,
    variantClasses[variant],
    sizeClasses[size],
    isDisabled && styles.disabled,
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      style={style}
      type="button"
    >
      {loading ? (
        <div className={`${styles.spinner}${variant === 'primary' ? ` ${styles.spinnerPrimary}` : ''}`} />
      ) : (
        <>
          {icon}
          <span
            className={`${styles.text} ${textSizeClasses[size]}`}
            style={textStyle}
          >
            {children}
          </span>
        </>
      )}
    </button>
  );
}
