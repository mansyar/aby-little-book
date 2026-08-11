import { useEffect, useState } from 'react';

export interface UseDelayedHintOptions {
  /** How long the child must be inactive before the hint appears. */
  delayMs: number;
  /** When true the interaction is being engaged and the hint resets. */
  active?: boolean;
}

export interface UseDelayedHintResult {
  hintVisible: boolean;
  dismiss: () => void;
}

/**
 * One gentle hint after a period of inactivity. The timer starts when the
 * interaction becomes available and resets whenever it is engaged; dismissing
 * (activation) hides the hint until the next engagement.
 */
export function useDelayedHint({
  delayMs,
  active = false,
}: UseDelayedHintOptions): UseDelayedHintResult {
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    setHintVisible(false);
    if (active) {
      return;
    }
    const timer = setTimeout(() => {
      setHintVisible(true);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [delayMs, active]);

  return {
    hintVisible,
    dismiss: () => setHintVisible(false),
  };
}
