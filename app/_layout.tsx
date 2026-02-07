/**
 * MarkDrive - Root Layout
 */

import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { FontSettingsProvider } from '../src/contexts/FontSettingsContext';
import { useTheme } from '../src/hooks';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootLayoutContent() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="viewer"
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            presentation: 'modal',
            animation: 'fade',
          }}
        />
      </Stack>
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
