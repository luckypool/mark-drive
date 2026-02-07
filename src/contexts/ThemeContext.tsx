/**
 * Theme Context - Dark/Light theme management
 */

import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { colors as darkColors } from '../theme/colors';
import { lightColors } from '../theme/lightColors';

export type ThemeMode = 'dark' | 'light';

// Use a more flexible type that works with both color schemes
export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  error: string;
  warning: string;
  warningMuted: string;
  success: string;
  overlay: string;
  overlayLight: string;
  shadowColor: string;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'markdrive-theme-preference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setMode(stored);
        }
      } catch (e) {
        console.warn('Failed to read theme preference:', e);
      }
      setIsInitialized(true);
    }
  }, []);

  // Persist theme preference
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch (e) {
        console.warn('Failed to save theme preference:', e);
      }
    }
  }, [mode, isInitialized]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const colors = useMemo(() => {
    return mode === 'dark' ? darkColors : lightColors;
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      colors,
      toggleTheme,
      setTheme,
    }),
    [mode, colors, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export { ThemeContext };
