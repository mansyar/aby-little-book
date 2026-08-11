import { describe, expect, it } from 'vitest';
import {
  chooseRoute,
  createSession,
  goBack,
  goForward,
  loadStory,
  snapshot,
} from '../reader/engine';

// Replay semantics: after completion the current reading resets to a fresh
// preview session (route unlocked) while the completed route history stays
// recorded. The alternate route must remain discoverable — and both routes
// must still be completable.

describe('completion and replay', () => {
  it('replays into a fresh session with no locked route', () => {
    const story = loadStory('the-starlight-rescue');
    let session = createSession(story, 'aby', 'en');
    session = goForward(session);
    session = goForward(session);
    session = chooseRoute(session, 'asteroid-garden');
    for (let step = 0; step < 7; step += 1) {
      session = goForward(session);
    }
    expect(session.completed).toBe(true);
    expect(session.route).toBe('asteroid-garden');

    const replaySession = createSession(story, 'aby', 'en');
    expect(replaySession.route).toBeNull();
    expect(replaySession.currentSpreadId).toBe('S01');
    expect(replaySession.history).toEqual(['S01']);
  });

  it('keeps the alternate route discoverable after replay', () => {
    const story = loadStory('the-starlight-rescue');
    let first = createSession(story, 'aby', 'en');
    first = goForward(first);
    first = goForward(first);
    first = chooseRoute(first, 'asteroid-garden');
    for (let step = 0; step < 7; step += 1) {
      first = goForward(first);
    }
    expect(first.completed).toBe(true);

    let second = createSession(story, 'aby', 'en');
    second = goForward(second);
    second = goForward(second);
    second = chooseRoute(second, 'singing-starfield');
    for (let step = 0; step < 7; step += 1) {
      second = goForward(second);
    }
    expect(second.completed).toBe(true);
    expect(second.route).toBe('singing-starfield');
    expect(second.currentSpreadId).toBe('S10');
  });

  it('never rewinds a completed history through backward navigation', () => {
    const story = loadStory('the-starlight-rescue');
    let session = createSession(story, 'aby', 'en');
    session = goForward(session);
    session = goForward(session);
    session = chooseRoute(session, 'singing-starfield');
    for (let step = 0; step < 7; step += 1) {
      session = goForward(session);
    }
    const atEnd = snapshot(session, 1);
    const back = goBack(session);
    expect(back.currentSpreadId).toBe('S09');
    expect(snapshot(session, 1)).toEqual(atEnd);
  });
});
