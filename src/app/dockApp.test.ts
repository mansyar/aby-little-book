import { describe, expect, it } from 'vitest';
import { initialDockState, reduceDockState } from './dockApp';

const session = { marker: 'engine-owned' } as never;

describe('dock app state', () => {
  it('starts at the Starlit Dock with no session', () => {
    const state = initialDockState();
    expect(state.view).toBe('dock');
    expect(state.locale).toBe('en');
    expect(state.session).toBeNull();
    expect(state.preparation).toBeNull();
    expect(state.lastCompletedStoryId).toBeNull();
  });

  it('prepares explicitly, then boards only when prepared', () => {
    const preparing = reduceDockState(initialDockState(), { type: 'begin-preparation' });
    expect(preparing.view).toBe('preparation');

    const unpreparedBoard = reduceDockState(initialDockState(), {
      type: 'board-boat',
      session,
    });
    expect(unpreparedBoard.view).toBe('dock');
    expect(unpreparedBoard.session).toBeNull();

    const ready = reduceDockState(preparing, {
      type: 'preparation-ready',
      session,
      packageId: 'the-sharing-tide-0.1.0',
    });
    expect(ready.view).toBe('reader');
    expect(ready.session).toBe(session);
    expect(ready.preparation).toEqual({ packageId: 'the-sharing-tide-0.1.0', ready: true });
  });

  it('rejects preparation events outside the preparation view', () => {
    const state = initialDockState();
    expect(
      reduceDockState(state, {
        type: 'preparation-ready',
        session,
        packageId: 'the-sharing-tide-0.1.0',
      }),
    ).toBe(state);
    const reading = reduceDockState(reduceDockState(state, { type: 'begin-preparation' }), {
      type: 'preparation-ready',
      session,
      packageId: 'the-sharing-tide-0.1.0',
    });
    expect(reduceDockState(reading, { type: 'begin-preparation' })).toBe(reading);
  });

  it('closes the reader back to the dock and continues later', () => {
    const reading = reduceDockState(initialDockState(), { type: 'board-boat', session });
    expect(reading.view).toBe('dock');
    const prepared = reduceDockState(
      reduceDockState(initialDockState(), { type: 'begin-preparation' }),
      { type: 'preparation-ready', session, packageId: 'the-sharing-tide-0.1.0' },
    );
    const closed = reduceDockState(prepared, { type: 'close-reader' });
    expect(closed.view).toBe('dock');
    expect(closed.session).toBe(session);
    const boarded = reduceDockState(closed, { type: 'board-boat', session });
    expect(boarded.view).toBe('reader');
    const continued = reduceDockState(closed, { type: 'continue-story', session });
    expect(continued.view).toBe('reader');
  });

  it('finishes calmly, replays, and resets while keeping locale', () => {
    let state = reduceDockState(
      reduceDockState(initialDockState(), { type: 'begin-preparation' }),
      { type: 'preparation-ready', session, packageId: 'the-sharing-tide-0.1.0' },
    );
    state = reduceDockState(state, { type: 'set-locale', locale: 'id' });
    const done = reduceDockState(state, { type: 'finish', storyId: 'the-sharing-tide' });
    expect(done.view).toBe('completion');
    expect(done.lastCompletedStoryId).toBe('the-sharing-tide');
    const replayed = reduceDockState(done, { type: 'replay', session });
    expect(replayed.view).toBe('reader');
    const reset = reduceDockState(replayed, { type: 'reset' });
    expect(reset.view).toBe('dock');
    expect(reset.session).toBeNull();
    expect(reset.locale).toBe('id');
  });

  it('opens and closes the caregiver area from the dock', () => {
    const state = initialDockState();
    const open = reduceDockState(state, { type: 'open-caregiver' });
    expect(open.view).toBe('caregiver');
    expect(reduceDockState(open, { type: 'close-caregiver' }).view).toBe('dock');
    expect(reduceDockState(state, { type: 'close-caregiver' })).toBe(state);
  });
});
