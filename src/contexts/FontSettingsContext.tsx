/**
 * Font Settings Context
 * Manages font size and font family preferences
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { storage } from '../services/storage';

export type FontSize = 'small' | 'medium' | 'large';
export type FontFamily = 'system' | 'serif' | 'sans-serif';

// Font size multipliers
export const fontSizeMultipliers: Record<FontSize, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.15,
};

// Font family stacks
export const fontFamilyStacks: Record<FontFamily, string> = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", Times, serif',
  'sans-serif': '"Helvetica Neue", Helvetica, Arial, sans-serif',
};

export interface FontSettings {
  fontSize: FontSize;
  fontFamily: FontFamily;
}

interface FontSettingsContextType {
  settings: FontSettings;
  setFontSize: (size: FontSize) => void;
  setFontFamily: (family: FontFamily) => void;
  getMultiplier: () => number;
  getFontStack: () => string;
}

const STORAGE_KEY = 'md-viewer-font-settings';

const defaultSettings: FontSettings = {
  fontSize: 'medium',
  fontFamily: 'system',
};

const FontSettingsContext = createContext<FontSettingsContextType | undefined>(undefined);

export function FontSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<FontSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await storage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<FontSettings>;
          setSettings({
            fontSize: parsed.fontSize || defaultSettings.fontSize,
            fontFamily: parsed.fontFamily || defaultSettings.fontFamily,
          });
        }
      } catch (error) {
        console.error('Failed to load font settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // Save settings to storage
  useEffect(() => {
    if (isLoaded) {
      storage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const setFontSize = useCallback((size: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  }, []);

  const setFontFamily = useCallback((family: FontFamily) => {
    setSettings(prev => ({ ...prev, fontFamily: family }));
  }, []);

  const getMultiplier = useCallback(() => {
    return fontSizeMultipliers[settings.fontSize];
  }, [settings.fontSize]);

  const getFontStack = useCallback(() => {
    return fontFamilyStacks[settings.fontFamily];
  }, [settings.fontFamily]);

  return (
    <FontSettingsContext.Provider
      value={{
        settings,
        setFontSize,
        setFontFamily,
        getMultiplier,
        getFontStack,
      }}
    >
      {children}
    </FontSettingsContext.Provider>
  );
}

export function useFontSettings(): FontSettingsContextType {
  const context = useContext(FontSettingsContext);
  if (!context) {
    throw new Error('useFontSettings must be used within a FontSettingsProvider');
  }
  return context;
}
