export type NavigationDirection = 'forward' | 'backward';

export interface Viewport {
  width: number;
  height: number;
}

export interface GesturePoints {
  from: { x: number; y: number };
  to: { x: number; y: number };
  /** True when the gesture began on an interactive target; defaults to false. */
  targetIsInteractive?: boolean;
}

export type Gesture = { kind: 'none' } | { kind: 'navigate'; direction: NavigationDirection };

/** Minimum horizontal travel in CSS pixels for a swipe to page-turn. */
export const SWIPE_THRESHOLD_PX = 60;

/** Fraction of the viewport width on each side reserved for edge taps. */
export const EDGE_ZONE_RATIO = 0.12;

/**
 * Decides whether a pointer gesture turns the page.
 *
 * Target ownership: gestures that begin on an interactive target (word, lamp,
 * choice, protected control) never navigate — the target keeps the gesture.
 * Below the swipe threshold the gesture is a tap, and only taps in the left or
 * right edge zone navigate. Vertical drags never navigate.
 */
export function evaluateGesture(points: GesturePoints, viewport: Viewport): Gesture {
  if (points.targetIsInteractive === true) {
    return { kind: 'none' };
  }
  const dx = points.to.x - points.from.x;
  const dy = points.to.y - points.from.y;
  if (Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
    return { kind: 'navigate', direction: dx < 0 ? 'forward' : 'backward' };
  }
  if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX) {
    const edge = viewport.width * EDGE_ZONE_RATIO;
    if (points.from.x < edge) {
      return { kind: 'navigate', direction: 'backward' };
    }
    if (points.from.x > viewport.width - edge) {
      return { kind: 'navigate', direction: 'forward' };
    }
  }
  return { kind: 'none' };
}

/**
 * Maps a keyboard key to a navigation direction.
 *
 * While an interactive target has focus, arrow/page keys belong to the target
 * (or to the page scroll) and never page-turn. Space and Enter always belong
 * to the focused control, never to navigation.
 */
export function navigationKeyFor(
  key: string,
  interactiveFocused: boolean,
): NavigationDirection | null {
  if (interactiveFocused) {
    return null;
  }
  switch (key) {
    case 'ArrowRight':
    case 'PageDown':
      return 'forward';
    case 'ArrowLeft':
    case 'PageUp':
      return 'backward';
    default:
      return null;
  }
}
