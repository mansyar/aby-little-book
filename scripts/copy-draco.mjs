// Copies the Draco decoder (JS + WASM) shipped inside the three npm package
// into public/draco/ so it is served and precached with the app shell.
// Remote decoder URLs are forbidden (local-only/offline rule); the files are
// build artifacts — public/draco/ is gitignored and regenerated here.
// Runs as the root `postinstall` script (fresh installs, CI, Docker builds,
// and three upgrades all flow through install).
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// node_modules/three is a (pnpm-symlinked) directory, so plain path joins
// work even though the package's exports map hides its package.json.
const dracoDir = join(root, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco');
const outDir = join(root, 'public', 'draco');
mkdirSync(outDir, { recursive: true });
for (const file of ['draco_decoder.js', 'draco_decoder.wasm']) {
  copyFileSync(join(dracoDir, file), join(outDir, file));
  console.log(`[copy-draco] ${file} -> public/draco/`);
}
