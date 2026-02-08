import React from 'react';
import ReactDOM from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FontSettingsProvider } from './contexts/FontSettingsContext';
import HomeScreen from '../app/index';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FontSettingsProvider>
          <HomeScreen />
          <SpeedInsights />
        </FontSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
