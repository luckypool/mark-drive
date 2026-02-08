import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  variant?: 'default' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <div className={styles.card} style={style}>
      {children}
    </div>
  );
}
