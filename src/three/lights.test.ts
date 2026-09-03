import type { DirectionalLight } from 'three';
import { describe, expect, it } from 'vitest';
import type { StyleBible } from '../scene/styleBible.js';
import { buildLights } from './lights.js';

const bible = {
  palette: { nightSky: '#0a1830' },
  lightRig: {
    key: { color: '#dfeaff', energy: 3.0 },
    fill: { color: '#ffb45e', energy: 1.2 },
    rim: { color: '#7fb2ff', energy: 0.8 },
    ambient: '#16263f',
  },
} as unknown as StyleBible;

describe('buildLights', () => {
  it('builds the bible key/fill/rim rig plus ambient', () => {
    const { group, background } = buildLights(bible);
    // 3 directionals + 1 ambient.
    expect(group.children).toHaveLength(4);
    expect(background).toBe('#0a1830');
  });

  it('matches the bible colors and energies', () => {
    const { group } = buildLights(bible);
    const lights = group.children as DirectionalLight[];
    const at = (index: number): DirectionalLight => lights[index] as DirectionalLight;
    const key = at(0);
    const fill = at(1);
    const rim = at(2);
    expect(key.color.getHexString()).toBe('dfeaff');
    expect(key.intensity).toBe(3.0);
    expect(fill.color.getHexString()).toBe('ffb45e');
    expect(fill.intensity).toBe(1.2);
    expect(rim.color.getHexString()).toBe('7fb2ff');
    expect(rim.intensity).toBe(0.8);
  });
});
