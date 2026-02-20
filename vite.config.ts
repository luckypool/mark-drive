import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
  },
  preview: {
    port: 8081,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  envPrefix: 'VITE_',
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    env: {
      VITE_GOOGLE_API_KEY: 'test-api-key',
      VITE_GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
      VITE_GOOGLE_APP_ID: '123456789',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/main.tsx',
        'src/router.tsx',
        'src/types/**',
        'src/components/editor/**',
      ],
    },
  },
});
