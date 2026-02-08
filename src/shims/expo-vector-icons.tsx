import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

function Ionicons({ name, size = 24, color = '#000', style }: IconProps) {
  return React.createElement('ion-icon', {
    name,
    style: {
      fontSize: `${size}px`,
      color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${size}px`,
      height: `${size}px`,
      pointerEvents: 'none',
      ...style,
    } as React.CSSProperties,
  });
}

export { Ionicons };
export default { Ionicons };
