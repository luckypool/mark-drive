/**
 * Tooltip wrapper component
 * Shows a custom CSS tooltip on hover (web only, instant display).
 */

import React from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <div className={styles.wrapper} data-tooltip={label}>
      {children}
    </div>
  );
}
