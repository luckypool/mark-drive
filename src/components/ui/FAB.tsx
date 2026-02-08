import React from 'react';
import styles from './FAB.module.css';

interface FABProps {
  onPress?: () => void;
  onClick?: () => void;
  icon: React.ReactNode;
  isOpen?: boolean;
  style?: React.CSSProperties;
}

export function FAB({ onPress, onClick, icon, isOpen = false, style }: FABProps) {
  const handleClick = onClick ?? onPress;

  const iconClass = isOpen
    ? `${styles.iconWrapper} ${styles.iconWrapperOpen}`
    : styles.iconWrapper;

  return (
    <button
      onClick={handleClick}
      className={styles.fab}
      style={style}
      type="button"
    >
      <div className={iconClass}>{icon}</div>
    </button>
  );
}
