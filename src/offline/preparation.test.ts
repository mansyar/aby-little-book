import { describe, expect, it } from 'vitest';
import { validManifest } from '../story/fixtures';
import { SPREAD08_MANIFEST } from '../story/spread08';
import {
  createPreparationFromManifest,
  type PackagePreparation,
  readinessOf,
  reducePreparation,
} from './preparation';

// Offline-readiness contract: a package becomes ready only when every
// required response has been received AND its hash verified. Anything less
// is a failed or in-progress state, never a false-ready one.
// Asset keys are the manifest `src` values: the same layer id appears once
// per layout, and each layout file is a distinct downloadable resource.

const ASSETS = validManifest.assets.map((asset) => asset.src);

function assetAt(index: number): string {
  const src = ASSETS[index];
  if (src === undefined) {
    throw new Error(`Fixture has no asset at index ${index}`);
  }
  return src;
}

function beginFullManifest(): PackagePreparation {
  return createPreparationFromManifest(validManifest);
}

function downloadAll(state: PackagePreparation): PackagePreparation {
  let next = reducePreparation(state, { type: 'begin' });
  for (const src of ASSETS) {
    next = reducePreparation(next, { type: 'asset-complete', assetId: src });
  }
  return next;
}

describe('preparation begins from the manifest', () => {
  it('creates an idle preparation with every manifest asset pending', () => {
    const state = createPreparationFromManifest(SPREAD08_MANIFEST);
    expect(state.phase).toBe('idle');
    expect(state.pending).toHaveLength(SPREAD08_MANIFEST.assets.length);
    expect(state.pending).toContain('assets/layers/ipad-landscape/bg-space.webp');
    expect(state.unverified).toHaveLength(0);
    expect(state.failed).toHaveLength(0);
    expect(readinessOf(state).ready).toBe(false);
  });

  it('tracks each layout of the same layer as a separate asset', () => {
    const state = createPreparationFromManifest(SPREAD08_MANIFEST);
    const perLayout = SPREAD08_MANIFEST.assets.filter((asset) => asset.id === 'bg-space');
    expect(perLayout).toHaveLength(2);
    for (const asset of perLayout) {
      expect(state.pending).toContain(asset.src);
    }
  });

  it('begins a bounded download flow from idle', () => {
    const state = reducePreparation(beginFullManifest(), { type: 'begin' });
    expect(state.phase).toBe('downloading');
    expect(state.receivedBytes).toBe(0);
    expect(state.totalBytes).toBe(validManifest.totalBytes);
  });

  it('clamps progress reports to the declared total', () => {
    const state = reducePreparation(reducePreparation(beginFullManifest(), { type: 'begin' }), {
      type: 'progress',
      receivedBytes: validManifest.totalBytes * 2,
    });
    expect(state.receivedBytes).toBe(validManifest.totalBytes);
  });
});

describe('atomic readiness', () => {
  it('never reports ready before every asset has been verified', () => {
    const downloading = downloadAll(beginFullManifest());
    expect(downloading.phase).toBe('verifying');
    expect(readinessOf(downloading).ready).toBe(false);

    const verified: PackagePreparation = reducePreparation(downloading, {
      type: 'asset-verified',
      assetId: assetAt(0),
    });
    expect(verified.phase).toBe('verifying');
    expect(readinessOf(verified).ready).toBe(false);
  });

  it('commits readiness only when the last hash verifies', () => {
    let state = downloadAll(beginFullManifest());
    for (const src of ASSETS.slice(0, -1)) {
      state = reducePreparation(state, { type: 'asset-verified', assetId: src });
    }
    expect(readinessOf(state).ready).toBe(false);
    state = reducePreparation(state, {
      type: 'asset-verified',
      assetId: assetAt(ASSETS.length - 1),
    });
    const readiness = readinessOf(state);
    expect(state.phase).toBe('ready');
    expect(readiness.ready).toBe(true);
    expect(readiness.packageId).toBe(validManifest.packageId);
    expect(readiness.storyVersion).toBe(validManifest.storyVersion);
    expect(readiness.missingAssets).toHaveLength(0);
    expect(readiness.failedHashes).toHaveLength(0);
  });

  it('fails on a missing asset response and never reaches ready', () => {
    let state = downloadAll(beginFullManifest());
    state = reducePreparation(state, { type: 'asset-missing', assetId: assetAt(2) });
    for (const src of ASSETS) {
      state = reducePreparation(state, { type: 'asset-verified', assetId: src });
    }
    expect(state.failed).toContain(assetAt(2));
    expect(state.phase).toBe('failed');
    expect(readinessOf(state).ready).toBe(false);
  });

  it('fails on a hash mismatch and never reaches ready', () => {
    let state = downloadAll(beginFullManifest());
    state = reducePreparation(state, { type: 'asset-hash-mismatch', assetId: assetAt(4) });
    for (const src of ASSETS) {
      state = reducePreparation(state, { type: 'asset-verified', assetId: src });
    }
    expect(state.failed).toContain(assetAt(4));
    expect(state.phase).toBe('failed');
    expect(readinessOf(state).ready).toBe(false);
  });

  it('reports missing and mismatched assets together in one failed state', () => {
    let state = downloadAll(beginFullManifest());
    state = reducePreparation(state, { type: 'asset-missing', assetId: assetAt(1) });
    state = reducePreparation(state, { type: 'asset-hash-mismatch', assetId: assetAt(3) });
    expect(state.failed).toHaveLength(2);
    expect(state.failed).toContain(assetAt(1));
    expect(state.failed).toContain(assetAt(3));
  });
});

describe('interruption, resume, and retry', () => {
  it('keeps the persisted state across an interruption and resumes', () => {
    let state = reducePreparation(beginFullManifest(), { type: 'begin' });
    state = reducePreparation(state, { type: 'asset-complete', assetId: assetAt(0) });
    const persisted = state;

    const resumed = reducePreparation(persisted, { type: 'resume' });
    expect(resumed.phase).toBe('downloading');
    expect(resumed.pending).not.toContain(assetAt(0));
    expect(resumed.unverified).toContain(assetAt(0));
  });

  it('retries failed assets without re-downloading verified ones', () => {
    let state = downloadAll(beginFullManifest());
    state = reducePreparation(state, { type: 'asset-hash-mismatch', assetId: assetAt(0) });
    const before = state;

    const retried = reducePreparation(state, { type: 'retry' });
    expect(retried.phase).toBe('downloading');
    expect(retried.failed).toHaveLength(0);
    expect(retried.pending).toContain(assetAt(0));
    expect(retried.unverified).toHaveLength(before.unverified.length);
  });

  it('verifies a retried asset and reaches ready', () => {
    let state = downloadAll(beginFullManifest());
    state = reducePreparation(state, { type: 'asset-hash-mismatch', assetId: assetAt(0) });
    state = reducePreparation(state, { type: 'retry' });
    state = reducePreparation(state, { type: 'asset-complete', assetId: assetAt(0) });
    for (const src of ASSETS) {
      state = reducePreparation(state, { type: 'asset-verified', assetId: src });
    }
    expect(state.phase).toBe('ready');
    expect(readinessOf(state).ready).toBe(true);
  });
});

describe('version replacement', () => {
  it('preserves the prior ready package while a replacement prepares', () => {
    let state = downloadAll(beginFullManifest());
    for (const src of ASSETS) {
      state = reducePreparation(state, { type: 'asset-verified', assetId: src });
    }
    const readyState = state;
    expect(readinessOf(readyState).ready).toBe(true);

    const next = reducePreparation(readyState, {
      type: 'begin',
      packageId: 'the-starlight-rescue-0.2.0',
      storyVersion: '0.2.0',
      totalBytes: validManifest.totalBytes,
      assetIds: ASSETS,
    });
    expect(next.phase).toBe('downloading');
    expect(next.previousReady?.ready).toBe(true);
    expect(next.previousReady?.storyVersion).toBe('0.1.0');
  });

  it('replaces the prior ready record only when the new version commits', () => {
    let state = downloadAll(beginFullManifest());
    for (const src of ASSETS) {
      state = reducePreparation(state, { type: 'asset-verified', assetId: src });
    }
    const next = reducePreparation(state, {
      type: 'begin',
      packageId: 'the-starlight-rescue-0.2.0',
      storyVersion: '0.2.0',
      totalBytes: validManifest.totalBytes,
      assetIds: ASSETS,
    });
    let replacing = next;
    for (const src of ASSETS) {
      replacing = reducePreparation(replacing, { type: 'asset-complete', assetId: src });
    }
    for (const src of ASSETS) {
      replacing = reducePreparation(replacing, { type: 'asset-verified', assetId: src });
    }
    expect(readinessOf(replacing).ready).toBe(true);
    expect(replacing.previousReady?.storyVersion).toBe('0.2.0');
    expect(replacing.previousReady?.packageId).toBe('the-starlight-rescue-0.2.0');
  });
});

describe('eviction detection and calm recovery', () => {
  it('detects evicted-cache state and requires re-preparation', () => {
    let state = downloadAll(beginFullManifest());
    for (const src of ASSETS) {
      state = reducePreparation(state, { type: 'asset-verified', assetId: src });
    }
    const evicted = reducePreparation(state, { type: 'eviction-detected' });
    expect(evicted.phase).toBe('failed');
    expect(evicted.evicted).toBe(true);
    expect(evicted.error).toBe('evicted');
    expect(readinessOf(evicted).ready).toBe(false);

    const retried = reducePreparation(evicted, { type: 'retry' });
    expect(retried.evicted).toBe(false);
    expect(retried.phase).toBe('downloading');
  });
});

describe('invalid events are rejected without corrupting state', () => {
  it('returns the identical state for events that do not apply', () => {
    const idle = beginFullManifest();
    expect(reducePreparation(idle, { type: 'asset-verified', assetId: assetAt(0) })).toBe(idle);
    expect(reducePreparation(idle, { type: 'progress', receivedBytes: 10 })).toBe(idle);
    expect(reducePreparation(idle, { type: 'retry' })).toBe(idle);
    expect(reducePreparation(idle, { type: 'eviction-detected' })).toBe(idle);
  });

  it('ignores events for unknown asset ids', () => {
    let state = reducePreparation(beginFullManifest(), { type: 'begin' });
    const before = state;
    state = reducePreparation(state, { type: 'asset-complete', assetId: 'ghost-layer.webp' });
    state = reducePreparation(state, { type: 'asset-verified', assetId: 'ghost-layer.webp' });
    expect(state).toBe(before);
  });

  it('is idempotent for repeated verification', () => {
    let state = downloadAll(beginFullManifest());
    state = reducePreparation(state, { type: 'asset-verified', assetId: assetAt(0) });
    const once = state;
    state = reducePreparation(state, { type: 'asset-verified', assetId: assetAt(0) });
    expect(state).toBe(once);
  });
});
