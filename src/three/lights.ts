import { AmbientLight, DirectionalLight, Group } from 'three';
import type { StyleBible } from '../scene/styleBible.js';

// Bible light rig for the hybrid renderer: key/fill/rim directionals plus
// ambient, mirroring light_subject() in tools/render_previews.py so browser
// frames match the approved Eevee previews. Directional lights (no falloff)
// keep the look deterministic across layouts.

// Deterministic rig directions: key high front-left, fill low front-right,
// rim behind. Positions scale with the subject, fixed here for the slice.
const RIG_DIRECTIONS = [
  [4, 6, 5],
  [-3, 1.5, 4],
  [0, 4, -5],
] as const;

export function buildLights(bible: StyleBible): {
  group: Group;
  background: string;
} {
  const group = new Group();
  const rig = [bible.lightRig.key, bible.lightRig.fill, bible.lightRig.rim];
  rig.forEach((lamp, index) => {
    const light = new DirectionalLight(lamp.color, lamp.energy);
    const direction = RIG_DIRECTIONS[index] as readonly [number, number, number];
    light.position.set(direction[0], direction[1], direction[2]);
    group.add(light);
  });
  group.add(new AmbientLight(bible.lightRig.ambient));
  return { group, background: bible.palette.nightSky as string };
}
