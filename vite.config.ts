import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite plugin to transform Metro-style require() for assets
 * into Vite-compatible new URL() imports.
 * e.g. require('../assets/images/icon.png') → new URL('../assets/images/icon.png', import.meta.url).href
 */
function requireAssetPlugin(): Plugin {
  return {
    name: 'vite-plugin-require-asset',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.[tj]sx?$/.test(id)) return;
      if (!code.includes('require(')) return;

      // Match require('...path to image...')
      const requireRegex = /require\(\s*(['"])([^'"]+\.(png|jpe?g|gif|svg|webp|ico|bmp|avif))\1\s*\)/g;
      if (!requireRegex.test(code)) return;

      // Reset regex lastIndex after test
      requireRegex.lastIndex = 0;
      const transformed = code.replace(
        requireRegex,
        (_match, _quote, assetPath) => `new URL('${assetPath}', import.meta.url).href`,
      );

      return { code: transformed, map: null };
    },
  };
}

export default defineConfig({
  plugins: [requireAssetPlugin(), react()],
  server: {
    port: 8081,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react-native': 'react-native-web',
      '@expo/vector-icons': path.resolve(__dirname, 'src/shims/expo-vector-icons.tsx'),
      'expo-router': path.resolve(__dirname, 'src/shims/expo-router.tsx'),
      'react-native-safe-area-context': path.resolve(__dirname, 'src/shims/react-native-safe-area-context.tsx'),
    },
    extensions: ['.tsx', '.ts', '.js'],
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
