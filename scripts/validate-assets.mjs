import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.env.ASSET_ROOT ?? join(process.cwd(), 'art');
const MANIFEST_DIR = join(ROOT, 'manifest');

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const entries = await readdir(MANIFEST_DIR, { withFileTypes: true }).catch((error) => {
  if (error?.code === 'ENOENT') return [];
  throw error;
});
const manifestFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
  .map((entry) => entry.name);

if (manifestFiles.length === 0) {
  console.log('validate:assets: no 3D packages yet — skipping (slice packages land in Phase 4/5).');
  process.exit(0);
}

let failed = false;
const fail = (name, message) => {
  failed = true;
  console.error(`validate:assets: ${name}: ${message}`);
};

async function readAsset(name, rel) {
  try {
    return await readFile(join(ROOT, rel));
  } catch {
    fail(name, `missing file ${rel}`);
    return null;
  }
}

for (const name of manifestFiles) {
  const path = join(MANIFEST_DIR, name);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(name, `invalid JSON — ${error.message}`);
    continue;
  }
  const id = manifest.packageId ?? name;
  let bytes = 0;
  let scenes = 0;
  const seen = new Set();
  const countBytes = (rel, data) => {
    if (!seen.has(rel)) {
      seen.add(rel);
      bytes += data.length;
    }
  };
  if (!Array.isArray(manifest.scenes)) {
    fail(name, 'manifest needs a scenes array');
    continue;
  }
  for (const scene of manifest.scenes) {
    scenes += 1;
    const tag = `${id}/${scene.sceneId ?? 'scene'}`;
    const data = await readAsset(name, scene.source);
    if (data === null) continue;
    countBytes(scene.source, data);
    if (sha256(data) !== scene.sha256) {
      fail(name, `${tag}: hash mismatch for ${scene.source}`);
    }
    if (typeof scene.triangles !== 'number' || scene.triangles > scene.maxTriangles) {
      fail(name, `${tag}: over triangle budget`);
    }
    if (scene.bakedText !== false) {
      fail(name, `${tag}: baked text is forbidden`);
    }
    if (!Array.isArray(scene.pivot) || scene.pivot.length !== 3) {
      fail(name, `${tag}: pivot must be a 3-number vector`);
    }
    for (const texture of scene.textures ?? []) {
      const pixels = await readAsset(name, texture.src);
      if (pixels === null) continue;
      countBytes(texture.src, pixels);
      if (texture.sha256 !== undefined && sha256(pixels) !== texture.sha256) {
        fail(name, `${tag}: hash mismatch for ${texture.src}`);
      }
    }
  }
  if (manifest.totalBytes !== bytes) {
    fail(name, `${id}: byte total mismatch (manifest ${manifest.totalBytes}, found ${bytes})`);
  }
  if (!failed) {
    console.log(`validate:assets: ${id}: verified ${scenes} scene(s), ${bytes} byte(s).`);
  }
}

if (failed) {
  console.error('validate:assets: FAILED — fix or remove the invalid packages above.');
  process.exit(1);
}
console.log(`validate:assets: ${manifestFiles.length} manifest(s) verified.`);
