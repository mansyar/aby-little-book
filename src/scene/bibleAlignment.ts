import type { Diagnostic } from '../story/validators';
import type { PackageManifest } from './package';
import type { StyleBible } from './styleBible';

// Bible alignment: a produced package must fit inside the style bible's
// budgets. The bible owns every numeric envelope so the auto-review gate has
// one source of truth; per-scene budgets in a manifest may be tighter but
// never looser. Build-time only; diagnostics never reach child-facing UI.

function error(code: string, message: string): Diagnostic {
  return { severity: 'error', code, message };
}

export function validateBibleAlignment(manifest: PackageManifest, bible: StyleBible): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const scene of manifest.scenes) {
    if (scene.budgets.maxTriangles > bible.budgets.maxTrianglesPerScene) {
      diagnostics.push(
        error(
          'scene-budget-exceeds-bible',
          `Scene ${scene.id} budgets ${scene.budgets.maxTriangles} triangles; bible allows ${bible.budgets.maxTrianglesPerScene}.`,
        ),
      );
    }
    if (scene.budgets.maxTextureBytes > bible.budgets.maxTextureBytes) {
      diagnostics.push(
        error(
          'scene-budget-exceeds-bible',
          `Scene ${scene.id} budgets ${scene.budgets.maxTextureBytes} texture bytes; bible allows ${bible.budgets.maxTextureBytes}.`,
        ),
      );
    }
    if (scene.budgets.maxTotalBytes > bible.budgets.maxSceneBytes) {
      diagnostics.push(
        error(
          'scene-budget-exceeds-bible',
          `Scene ${scene.id} budgets ${scene.budgets.maxTotalBytes} total bytes; bible allows ${bible.budgets.maxSceneBytes}.`,
        ),
      );
    }
  }
  if (manifest.totalBytes > bible.budgets.maxPackageBytes) {
    diagnostics.push(
      error(
        'package-bytes-exceed-bible',
        `Package ${manifest.packageId} declares ${manifest.totalBytes} bytes; bible allows ${bible.budgets.maxPackageBytes}.`,
      ),
    );
  }
  return diagnostics;
}
