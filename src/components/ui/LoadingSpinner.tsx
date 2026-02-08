import React from 'react';
import styles from './LoadingSpinner.module.css';

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
  const containerClass = fullScreen
    ? `${styles.container} ${styles.fullScreen}`
    : styles.container;

  const spinnerClass = size === 'small'
    ? `${styles.spinner} ${styles.spinnerSmall}`
    : `${styles.spinner} ${styles.spinnerLarge}`;

  return (
    <div className={containerClass}>
      <div className={spinnerClass} />
      {message && <span className={styles.message}>{message}</span>}
    </div>
  );
}
