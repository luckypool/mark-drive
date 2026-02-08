import React from 'react';
import { View } from 'react-native';

export function SafeAreaView({ children, style, edges, ...props }: {
  children?: React.ReactNode;
  style?: object | object[];
  edges?: string[];
  [key: string]: unknown;
}) {
  return <View style={style} {...props}>{children}</View>;
}

export function SafeAreaProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function useSafeAreaInsets() {
  return { top: 0, bottom: 0, left: 0, right: 0 };
}
