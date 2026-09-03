import { describe, expect, it } from 'vitest';
import bible from '../../art/style-bible.json';
import { styleBibleSchema } from './styleBible';

type MutableBible = {
  palette: Record<string, string>;
  materials: { clay: { roughness: number } };
  cameras: Record<string, unknown>;
  characters: Record<string, unknown>;
};

const clone = (): MutableBible => JSON.parse(JSON.stringify(bible)) as MutableBible;

describe('style bible', () => {
  it('accepts the checked-in Starlit Dock bible', () => {
    const parsed = styleBibleSchema.safeParse(bible);
    expect(parsed.success).toBe(true);
  });

  it('rejects non-color palette entries and out-of-range roughness', () => {
    const badColor = clone();
    badColor.palette.lanternGlow = 'warm-ish';
    expect(styleBibleSchema.safeParse(badColor).success).toBe(false);

    const badRough = clone();
    badRough.materials.clay.roughness = 1.5;
    expect(styleBibleSchema.safeParse(badRough).success).toBe(false);
  });

  it('requires both layout cameras and the turtle/child cast', () => {
    const noCamera = clone();
    delete noCamera.cameras['ipad-landscape'];
    expect(styleBibleSchema.safeParse(noCamera).success).toBe(false);

    const noTurtle = clone();
    delete noTurtle.characters.turtle;
    expect(styleBibleSchema.safeParse(noTurtle).success).toBe(false);
  });

  it('keeps budgets inside the iPad envelope and faces minimal', () => {
    const parsed = styleBibleSchema.safeParse(bible);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }
    expect(parsed.data.budgets.maxTrianglesPerScene).toBeLessThanOrEqual(50000);
    expect(parsed.data.budgets.maxPackageBytes).toBeLessThanOrEqual(20 * 1024 * 1024);
    expect(parsed.data.characters.turtle.face).toBe('beads-and-blush');
    expect(parsed.data.characters.child.face).toBe('beads-and-blush');
  });
});
