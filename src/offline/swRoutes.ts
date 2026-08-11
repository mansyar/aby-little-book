/**
 * Service-worker routing classification. The worker owns only:
 * - prepared immutable package assets (served from the package cache),
 * - version and health endpoints (revalidated),
 * - navigations (network-first, precache fallback).
 * The app shell's hashed assets and fonts are owned by the workbox precache;
 * anything else — especially third-party or cross-origin resources — is
 * never handled or cached by this project's worker.
 */

export const PACKAGE_BASE_PATH = '/stories';
export const PACKAGE_CACHE_NAME = 'aby-little-book-package';
export const SHELL_CACHE_NAME = 'aby-little-book-shell';

export type RouteKind = 'package-asset' | 'version' | 'health' | 'navigation' | 'unhandled';

export function classifyRequest(url: URL, mode: RequestMode | null = null): RouteKind {
  const pathname = url.pathname;
  if (pathname.startsWith(`${PACKAGE_BASE_PATH}/`)) {
    return 'package-asset';
  }
  if (pathname === '/version.json') {
    return 'version';
  }
  if (pathname === '/healthz') {
    return 'health';
  }
  if (mode === 'navigate' || pathname === '/') {
    return 'navigation';
  }
  return 'unhandled';
}
