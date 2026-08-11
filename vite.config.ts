import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { versionJsonPlugin } from './scripts/version-plugin.ts';

// Vite configuration for the static PWA build.
// Test, coverage, and PWA plugin configuration land with their owning tasks.
export default defineConfig({
  plugins: [react(), versionJsonPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/**/*.css',
        'src/main.tsx',
      ],
      reporter: ['text', 'html'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
