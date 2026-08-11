import { useEffect, useMemo, useState } from 'react';
import { createUpdateState, reduceUpdate, type UpdateState } from './update';

/**
 * Minimal Workbox surface the hook depends on (testable without a real
 * registration): lifecycle events and an explicit skip-waiting message.
 */
export interface WorkboxLike {
  addEventListener: (
    type: 'waiting' | 'controlling' | 'message',
    listener: (event: unknown) => void,
  ) => void;
  removeEventListener: (
    type: 'waiting' | 'controlling' | 'message',
    listener: (event: unknown) => void,
  ) => void;
  messageSkipWaiting: () => void;
}

export interface UseUpdatePromptOptions {
  workbox: WorkboxLike | null;
  installedVersion: string;
  readerOpen: boolean;
  onApplied?: () => void;
}

export interface UseUpdatePromptResult {
  state: UpdateState;
  atSafeBoundary: () => void;
  install: () => void;
}

export function useUpdatePrompt({
  workbox,
  installedVersion,
  readerOpen,
  onApplied,
}: UseUpdatePromptOptions): UseUpdatePromptResult {
  const [state, setState] = useState<UpdateState>(() => createUpdateState({ installedVersion }));

  const api = useMemo(
    () => ({
      atSafeBoundary: (): void =>
        setState((current) => reduceUpdate(current, { type: 'reader-closed' })),
      install: (): void => {
        setState((current) => {
          if (current.status !== 'installable') {
            return current;
          }
          workbox?.messageSkipWaiting();
          return reduceUpdate(current, { type: 'install-requested' });
        });
      },
    }),
    [workbox],
  );

  // The reader's open/closed state is app-owned; mirror it into the update
  // machine so a waiting update is deferred until the boundary.
  useEffect(() => {
    setState((current) =>
      reduceUpdate(current, readerOpen ? { type: 'reader-opened' } : { type: 'reader-closed' }),
    );
  }, [readerOpen]);

  useEffect(() => {
    if (workbox === null) {
      return;
    }
    const onWaiting = (): void => {
      setState((current) =>
        reduceUpdate(current, { type: 'update-available', version: 'pending' }),
      );
    };
    const onControlling = (): void => {
      setState((current) => {
        const applied = reduceUpdate(current, { type: 'update-applied' });
        onApplied?.();
        return applied;
      });
    };
    workbox.addEventListener('waiting', onWaiting);
    workbox.addEventListener('controlling', onControlling);
    return () => {
      workbox.removeEventListener('waiting', onWaiting);
      workbox.removeEventListener('controlling', onControlling);
    };
  }, [workbox, onApplied]);

  return { state, ...api };
}
