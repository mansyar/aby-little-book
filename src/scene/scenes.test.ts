// Scene binding: which spreads are live (previous/active/next) around the
// current reading position. The renderer decodes at most these three scenes
// so memory stays bounded, and never loads spreads from the unchosen route.

import { describe, expect, it } from 'vitest';
import { chooseRoute, createSession, goForward } from '../reader/engine';
import { story } from '../story/starlight-rescue';
import { boundScenes } from './scenes';

function makeSession(): ReturnType<typeof createSession> {
  return createSession(story, 'aby', 'en');
}

describe('boundScenes', () => {
  it('binds no previous scene at the first spread and the next opening spread after it', () => {
    const scenes = boundScenes(makeSession());
    expect(scenes).toEqual({ previous: null, active: 'S01', next: 'S02' });
  });

  it('binds previous, active, and next scenes mid-story', () => {
    const session = goForward(goForward(makeSession()));
    expect(boundScenes(session)).toEqual({ previous: 'S01', active: 'S02', next: 'S03' });
  });

  it('follows the locked route after the choice', () => {
    let session = goForward(goForward(makeSession()));
    session = chooseRoute(session, 'asteroid-garden');
    expect(boundScenes(session)).toEqual({ previous: 'S02', active: 'S03', next: 'A04' });
  });

  it('binds no next scene at the ending', () => {
    let session = makeSession();
    for (let step = 0; step < 12; step += 1) {
      session = goForward(session);
    }
    expect(session.completed).toBe(true);
    expect(boundScenes(session)).toEqual({ previous: 'S09', active: 'S10', next: null });
  });

  it('never binds spreads from the unchosen route', () => {
    let session = goForward(goForward(makeSession()));
    session = chooseRoute(session, 'singing-starfield');
    const scenes = boundScenes(session);
    expect(scenes.next).toBe('B04');
    expect([scenes.previous, scenes.active, scenes.next].includes('A04')).toBe(false);
  });
});
