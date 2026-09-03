import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const ROOT = join(__dirname, '..', '..');

type RunResult = { code: number; stdout: string; stderr: string };

async function runScript(name: string, env: Record<string, string> = {}): Promise<RunResult> {
  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [join(ROOT, 'scripts', name)],
      { env: { ...process.env, ...env } },
    );
    return { code: 0, stdout, stderr };
  } catch (error) {
    const err = error as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  }
}

const sha256 = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');

function writeFixture(tamper: boolean): string {
  const root = mkdtempSync(join(tmpdir(), 'aby-assets-'));
  mkdirSync(join(root, 'manifest'), { recursive: true });
  mkdirSync(join(root, 'glb'), { recursive: true });
  mkdirSync(join(root, 'ktx'), { recursive: true });
  const model = Buffer.from('fake-glb-bytes-dock');
  const texture = Buffer.from('fake-ktx2-bytes-water');
  writeFileSync(join(root, 'glb', 'dock.glb'), tamper ? Buffer.from('tampered!') : model);
  writeFileSync(join(root, 'ktx', 'water.ktx2'), texture);
  const manifest = {
    packageId: 'test-pack',
    storyId: 'the-sharing-tide',
    storyVersion: '0.1.0',
    totalBytes: model.length + texture.length,
    scenes: [
      {
        sceneId: 'dock',
        source: 'glb/dock.glb',
        sha256: sha256(model),
        triangles: 120,
        maxTriangles: 30000,
        pivot: [0, 0, 0],
        bakedText: false,
        textures: [{ src: 'ktx/water.ktx2', sha256: sha256(texture) }],
      },
    ],
  };
  writeFileSync(join(root, 'manifest', 'test-pack.json'), JSON.stringify(manifest));
  return root;
}

describe('asset scripts', () => {
  it('build-assets refuses without Blender even when builders exist', async () => {
    const result = await runScript('build-assets.mjs', { PATH: '' });
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/not on PATH/);
  });

  it('validate-assets verifies a correct package byte-for-byte', async () => {
    const result = await runScript('validate-assets.mjs', {
      ASSET_ROOT: writeFixture(false),
    });
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/verified/);
  });

  it('validate-assets rejects tampered bytes', async () => {
    const result = await runScript('validate-assets.mjs', {
      ASSET_ROOT: writeFixture(true),
    });
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/hash mismatch/);
  });
});

describe('headless pipeline contract', () => {
  const tools = join(ROOT, 'tools');

  it('build_all.py drives background Blender, Draco, KTX2, and the manifest', () => {
    const source = readFileSync(join(tools, 'build_all.py'), 'utf8');
    for (const step of [
      '--background',
      'gltf-transform',
      'draco',
      'ktx',
      'sha256',
      'builderSha',
      'styleSha',
      'seed',
    ]) {
      expect(source).toContain(step);
    }
  });

  it('export_glb.py exports Draco-ready glTF from a .blend', () => {
    const source = readFileSync(join(tools, 'export_glb.py'), 'utf8');
    expect(source).toContain('export_scene.gltf');
  });
});
