import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDelayedHint } from './useDelayedHint';

afterEach(() => {
  vi.useRealTimers();
});

describe('useDelayedHint', () => {
  it('stays hidden until the inactivity delay elapses', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDelayedHint({ delayMs: 6000 }));
    expect(result.current.hintVisible).toBe(false);
    act(() => {
      vi.advanceTimersByTime(5999);
    });
    expect(result.current.hintVisible).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.hintVisible).toBe(true);
  });

  it('resets when the interaction becomes active again', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ active }) => useDelayedHint({ delayMs: 6000, active }),
      { initialProps: { active: false } },
    );
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(result.current.hintVisible).toBe(true);
    rerender({ active: true });
    expect(result.current.hintVisible).toBe(false);
  });

  it('can be dismissed explicitly (activation happens)', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDelayedHint({ delayMs: 1000 }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.hintVisible).toBe(true);
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.hintVisible).toBe(false);
  });

  it('cleans up its timer on unmount', () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() => useDelayedHint({ delayMs: 6000 }));
    unmount();
    expect(() => vi.runAllTimers()).not.toThrow();
  });
});
