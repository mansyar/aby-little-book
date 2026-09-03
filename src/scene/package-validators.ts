import type { Diagnostic } from '../story/validators';
import type { PackageManifest, PackageReadiness, Scene, Vec3 } from './package';

// Package rules the Zod schemas cannot express: budgets against actuals,
// pivot containment, tap-target uniqueness, and story/manifest agreement.
// Build-time only; diagnostics never reach child-facing UI.

function error(code: string, message: string): Diagnostic {
  return { severity: 'error', code, message };
}

function withinBounds(point: Vec3, scene: Scene): boolean {
  const { min, max } = scene.bounds;
  return (
    point.x >= min.x &&
    point.x <= max.x &&
    point.y >= min.y &&
    point.y <= max.y &&
    point.z >= min.z &&
    point.z <= max.z
  );
}

function validateScene(scene: Scene): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (scene.triangles > scene.budgets.maxTriangles) {
    diagnostics.push(
      error(
        'scene-over-triangles',
        `Scene ${scene.id} uses ${scene.triangles} triangles; budget is ${scene.budgets.maxTriangles}.`,
      ),
    );
  }
  if (!withinBounds(scene.pivot, scene)) {
    diagnostics.push(
      error('pivot-out-of-bounds', `Scene ${scene.id} pivot lies outside its bounds.`),
    );
  }
  const seen = new Set<string>();
  for (const target of scene.tapTargets) {
    if (seen.has(target.id)) {
      diagnostics.push(
        error('tap-duplicate', `Scene ${scene.id} repeats tap target ${target.id}.`),
      );
    }
    seen.add(target.id);
  }
  return diagnostics;
}

export function validatePackage(
  manifest: PackageManifest,
  story: { id: string; version: string },
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (manifest.storyId !== story.id || manifest.storyVersion !== story.version) {
    diagnostics.push(
      error(
        'package-story-mismatch',
        `Package ${manifest.packageId} targets ${manifest.storyId}@${manifest.storyVersion} but story is ${story.id}@${story.version}.`,
      ),
    );
  }
  const budget = manifest.scenes.reduce((sum, scene) => sum + scene.budgets.maxTotalBytes, 0);
  if (manifest.totalBytes > budget) {
    diagnostics.push(
      error(
        'package-over-budget',
        `Package ${manifest.packageId} declares ${manifest.totalBytes} bytes; budget is ${budget}.`,
      ),
    );
  }
  for (const scene of manifest.scenes) {
    diagnostics.push(...validateScene(scene));
  }
  return diagnostics;
}

export function validateReadiness(readiness: PackageReadiness): Diagnostic[] {
  if (
    readiness.ready &&
    (readiness.missingAssets.length > 0 || readiness.failedHashes.length > 0)
  ) {
    return [
      error(
        'readiness-inconsistent',
        'A ready package cannot have missing assets or failed hashes.',
      ),
    ];
  }
  return [];
}
