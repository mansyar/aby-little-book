import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import { versionJsonPlugin } from './scripts/version-plugin.ts';

// Vite configuration for the static PWA build.
// Test, coverage, and PWA plugin configuration land with their owning tasks.
export default defineConfig({
  plugins: [
    react(),
    versionJsonPlugin(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      manifest: {
        name: 'Aby Little Book',
        short_name: 'Aby Book',
        description: 'A quiet bilingual picture book for sharing.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#141b33',
        theme_color: '#141b33',
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,woff2,webp,json,svg}'],
        globIgnores: ['**/version.json', '**/healthz', '**/stories/**', '**/node_modules/**'],
        maximumFileSizeToCacheInBytes: 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
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
