import type { StyleBible } from '../scene/styleBible.js';

// Beat labels produced by cameraBeatFor() in the guided engine: 'arrive' for
// forward moves, 'return' for back moves, null when reduced motion (or no
// transition) holds the rest pose.
export type CameraBeat = 'arrive' | 'return';

// Camera poses for the hybrid slice renderer. Poses come from the style bible
// (the same values the preview pipeline frames with), and the response pose
// pushes 10% toward the target — mirroring response_position() in
// tools/render_previews.py so browser captures match the approved previews.

export type LayoutId = keyof StyleBible['cameras'];

export type CameraPose = {
  fov: number;
  position: [number, number, number];
  target: [number, number, number];
};

/** Fraction of the way from rest position to target for response beats. */
export const BEAT_PUSH = 0.1;

export function layoutCamera(bible: StyleBible, layout: LayoutId): CameraPose {
  const camera = bible.cameras[layout];
  return {
    fov: camera.fov,
    position: [...camera.position],
    target: [...camera.target],
  };
}

/**
 * Resolve the pose for a camera beat. A null beat (reduced motion, or no
 * transition) holds the rest pose; arrive/return beats push gently toward the
 * subject. Callers feed cameraBeatFor() from the guided engine here.
 */
export function poseForBeat(rest: CameraPose, beat: CameraBeat | null): CameraPose {
  if (beat === null) {
    return rest;
  }
  const [px, py, pz] = rest.position;
  const [tx, ty, tz] = rest.target;
  return {
    fov: rest.fov,
    position: [px + (tx - px) * BEAT_PUSH, py + (ty - py) * BEAT_PUSH, pz + (tz - pz) * BEAT_PUSH],
    target: [...rest.target],
  };
}
