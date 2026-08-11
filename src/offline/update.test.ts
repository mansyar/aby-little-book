import { describe, expect, it } from 'vitest';
import { createUpdateState, reduceUpdate, type UpdateEvent, type UpdateState } from './update';

// Safe-update contract: an update is detected without interrupting an open
// reader; activation is deferred until a safe boundary (reader closed,
// bookshelf visible); progress survives the update because it lives in
// IndexedDB and the new version replaces the old shell only at install.

function base(): UpdateState {
  return createUpdateState({ installedVersion: '0.1.0' });
}

function drive(events: readonly UpdateEvent[], from: UpdateState = base()): UpdateState {
  return events.reduce((state, event) => reduceUpdate(state, event), from);
}

describe('reduceUpdate', () => {
  it('starts idle with the installed version', () => {
    const state = base();
    expect(state.status).toBe('idle');
    expect(state.installedVersion).toBe('0.1.0');
    expect(state.availableVersion).toBeNull();
  });

  it('detects an available update while idle', () => {
    const state = drive([{ type: 'update-available', version: '0.2.0' }]);
    expect(state.status).toBe('available');
    expect(state.availableVersion).toBe('0.2.0');
  });

  it('defers activation while the reader is open', () => {
    const state = drive([
      { type: 'reader-opened' },
      { type: 'update-available', version: '0.2.0' },
    ]);
    expect(state.status).toBe('available');
    expect(state.deferred).toBe(true);
    // The install request is rejected while reading: no interruption.
    const attempted = reduceUpdate(state, { type: 'install-requested' });
    expect(attempted).toBe(state);
  });

  it('promotes the deferred update to installable at the safe boundary', () => {
    const state = drive([
      { type: 'reader-opened' },
      { type: 'update-available', version: '0.2.0' },
      { type: 'reader-closed' },
    ]);
    expect(state.status).toBe('installable');
    expect(state.deferred).toBe(false);
  });

  it('installs only at a safe boundary', () => {
    const installable = drive([
      { type: 'update-available', version: '0.2.0' },
      { type: 'reader-opened' },
      { type: 'reader-closed' },
    ]);
    const installing = reduceUpdate(installable, { type: 'install-requested' });
    expect(installing.status).toBe('installing');
    expect(installing.installedVersion).toBe('0.1.0');
    const applied = reduceUpdate(installing, { type: 'update-applied' });
    expect(applied.status).toBe('idle');
    expect(applied.installedVersion).toBe('0.2.0');
    expect(applied.availableVersion).toBeNull();
  });

  it('ignores an update signal for the version already installed', () => {
    const state = drive([{ type: 'update-available', version: '0.1.0' }]);
    expect(state.status).toBe('idle');
  });

  it('rolls back cleanly when the new shell fails to take over', () => {
    const installable = drive([
      { type: 'update-available', version: '0.2.0' },
      { type: 'reader-opened' },
      { type: 'reader-closed' },
    ]);
    const installing = reduceUpdate(installable, { type: 'install-requested' });
    const rolledBack = reduceUpdate(installing, { type: 'update-failed' });
    expect(rolledBack.status).toBe('idle');
    expect(rolledBack.installedVersion).toBe('0.1.0');
    expect(rolledBack.availableVersion).toBeNull();
  });

  it('treats install requests in every non-installable state as identity', () => {
    for (const from of [
      base(),
      drive([{ type: 'update-available', version: '0.2.0' }]),
      drive([{ type: 'reader-opened' }]),
      drive([{ type: 'update-available', version: '0.2.0' }, { type: 'install-requested' }]),
    ]) {
      expect(reduceUpdate(from, { type: 'install-requested' })).toBe(from);
    }
  });
});
