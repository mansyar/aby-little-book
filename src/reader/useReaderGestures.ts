import type { PointerEventHandler } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { evaluateGesture, type NavigationDirection, navigationKeyFor } from './navigation';

export interface UseReaderGesturesOptions {
  onNavigate: (direction: NavigationDirection) => void;
  /** How long after a committed navigation further gestures are ignored. */
  lockDurationMs: number;
}

export interface ReaderGestureHandlers {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[data-interactive]') !== null;
}

function viewportOf(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return { width: rect.width, height: rect.height };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

/**
 * Owns reader navigation gestures on the scene stage.
 *
 * Pointer Events track one gesture at a time; the gesture is evaluated with
 * the pure `evaluateGesture` contract (swipe thresholds, edge taps, target
 * ownership). A committed navigation locks further gestures until the
 * transition lock elapses, which is also when the reader cancels active
 * speech and hints.
 *
 * Keyboard page-turns listen at the window level so reading works no matter
 * where focus happens to be (the stage, a word control, or the page body
 * before the reader gains focus). `navigationKeyFor` never fires while an
 * interactive target has focus, and the lock suppresses repeats during a
 * page-turn.
 */
export function useReaderGestures({ onNavigate, lockDurationMs }: UseReaderGesturesOptions): {
  handlers: ReaderGestureHandlers;
  locked: boolean;
} {
  const [locked, setLocked] = useState(false);
  const startRef = useRef<{ x: number; y: number; targetIsInteractive: boolean } | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  // The lock is read from the event listener (attached once) via a ref so the
  // listener never needs to be re-attached on every navigation.
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  function commit(direction: NavigationDirection) {
    onNavigateRef.current(direction);
    setLocked(true);
    if (lockTimerRef.current !== null) {
      clearTimeout(lockTimerRef.current);
    }
    lockTimerRef.current = setTimeout(() => {
      setLocked(false);
      lockTimerRef.current = null;
    }, lockDurationMs);
  }

  // The layout effect attaches once; it reaches the current commit through a
  // ref so the listener never observes a stale handler or lock.
  const commitRef = useRef(commit);
  commitRef.current = commit;

  // Layout effect: the page-turn listener must exist before first paint so an
  // arrow key pressed the instant a reading session appears is never lost.
  useLayoutEffect(() => {
    function onWindowKeyDown(event: KeyboardEvent) {
      if (lockedRef.current) {
        return;
      }
      const direction = navigationKeyFor(event.key, isInteractiveTarget(event.target));
      if (direction !== null) {
        event.preventDefault();
        commitRef.current(direction);
      }
    }
    window.addEventListener('keydown', onWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
      if (lockTimerRef.current !== null) {
        clearTimeout(lockTimerRef.current);
      }
    };
  }, []);

  const onPointerDown: PointerEventHandler<HTMLElement> = (event) => {
    if (locked) {
      return;
    }
    startRef.current = {
      x: event.clientX,
      y: event.clientY,
      targetIsInteractive: isInteractiveTarget(event.target),
    };
    // No pointer capture: capturing on the stage would retarget pointerup and
    // the resulting click away from interactive children (the lamp, word
    // controls), silently swallowing their activation.
  };

  const onPointerUp: PointerEventHandler<HTMLElement> = (event) => {
    const start = startRef.current;
    startRef.current = null;
    if (start === null || locked) {
      return;
    }
    const viewport = viewportOf(event.currentTarget);
    const gesture = evaluateGesture(
      {
        from: { x: start.x, y: start.y },
        to: { x: event.clientX, y: event.clientY },
        targetIsInteractive: start.targetIsInteractive,
      },
      viewport,
    );
    if (gesture.kind === 'navigate') {
      commit(gesture.direction);
    }
  };

  const onPointerCancel: PointerEventHandler<HTMLElement> = () => {
    startRef.current = null;
  };

  return { handlers: { onPointerDown, onPointerUp, onPointerCancel }, locked };
}
