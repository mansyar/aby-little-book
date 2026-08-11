import { describe, expect, it } from 'vitest';
import {
  assetLayerSchema,
  layoutSchema,
  packageManifestSchema,
  packageReadinessSchema,
  type SceneLayout,
} from './contracts';
import { validAssetLayers, validLayouts, validManifest, validReadiness } from './fixtures';
import {
  assertLayerOrderUnique,
  assertLayoutCameraInBounds,
  assertLayoutLayersExist,
  assertLayoutPanelInBounds,
  assertReadinessConsistent,
  assertSafeRegion,
  validateManifest,
} from './validators';

describe('asset layer contract', () => {
  it('accepts a well-formed webp layer with a sha256 digest', () => {
    expect(assetLayerSchema.safeParse(validAssetLayers[0]).success).toBe(true);
  });

  it('rejects a non-webp delivery source', () => {
    const broken = { ...validAssetLayers[0], src: 'assets/layers/bg-space.png' };
    expect(assetLayerSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects a malformed sha256 digest', () => {
    const broken = { ...validAssetLayers[0], sha256: 'not-a-hash' };
    expect(assetLayerSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects a non-positive dimension', () => {
    const broken = { ...validAssetLayers[0], width: 0 };
    expect(assetLayerSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects an unknown layer role', () => {
    const broken = { ...validAssetLayers[0], role: 'hud' };
    expect(assetLayerSchema.safeParse(broken).success).toBe(false);
  });
});

describe('layout contract', () => {
  const landscape = validLayouts.find((entry) => entry.id === 'ipad-landscape') as SceneLayout;

  it('accepts an authored layout over known layers', () => {
    expect(layoutSchema.safeParse(landscape).success).toBe(true);
  });

  it('rejects an unsupported layout id', () => {
    expect(layoutSchema.safeParse({ id: 'smartwatch', layerIds: ['bg-space'] }).success).toBe(
      false,
    );
  });

  it('rejects a layout without an authored camera', () => {
    const broken = { ...landscape };
    delete (broken as Partial<typeof broken>).camera;
    expect(layoutSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects a layout without a text-safe panel placement', () => {
    const broken = { ...landscape };
    delete (broken as Partial<typeof broken>).panel;
    expect(layoutSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects an unknown panel position', () => {
    const broken = { ...landscape, panel: { position: 'float', region: landscape.panel.region } };
    expect(layoutSchema.safeParse(broken).success).toBe(false);
  });
});

describe('package manifest contract', () => {
  it('accepts a complete versioned manifest', () => {
    expect(packageManifestSchema.safeParse(validManifest).success).toBe(true);
  });

  it('rejects a manifest with a non-semantic story version', () => {
    const broken = { ...validManifest, storyVersion: 'latest' };
    expect(packageManifestSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects a manifest with a negative byte budget', () => {
    const broken = { ...validManifest, totalBytes: -1 };
    expect(packageManifestSchema.safeParse(broken).success).toBe(false);
  });
});

describe('package readiness contract', () => {
  it('accepts an atomically-ready package', () => {
    expect(packageReadinessSchema.safeParse(validReadiness).success).toBe(true);
  });

  it('rejects readiness that claims ready while assets are missing', () => {
    const broken = { ...validReadiness, missingAssets: ['char-maya'] };
    expect(packageReadinessSchema.safeParse(broken).success).toBe(true);
    expect(assertReadinessConsistent(broken)).not.toEqual([]);
  });

  it('rejects readiness that claims ready while hashes failed', () => {
    const broken = { ...validReadiness, failedHashes: ['bg-space'] };
    expect(assertReadinessConsistent(broken)).not.toEqual([]);
  });

  it('accepts an incomplete package that honestly reports not-ready', () => {
    const broken = { ...validReadiness, ready: false, missingAssets: ['fx-glow'] };
    expect(assertReadinessConsistent(broken)).toEqual([]);
  });
});

describe('semantic asset guards', () => {
  it('rejects duplicate layer order values', () => {
    const layers = validAssetLayers.map((layer, index) =>
      index === 2 ? { ...layer, order: 0 } : layer,
    );
    expect(assertLayerOrderUnique(layers)).not.toEqual([]);
  });

  it('rejects a layout referencing an unknown layer', () => {
    const layout = { id: 'ipad-landscape', layerIds: ['bg-space', 'ghost-layer'] };
    expect(assertLayoutLayersExist(layout, validAssetLayers)).not.toEqual([]);
  });

  it('rejects a safe region outside normalized bounds', () => {
    expect(assertSafeRegion({ x: 0.9, y: 0.2, width: 0.4, height: 0.3 })).not.toEqual([]);
    expect(assertSafeRegion({ x: 0.1, y: 0.2, width: 0.4, height: 0.3 })).toEqual([]);
  });

  it('rejects an authored camera outside normalized bounds', () => {
    const layout = {
      ...validLayouts[0],
      camera: { x: 0.9, y: 0.2, width: 0.4, height: 0.3 },
    } as SceneLayout;
    expect(assertLayoutCameraInBounds(layout)).not.toEqual([]);
  });

  it('rejects a text-safe panel region outside normalized bounds', () => {
    const layout = {
      ...validLayouts[0],
      panel: { position: 'side' as const, region: { x: 0.1, y: 0.9, width: 0.9, height: 0.2 } },
    } as SceneLayout;
    expect(assertLayoutPanelInBounds(layout)).not.toEqual([]);
  });

  it('flags out-of-bounds cameras and panels through manifest validation', () => {
    const layout = {
      ...validLayouts[0],
      camera: { x: 0.5, y: 0.5, width: 1.5, height: 1 },
    } as SceneLayout;
    const diagnostics = validateManifest({ ...validManifest, layouts: [layout] });
    expect(diagnostics.some((entry) => entry.code === 'layout-camera-out-of-bounds')).toBe(true);
  });
});

describe('package manifest validation', () => {
  it('accepts a complete valid manifest', () => {
    expect(validateManifest(validManifest)).toEqual([]);
  });

  it('rejects an empty asset set', () => {
    const broken = { ...validManifest, assets: [] };
    expect(validateManifest(broken)).not.toEqual([]);
  });

  it('rejects a zero byte budget', () => {
    const broken = { ...validManifest, totalBytes: 0 };
    const codes = validateManifest(broken).map((d) => d.code);
    expect(codes).toContain('package-zero-budget');
  });
});
