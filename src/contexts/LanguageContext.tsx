/**
 * Language Context - English/Japanese language management
 */

import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { en, ja, type Translations } from '../i18n';

export type Language = 'en' | 'ja';

export interface LanguageContextValue {
  language: Language;
  t: Translations;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const STORAGE_KEY = 'md-viewer-language-preference';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'en' || stored === 'ja') {
          setLanguageState(stored);
        }
      } catch (e) {
        console.warn('Failed to read language preference:', e);
      }
      setIsInitialized(true);
    }
  }, []);

  // Persist language preference
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, language);
      } catch (e) {
        console.warn('Failed to save language preference:', e);
      }
    }
  }, [language, isInitialized]);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'ja' : 'en'));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useMemo(() => {
    return language === 'en' ? en : ja;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      t,
      toggleLanguage,
      setLanguage,
    }),
    [language, t, toggleLanguage, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export { LanguageContext };
