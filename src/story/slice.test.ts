import { describe, expect, it } from 'vitest';
import { spreadSchema } from './dock-contracts';
import { slice, sliceMeta } from './slice';

describe('3-spread slice prose', () => {
  it('ships three versioned spreads with no placeholders', () => {
    expect(sliceMeta.storyId).toBe('the-sharing-tide');
    expect(sliceMeta.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(slice.map((spread) => spread.id)).toEqual(['S01', 'S02', 'S03']);
    for (const spread of slice) {
      expect(spreadSchema.safeParse(spread).success).toBe(true);
    }
  });

  it('boards at the dock, meets the turtle, then shares', () => {
    expect(slice[0]?.interaction).toEqual({ kind: 'board', target: 'boat', required: true });
    expect(slice[1]?.interaction).toBeUndefined();
    expect(slice[2]?.interaction).toEqual({ kind: 'tap', target: 'cake', required: false });
  });
});
