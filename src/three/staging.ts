// Slice staging: which 3D scenes share the canvas for each spread, and how
// many spreads stay mounted. Composition is deterministic and authored here
// (offsets in scene meters); Playwright rest/response captures prove it.

export type StagedScene = {
  sceneId: string;
  offset: [number, number, number];
};

export const SLICE_STAGING: Record<'S01' | 'S02' | 'S03', StagedScene[]> = {
  // Lanterns on the Water — the dock with the waiting boat alongside.
  S01: [
    { sceneId: 'dock', offset: [0, 0, 0] },
    { sceneId: 'boat', offset: [2.2, 0, 0.5] },
  ],
  // A Shy New Friend — the turtle half-hidden among the lake props.
  S02: [
    { sceneId: 'lake_props', offset: [0, 0, 0] },
    { sceneId: 'turtle', offset: [0.8, 0, 0.6] },
  ],
  // Half for You — the child and the turtle face to face for the sharing.
  S03: [
    { sceneId: 'turtle', offset: [-0.8, 0, 0] },
    { sceneId: 'child', offset: [0.8, 0, 0.4] },
  ],
};

/**
 * Spreads that stay mounted: the active spread plus immediate neighbors.
 * Everything else unmounts and disposes, bounding iPad GPU memory to at most
 * three spreads regardless of story length.
 */
export function activeWindow(ids: string[], index: number): string[] {
  return ids.slice(Math.max(0, index - 1), index + 2);
}
