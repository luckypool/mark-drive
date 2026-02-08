import { Outlet } from 'react-router';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { FontSettingsProvider } from '../contexts/FontSettingsContext';
import styles from './RootLayout.module.css';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FontSettingsProvider>
          <div className={styles.container}>
            <Outlet />
            <SpeedInsights />
          </div>
        </FontSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
