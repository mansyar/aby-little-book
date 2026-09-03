import { describe, expect, it } from 'vitest';
import type { PackageManifest, PackageReadiness, Scene } from './package';
import { validatePackage, validateReadiness } from './package-validators';

function validScene(): Scene {
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
    budgets: { maxTriangles: 60000, maxTextureBytes: 4194304, maxTotalBytes: 12582912 },
  };
}

function validManifest(): PackageManifest {
  return {
    packageId: 'sharing-tide-0.1.0',
    storyId: 'the-sharing-tide',
    storyVersion: '0.1.0',
    builder: { blender: '5.2.0', builderSha: 'b'.repeat(7), styleSha: 'c'.repeat(7), seed: 7 },
    scenes: [validScene()],
    totalBytes: 1000000,
  };
}

function validReadiness(): PackageReadiness {
  return {
    ready: true,
    packageId: 'sharing-tide-0.1.0',
    storyVersion: '0.1.0',
    missingAssets: [],
    failedHashes: [],
  };
}

const storyVersion = { id: 'the-sharing-tide', version: '0.1.0' };

describe('3D package validators', () => {
  it('accepts a within-budget package that matches its story', () => {
    expect(validatePackage(validManifest(), storyVersion)).toEqual([]);
    expect(validateReadiness(validReadiness())).toEqual([]);
  });

  it('rejects scenes over their triangle budget', () => {
    const manifest = validManifest();
    const scene = manifest.scenes[0];
    if (scene !== undefined) {
      scene.triangles = 60001;
    }
    expect(validatePackage(manifest, storyVersion).map((d) => d.code)).toContain(
      'scene-over-triangles',
    );
  });

  it('rejects packages over the summed byte budget', () => {
    const manifest = validManifest();
    manifest.totalBytes = 12582913;
    expect(validatePackage(manifest, storyVersion).map((d) => d.code)).toContain(
      'package-over-budget',
    );
  });

  it('rejects duplicate tap targets and pivots outside bounds', () => {
    const manifest = validManifest();
    const scene = manifest.scenes[0];
    if (scene !== undefined) {
      const target = scene.tapTargets[0];
      if (target !== undefined) {
        scene.tapTargets = [target, { ...target }];
      }
      scene.pivot = { x: 99, y: 0.5, z: 0 };
    }
    const codes = validatePackage(manifest, storyVersion).map((d) => d.code);
    expect(codes).toContain('tap-duplicate');
    expect(codes).toContain('pivot-out-of-bounds');
  });

  it('rejects manifests that mismatch the story version', () => {
    const codes = validatePackage(validManifest(), {
      id: 'the-sharing-tide',
      version: '0.2.0',
    }).map((d) => d.code);
    expect(codes).toContain('package-story-mismatch');
  });

  it('rejects ready packages with missing or failed assets', () => {
    const codes = validateReadiness({
      ...validReadiness(),
      missingAssets: ['assets/3d/boat.glb'],
    }).map((d) => d.code);
    expect(codes).toContain('readiness-inconsistent');
  });
});
