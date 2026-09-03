// Publishes versioned 3D story packages into a servable static root.
// Reads art/manifest/*.json and copies each scene GLB (and any texture
// payload) to <out>/stories/<packageId>/<src>, so the URLs the app prepares
// (/stories/<packageId>/glb/*.glb), the service worker serves offline, and
// the reader loads all resolve against static files. Runs twice: as
// `predev` with out=public (the dev server serves public/, never dist/ —
// without this, dev falls back to index.html for GLB URLs and GLTFLoader
// fails parsing the HTML as JSON) and as `postbuild` with out=dist.
// Fails loudly on a missing payload so images never ship half a package.
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_DIR = join(ROOT, 'art', 'manifest');
const GLB_DIR = join(ROOT, 'art', 'glb');
const OUT = join(ROOT, process.argv[2] ?? 'dist');

function publish(manifestPath) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const packageDir = join(OUT, 'stories', manifest.packageId);
  let bytes = 0;
  for (const scene of manifest.scenes ?? []) {
    const sources = [scene.glb, ...(scene.textures ?? []).map((texture) => texture.src)];
    for (const src of sources) {
      const from = src.startsWith('glb/')
        ? join(GLB_DIR, src.slice('glb/'.length))
        : join(ROOT, 'art', src);
      const to = join(packageDir, src);
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(from, to);
      bytes += statSync(to).size;
    }
  }
  console.log(
    `[copy-package] ${manifest.packageId}: published ${bytes} byte(s) to stories/${manifest.packageId}/`,
  );
}

const manifests = readdirSync(MANIFEST_DIR).filter((file) => file.endsWith('.json'));
if (manifests.length === 0) {
  console.log('[copy-package] no manifests in art/manifest/ — nothing to publish.');
} else {
  for (const file of manifests) {
    publish(join(MANIFEST_DIR, file));
  }
}
