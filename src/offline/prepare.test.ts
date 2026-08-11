import { describe, expect, it, vi } from 'vitest';
import type { PackageManifest } from '../story/contracts';
import { type PrepareDeps, preparePackage } from './prepare';

// Explicit book preparation: bounded sequential download, real SHA-256
// verification against the manifest, verified responses only ever enter
// Cache Storage, and readiness is committed to IndexedDB only atomically.

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const BYTES = new Uint8Array([0x61, 0x62, 0x63, 0x64, 0x65, 0x66]); // 'abcdef'

function entryAt(entries: CacheEntry[], index: number): CacheEntry {
  const entry = entries[index];
  if (entry === undefined) {
    throw new Error(`Fixture has no cache entry at index ${index}`);
  }
  return entry;
}

function firstCallArg(mock: ReturnType<typeof vi.fn>): unknown {
  const first = mock.mock.calls[0];
  if (first === undefined) {
    throw new Error('Mock was never called');
  }
  return first[0];
}

interface CacheEntry {
  url: string;
  bytes: ArrayBuffer;
}

function stubCaches(): { caches: CacheStorage; entries: CacheEntry[] } {
  const entries: CacheEntry[] = [];
  const cache = {
    async put(url: string, response: Response): Promise<void> {
      const bytes = await response.arrayBuffer();
      const existing = entries.findIndex((candidate) => candidate.url === url);
      const entry = { url, bytes: bytes.slice(0) };
      if (existing === -1) {
        entries.push(entry);
      } else {
        entries[existing] = entry; // real Cache semantics: put replaces by URL
      }
    },
    async match(url: string): Promise<Response | undefined> {
      const entry = entries.find((candidate) => candidate.url === url);
      return entry === undefined ? undefined : new Response(entry.bytes.slice(0));
    },
    async keys(): Promise<string[]> {
      return entries.map((entry) => entry.url);
    },
  };
  const caches = {
    async open(name: string): Promise<typeof cache> {
      expect(name).toBe('aby-little-book-package');
      return cache;
    },
  } as unknown as CacheStorage;
  return { caches, entries };
}

function makeManifest(assets: Array<{ src: string; sha256?: string }>): PackageManifest {
  return {
    packageId: 'fixture-package-1.0.0',
    storyId: 'fixture-package',
    storyVersion: '1.0.0',
    layouts: [],
    assets: assets.map((asset, index) => ({
      id: `layer-${index}`,
      role: 'background',
      order: index,
      src: asset.src,
      width: 8,
      height: 6,
      sha256: asset.sha256 ?? 'x'.repeat(64),
      layout: 'ipad-landscape',
    })),
    totalBytes: BYTES.byteLength * assets.length,
  };
}

function makeDeps(overrides?: Partial<PrepareDeps>): PrepareDeps & {
  entries: CacheEntry[];
  fetched: string[];
  saveReadiness: ReturnType<typeof vi.fn>;
} {
  const { caches, entries } = stubCaches();
  const fetched: string[] = [];
  const fetchImpl = vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    fetched.push(url);
    if (url.includes('missing')) {
      return new Response('not found', { status: 404 });
    }
    if (url.includes('corrupt')) {
      return new Response(new Uint8Array([0xff, 0x00]), { status: 200 });
    }
    if (url.includes('flaky') && fetched.filter((candidate) => candidate === url).length === 1) {
      throw new Error('network flake');
    }
    return new Response(BYTES.slice(0), {
      status: 200,
      headers: { 'content-length': String(BYTES.byteLength) },
    });
  });
  const saveReadiness = vi.fn(async () => undefined);
  const deps: PrepareDeps = {
    basePath: '/stories',
    cacheName: 'aby-little-book-package',
    fetchImpl,
    cachesImpl: caches,
    saveReadiness,
    ...overrides,
  };
  return { ...deps, entries, fetched, saveReadiness };
}

describe('bounded download flow', () => {
  it('downloads every asset sequentially in manifest order', async () => {
    const manifest = makeManifest([
      { src: 'a.webp', sha256: await sha256Hex(BYTES.buffer) },
      { src: 'b.webp', sha256: await sha256Hex(BYTES.buffer) },
      { src: 'c.webp', sha256: await sha256Hex(BYTES.buffer) },
    ]);
    const deps = makeDeps();
    const result = await preparePackage(manifest, deps);
    expect(deps.fetched).toEqual(['/stories/a.webp', '/stories/b.webp', '/stories/c.webp']);
    expect(result.preparation.phase).toBe('ready');
    expect(result.readiness.ready).toBe(true);
  });

  it('reports cumulative progress through the onProgress callback', async () => {
    const manifest = makeManifest([
      { src: 'a.webp', sha256: await sha256Hex(BYTES.buffer) },
      { src: 'b.webp', sha256: await sha256Hex(BYTES.buffer) },
    ]);
    const deps = makeDeps();
    const progress: number[] = [];
    await preparePackage(manifest, { ...deps, onProgress: (bytes) => progress.push(bytes) });
    expect(progress.at(-1)).toBe(BYTES.byteLength * 2);
  });
});

describe('hash verification and cache safety', () => {
  it('stores only verified responses in Cache Storage', async () => {
    const good = await sha256Hex(BYTES.buffer);
    const manifest = makeManifest([{ src: 'a.webp', sha256: good }]);
    const deps = makeDeps();
    await preparePackage(manifest, deps);
    expect(deps.entries).toHaveLength(1);
    expect(entryAt(deps.entries, 0).url).toBe('/stories/a.webp');
    expect(Array.from(new Uint8Array(entryAt(deps.entries, 0).bytes))).toEqual(Array.from(BYTES));
  });

  it('never stores a corrupted asset and never commits readiness', async () => {
    const good = await sha256Hex(BYTES.buffer);
    const manifest = makeManifest([
      { src: 'a.webp', sha256: good },
      { src: 'corrupt.webp', sha256: good },
    ]);
    const deps = makeDeps();
    const result = await preparePackage(manifest, deps);
    expect(result.preparation.phase).toBe('failed');
    expect(result.preparation.failed).toContain('corrupt.webp');
    expect(result.readiness.ready).toBe(false);
    expect(deps.entries).toHaveLength(1);
    expect(entryAt(deps.entries, 0).url).toBe('/stories/a.webp');
    expect(deps.saveReadiness).not.toHaveBeenCalled();
  });

  it('fails on a missing response and keeps verified assets cached', async () => {
    const good = await sha256Hex(BYTES.buffer);
    const manifest = makeManifest([
      { src: 'a.webp', sha256: good },
      { src: 'missing.webp', sha256: good },
    ]);
    const deps = makeDeps();
    const result = await preparePackage(manifest, deps);
    expect(result.preparation.phase).toBe('failed');
    expect(result.preparation.failed).toContain('missing.webp');
    expect(deps.entries.map((entry) => entry.url)).toEqual(['/stories/a.webp']);
    expect(deps.saveReadiness).not.toHaveBeenCalled();
  });
});

describe('atomic readiness commit', () => {
  it('commits the readiness record only when every asset verified', async () => {
    const good = await sha256Hex(BYTES.buffer);
    const manifest = makeManifest([
      { src: 'a.webp', sha256: good },
      { src: 'b.webp', sha256: good },
    ]);
    const deps = makeDeps();
    const result = await preparePackage(manifest, deps);
    expect(deps.saveReadiness).toHaveBeenCalledTimes(1);
    const record = firstCallArg(deps.saveReadiness) as {
      ready: boolean;
      packageId: string;
      storyVersion: string;
    };
    expect(record.ready).toBe(true);
    expect(record.packageId).toBe('fixture-package-1.0.0');
    expect(record.storyVersion).toBe('1.0.0');
    expect(result.readiness.ready).toBe(true);
  });

  it('survives a mid-download interruption and can be retried', async () => {
    const good = await sha256Hex(BYTES.buffer);
    const manifest = makeManifest([
      { src: 'a.webp', sha256: good },
      { src: 'flaky.webp', sha256: good },
      { src: 'c.webp', sha256: good },
    ]);
    const deps = makeDeps();
    const first = await preparePackage(manifest, deps);
    expect(first.preparation.phase).toBe('failed');
    expect(first.preparation.failed).toContain('flaky.webp');
    expect(deps.saveReadiness).not.toHaveBeenCalled();

    const second = await preparePackage(manifest, deps);
    expect(second.preparation.phase).toBe('ready');
    expect(second.readiness.ready).toBe(true);
    expect(deps.entries).toHaveLength(3);
  });
});

describe('preparation against the real Spread 08 package', () => {
  it('prepares the production manifest end to end', async () => {
    const { SPREAD08_MANIFEST } = await import('../story/spread08');
    const fetched: string[] = [];
    const { caches, entries } = stubCaches();
    const fetchImpl = vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input);
      fetched.push(url);
      const rel = url.replace('/stories/the-starlight-rescue-0.1.0/', '');
      const asset = SPREAD08_MANIFEST.assets.find((candidate) => candidate.src === rel);
      if (asset === undefined) {
        return new Response('not found', { status: 404 });
      }
      // Deterministic pseudo-art bytes; the sha256 below is computed from them.
      const seed = Array.from(rel).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const bytes = new Uint8Array(64).map((_, index) => (seed + index) % 256);
      return new Response(bytes, { status: 200 });
    });
    const deps: PrepareDeps = {
      basePath: '/stories/the-starlight-rescue-0.1.0',
      cacheName: 'aby-little-book-package',
      fetchImpl,
      cachesImpl: caches,
      saveReadiness: vi.fn(async () => undefined),
    };
    const result = await preparePackage(SPREAD08_MANIFEST, deps);
    // The production manifest hashes are real (from the committed WebP files),
    // so pseudo-bytes must fail verification — the package must NOT become ready.
    expect(result.preparation.phase).toBe('failed');
    expect(result.readiness.ready).toBe(false);
    expect(deps.saveReadiness).not.toHaveBeenCalled();
    expect(entries).toHaveLength(0);
    expect(fetched.length).toBeGreaterThan(0);
  });
});
