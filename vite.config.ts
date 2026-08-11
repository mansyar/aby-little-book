import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the static PWA build.
// Test, coverage, and PWA plugin configuration land with their owning tasks.
export default defineConfig({
  plugins: [react()],
});
