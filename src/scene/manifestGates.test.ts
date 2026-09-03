import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateBibleAlignment } from './bibleAlignment';
import { packageManifestSchema } from './package';
import { validatePackage } from './package-validators';
import { styleBibleSchema } from './styleBible';

const ROOT = join(__dirname, '..', '..');
const STORY = { id: 'the-sharing-tide', version: '0.1.0' };

function validScene(overrides: Record<string, unknown> = {}) {
  return {
    id: 'dock',
    glb: 'glb/dock.glb',
    sha256: 'a'.repeat(64),
    triangles: 120,
    pivot: { x: 0, y: 0, z: 0 },
    bounds: {
      min: { x: -5, y: -1, z: -5 },
      max: { x: 5, y: 3, z: 5 },
    },
    textures: [],
    tapTargets: [
      {
        id: 'boat',
        label: { en: 'Board the boat', id: 'Naiki perahu' },
        position: { x: 0, y: 1, z: 0 },
      },
    ],
    bakedText: false,
    budgets: {
      maxTriangles: 30000,
      maxTextureBytes: 4000000,
      maxTotalBytes: 2000000,
    },
    ...overrides,
  };
}

function validManifest(overrides: Record<string, unknown> = {}) {
  return {
    packageId: 'dock-slice-0.1.0',
    storyId: 'the-sharing-tide',
    storyVersion: '0.1.0',
    builder: { blender: '5.2.0', builderSha: 'abc123', styleSha: 'def456', seed: 7 },
    scenes: [validScene()],
    totalBytes: 1024,
    ...overrides,
  };
}

function bible() {
  return styleBibleSchema.parse(
    JSON.parse(readFileSync(join(ROOT, 'art', 'style-bible.json'), 'utf8')),
  );
}

describe('manifest auto-review gates', () => {
  it('accepts a schema-conformant manifest with zero package diagnostics', () => {
    const parsed = packageManifestSchema.safeParse(validManifest());
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(validatePackage(parsed.data, STORY)).toEqual([]);
    expect(validateBibleAlignment(parsed.data, bible())).toEqual([]);
  });

  it('rejects scene budgets that exceed the style bible', () => {
    const overTriangles = packageManifestSchema.parse(
      validManifest({
        scenes: [
          validScene({
            budgets: { maxTriangles: 30001, maxTextureBytes: 4000000, maxTotalBytes: 2000000 },
          }),
        ],
      }),
    );
    expect(
      validateBibleAlignment(overTriangles, bible()).map((diagnostic) => diagnostic.code),
    ).toContain('scene-budget-exceeds-bible');

    const overBytes = packageManifestSchema.parse(validManifest({ totalBytes: 12582913 }));
    expect(
      validateBibleAlignment(overBytes, bible()).map((diagnostic) => diagnostic.code),
    ).toContain('package-bytes-exceed-bible');
  });

  it('rejects a manifest whose scene bakes text into art', () => {
    expect(
      packageManifestSchema.safeParse(validManifest({ scenes: [validScene({ bakedText: true })] }))
        .success,
    ).toBe(false);
  });

  it('every produced package in art/manifest passes schema, package, and bible gates', () => {
    const dir = join(ROOT, 'art', 'manifest');
    if (!existsSync(dir)) return;
    const files = readdirSync(dir).filter((file) => file.endsWith('.json'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const parsed = packageManifestSchema.safeParse(
        JSON.parse(readFileSync(join(dir, file), 'utf8')),
      );
      expect(parsed.success, `${file} must satisfy the package schema`).toBe(true);
      if (!parsed.success) continue;
      expect(validatePackage(parsed.data, STORY), `${file} package rules`).toEqual([]);
      expect(validateBibleAlignment(parsed.data, bible()), `${file} bible alignment`).toEqual([]);
    }
  });
});

describe('preview pipeline contract', () => {
  it('render_previews.py renders Eevee rest/response previews per layout from bible cameras', () => {
    const source = readFileSync(join(ROOT, 'tools', 'render_previews.py'), 'utf8');
    for (const step of [
      'BLENDER_EEVEE',
      'rest',
      'response',
      'ipad-landscape',
      'phone-portrait',
      'style-bible.json',
    ]) {
      expect(source).toContain(step);
    }
  });
});
