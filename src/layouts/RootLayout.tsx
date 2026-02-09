import { Outlet } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { FontSettingsProvider, useFontSettings, fontFamilyStacks } from '../contexts/FontSettingsContext';
import styles from './RootLayout.module.css';

function RootLayoutInner() {
  const { settings } = useFontSettings();
  const fontFamily = fontFamilyStacks[settings.fontFamily];

  return (
    <div className={styles.container} style={{ fontFamily }}>
      <Outlet />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FontSettingsProvider>
          <RootLayoutInner />
        </FontSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
