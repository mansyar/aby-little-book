import type { PackageManifest, PackageReadiness } from '../scene/package';
import { sha256Hex } from './prepare';

// Explicit 3D preparation for dock packages: bounded sequential download of
// every scene GLB plus KTX2 texture. Each response is SHA-256 verified BEFORE
// it enters Cache Storage; a texture without a manifest hash is unverifiable
// and never cached. The readiness receipt is always committed — ready only
// when every byte verified — so the dock can never read a false-ready state.
// Re-running replaces cache entries and the receipt, making retry safe.

export type DockAssetNeed = {
  src: string;
  sha256: string | null;
};

export function dockPackageNeeds(manifest: PackageManifest): DockAssetNeed[] {
  return manifest.scenes.flatMap((scene) => [
    { src: scene.glb, sha256: scene.sha256 },
    ...scene.textures.map((texture) => ({ src: texture.src, sha256: texture.sha256 ?? null })),
  ]);
}

export interface DockPrepareDeps {
  basePath: string;
  cacheName: string;
  fetchImpl: typeof fetch;
  cachesImpl: CacheStorage;
  saveReadiness: (readiness: PackageReadiness) => Promise<void>;
  onProgress?: (receivedBytes: number, totalBytes: number) => void;
}

export interface DockPrepareResult {
  receivedBytes: number;
  totalBytes: number;
  missing: string[];
  failedHashes: string[];
  ready: boolean;
}

export async function prepareDockPackage(
  manifest: PackageManifest,
  deps: DockPrepareDeps,
): Promise<DockPrepareResult> {
  const cache = await deps.cachesImpl.open(deps.cacheName);
  const missing: string[] = [];
  const failedHashes: string[] = [];
  let receivedBytes = 0;

  for (const need of dockPackageNeeds(manifest)) {
    const url = `${deps.basePath}/${need.src}`;
    let response: Response;
    try {
      response = await deps.fetchImpl(url);
    } catch {
      missing.push(need.src);
      continue;
    }
    if (!response.ok) {
      missing.push(need.src);
      continue;
    }
    if (need.sha256 === null) {
      failedHashes.push(need.src);
      continue;
    }
    const bytes = await response.arrayBuffer();
    const digest = await sha256Hex(bytes);
    if (digest !== need.sha256) {
      failedHashes.push(need.src);
      continue;
    }
    receivedBytes += bytes.byteLength;
    deps.onProgress?.(receivedBytes, manifest.totalBytes);
    await cache.put(url, new Response(bytes.slice(0), { status: 200 }));
  }

  const ready = missing.length === 0 && failedHashes.length === 0;
  await deps.saveReadiness({
    ready,
    packageId: manifest.packageId,
    storyVersion: manifest.storyVersion,
    missingAssets: missing,
    failedHashes,
  });
  return { receivedBytes, totalBytes: manifest.totalBytes, missing, failedHashes, ready };
}
