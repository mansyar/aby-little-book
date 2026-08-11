import { describe, expect, it } from 'vitest';
import type { RouteId } from '../story/contracts';
import { story as starlightStory } from '../story/starlight-rescue';
import {
  chooseRoute,
  createSession,
  fromSnapshot,
  goBack,
  goForward,
  loadStory,
  nextDestination,
  previousDestination,
  resolveSpread,
  snapshot,
} from './engine';
import type { ReaderSession } from './types';

function walk(session: ReaderSession, steps: number): ReaderSession {
  let current = session;
  for (let i = 0; i < steps; i += 1) {
    current = goForward(current);
  }
  return current;
}

describe('reader engine navigation', () => {
  it('opens a session at S01 with no route and no completion', () => {
    const session = createSession(starlightStory, 'aby', 'en');
    expect(session.currentSpreadId).toBe('S01');
    expect(session.route).toBeNull();
    expect(session.history).toEqual(['S01']);
    expect(session.completed).toBe(false);
  });

  it('moves forward through the shared opening', () => {
    const session = walk(createSession(starlightStory, 'aby', 'en'), 2);
    expect(session.currentSpreadId).toBe('S03');
    expect(session.history).toEqual(['S01', 'S02', 'S03']);
  });

  it('blocks forward navigation at the route choice until a route is chosen', () => {
    const atChoice = walk(createSession(starlightStory, 'aby', 'en'), 2);
    const blocked = goForward(atChoice);
    expect(blocked).toBe(atChoice);
    expect(nextDestination(atChoice)).toBeNull();
  });

  it('chooses a route only at the choice spread, once, for a known route', () => {
    const atChoice = walk(createSession(starlightStory, 'aby', 'en'), 2);
    const chosen = chooseRoute(atChoice, 'asteroid-garden');
    expect(chosen.route).toBe('asteroid-garden');

    const atStart = createSession(starlightStory, 'aby', 'en');
    expect(chooseRoute(atStart, 'asteroid-garden')).toBe(atStart);
    expect(chooseRoute(atChoice, 'unknown-route' as RouteId)).toBe(atChoice);
  });

  it('follows the asteroid-garden route through convergence', () => {
    const session = chooseRoute(
      walk(createSession(starlightStory, 'aby', 'en'), 2),
      'asteroid-garden',
    );
    const route = walk(session, 7);
    expect(route.currentSpreadId).toBe('S10');
    expect(route.history).toEqual([
      'S01',
      'S02',
      'S03',
      'A04',
      'A05',
      'A06',
      'S07',
      'S08',
      'S09',
      'S10',
    ]);
  });

  it('follows the singing-starfield route through convergence', () => {
    const session = chooseRoute(
      walk(createSession(starlightStory, 'aby', 'en'), 2),
      'singing-starfield',
    );
    const route = walk(session, 7);
    expect(route.currentSpreadId).toBe('S10');
    expect(route.history).toEqual([
      'S01',
      'S02',
      'S03',
      'B04',
      'B05',
      'B06',
      'S07',
      'S08',
      'S09',
      'S10',
    ]);
  });

  it('completes only when the final spread is reached', () => {
    const session = chooseRoute(
      walk(createSession(starlightStory, 'aby', 'en'), 2),
      'asteroid-garden',
    );
    const finished = walk(session, 7);
    expect(finished.completed).toBe(true);
    expect(finished.currentSpreadId).toBe('S10');
    expect(goForward(finished)).toBe(finished);
    expect(nextDestination(finished)).toBeNull();
  });

  it('locks the route: backing to the choice spread cannot switch routes', () => {
    const session = chooseRoute(
      walk(createSession(starlightStory, 'aby', 'en'), 2),
      'asteroid-garden',
    );
    const atChoiceAgain = goBack(goForward(session));
    expect(atChoiceAgain.currentSpreadId).toBe('S03');
    expect(chooseRoute(atChoiceAgain, 'singing-starfield')).toBe(atChoiceAgain);
    expect(goForward(atChoiceAgain).currentSpreadId).toBe('A04');
  });

  it('never navigates before S01', () => {
    const session = createSession(starlightStory, 'aby', 'en');
    expect(goBack(session)).toBe(session);
    expect(previousDestination(session)).toBeNull();
  });

  it('moves backward through history and truncates it', () => {
    const session = walk(createSession(starlightStory, 'aby', 'en'), 4);
    const back = goBack(session);
    expect(back.currentSpreadId).toBe('S02');
    expect(back.history).toEqual(['S01', 'S02']);
    expect(goBack(back).currentSpreadId).toBe('S01');
  });

  it('supports replay and alternate-route discovery', () => {
    const first = chooseRoute(
      walk(createSession(starlightStory, 'aby', 'en'), 2),
      'asteroid-garden',
    );
    const finished = walk(first, 7);
    expect(finished.completed).toBe(true);

    const replay = createSession(starlightStory, 'aby', 'en');
    expect(replay.route).toBeNull();
    const second = chooseRoute(walk(replay, 2), 'singing-starfield');
    expect(walk(second, 7).currentSpreadId).toBe('S10');
  });

  it('keeps astronaut choice independent of narrative progress', () => {
    let aby = chooseRoute(walk(createSession(starlightStory, 'aby', 'en'), 2), 'asteroid-garden');
    let maya = chooseRoute(walk(createSession(starlightStory, 'maya', 'id'), 2), 'asteroid-garden');
    for (let i = 0; i < 7; i += 1) {
      expect(aby.currentSpreadId).toBe(maya.currentSpreadId);
      aby = goForward(aby);
      maya = goForward(maya);
    }
  });

  it('resolves the current spread for rendering', () => {
    const session = walk(createSession(starlightStory, 'aby', 'en'), 1);
    expect(resolveSpread(session).id).toBe('S02');
  });

  it('emits stable progress snapshots and restores sessions from them', () => {
    const session = walk(
      chooseRoute(walk(createSession(starlightStory, 'aby', 'en'), 2), 'asteroid-garden'),
      1,
    );
    expect(session.currentSpreadId).toBe('A04');
    const saved = snapshot(session, 1234);
    expect(saved).toEqual({
      storyId: 'the-starlight-rescue',
      astronautId: 'aby',
      locale: 'en',
      currentSpreadId: 'A04',
      route: 'asteroid-garden',
      history: ['S01', 'S02', 'S03', 'A04'],
      completed: false,
      savedAt: 1234,
    });

    const restored = fromSnapshot(saved);
    expect(restored.currentSpreadId).toBe(session.currentSpreadId);
    expect(restored.route).toBe(session.route);
    expect(restored.history).toEqual(session.history);
    expect(restored.completed).toBe(session.completed);
  });

  it('loads only known story resources', () => {
    expect(loadStory('the-starlight-rescue').id).toBe('the-starlight-rescue');
    expect(() => loadStory('missing-story')).toThrow(/unknown story/i);
  });
});
