import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const MANIFEST_DIR = join(process.cwd(), 'art', 'manifest');

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
for (const name of manifestFiles) {
  const path = join(MANIFEST_DIR, name);
  try {
    JSON.parse(await readFile(path, 'utf8'));
    console.log(`validate:assets: ${name}: valid JSON.`);
  } catch (error) {
    failed = true;
    console.error(`validate:assets: ${name}: invalid JSON — ${error.message}`);
  }
}

if (failed) {
  console.error('validate:assets: FAILED — fix or remove the invalid manifests above.');
  process.exit(1);
}
console.log(`validate:assets: ${manifestFiles.length} manifest(s) parsed.`);
