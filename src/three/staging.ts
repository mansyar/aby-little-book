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
 * Full-story staging: every spread of The Sharing Tide stages subjects from
 * the five approved package scenes. One set, many scenes — like a stage
 * play. Offsets are provisional until the Phase 6 journey captures review
 * each spread; the S01-S03 entries mirror the approved slice exactly.
 */
export type StorySpreadId =
  | 'S01'
  | 'S02'
  | 'S03'
  | 'S04'
  | 'A05'
  | 'A06'
  | 'B05'
  | 'B06'
  | 'S08'
  | 'S10';

export const STORY_STAGING: Record<StorySpreadId, StagedScene[]> = {
  S01: SLICE_STAGING.S01,
  S02: SLICE_STAGING.S02,
  S03: SLICE_STAGING.S03,
  // Which Way Across? — the boat between reeds and pads, the choice ahead.
  S04: [
    { sceneId: 'lake_props', offset: [0, 0, 0] },
    { sceneId: 'boat', offset: [1.6, 0, 0.5] },
  ],
  // Tall Reeds — the turtle half-hidden on the far side.
  A05: [
    { sceneId: 'lake_props', offset: [0, 0, 0] },
    { sceneId: 'turtle', offset: [-0.8, 0.6, 0.1] },
  ],
  // Shared Light — the child holds the lantern up in the boat.
  A06: [
    { sceneId: 'boat', offset: [0.8, 0, 0.5] },
    { sceneId: 'child', offset: [0.6, 0.3, 0.55] },
  ],
  // Lily Pads — the turtle rests on the near side.
  B05: [
    { sceneId: 'lake_props', offset: [0, 0, 0] },
    { sceneId: 'turtle', offset: [-0.8, 0, 0] },
  ],
  // Cake Crumbs — the turtle alongside the boat for its share.
  B06: [
    { sceneId: 'boat', offset: [0, 0, 0.5] },
    { sceneId: 'turtle', offset: [0.8, 0.7, 0] },
  ],
  // The Other Shore — everyone arrives: the child standing in the boat,
  // the turtle floating beside the dock end, clear of every hull.
  S08: [
    { sceneId: 'dock', offset: [0, 0, 0] },
    { sceneId: 'boat', offset: [2.2, 0, 0.5] },
    { sceneId: 'child', offset: [2.2, 0, 0.55] },
    { sceneId: 'turtle', offset: [-1.6, -1.6, 0] },
  ],
  // Home by Lantern Light — the quiet dock again, at rest.
  S10: [
    { sceneId: 'dock', offset: [0, 0, 0] },
    { sceneId: 'boat', offset: [2.2, 0, 0.5] },
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
