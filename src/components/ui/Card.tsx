import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  variant?: 'default' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const className = variant === 'elevated'
    ? `${styles.card} ${styles.elevated}`
    : styles.card;

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
