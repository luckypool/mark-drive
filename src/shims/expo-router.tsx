import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Link as RRLink,
  useSearchParams,
  useLocation,
  useNavigate,
} from 'react-router';

// Module-level navigate function, initialized by useRouterSetup()
let _navigate: ReturnType<typeof useNavigate> | null = null;

/**
 * Call this hook once in RootLayout to wire up the module-level navigate.
 */
export function useRouterSetup() {
  const navigate = useNavigate();
  React.useEffect(() => {
    _navigate = navigate;
    return () => {
      _navigate = null;
    };
  }, [navigate]);
}

function buildPath(
  route: string | { pathname: string; params?: Record<string, string> },
  options?: { replace?: boolean },
) {
  if (typeof route === 'string') {
    return { to: route, state: undefined, replace: options?.replace };
  }

  const { pathname, params } = route;

  // Separate "content" (large data) into location.state,
  // and put the rest into search params.
  const stateData: Record<string, string> = {};
  const searchData: Record<string, string> = {};

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (key === 'content') {
        stateData[key] = value;
      } else {
        searchData[key] = value;
      }
    }
  }

  const search = new URLSearchParams(searchData).toString();
  const to = search ? `${pathname}?${search}` : pathname;

  return {
    to,
    state: Object.keys(stateData).length > 0 ? stateData : undefined,
    replace: options?.replace,
  };
}

export const router = {
  push(route: string | { pathname: string; params?: Record<string, string> }) {
    if (!_navigate) {
      console.warn('[expo-router shim] navigate not initialized. Did you call useRouterSetup()?');
      return;
    }
    const { to, state, replace } = buildPath(route);
    _navigate(to, { state, replace });
  },
  back() {
    if (!_navigate) {
      console.warn('[expo-router shim] navigate not initialized. Did you call useRouterSetup()?');
      return;
    }
    _navigate(-1);
  },
  replace(route: string | { pathname: string; params?: Record<string, string> }) {
    if (!_navigate) {
      console.warn('[expo-router shim] navigate not initialized. Did you call useRouterSetup()?');
      return;
    }
    const { to, state } = buildPath(route, { replace: true });
    _navigate(to, { state, replace: true });
  },
};

export function Link({
  href,
  children,
  style,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  style?: unknown;
  [key: string]: unknown;
}) {
  // Flatten RN style arrays (e.g. [styles.foo, { color: 'red' }]) into a plain object
  // so DOM elements can consume them.
  const flatStyle = style ? (StyleSheet.flatten(style as never) as React.CSSProperties) : undefined;
  return (
    <RRLink to={href} style={flatStyle} {...props}>
      {children}
    </RRLink>
  );
}

export function Stack() {
  return null;
}
Stack.Screen = function StackScreen() {
  return null;
};

export function useLocalSearchParams<
  T extends Record<string, string> = Record<string, string>,
>(): T {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  return React.useMemo(() => {
    const result: Record<string, string> = {};

    // Merge URL search params
    searchParams.forEach((value, key) => {
      result[key] = value;
    });

    // Merge location.state (overrides search params for same keys)
    if (location.state && typeof location.state === 'object') {
      for (const [key, value] of Object.entries(location.state as Record<string, string>)) {
        result[key] = value;
      }
    }

    return result as T;
  }, [searchParams, location.state]);
}

export function ErrorBoundary() {
  return null;
}
