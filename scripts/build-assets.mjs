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
try {
  const { stdout } = await execFileAsync('python', ['--version']);
  console.log(`build:assets: found ${stdout.split('\n')[0]}`);
} catch {
  console.error(
    'build:assets: FAILED — `python` is not on PATH. ' +
      'Install Python 3 (see tech-stack.md) and retry.',
  );
  process.exit(1);
}

const seedArg = process.argv.indexOf('--seed');
const seed = seedArg === -1 ? '7' : (process.argv[seedArg + 1] ?? '7');
console.log(`build:assets: running headless pipeline (seed ${seed}).`);
try {
  const { stdout } = await execFileAsync('python', [
    join(process.cwd(), 'tools', 'build_all.py'),
    '--seed',
    seed,
  ]);
  console.log(stdout);
} catch (error) {
  console.error(`build:assets: FAILED — headless pipeline failed.\n${error.stdout ?? error}`);
  process.exit(1);
}
console.log('build:assets: packages built — run pnpm validate:assets.');
