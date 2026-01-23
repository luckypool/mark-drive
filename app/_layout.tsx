/**
 * MD Viewer - Root Layout
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors } from '../src/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
});
