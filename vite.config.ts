import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react-native': 'react-native-web',
      '@expo/vector-icons': path.resolve(__dirname, 'src/shims/expo-vector-icons.tsx'),
      'expo-router': path.resolve(__dirname, 'src/shims/expo-router.tsx'),
      'react-native-safe-area-context': path.resolve(__dirname, 'src/shims/react-native-safe-area-context.tsx'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  envPrefix: 'VITE_',
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/shims/**'],
    },
  },
});
