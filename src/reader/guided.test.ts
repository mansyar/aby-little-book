import { describe, expect, it } from 'vitest';
import { slice } from '../story/slice';
import {
  boardBoat,
  cameraBeatFor,
  chooseRoute,
  finishGuided,
  goBack,
  goForward,
  startGuidedSession,
  tapTarget,
} from './guided';

const STORY_ID = 'the-sharing-tide';
const PATH = ['S01', 'S02', 'S03'];

describe('guided reader engine', () => {
  it('starts at the first spread unboarded', () => {
    const session = startGuidedSession(STORY_ID, PATH);
    expect(session.spreadId).toBe('S01');
    expect(session.boarded).toBe(false);
    expect(session.routeId).toBeNull();
    expect(session.completed).toBe(false);
  });

  it('holds at the dock until the required boarding commits, then flows', () => {
    let session = startGuidedSession(STORY_ID, PATH);
    expect(goForward(session, slice).spreadId).toBe('S01');
    session = boardBoat(session, slice, 'wrong-boat');
    expect(session.boarded).toBe(false);
    session = boardBoat(session, slice, 'boat');
    expect(session.boarded).toBe(true);
    session = goForward(session, slice);
    expect(session.spreadId).toBe('S02');
    session = goForward(session, slice);
    expect(session.spreadId).toBe('S03');
    expect(goForward(session, slice).spreadId).toBe('S03');
  });

  it('records optional taps without navigating', () => {
    let session = boardBoat(startGuidedSession(STORY_ID, PATH), slice, 'boat');
    session = goForward(goForward(session, slice), slice);
    expect(session.spreadId).toBe('S03');
    const tapped = tapTarget(session, slice, 'S03', 'cake');
    expect(tapped.spreadId).toBe('S03');
    expect(tapped.taps).toEqual({ S03: ['cake'] });
    const stray = tapTarget(session, slice, 'S03', 'moon');
    expect(stray.taps).toEqual({});
  });

  it('preserves the route when going back', () => {
    let session = boardBoat(startGuidedSession(STORY_ID, PATH), slice, 'boat');
    session = goForward(session, slice);
    session = chooseRoute(session, 'firefly-channel', ['S01', 'S02', 'S03']);
    session = goBack(session);
    expect(session.spreadId).toBe('S01');
    expect(session.routeId).toBe('firefly-channel');
    expect(session.boarded).toBe(true);
    expect(goBack(session).spreadId).toBe('S01');
  });

  it('finishes only at the last spread', () => {
    const session = boardBoat(startGuidedSession(STORY_ID, PATH), slice, 'boat');
    expect(finishGuided(session, slice).completed).toBe(false);
    const end = goForward(goForward(session, slice), slice);
    expect(finishGuided(end, slice).completed).toBe(true);
  });

  it('freezes camera beats under reduced motion', () => {
    expect(cameraBeatFor('forward', 'full')).toBe('arrive');
    expect(cameraBeatFor('back', 'full')).toBe('return');
    expect(cameraBeatFor('forward', 'reduced')).toBeNull();
    expect(cameraBeatFor('back', 'reduced')).toBeNull();
  });
});
