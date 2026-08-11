import { describe, expect, it } from 'vitest';
import {
  EDGE_ZONE_RATIO,
  evaluateGesture,
  navigationKeyFor,
  SWIPE_THRESHOLD_PX,
} from './navigation';

const viewport = { width: 1180, height: 820 };
const edge = Math.round(viewport.width * EDGE_ZONE_RATIO); // 142

describe('evaluateGesture', () => {
  it('treats a leftward swipe beyond the threshold as forward navigation', () => {
    const result = evaluateGesture(
      { from: { x: 600, y: 400 }, to: { x: 600 - SWIPE_THRESHOLD_PX - 20, y: 400 } },
      viewport,
    );
    expect(result).toEqual({ kind: 'navigate', direction: 'forward' });
  });

  it('treats a rightward swipe beyond the threshold as backward navigation', () => {
    const result = evaluateGesture(
      { from: { x: 600, y: 400 }, to: { x: 600 + SWIPE_THRESHOLD_PX + 20, y: 400 } },
      viewport,
    );
    expect(result).toEqual({ kind: 'navigate', direction: 'backward' });
  });

  it('ignores movement below the swipe threshold', () => {
    const result = evaluateGesture(
      { from: { x: 600, y: 400 }, to: { x: 600 + SWIPE_THRESHOLD_PX - 10, y: 400 } },
      viewport,
    );
    expect(result).toEqual({ kind: 'none' });
  });

  it('ignores vertical drags even when long', () => {
    const result = evaluateGesture(
      { from: { x: 600, y: 400 }, to: { x: 610, y: 400 + 300 } },
      viewport,
    );
    expect(result).toEqual({ kind: 'none' });
  });

  it('navigates backward on a tap in the left edge zone', () => {
    const result = evaluateGesture(
      { from: { x: edge - 10, y: 400 }, to: { x: edge - 8, y: 402 } },
      viewport,
    );
    expect(result).toEqual({ kind: 'navigate', direction: 'backward' });
  });

  it('navigates forward on a tap in the right edge zone', () => {
    const result = evaluateGesture(
      {
        from: { x: viewport.width - edge + 10, y: 400 },
        to: { x: viewport.width - edge + 12, y: 402 },
      },
      viewport,
    );
    expect(result).toEqual({ kind: 'navigate', direction: 'forward' });
  });

  it('ignores taps in the middle of the scene', () => {
    const result = evaluateGesture({ from: { x: 600, y: 400 }, to: { x: 601, y: 401 } }, viewport);
    expect(result).toEqual({ kind: 'none' });
  });

  it('never navigates when the gesture starts on an interactive target', () => {
    const result = evaluateGesture(
      { from: { x: 600, y: 400 }, to: { x: 300, y: 400 }, targetIsInteractive: true },
      viewport,
    );
    expect(result).toEqual({ kind: 'none' });
  });

  it('never navigates from an edge tap on an interactive target', () => {
    const result = evaluateGesture(
      { from: { x: edge - 5, y: 400 }, to: { x: edge - 4, y: 400 }, targetIsInteractive: true },
      viewport,
    );
    expect(result).toEqual({ kind: 'none' });
  });
});

describe('navigationKeyFor', () => {
  it('navigates forward with ArrowRight and PageDown when no target is focused', () => {
    expect(navigationKeyFor('ArrowRight', false)).toBe('forward');
    expect(navigationKeyFor('PageDown', false)).toBe('forward');
  });

  it('navigates backward with ArrowLeft and PageUp when no target is focused', () => {
    expect(navigationKeyFor('ArrowLeft', false)).toBe('backward');
    expect(navigationKeyFor('PageUp', false)).toBe('backward');
  });

  it('never page-turns while an interactive target has focus', () => {
    expect(navigationKeyFor('ArrowRight', true)).toBeNull();
    expect(navigationKeyFor('ArrowLeft', true)).toBeNull();
    expect(navigationKeyFor('PageDown', true)).toBeNull();
    expect(navigationKeyFor('PageUp', true)).toBeNull();
  });

  it('lets Space and Enter activate the focused target instead of navigating', () => {
    expect(navigationKeyFor(' ', false)).toBeNull();
    expect(navigationKeyFor('Enter', false)).toBeNull();
  });

  it('ignores unrelated keys', () => {
    expect(navigationKeyFor('KeyA', false)).toBeNull();
    expect(navigationKeyFor('Tab', false)).toBeNull();
  });
});
