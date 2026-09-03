import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import type { TapTarget } from '../scene/package.js';
import { type ProjectedTarget, pickTapTarget, projectTapTargets } from './hotspots.js';

function testCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera(40, 4 / 3, 0.1, 100);
  camera.position.set(0, 3.2, 7.5);
  camera.lookAt(new Vector3(0, 1.0, 0));
  return camera;
}

const boatTarget: TapTarget = {
  id: 'boat',
  label: { en: 'Board the boat', id: 'Naiki perahu' },
  position: { x: 0, y: 1.0, z: 0 },
};

const lanternTarget: TapTarget = {
  id: 'lantern',
  label: { en: 'Light the lantern', id: 'Nyalakan lentera' },
  position: { x: 2, y: 1.0, z: 0 },
};

const targets: TapTarget[] = [boatTarget, lanternTarget];

describe('projectTapTargets', () => {
  it('projects targets to pixel positions inside the viewport', () => {
    const projected = projectTapTargets(testCamera(), 800, 600, targets);
    expect(projected).toHaveLength(2);
    for (const p of projected) {
      expect(p.visible).toBe(true);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(800);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(600);
    }
  });

  it('centers a target sitting on the look-at point', () => {
    const projected = projectTapTargets(testCamera(), 800, 600, [boatTarget]);
    expect(projected).toHaveLength(1);
    const boat = projected[0] as ProjectedTarget;
    expect(boat.x).toBeCloseTo(400, 0);
    expect(boat.y).toBeCloseTo(300, 0);
  });

  it('marks targets behind the camera as not visible', () => {
    const behind: TapTarget[] = [
      {
        id: 'moon',
        label: { en: 'Moon', id: 'Bulan' },
        position: { x: 0, y: 3.2, z: 20 },
      },
    ];
    const projected = projectTapTargets(testCamera(), 800, 600, behind);
    expect(projected).toHaveLength(1);
    const moon = projected[0] as ProjectedTarget;
    expect(moon.visible).toBe(false);
  });
});

describe('pickTapTarget', () => {
  const projected: ProjectedTarget[] = [
    { id: 'boat', x: 400, y: 300, visible: true },
    { id: 'lantern', x: 600, y: 300, visible: true },
    { id: 'moon', x: 100, y: 100, visible: false },
  ];

  it('picks the nearest target within the touch radius', () => {
    expect(pickTapTarget(projected, 410, 305, 48)).toBe('boat');
  });

  it('returns null when the touch lands on empty water', () => {
    expect(pickTapTarget(projected, 100, 500, 48)).toBeNull();
  });

  it('never picks a target that is not visible', () => {
    expect(pickTapTarget(projected, 100, 100, 48)).toBeNull();
  });
});
