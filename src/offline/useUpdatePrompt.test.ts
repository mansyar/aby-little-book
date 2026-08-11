import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { WorkboxLike } from './useUpdatePrompt';
import { useUpdatePrompt } from './useUpdatePrompt';

// The prompt hook translates Workbox lifecycle events into the update
// reducer's language, and installs only when the app says the boundary is
// safe. Workbox is never given permission to auto-activate.

function makeWb(): WorkboxLike & {
  messageSkipWaiting: ReturnType<typeof vi.fn>;
  removeCount: () => number;
} {
  const listeners = new Map<string, Array<(event: unknown) => void>>();
  const wb = {
    listeners,
    messageSkipWaiting: vi.fn(),
    removeEventListener: (type: string, cb: (event: unknown) => void) => {
      const bucket = listeners.get(type) ?? [];
      const remaining = bucket.filter((entry) => entry !== cb);
      if (remaining.length === 0) {
        listeners.delete(type);
      } else {
        listeners.set(type, remaining);
      }
    },
    addEventListener: (type: string, cb: (event: unknown) => void) => {
      const bucket = listeners.get(type) ?? [];
      bucket.push(cb);
      listeners.set(type, bucket);
    },
  };
  return {
    ...wb,
    removeCount: () => wb.listeners.size,
  } as WorkboxLike & {
    messageSkipWaiting: ReturnType<typeof vi.fn>;
    removeCount: () => number;
  };
}

function fire(wb: WorkboxLike, type: 'waiting' | 'controlling' | 'message', event: unknown): void {
  const listeners = (
    wb as WorkboxLike & { listeners: Map<string, Array<(event: unknown) => void>> }
  ).listeners;
  for (const cb of listeners.get(type) ?? []) {
    cb(event);
  }
}

describe('useUpdatePrompt', () => {
  it('surfaces a waiting update and defers activation', () => {
    const wb = makeWb();
    const { result } = renderHook(() =>
      useUpdatePrompt({ workbox: wb, installedVersion: '0.1.0', readerOpen: false }),
    );
    expect(result.current.state.status).toBe('idle');
    act(() => fire(wb, 'waiting', {}));
    expect(result.current.state.status).toBe('available');
    // Prompt mode: the worker never self-activates; skipWaiting is called
    // only after the app requests the install at a safe boundary.
    expect(wb.messageSkipWaiting).not.toHaveBeenCalled();
  });

  it('defers a waiting update while the reader is open', () => {
    const wb = makeWb();
    const { result } = renderHook(() =>
      useUpdatePrompt({ workbox: wb, installedVersion: '0.1.0', readerOpen: true }),
    );
    act(() => fire(wb, 'waiting', {}));
    expect(result.current.state.status).toBe('available');
    expect(result.current.state.deferred).toBe(true);
    act(() => result.current.install());
    expect(wb.messageSkipWaiting).not.toHaveBeenCalled();
  });

  it('marks the boundary so a deferred update becomes installable', () => {
    const wb = makeWb();
    const { result } = renderHook(() =>
      useUpdatePrompt({ workbox: wb, installedVersion: '0.1.0', readerOpen: true }),
    );
    act(() => fire(wb, 'waiting', {}));
    act(() => result.current.atSafeBoundary());
    expect(result.current.state.status).toBe('installable');
  });

  it('installs only from the installable state', () => {
    const wb = makeWb();
    const { result } = renderHook(() =>
      useUpdatePrompt({ workbox: wb, installedVersion: '0.1.0', readerOpen: false }),
    );
    // While reading (no boundary), install must be refused.
    act(() => fire(wb, 'waiting', {}));
    act(() => result.current.install());
    expect(wb.messageSkipWaiting).not.toHaveBeenCalled();
    // At the boundary it is allowed.
    act(() => result.current.atSafeBoundary());
    act(() => result.current.install());
    expect(wb.messageSkipWaiting).toHaveBeenCalledTimes(1);
  });

  it('cleans up its listeners on unmount', () => {
    const wb = makeWb();
    const { unmount } = renderHook(() =>
      useUpdatePrompt({ workbox: wb, installedVersion: '0.1.0', readerOpen: false }),
    );
    unmount();
    expect(wb.removeCount()).toBe(0);
  });
});
