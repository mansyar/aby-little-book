import { describe, expect, it } from 'vitest';
import { storySchema } from './dock-contracts';
import { validateDockRouteGraph } from './dock-validators';
import { sharingTide } from './sharingTide';

const EXPECTED_IDS = ['S01', 'S02', 'S03', 'S04', 'A05', 'A06', 'B05', 'B06', 'S08', 'S10'];

describe('The Sharing Tide (full 10-spread story)', () => {
  it('parses as a valid story', () => {
    expect(storySchema.safeParse(sharingTide).success).toBe(true);
  });

  it('holds exactly the ten planned spreads', () => {
    expect(Object.keys(sharingTide.spreads).sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it('pins start, choice, convergence, and ending spreads', () => {
    expect(sharingTide.startSpreadId).toBe('S01');
    expect(sharingTide.choiceSpreadId).toBe('S04');
    expect(sharingTide.convergenceSpreadId).toBe('S08');
    expect(sharingTide.endingSpreadId).toBe('S10');
  });

  it('requires the route choice at S04 before either route opens', () => {
    expect(sharingTide.spreads.S04?.interaction).toMatchObject({
      kind: 'route-choice',
      required: true,
    });
  });

  it('runs two complete routes that converge and share the ending', () => {
    expect(sharingTide.routes).toEqual([
      {
        id: 'reed-channel',
        title: { en: 'Reed Channel', id: 'Jalur Gelagah' },
        spreadIds: ['S04', 'A05', 'A06', 'S08', 'S10'],
      },
      {
        id: 'lily-cove',
        title: { en: 'Lily Cove', id: 'Teluk Teratai' },
        spreadIds: ['S04', 'B05', 'B06', 'S08', 'S10'],
      },
    ]);
  });

  it('passes the route-graph validators with no diagnostics', () => {
    expect(validateDockRouteGraph(sharingTide)).toEqual([]);
  });
});
