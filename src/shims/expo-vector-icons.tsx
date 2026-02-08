import React from 'react';
import { Text } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: object;
}

function Ionicons({ name, size = 24, color = '#000', style }: IconProps) {
  return (
    <Text style={[{ fontSize: size, color }, style]} aria-label={name}>
      ?
    </Text>
  );
}

export { Ionicons };
export default { Ionicons };
