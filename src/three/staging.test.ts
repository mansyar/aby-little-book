import { describe, expect, it } from 'vitest';
import { activeWindow, SLICE_STAGING, STORY_STAGING } from './staging.js';

describe('SLICE_STAGING', () => {
  it('stages the dock and boat for the boarding spread', () => {
    expect(SLICE_STAGING.S01.map((s) => s.sceneId)).toEqual(['dock', 'boat']);
  });

  it('stages the turtle among the lake props for the meeting spread', () => {
    expect(SLICE_STAGING.S02.map((s) => s.sceneId)).toEqual(['lake_props', 'turtle']);
  });

  it('stages the turtle and child together for the sharing spread', () => {
    expect(SLICE_STAGING.S03.map((s) => s.sceneId)).toEqual(['turtle', 'child']);
  });

  it('gives every staged scene a 3-number offset', () => {
    for (const staged of Object.values(SLICE_STAGING).flat()) {
      expect(staged.offset).toHaveLength(3);
    }
  });
});

describe('activeWindow', () => {
  const ids = ['S01', 'S02', 'S03'];

  it('keeps the active spread plus its immediate neighbors mounted', () => {
    expect(activeWindow(ids, 1)).toEqual(['S01', 'S02', 'S03']);
  });

  it('clamps the window at the edges of the story', () => {
    expect(activeWindow(ids, 0)).toEqual(['S01', 'S02']);
    expect(activeWindow(ids, 2)).toEqual(['S02', 'S03']);
  });

  it('bounds memory by mounting at most three spreads', () => {
    const long = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07'];
    expect(activeWindow(long, 3)).toEqual(['S03', 'S04', 'S05']);
    expect(activeWindow(long, 3)).toHaveLength(3);
  });
});

describe('STORY_STAGING', () => {
  const PACKAGE_SCENES = ['dock', 'boat', 'turtle', 'child', 'lake_props'];

  it('stages every spread of the full story', () => {
    expect(Object.keys(STORY_STAGING).sort()).toEqual(
      ['A05', 'A06', 'B05', 'B06', 'S01', 'S02', 'S03', 'S04', 'S08', 'S10'].sort(),
    );
  });

  it('keeps the approved slice entries untouched', () => {
    expect(STORY_STAGING.S01).toEqual(SLICE_STAGING.S01);
    expect(STORY_STAGING.S02).toEqual(SLICE_STAGING.S02);
    expect(STORY_STAGING.S03).toEqual(SLICE_STAGING.S03);
  });

  it('references only packaged scenes with 3-number offsets', () => {
    for (const staged of Object.values(STORY_STAGING)) {
      expect(staged.length).toBeGreaterThan(0);
      for (const entry of staged) {
        expect(PACKAGE_SCENES).toContain(entry.sceneId);
        expect(entry.offset).toHaveLength(3);
      }
    }
  });
});
