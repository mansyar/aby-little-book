import type { KeyboardEventHandler, PointerEventHandler } from 'react';
import { useEffect, useRef, useState } from 'react';
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
  onKeyDown: KeyboardEventHandler<HTMLElement>;
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
 * Pointer Events with pointer capture track one gesture at a time; the gesture
 * is evaluated with the pure `evaluateGesture` contract (swipe thresholds, edge
 * taps, target ownership). A committed navigation locks further gestures until
 * the transition lock elapses, which is also when the reader cancels active
 * speech and hints. Keyboard page-turns use `navigationKeyFor` and never fire
 * while an interactive target has focus.
 */
export function useReaderGestures({ onNavigate, lockDurationMs }: UseReaderGesturesOptions): {
  handlers: ReaderGestureHandlers;
  locked: boolean;
} {
  const [locked, setLocked] = useState(false);
  const startRef = useRef<{ x: number; y: number; targetIsInteractive: boolean } | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current !== null) {
        clearTimeout(lockTimerRef.current);
      }
    };
  }, []);

  function commit(direction: NavigationDirection) {
    onNavigate(direction);
    setLocked(true);
    if (lockTimerRef.current !== null) {
      clearTimeout(lockTimerRef.current);
    }
    lockTimerRef.current = setTimeout(() => {
      setLocked(false);
      lockTimerRef.current = null;
    }, lockDurationMs);
  }

  const onPointerDown: PointerEventHandler<HTMLElement> = (event) => {
    if (locked) {
      return;
    }
    startRef.current = {
      x: event.clientX,
      y: event.clientY,
      targetIsInteractive: isInteractiveTarget(event.target),
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is a progressive enhancement; some test environments
      // do not implement it for synthetic pointer ids.
    }
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

  const onKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if (locked) {
      return;
    }
    const direction = navigationKeyFor(event.key, isInteractiveTarget(event.target));
    if (direction !== null) {
      event.preventDefault();
      commit(direction);
    }
  };

  return { handlers: { onPointerDown, onPointerUp, onPointerCancel, onKeyDown }, locked };
}
