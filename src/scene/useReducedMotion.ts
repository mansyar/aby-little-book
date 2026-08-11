import { useEffect, useState } from 'react';

/**
 * True when the platform asks for reduced motion. Guarded for environments
 * without matchMedia (jsdom); the app's global reduced-motion CSS already
 * zeroes animation durations, and this flag switches the hint to static
 * emphasis instead of the gentle pulse.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);

  return reduced;
}
