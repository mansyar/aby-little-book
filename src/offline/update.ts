/**
 * Safe-update state machine. The service worker (registered in prompt
 * mode) never activates by itself; this reducer tracks when an update is
 * waiting and only allows activation once the app is at a safe boundary
 * (reader closed). Progress is unaffected by an update because it lives in
 * IndexedDB, not in the shell being replaced.
 */

export type UpdateStatus = 'idle' | 'available' | 'installable' | 'installing';

export interface UpdateState {
  readonly status: UpdateStatus;
  readonly installedVersion: string;
  readonly availableVersion: string | null;
  readonly readerOpen: boolean;
  readonly deferred: boolean;
}

export type UpdateEvent =
  | { type: 'update-available'; version: string }
  | { type: 'reader-opened' }
  | { type: 'reader-closed' }
  | { type: 'install-requested' }
  | { type: 'update-applied' }
  | { type: 'update-failed' };

export function createUpdateState(options: { installedVersion: string }): UpdateState {
  return {
    status: 'idle',
    installedVersion: options.installedVersion,
    availableVersion: null,
    readerOpen: false,
    deferred: false,
  };
}

export function reduceUpdate(state: UpdateState, event: UpdateEvent): UpdateState {
  switch (event.type) {
    case 'update-available':
      if (event.version === state.installedVersion) {
        return state;
      }
      if (state.status === 'installable' || state.status === 'installing') {
        return state;
      }
      return {
        ...state,
        status: 'available',
        availableVersion: event.version,
        deferred: state.readerOpen,
      };

    case 'reader-opened':
      return {
        ...state,
        readerOpen: true,
        deferred: state.status === 'available' ? true : state.deferred,
      };

    case 'reader-closed':
      return {
        ...state,
        readerOpen: false,
        status: state.status === 'available' ? 'installable' : state.status,
        deferred: false,
      };

    case 'install-requested':
      if (state.status !== 'installable') {
        return state;
      }
      return { ...state, status: 'installing' };

    case 'update-applied':
      if (state.status !== 'installing') {
        return state;
      }
      return {
        status: 'idle',
        installedVersion: state.availableVersion ?? state.installedVersion,
        availableVersion: null,
        readerOpen: false,
        deferred: false,
      };

    case 'update-failed':
      if (state.status !== 'installing') {
        return state;
      }
      return {
        status: 'idle',
        installedVersion: state.installedVersion,
        availableVersion: null,
        readerOpen: false,
        deferred: false,
      };
  }
}
