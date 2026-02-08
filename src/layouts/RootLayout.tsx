import { Outlet } from 'react-router';
import { View, StyleSheet } from 'react-native';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { FontSettingsProvider } from '../contexts/FontSettingsContext';
import { useTheme } from '../hooks';
import { useRouterSetup } from '../shims/expo-router';

function RootLayoutContent() {
  const { colors } = useTheme();
  useRouterSetup();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Outlet />
      <SpeedInsights />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FontSettingsProvider>
          <RootLayoutContent />
        </FontSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
