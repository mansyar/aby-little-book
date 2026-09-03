import { describe, expect, it } from 'vitest';
import { packageManifestSchema, packageReadinessSchema, sceneSchema } from './package';

function validScene(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'dock',
    glb: 'assets/3d/dock.glb',
    sha256: 'a'.repeat(64),
    triangles: 12000,
    pivot: { x: 0, y: 0.5, z: 0 },
    bounds: {
      min: { x: -4, y: 0, z: -4 },
      max: { x: 4, y: 3, z: 4 },
    },
    textures: [{ id: 'dock-albedo', src: 'assets/3d/dock-albedo.ktx2', width: 1024, height: 1024 }],
    tapTargets: [
      {
        id: 'boat',
        label: { en: 'Climb aboard', id: 'Naik ke perahu' },
        position: { x: 1.2, y: 0.4, z: 0 },
      },
    ],
    bakedText: false,
    budgets: { maxTriangles: 60000, maxTextureBytes: 4_194_304, maxTotalBytes: 12_582_912 },
    ...overrides,
  };
}

function validManifest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    packageId: 'sharing-tide-0.1.0',
    storyId: 'the-sharing-tide',
    storyVersion: '0.1.0',
    builder: { blender: '5.2.0', builderSha: 'b'.repeat(7), styleSha: 'c'.repeat(7), seed: 7 },
    scenes: [validScene()],
    totalBytes: 1_000_000,
    ...overrides,
  };
}

describe('3D package contract', () => {
  it('accepts a complete scene with pivot, tap targets, and budgets', () => {
    expect(sceneSchema.safeParse(validScene()).success).toBe(true);
  });

  it('rejects a scene without a pivot or with baked text', () => {
    const { pivot: _dropped, ...withoutPivot } = validScene();
    expect(sceneSchema.safeParse(withoutPivot).success).toBe(false);
    expect(sceneSchema.safeParse(validScene({ bakedText: true })).success).toBe(false);
  });

  it('rejects non-GLB scenes and non-KTX2 textures', () => {
    expect(sceneSchema.safeParse(validScene({ glb: 'assets/3d/dock.usdz' })).success).toBe(false);
    expect(
      sceneSchema.safeParse({
        ...validScene(),
        textures: [{ id: 'x', src: 'assets/3d/x.png', width: 64, height: 64 }],
      }).success,
    ).toBe(false);
  });

  it('requires localized tap target labels', () => {
    expect(
      sceneSchema.safeParse({
        ...validScene(),
        tapTargets: [{ id: 'boat', label: { en: 'Climb aboard' }, position: { x: 0, y: 0, z: 0 } }],
      }).success,
    ).toBe(false);
  });

  it('accepts a versioned manifest with builder provenance', () => {
    expect(packageManifestSchema.safeParse(validManifest()).success).toBe(true);
  });

  it('rejects bad versions, hashes, and empty scene lists', () => {
    expect(packageManifestSchema.safeParse(validManifest({ storyVersion: '0.1' })).success).toBe(
      false,
    );
    expect(packageManifestSchema.safeParse({ ...validScene(), sha256: 'xyz' }).success).toBe(false);
    expect(packageManifestSchema.safeParse(validManifest({ scenes: [] })).success).toBe(false);
  });

  it('tracks readiness with missing and failed assets', () => {
    expect(
      packageReadinessSchema.safeParse({
        ready: false,
        packageId: 'sharing-tide-0.1.0',
        storyVersion: '0.1.0',
        missingAssets: ['assets/3d/boat.glb'],
        failedHashes: [],
      }).success,
    ).toBe(true);
  });
});
