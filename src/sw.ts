/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

import { matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly } from 'workbox-strategies';
import {
  classifyRequest,
  PACKAGE_BASE_PATH,
  PACKAGE_CACHE_NAME,
  type RouteKind,
  SHELL_CACHE_NAME,
} from './offline/swRoutes';

// The app shell (hashed assets, fonts, index.html) is precached at install
// time. Story packages are NEVER precached: they are prepared explicitly by
// the app (hash-verified, atomic readiness) into the package cache, and the
// worker only serves what the app verified.
precacheAndRoute(self.__WB_MANIFEST);

function kindOf(url: URL, mode: RequestMode | null): RouteKind {
  // The worker only ever handles same-origin requests; classifyRequest does
  // not see foreign origins because every route below matches by URL against
  // this origin's pathname space.
  return classifyRequest(url, mode);
}

// Prepared story assets: served from the verified package cache. A miss is
// forwarded to the network for online reading but never re-cached here —
// the app's explicit preparation flow is the only writer to that cache.
registerRoute(
  ({ url, request }) => kindOf(url, request.mode) === 'package-asset',
  async ({ request }) => {
    const cache = await caches.open(PACKAGE_CACHE_NAME);
    const hit = await cache.match(request);
    if (hit !== undefined) {
      return hit;
    }
    return fetch(request);
  },
);

// Version and health endpoints: always fresh when online.
registerRoute(
  ({ url }) => kindOf(url, null) === 'version',
  new NetworkFirst({ cacheName: SHELL_CACHE_NAME }),
);
registerRoute(({ url }) => kindOf(url, null) === 'health', new NetworkOnly());

// Navigations: network-first so the reader always gets the latest shell,
// with the precached document as the calm offline fallback. Package paths
// are never navigations (excluded defensively).
registerRoute(
  ({ url, request }) =>
    request.mode === 'navigate' && !url.pathname.startsWith(PACKAGE_BASE_PATH + '/'),
  async ({ request, url, event }) => {
    const strategy = new NetworkFirst({
      cacheName: SHELL_CACHE_NAME,
      networkTimeoutSeconds: 3,
    });
    try {
      return await strategy.handle({ request, url, event });
    } catch {
      const cached = await matchPrecache('/index.html');
      if (cached !== undefined) {
        return cached;
      }
      return Response.error();
    }
  },
);
