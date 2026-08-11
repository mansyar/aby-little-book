import type { PackageManifest, PackageReadiness } from '../story/contracts';
import {
  createPreparationFromManifest,
  type PackagePreparation,
  readinessOf,
  reducePreparation,
} from './preparation';

/**
 * Explicit book preparation: bounded sequential download of the complete
 * immutable package. Every response is SHA-256 verified against the manifest
 * BEFORE it enters Cache Storage; corrupted or missing assets fail the flow
 * and no readiness record is ever committed. Only a fully verified package
 * is saved to IndexedDB as ready.
 */

export interface PrepareDeps {
  basePath: string;
  cacheName: string;
  fetchImpl: typeof fetch;
  cachesImpl: CacheStorage;
  saveReadiness: (readiness: PackageReadiness) => Promise<void>;
  onProgress?: (receivedBytes: number) => void;
}

export interface PrepareResult {
  preparation: PackagePreparation;
  readiness: PackageReadiness;
}

export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function preparePackage(
  manifest: PackageManifest,
  deps: PrepareDeps,
): Promise<PrepareResult> {
  const cache = await deps.cachesImpl.open(deps.cacheName);
  let preparation = reducePreparation(createPreparationFromManifest(manifest), { type: 'begin' });

  for (const asset of manifest.assets) {
    const url = `${deps.basePath}/${asset.src}`;
    try {
      const response = await deps.fetchImpl(url);
      if (!response.ok) {
        preparation = reducePreparation(preparation, { type: 'asset-missing', assetId: asset.src });
        continue;
      }
      const bytes = await response.arrayBuffer();
      const digest = await sha256Hex(bytes);
      if (digest !== asset.sha256) {
        preparation = reducePreparation(preparation, {
          type: 'asset-hash-mismatch',
          assetId: asset.src,
        });
        continue;
      }
      // Verified: the response is re-wrapped so the cache stores the same
      // bytes that passed the hash check.
      const length = Number(response.headers.get('content-length') ?? 0);
      if (Number.isFinite(length) && length > 0) {
        preparation = reducePreparation(preparation, {
          type: 'progress',
          receivedBytes: preparation.receivedBytes + length,
        });
        deps.onProgress?.(preparation.receivedBytes);
      }
      await cache.put(url, new Response(bytes.slice(0), { status: 200 }));
      preparation = reducePreparation(preparation, { type: 'asset-complete', assetId: asset.src });
      preparation = reducePreparation(preparation, { type: 'asset-verified', assetId: asset.src });
    } catch {
      preparation = reducePreparation(preparation, {
        type: 'asset-hash-mismatch',
        assetId: asset.src,
      });
    }
  }

  const readiness = readinessOf(preparation);
  if (readiness.ready) {
    await deps.saveReadiness(readiness);
  }
  return { preparation, readiness };
}
