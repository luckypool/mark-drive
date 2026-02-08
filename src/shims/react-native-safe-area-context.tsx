import React from 'react';
import { flattenStyle } from '../utils/flattenStyle';

const safeAreaViewBase: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
};

export function SafeAreaView({ children, style, edges }: {
  children?: React.ReactNode;
  style?: unknown;
  edges?: string[];
}) {
  const flatStyle = flattenStyle(style);
  return <div style={{ ...safeAreaViewBase, ...flatStyle }}>{children}</div>;
}

export function SafeAreaProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function useSafeAreaInsets() {
  return { top: 0, bottom: 0, left: 0, right: 0 };
}
