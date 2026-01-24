/**
 * useLanguage hook - Access language context
 */

import { useContext } from 'react';
import { LanguageContext, type LanguageContextValue } from '../contexts/LanguageContext';

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
