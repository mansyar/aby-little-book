import { Workbox } from 'workbox-window';

/**
 * Registers the project-owned service worker in production builds only.
 * The prompt register type keeps update activation in the app's hands
 * (safe update behavior), so an open reader is never interrupted.
 */
export function registerSw(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }
  const wb = new Workbox('/sw.js');
  void wb.register();
}
