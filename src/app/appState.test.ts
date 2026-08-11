import { describe, expect, it } from 'vitest';
import type { ReaderSession } from '../reader/types';
import { story as starlightStory } from '../story/starlight-rescue';
import type { AppEvent } from './appState';
import { initialAppState, isSaveBoundary, reduceAppState, SAVE_BOUNDARY_TYPES } from './appState';

function makeSession(overrides: Partial<ReaderSession> = {}): ReaderSession {
  return {
    story: starlightStory,
    astronautId: 'aby',
    locale: 'en',
    currentSpreadId: 'S01',
    route: null,
    history: ['S01'],
    completed: false,
    ...overrides,
  };
}

describe('application state machine', () => {
  it('starts on the bookshelf with default locale and astronaut', () => {
    const state = initialAppState();
    expect(state.view).toBe('bookshelf');
    expect(state.locale).toBe('en');
    expect(state.astronautId).toBe('aby');
    expect(state.session).toBeNull();
    expect(state.lastCompletedStoryId).toBeNull();
  });

  it('opens a story into the preview and rejects opening from the reader', () => {
    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    expect(preview.view).toBe('preview');

    const reader = reduceAppState(preview, {
      type: 'preparation-ready',
      session: makeSession(),
    });
    const invalid = reduceAppState(reader, { type: 'open-story' });
    expect(invalid).toBe(reader);
  });

  it('begins preparation from the preview only', () => {
    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    const preparing = reduceAppState(preview, { type: 'begin-preparation' });
    expect(preparing.view).toBe('preparation');

    const base = initialAppState();
    expect(reduceAppState(base, { type: 'begin-preparation' })).toBe(base);
  });

  it('enters the reader when preparation is ready', () => {
    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    const preparing = reduceAppState(preview, { type: 'begin-preparation' });
    const session = makeSession();
    const reader = reduceAppState(preparing, { type: 'preparation-ready', session });
    expect(reader.view).toBe('reader');
    expect(reader.session).toBe(session);
    expect(reader.preparation).toEqual({ packageId: 'the-starlight-rescue-0.1.0', ready: true });
  });

  it('continues a restored session into the reader', () => {
    const session = makeSession({
      currentSpreadId: 'A05',
      route: 'asteroid-garden',
      history: ['S01', 'S02', 'S03', 'A04', 'A05'],
    });
    const state = reduceAppState(initialAppState(), { type: 'continue-story', session });
    expect(state.view).toBe('reader');
    expect(state.session).toBe(session);
  });

  it('rejects continue-story while already reading', () => {
    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    const preparing = reduceAppState(preview, { type: 'begin-preparation' });
    const reader = reduceAppState(preparing, { type: 'preparation-ready', session: makeSession() });
    expect(reduceAppState(reader, { type: 'continue-story', session: makeSession() })).toBe(reader);
  });

  it('moves to the completion view when the session is completed', () => {
    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    const preparing = reduceAppState(preview, { type: 'begin-preparation' });
    const reader = reduceAppState(preparing, { type: 'preparation-ready', session: makeSession() });
    const finished = reduceAppState(reader, {
      type: 'update-reader',
      session: makeSession({ currentSpreadId: 'S10', completed: true }),
    });
    expect(finished.view).toBe('completion');
    expect(finished.lastCompletedStoryId).toBe('the-starlight-rescue');
  });

  it('rejects reader updates when no session exists', () => {
    const base = initialAppState();
    const state = reduceAppState(base, { type: 'update-reader', session: makeSession() });
    expect(state).toBe(base);
  });

  it('closes the reader back to the bookshelf without losing preparation', () => {
    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    const preparing = reduceAppState(preview, { type: 'begin-preparation' });
    const reader = reduceAppState(preparing, { type: 'preparation-ready', session: makeSession() });
    const closed = reduceAppState(reader, { type: 'close-reader' });
    expect(closed.view).toBe('bookshelf');
    expect(closed.session).toBeNull();
    expect(closed.preparation).not.toBeNull();
  });

  it('opens and closes the caregiver area from non-reading views only', () => {
    const caregiver = reduceAppState(initialAppState(), { type: 'open-caregiver' });
    expect(caregiver.view).toBe('caregiver');
    expect(reduceAppState(caregiver, { type: 'close-caregiver' }).view).toBe('bookshelf');

    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    const preparing = reduceAppState(preview, { type: 'begin-preparation' });
    const reader = reduceAppState(preparing, { type: 'preparation-ready', session: makeSession() });
    expect(reduceAppState(reader, { type: 'open-caregiver' })).toBe(reader);
  });

  it('switches language mid-reader without losing progress', () => {
    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    const preparing = reduceAppState(preview, { type: 'begin-preparation' });
    const reader = reduceAppState(preparing, { type: 'preparation-ready', session: makeSession() });
    const switched = reduceAppState(reader, { type: 'set-locale', locale: 'id' });
    expect(switched.locale).toBe('id');
    expect(switched.session?.locale).toBe('id');
    expect(switched.session?.currentSpreadId).toBe('S01');
    expect(switched.session?.history).toEqual(['S01']);
  });

  it('changes the astronaut outside the reader only', () => {
    const changed = reduceAppState(initialAppState(), {
      type: 'set-astronaut',
      astronautId: 'maya',
    });
    expect(changed.astronautId).toBe('maya');

    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    const preparing = reduceAppState(preview, { type: 'begin-preparation' });
    const reader = reduceAppState(preparing, { type: 'preparation-ready', session: makeSession() });
    expect(reduceAppState(reader, { type: 'set-astronaut', astronautId: 'maya' })).toBe(reader);
  });

  it('replays from completion into a fresh preview', () => {
    const preview = reduceAppState(initialAppState(), { type: 'open-story' });
    const preparing = reduceAppState(preview, { type: 'begin-preparation' });
    const reader = reduceAppState(preparing, { type: 'preparation-ready', session: makeSession() });
    const finished = reduceAppState(reader, {
      type: 'update-reader',
      session: makeSession({ completed: true }),
    });
    const replayed = reduceAppState(finished, { type: 'replay' });
    expect(replayed.view).toBe('preview');
    expect(replayed.session).toBeNull();

    const base = initialAppState();
    expect(reduceAppState(base, { type: 'replay' })).toBe(base);
  });

  it('resets from the caregiver, keeping settings but clearing story state', () => {
    const caregiver = reduceAppState(initialAppState(), { type: 'open-caregiver' });
    const changed = reduceAppState(caregiver, { type: 'set-locale', locale: 'id' });
    const reset = reduceAppState(changed, { type: 'reset' });
    expect(reset.view).toBe('bookshelf');
    expect(reset.session).toBeNull();
    expect(reset.lastCompletedStoryId).toBeNull();
    expect(reset.preparation).toBeNull();
    expect(reset.locale).toBe('id');
  });

  it('rejects every invalid event by returning the identical state', () => {
    const base = initialAppState();
    const invalidEvents: AppEvent[] = [
      { type: 'close-reader' },
      { type: 'update-reader', session: makeSession() },
      { type: 'preparation-ready', session: makeSession() },
      { type: 'begin-preparation' },
      { type: 'replay' },
      { type: 'reset' },
      { type: 'close-caregiver' },
    ];
    for (const event of invalidEvents) {
      expect(reduceAppState(base, event)).toBe(base);
    }
  });

  it('defines stable save boundaries for progress persistence', () => {
    expect(SAVE_BOUNDARY_TYPES).toEqual(['update-reader', 'close-reader']);
    expect(isSaveBoundary({ type: 'update-reader', session: makeSession() })).toBe(true);
    expect(isSaveBoundary({ type: 'close-reader' })).toBe(true);
    expect(isSaveBoundary({ type: 'open-story' })).toBe(false);
    expect(isSaveBoundary({ type: 'set-locale', locale: 'en' })).toBe(false);
  });
});
