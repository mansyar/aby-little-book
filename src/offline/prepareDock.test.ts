import { describe, expect, it } from 'vitest';
import { type PackageManifest, packageManifestSchema } from '../scene/package';
import { type DockPrepareDeps, dockPackageNeeds, prepareDockPackage } from './prepareDock';

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const GLB_BYTES = new Uint8Array([0x67, 0x6c, 0x62, 0x31]);
const TEX_BYTES = new Uint8Array([0x6b, 0x74, 0x78, 0x32]);

function bytesOf(data: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(data.length);
  new Uint8Array(buffer).set(data);
  return buffer;
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
      const entry = { url, bytes: bytes.slice(0) };
      const existing = entries.findIndex((candidate) => candidate.url === url);
      if (existing === -1) {
        entries.push(entry);
      } else {
        entries[existing] = entry;
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
    async open(_name: string): Promise<typeof cache> {
      return cache;
    },
  };
  return { caches: caches as unknown as CacheStorage, entries };
}

type FetchPlan = Record<string, Uint8Array | 'missing'>;

function stubFetch(plan: FetchPlan): typeof fetch {
  return (async (url: unknown) => {
    const bytes = plan[String(url)];
    if (bytes === undefined || bytes === 'missing') {
      return new Response(null, { status: 404 });
    }
    return new Response(bytesOf(bytes), { status: 200 });
  }) as typeof fetch;
}

async function dockManifest(textureSha: string | null = null): Promise<PackageManifest> {
  const manifest = {
    packageId: 'the-sharing-tide-0.1.0',
    storyId: 'the-sharing-tide',
    storyVersion: '0.1.0',
    builder: { blender: '5.2.0', builderSha: 'b1', styleSha: 's1', seed: 7 },
    scenes: [
      {
        id: 'dock',
        glb: 'dock.glb',
        sha256: await sha256Hex(bytesOf(GLB_BYTES)),
        triangles: 100,
        pivot: { x: 0, y: 0, z: 0 },
        bounds: { min: { x: -1, y: 0, z: -1 }, max: { x: 1, y: 2, z: 1 } },
        textures: [
          {
            id: 'water',
            src: 'water.ktx2',
            width: 64,
            height: 64,
            ...(textureSha === null ? {} : { sha256: textureSha }),
          },
        ],
        tapTargets: [
          {
            id: 'boat',
            label: { en: 'Board the boat', id: 'Naik perahu' },
            position: { x: 0, y: 1, z: 0 },
          },
        ],
        bakedText: false,
        budgets: { maxTriangles: 1000, maxTextureBytes: 1000, maxTotalBytes: 10000 },
      },
    ],
    totalBytes: 10000,
  };
  const parsed = packageManifestSchema.safeParse(manifest);
  expect(parsed.success).toBe(true);
  if (!parsed.success) {
    throw new Error('Dock manifest fixture is invalid.');
  }
  return parsed.data;
}

function deps(
  plan: FetchPlan,
  caches: CacheStorage,
  saveReadiness: (readiness: never) => Promise<void>,
): DockPrepareDeps {
  return {
    basePath: '/stories/the-sharing-tide-0.1.0',
    cacheName: 'aby-little-book-package',
    fetchImpl: stubFetch(plan),
    cachesImpl: caches,
    saveReadiness: saveReadiness as DockPrepareDeps['saveReadiness'],
  };
}

describe('dock 3D preparation', () => {
  it('verifies every scene byte before caching and commits a ready receipt', async () => {
    const manifest = await dockManifest(await sha256Hex(bytesOf(TEX_BYTES)));
    expect(dockPackageNeeds(manifest)).toEqual([
      { src: 'dock.glb', sha256: expect.any(String) },
      { src: 'water.ktx2', sha256: expect.any(String) },
    ]);
    const { caches, entries } = stubCaches();
    const saved: unknown[] = [];
    const progress: number[] = [];
    const result = await prepareDockPackage(manifest, {
      ...deps(
        {
          '/stories/the-sharing-tide-0.1.0/dock.glb': GLB_BYTES,
          '/stories/the-sharing-tide-0.1.0/water.ktx2': TEX_BYTES,
        },
        caches,
        async (readiness) => {
          saved.push(readiness);
        },
      ),
      onProgress: (received) => {
        progress.push(received);
      },
    });
    expect(result.ready).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.failedHashes).toEqual([]);
    expect(entries.map((entry) => entry.url).sort()).toEqual(
      [
        '/stories/the-sharing-tide-0.1.0/dock.glb',
        '/stories/the-sharing-tide-0.1.0/water.ktx2',
      ].sort(),
    );
    expect(saved).toEqual([
      {
        ready: true,
        packageId: 'the-sharing-tide-0.1.0',
        storyVersion: '0.1.0',
        missingAssets: [],
        failedHashes: [],
      },
    ]);
    for (const received of progress) {
      expect(received).toBeLessThanOrEqual(manifest.totalBytes);
    }
  });

  it('leaves missing assets out of the cache and commits a not-ready receipt', async () => {
    const manifest = await dockManifest(await sha256Hex(bytesOf(TEX_BYTES)));
    const { caches, entries } = stubCaches();
    const saved: unknown[] = [];
    const result = await prepareDockPackage(
      manifest,
      deps(
        {
          '/stories/the-sharing-tide-0.1.0/dock.glb': 'missing',
          '/stories/the-sharing-tide-0.1.0/water.ktx2': TEX_BYTES,
        },
        caches,
        async (r) => {
          saved.push(r);
        },
      ),
    );
    expect(result.ready).toBe(false);
    expect(result.missing).toEqual(['dock.glb']);
    expect(entries.map((entry) => entry.url)).toEqual([
      '/stories/the-sharing-tide-0.1.0/water.ktx2',
    ]);
    expect(saved).toEqual([
      {
        ready: false,
        packageId: 'the-sharing-tide-0.1.0',
        storyVersion: '0.1.0',
        missingAssets: ['dock.glb'],
        failedHashes: [],
      },
    ]);
  });

  it('rejects tampered bytes and retries cleanly to ready', async () => {
    const textureSha = await sha256Hex(bytesOf(TEX_BYTES));
    const manifest = await dockManifest(textureSha);
    const { caches } = stubCaches();
    const saved: unknown[] = [];
    const tampered = await prepareDockPackage(
      manifest,
      deps(
        {
          '/stories/the-sharing-tide-0.1.0/dock.glb': TEX_BYTES,
          '/stories/the-sharing-tide-0.1.0/water.ktx2': TEX_BYTES,
        },
        caches,
        async (r) => {
          saved.push(r);
        },
      ),
    );
    expect(tampered.ready).toBe(false);
    expect(tampered.failedHashes).toEqual(['dock.glb']);

    const retried = await prepareDockPackage(
      manifest,
      deps(
        {
          '/stories/the-sharing-tide-0.1.0/dock.glb': GLB_BYTES,
          '/stories/the-sharing-tide-0.1.0/water.ktx2': TEX_BYTES,
        },
        caches,
        async (r) => {
          saved.push(r);
        },
      ),
    );
    expect(retried.ready).toBe(true);
    expect(saved[saved.length - 1]).toMatchObject({ ready: true });
  });

  it('never caches a texture without a hash to verify against', async () => {
    const manifest = await dockManifest();
    const { caches, entries } = stubCaches();
    const result = await prepareDockPackage(
      manifest,
      deps(
        {
          '/stories/the-sharing-tide-0.1.0/dock.glb': GLB_BYTES,
          '/stories/the-sharing-tide-0.1.0/water.ktx2': TEX_BYTES,
        },
        caches,
        async () => {},
      ),
    );
    expect(result.ready).toBe(false);
    expect(result.failedHashes).toEqual(['water.ktx2']);
    expect(entries.map((entry) => entry.url)).toEqual(['/stories/the-sharing-tide-0.1.0/dock.glb']);
  });
});
