import type { PackageManifest, PackageReadiness } from '../story/contracts';

/**
 * Explicit book preparation: a bounded download-and-verify flow whose only
 * exit to `ready` is atomic — every manifest asset must have a response AND
 * a verified hash. Asset keys are manifest `src` values: the same layer id
 * appears once per layout, and each layout file is a distinct resource.
 */

export type PreparationPhase = 'idle' | 'downloading' | 'verifying' | 'ready' | 'failed';

export interface PackagePreparation {
  readonly packageId: string;
  readonly storyVersion: string;
  readonly phase: PreparationPhase;
  /** Responses not yet received. */
  readonly pending: readonly string[];
  /** Responses received, hashes not yet verified. */
  readonly unverified: readonly string[];
  /** Missing responses or failed hash checks. */
  readonly failed: readonly string[];
  readonly receivedBytes: number;
  readonly totalBytes: number;
  /** The readiness record replaced by a newer version, preserved until it commits. */
  readonly previousReady: PackageReadiness | null;
  /** Set when the browser evicted the cached package; calm recovery re-prepares. */
  readonly evicted: boolean;
  readonly error: string | null;
}

export type PreparationEvent =
  | {
      readonly type: 'begin';
      readonly packageId?: string;
      readonly storyVersion?: string;
      readonly totalBytes?: number;
      readonly assetIds?: readonly string[];
    }
  | { readonly type: 'progress'; readonly receivedBytes: number }
  | { readonly type: 'asset-complete'; readonly assetId: string }
  | { readonly type: 'asset-verified'; readonly assetId: string }
  | { readonly type: 'asset-missing'; readonly assetId: string }
  | { readonly type: 'asset-hash-mismatch'; readonly assetId: string }
  | { readonly type: 'resume' }
  | { readonly type: 'retry' }
  | { readonly type: 'eviction-detected' };

export function createPreparation(
  packageId: string,
  storyVersion: string,
  totalBytes: number,
  assetIds: readonly string[],
): PackagePreparation {
  return {
    packageId,
    storyVersion,
    phase: 'idle',
    pending: [...assetIds],
    unverified: [],
    failed: [],
    receivedBytes: 0,
    totalBytes,
    previousReady: null,
    evicted: false,
    error: null,
  };
}

export function createPreparationFromManifest(manifest: PackageManifest): PackagePreparation {
  return createPreparation(
    manifest.packageId,
    manifest.storyVersion,
    manifest.totalBytes,
    manifest.assets.map((asset) => asset.src),
  );
}

function without(list: readonly string[], assetId: string): string[] {
  return list.filter((id) => id !== assetId);
}

export function reducePreparation(
  state: PackagePreparation,
  event: PreparationEvent,
): PackagePreparation {
  switch (event.type) {
    case 'begin': {
      if (state.phase === 'downloading' || state.phase === 'verifying') {
        return state;
      }
      const replaces = event.assetIds !== undefined;
      const base = replaces
        ? createPreparation(
            event.packageId ?? state.packageId,
            event.storyVersion ?? state.storyVersion,
            event.totalBytes ?? state.totalBytes,
            event.assetIds ?? [],
          )
        : state;
      const previousReady =
        state.phase === 'ready' && replaces ? readinessOf(state) : state.previousReady;
      return { ...base, phase: 'downloading', previousReady };
    }
    case 'progress': {
      if (state.phase !== 'downloading') {
        return state;
      }
      const receivedBytes = Math.min(Math.max(0, event.receivedBytes), state.totalBytes);
      return receivedBytes === state.receivedBytes ? state : { ...state, receivedBytes };
    }
    case 'asset-complete': {
      if (state.phase !== 'downloading' || !state.pending.includes(event.assetId)) {
        return state;
      }
      const next = {
        ...state,
        pending: without(state.pending, event.assetId),
        unverified: [...state.unverified, event.assetId],
      };
      if (next.pending.length === 0) {
        return { ...next, phase: 'verifying' };
      }
      return next;
    }
    case 'asset-verified': {
      if (state.phase !== 'verifying' || !state.unverified.includes(event.assetId)) {
        return state;
      }
      const unverified = without(state.unverified, event.assetId);
      if (unverified.length === 0) {
        const next = { ...state, unverified, phase: 'ready' as const };
        return { ...next, previousReady: readinessOf(next) };
      }
      return { ...state, unverified };
    }
    case 'asset-missing':
    case 'asset-hash-mismatch': {
      if (
        state.phase === 'idle' ||
        state.phase === 'ready' ||
        state.failed.includes(event.assetId)
      ) {
        return state;
      }
      return {
        ...state,
        failed: [...state.failed, event.assetId],
        phase: 'failed',
        error: event.type === 'asset-missing' ? 'missing' : 'hash-mismatch',
      };
    }
    case 'resume': {
      if (state.phase === 'idle' || state.phase === 'ready') {
        return state;
      }
      if (state.phase === 'downloading' || state.phase === 'verifying') {
        return state;
      }
      return { ...state, phase: 'downloading', error: null, evicted: false };
    }
    case 'retry': {
      if (state.phase === 'idle' || state.phase === 'downloading' || state.phase === 'verifying') {
        return state;
      }
      return {
        ...state,
        pending: [...state.pending, ...state.failed],
        failed: [],
        phase: 'downloading',
        error: null,
        evicted: false,
      };
    }
    case 'eviction-detected': {
      if (state.phase !== 'ready') {
        return state;
      }
      return { ...state, phase: 'failed', evicted: true, error: 'evicted' };
    }
  }
}

export function readinessOf(state: PackagePreparation): PackageReadiness {
  return {
    ready: state.phase === 'ready',
    packageId: state.packageId,
    storyVersion: state.storyVersion,
    missingAssets: state.phase === 'failed' ? [...state.failed] : [],
    failedHashes: [],
  };
}
