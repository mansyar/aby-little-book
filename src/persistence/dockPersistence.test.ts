import 'fake-indexeddb/auto';
import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import { afterEach, describe, expect, it } from 'vitest';
import { boardBoat, goForward, startGuidedSession } from '../reader/guided';
import { slice } from '../story/slice';
import type { AbyDB } from './db';
import { openDatabase } from './db';
import {
  loadDockCompletion,
  loadDockProgress,
  loadDockReadiness,
  loadDockSettings,
  resetDockStory,
  saveDockCompletion,
  saveDockProgress,
  saveDockReadiness,
  saveDockSettings,
} from './dockRepos';

const DB_NAME = 'aby-little-book-dock-test';

const openConnections = new Set<{ close(): void }>();

async function trackedOpen<T extends { close(): void }>(open: () => Promise<T>): Promise<T> {
  const db = await open();
  openConnections.add(db);
  return db;
}

afterEach(async () => {
  for (const db of openConnections) {
    db.close();
  }
  openConnections.clear();
  await indexedDB.deleteDatabase(DB_NAME);
});

type RawSchema = DBSchema & {
  settings: { key: string; value: unknown };
  progress: { key: string; value: unknown };
  completion: { key: string; value: unknown };
  packageState: { key: string; value: unknown };
};

function sessionAtS02() {
  const started = startGuidedSession('the-sharing-tide', ['S01', 'S02', 'S03']);
  return goForward(boardBoat(started, slice, 'boat'), slice);
}

describe('dock persistence', () => {
  it('round-trips settings and recovers calmly from corrupt settings', async () => {
    const db: AbyDB = await trackedOpen(() => openDatabase(DB_NAME));
    expect(await loadDockSettings(db)).toBeNull();
    await saveDockSettings(db, { locale: 'id', soundEnabled: false });
    expect(await loadDockSettings(db)).toMatchObject({ locale: 'id', soundEnabled: false });

    const raw: IDBPDatabase<RawSchema> = await trackedOpen(() => openDB<RawSchema>(DB_NAME));
    await raw.put('settings', { id: 'app', locale: 'xx' });
    expect(await loadDockSettings(db)).toBeNull();
  });

  it('round-trips guided progress and rejects invalid snapshots', async () => {
    const db: AbyDB = await trackedOpen(() => openDatabase(DB_NAME));
    const session = sessionAtS02();
    await saveDockProgress(db, session);
    const restored = await loadDockProgress(db, 'the-sharing-tide');
    expect(restored).toMatchObject({ spreadId: 'S02', boarded: true, completed: false });

    const raw: IDBPDatabase<RawSchema> = await trackedOpen(() => openDB<RawSchema>(DB_NAME));
    await raw.put('progress', { storyId: 'the-sharing-tide', session: { spreadId: 42 } });
    expect(await loadDockProgress(db, 'the-sharing-tide')).toBeNull();
    await expect(saveDockProgress(db, { ...session, spreadId: '' } as never)).rejects.toThrow();
  });

  it('round-trips package readiness and completion, then resets the story calmly', async () => {
    const db: AbyDB = await trackedOpen(() => openDatabase(DB_NAME));
    await saveDockReadiness(db, {
      ready: true,
      packageId: 'the-sharing-tide-0.1.0',
      storyVersion: '0.1.0',
      missingAssets: [],
      failedHashes: [],
    });
    await saveDockCompletion(db, { storyId: 'the-sharing-tide', routeId: null });
    expect(await loadDockReadiness(db, 'the-sharing-tide-0.1.0')).toMatchObject({ ready: true });
    expect(await loadDockCompletion(db)).toMatchObject({ storyId: 'the-sharing-tide' });

    await saveDockSettings(db, { locale: 'id' });
    await resetDockStory(db);
    expect(await loadDockProgress(db, 'the-sharing-tide')).toBeNull();
    expect(await loadDockCompletion(db)).toBeNull();
    expect(await loadDockReadiness(db, 'the-sharing-tide-0.1.0')).toBeNull();
    expect(await loadDockSettings(db)).toMatchObject({ locale: 'id' });
  });

  it('preserves dock records across a reopen (idempotent upgrade)', async () => {
    const first: AbyDB = await trackedOpen(() => openDatabase(DB_NAME));
    await saveDockSettings(first, { locale: 'id' });
    await saveDockProgress(first, sessionAtS02());
    first.close();

    const second: AbyDB = await trackedOpen(() => openDatabase(DB_NAME));
    expect(await loadDockSettings(second)).toMatchObject({ locale: 'id' });
    expect(await loadDockProgress(second, 'the-sharing-tide')).toMatchObject({
      spreadId: 'S02',
    });
  });
});
