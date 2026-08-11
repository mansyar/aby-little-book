// One-off Phase 3 evidence harness (not part of the suite). Exercises the
// real integration of reducer + engine + IndexedDB repositories: the
// save/reload/Continue loop, live language change, both routes, replay, and
// caregiver reset. Run with: pnpm exec vitest run src/state/evidence.test.ts

import 'fake-indexeddb/auto';
import { afterEach, it } from 'vitest';
import { initialAppState, reduceAppState } from '../app/appState';
import type { AppState } from '../app/appState';
import { openDatabase } from '../persistence/db';
import { loadProgress, loadSettings, resetStoryState, saveProgress, saveSettings } from '../persistence/repos';
import { chooseRoute, createSession, goForward, snapshot } from '../reader/engine';
import { story } from '../story/starlight-rescue';

const DB_NAME = 'aby-little-book-evidence';

async function makeReader(): Promise<{ state: AppState; db: Awaited<ReturnType<typeof openDatabase>> }> {
  const db = await openDatabase(DB_NAME);
  let state = initialAppState();
  state = reduceAppState(state, { type: 'open-story' });
  state = reduceAppState(state, { type: 'begin-preparation' });
  state = reduceAppState(state, { type: 'preparation-ready', session: createSession(story, 'aby', 'en') });
  return { state, db };
}

function report(label: string, value: string): void {
  console.log(`[ev] ${label}: ${value}`);
}

afterEach(async () => {
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
});

it('manual harness: save/reload/Continue, language, routes, replay, reset', async () => {
  // 1. Begin a playthrough, navigate to the route choice, save at the boundary.
  const { state: reading, db } = await makeReader();
  let session = reading.session!;
  session = goForward(session);
  session = goForward(session);
  report('at route choice', `${session.currentSpreadId} route=${String(session.route)}`);
  await saveProgress(db, snapshot(session, Date.now()));

  // 2. "Close and reopen the book" — reload state from the database.
  const restored = await loadProgress(db, 'the-starlight-rescue');
  report('restored after reload', `spread=${restored?.currentSpreadId} history=${restored?.history.join(',')}`);
  let continued = initialAppState();
  continued = reduceAppState(continued, { type: 'continue-story', session: restored! });
  report('continue-story view', continued.view);

  // 3. Live language change mid-session keeps progress.
  continued = reduceAppState(continued, { type: 'set-locale', locale: 'id' });
  report('locale switched', `${continued.locale} spread=${continued.session?.currentSpreadId}`);

  // 4. Both routes to completion.
  for (const route of ['asteroid-garden', 'singing-starfield'] as const) {
    let s = createSession(story, 'maya', 'en');
    s = goForward(s);
    s = goForward(s);
    s = chooseRoute(s, route);
    let steps = 0;
    while (!s.completed && steps < 20) {
      s = goForward(s);
      steps += 1;
    }
    report(`route ${route}`, `completed=${s.completed} at ${s.currentSpreadId} after ${steps} steps`);
  }

  // 5. Replay from completion gives a fresh preview session.
  let done = reduceAppState(initialAppState(), { type: 'open-story' });
  done = reduceAppState(done, { type: 'begin-preparation' });
  done = reduceAppState(done, { type: 'preparation-ready', session: createSession(story, 'aby', 'en') });
  done = reduceAppState(done, { type: 'update-reader', session: { ...done.session!, completed: true } });
  done = reduceAppState(done, { type: 'replay' });
  report('replay', `view=${done.view} session=${String(done.session)}`);

  // 6. Caregiver reset clears story state, keeps settings.
  await saveSettings(db, { locale: 'id', astronautId: 'niko' });
  let caregiver = reduceAppState(initialAppState(), { type: 'open-caregiver' });
  caregiver = reduceAppState(caregiver, { type: 'reset' });
  await resetStoryState(db);
  report('reset', `view=${caregiver.view} progress=${await loadProgress(db, 'the-starlight-rescue')}`);
  report('settings kept', JSON.stringify(await loadSettings(db)));

  db.close();
});
