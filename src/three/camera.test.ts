import { describe, expect, it } from 'vitest';
import type { StyleBible } from '../scene/styleBible.js';
import { BEAT_PUSH, type CameraPose, layoutCamera, poseForBeat } from './camera.js';

const bible = {
  cameras: {
    'ipad-landscape': {
      fov: 40,
      position: [0, 3.2, 7.5],
      target: [0, 1.0, 0],
    },
    'phone-portrait': {
      fov: 50,
      position: [0, 2.6, 6.0],
      target: [0, 1.2, 0],
    },
  },
} as unknown as StyleBible;

const rest: CameraPose = {
  fov: 40,
  position: [0, 3.2, 7.5],
  target: [0, 1.0, 0],
};

describe('layoutCamera', () => {
  it('returns the bible pose for the requested layout', () => {
    expect(layoutCamera(bible, 'ipad-landscape')).toEqual(rest);
    expect(layoutCamera(bible, 'phone-portrait')).toEqual({
      fov: 50,
      position: [0, 2.6, 6.0],
      target: [0, 1.2, 0],
    });
  });
});

describe('poseForBeat', () => {
  it('holds the rest pose when there is no beat (reduced motion)', () => {
    expect(poseForBeat(rest, null)).toEqual(rest);
  });

  it('pushes the camera toward the target on arrive and return beats', () => {
    for (const beat of ['arrive', 'return'] as const) {
      const pose = poseForBeat(rest, beat);
      expect(pose.fov).toBe(rest.fov);
      expect(pose.target).toEqual(rest.target);
      // 10% of the way from position to target, mirroring render_previews.py.
      for (const axis of [0, 1, 2] as const) {
        const expected =
          rest.position[axis] + (rest.target[axis] - rest.position[axis]) * BEAT_PUSH;
        expect(pose.position[axis]).toBeCloseTo(expected, 10);
      }
    }
  });

  it('pins the push factor at 10% to match the preview pipeline', () => {
    expect(BEAT_PUSH).toBe(0.1);
  });
});
