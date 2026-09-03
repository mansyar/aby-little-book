import { type PerspectiveCamera, Vector3 } from 'three';
import type { TapTarget } from '../scene/package.js';

// Hotspot anchoring for guided taps. Manifest tap targets live in 3D scene
// space; these pure helpers project them to screen pixels (so DOM hit targets
// can sit exactly over the 3D subject) and resolve touches to target ids.
// No WebGL context is needed — camera math only.

export type ProjectedTarget = {
  id: string;
  x: number;
  y: number;
  visible: boolean;
};

const _point = new Vector3();

export function projectTapTargets(
  camera: PerspectiveCamera,
  width: number,
  height: number,
  targets: TapTarget[],
): ProjectedTarget[] {
  // Poses are set imperatively between renders, so refresh the world matrices
  // here — otherwise projection uses a stale (often identity) inverse.
  camera.updateMatrixWorld();
  return targets.map((target) => {
    _point.set(target.position.x, target.position.y, target.position.z);
    _point.project(camera);
    const behind = _point.z > 1;
    return {
      id: target.id,
      x: ((_point.x + 1) / 2) * width,
      y: ((1 - _point.y) / 2) * height,
      visible: !behind,
    };
  });
}

/**
 * Resolve a touch (CSS pixels, same space as projectTapTargets output) to the
 * nearest visible target within the touch radius. Returns null for empty
 * water — a miss never navigates, the guided engine ignores it.
 */
export function pickTapTarget(
  projected: ProjectedTarget[],
  x: number,
  y: number,
  radiusPx: number,
): string | null {
  let best: string | null = null;
  let bestDistance = radiusPx;
  for (const target of projected) {
    if (!target.visible) {
      continue;
    }
    const distance = Math.hypot(target.x - x, target.y - y);
    if (distance <= bestDistance) {
      best = target.id;
      bestDistance = distance;
    }
  }
  return best;
}
