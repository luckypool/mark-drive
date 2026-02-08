import React from 'react';
import styles from './IconButton.module.css';

type IconButtonVariant = 'default' | 'accent' | 'danger' | 'ghost';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  onPress?: () => void;
  onClick?: () => void;
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export function IconButton({
  onPress,
  onClick,
  icon,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  const handleClick = onClick ?? onPress;

  const className = [
    styles.base,
    variant !== 'default' && styles[variant],
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
        <div className={`${styles.spinner}${variant === 'accent' ? ` ${styles.spinnerAccent}` : ''}`} />
      ) : (
        icon
      )}
    </button>
  );
}
