import { execFile } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const BUILDERS_DIR = join(process.cwd(), 'art', 'builders');

const entries = await readdir(BUILDERS_DIR, { withFileTypes: true }).catch((error) => {
  if (error?.code === 'ENOENT') return [];
  throw error;
});
const builders = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.py'))
  .map((entry) => entry.name);

if (builders.length === 0) {
  console.log('build:assets: no builders yet — nothing to build (builders land in Phase 4).');
  process.exit(0);
}

try {
  const { stdout } = await execFileAsync('blender', ['--version']);
  console.log(`build:assets: found ${stdout.split('\n')[0]}`);
} catch {
  console.error(
    'build:assets: FAILED — versioned builders exist but `blender` is not on PATH. ' +
      'Install Blender 5.2.0 LTS (see tech-stack.md) and retry.',
  );
  process.exit(1);
}
console.log('build:assets: headless export jobs land in Phase 4 — no packages built yet.');
