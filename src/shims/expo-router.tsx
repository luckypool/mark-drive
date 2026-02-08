import React from 'react';

export const router = {
  push: (route: string | { pathname: string; params?: Record<string, string> }) => {
    console.warn('[expo-router shim] router.push called:', route);
  },
  back: () => {
    console.warn('[expo-router shim] router.back called');
  },
  replace: (route: string | { pathname: string; params?: Record<string, string> }) => {
    console.warn('[expo-router shim] router.replace called:', route);
  },
};

export function Link({ href, children, style, ...props }: {
  href: string;
  children: React.ReactNode;
  style?: object;
  [key: string]: unknown;
}) {
  return <a href={href} style={style} {...props}>{children}</a>;
}

export function Stack() {
  return null;
}
Stack.Screen = function StackScreen() {
  return null;
};

export function useLocalSearchParams(): Record<string, string> {
  return {};
}

export function ErrorBoundary() {
  return null;
}
