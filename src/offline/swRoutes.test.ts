import { describe, expect, it } from 'vitest';
import { classifyRequest, PACKAGE_BASE_PATH, type RouteKind } from './swRoutes';

// Service-worker routing contract: the worker owns only the shell
// (precached), prepared immutable package assets (served from the package
// cache), version/health endpoints (revalidated), and navigations. Anything
// third-party or unknown is left to the network and never cached.

const ORIGIN = 'https://aby.example';

function classify(pathname: string, mode: RequestMode | null = null): RouteKind {
  return classifyRequest(new URL(ORIGIN + pathname), mode);
}

describe('classifyRequest', () => {
  it('never handles third-party or cross-origin requests', () => {
    expect(classify('/assets/app.js', 'no-cors')).toBe('unhandled');
    const foreign = classifyRequest(new URL('https://evil.example/x.webp'));
    expect(foreign).toBe('unhandled');
  });

  it('owns prepared package assets under the immutable base path', () => {
    expect(
      classify(
        PACKAGE_BASE_PATH +
          '/the-starlight-rescue-0.1.0/assets/layers/ipad-landscape/bg-space.webp',
      ),
    ).toBe('package-asset');
    expect(
      classify(PACKAGE_BASE_PATH + '/the-starlight-rescue-0.1.0/assets/layers/bg-space.webp?x=1'),
    ).toBe('package-asset');
  });

  it('does not own the package base path itself', () => {
    expect(classify(PACKAGE_BASE_PATH)).toBe('unhandled');
  });

  it('revalidates version and health endpoints', () => {
    expect(classify('/version.json')).toBe('version');
    expect(classify('/healthz')).toBe('health');
  });

  it('owns navigations and the root document', () => {
    expect(classify('/', 'navigate')).toBe('navigation');
    expect(classify('/some/deep/link', 'navigate')).toBe('navigation');
  });

  it('leaves non-navigation same-origin requests to the precache or network', () => {
    expect(classify('/assets/index-hash.js')).toBe('unhandled');
    expect(classify('/fonts/nunito-latin.woff2')).toBe('unhandled');
    expect(classify('/favicon.ico')).toBe('unhandled');
  });
});
