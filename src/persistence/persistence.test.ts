import 'fake-indexeddb/auto';
import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProgressSnapshot } from '../reader/types';
import type { AbyDB } from './db';
import { openDatabase, STORES } from './db';
import {
  loadKeepsake,
  loadPackageState,
  loadProgress,
  loadSettings,
  resetStoryState,
  saveKeepsake,
  savePackageState,
  saveProgress,
  saveSettings,
} from './repos';

const DB_NAME = 'aby-little-book-test';

// Every connection is tracked so afterEach can close them all, even when an
// assertion fails before a test reaches its own close() call. A lingering
// connection would otherwise block the deleteDatabase cleanup forever.
const openConnections = new Set<{ close(): void }>();

async function trackedOpen<T extends { close(): void }>(open: () => Promise<T>): Promise<T> {
  const db = await open();
  openConnections.add(db);
  return db;
}

function openTestDb(): Promise<AbyDB> {
  return trackedOpen(() => openDatabase(DB_NAME));
}

async function rawDb(): Promise<IDBPDatabase<TestSchema>> {
  // Opens whatever exists without upgrading, so tests can corrupt records
  // in stores created by openDatabase.
  return trackedOpen(() => openDB<TestSchema>(DB_NAME));
}

type TestSchema = DBSchema & {
  progress: { key: string; value: unknown };
  settings: { key: string; value: unknown };
  completion: { key: string; value: unknown };
  packageState: { key: string; value: unknown };
};

function makeSnapshot(overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot {
  return {
    storyId: 'the-starlight-rescue',
    astronautId: 'aby',
    locale: 'en',
    currentSpreadId: 'S02',
    route: null,
    history: ['S01', 'S02'],
    completed: false,
    savedAt: 1000,
    ...overrides,
  };
}

afterEach(async () => {
  vi.restoreAllMocks();
  for (const db of openConnections) {
    db.close();
  }
  openConnections.clear();
  // Resolve on blocked too: cleanup must never hang the suite.
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
});

describe('IndexedDB repositories', () => {
  it('reports no state on first launch', async () => {
    const db = await openTestDb();
    expect(await loadSettings(db)).toBeNull();
    expect(await loadProgress(db, 'the-starlight-rescue')).toBeNull();
    expect(await loadKeepsake(db)).toBeNull();
    expect(await loadPackageState(db, 'the-starlight-rescue-0.1.0')).toBeNull();
    db.close();
  });

  it('round-trips settings', async () => {
    const db = await openTestDb();
    await saveSettings(db, { locale: 'id', astronautId: 'maya' });
    expect(await loadSettings(db)).toEqual({ id: 'app', locale: 'id', astronautId: 'maya' });
    db.close();
  });

  it('round-trips progress snapshots with choices and history', async () => {
    const db = await openTestDb();
    const snapshot = makeSnapshot({
      currentSpreadId: 'B05',
      route: 'singing-starfield',
      history: ['S01', 'S02', 'S03', 'B04', 'B05'],
    });
    await saveProgress(db, snapshot);
    const loaded = await loadProgress(db, 'the-starlight-rescue');
    expect(loaded).toEqual(snapshot);
    expect(loaded?.route).toBe('singing-starfield');
    db.close();
  });

  it('round-trips the Lumi keepsake and package readiness', async () => {
    const db = await openTestDb();
    await saveKeepsake(db, true);
    expect(await loadKeepsake(db)).toBe(true);

    const readiness = {
      packageId: 'the-starlight-rescue-0.1.0',
      ready: true,
      missingAssets: [],
      failedHashes: [],
    };
    await savePackageState(db, readiness);
    expect(await loadPackageState(db, readiness.packageId)).toEqual(readiness);
    db.close();
  });

  it('rejects malformed records and recovers with defaults', async () => {
    const db = await openTestDb();
    const raw = await rawDb();
    await raw.put('settings', { id: 'app', locale: 'klingon', astronautId: 'aby' });
    await raw.put('progress', {
      storyId: 'the-starlight-rescue',
      currentSpreadId: 42,
      history: 'nope',
    });
    await raw.put('completion', { id: 'keepsake', lumiKeepsake: 'yes' });
    await raw.put('packageState', { packageId: 'the-starlight-rescue-0.1.0', ready: 'soon' });
    raw.close();

    expect(await loadSettings(db)).toBeNull();
    expect(await loadProgress(db, 'the-starlight-rescue')).toBeNull();
    expect(await loadKeepsake(db)).toBeNull();
    expect(await loadPackageState(db, 'the-starlight-rescue-0.1.0')).toBeNull();
    db.close();
  });

  it('rejects invalid writes before they reach the database', async () => {
    const db = await openTestDb();
    await saveProgress(db, makeSnapshot());
    await expect(
      saveProgress(db, { ...makeSnapshot(), history: [1, 2] } as unknown as ProgressSnapshot),
    ).rejects.toThrow();
    expect(await loadProgress(db, 'the-starlight-rescue')).toEqual(makeSnapshot());
    db.close();
  });

  it('keeps previously saved state when a transaction aborts', async () => {
    const db = await openTestDb();
    await saveProgress(db, makeSnapshot({ currentSpreadId: 'S03' }));

    const raw = await rawDb();
    const tx = raw.transaction('progress', 'readwrite');
    await tx.store.put(makeSnapshot({ currentSpreadId: 'S04' }));
    tx.abort();
    await expect(tx.done).rejects.toThrow();
    raw.close();

    expect((await loadProgress(db, 'the-starlight-rescue'))?.currentSpreadId).toBe('S03');
    db.close();
  });

  it('resets story state while preserving settings', async () => {
    const db = await openTestDb();
    await saveSettings(db, { locale: 'id', astronautId: 'niko' });
    await saveProgress(db, makeSnapshot());
    await saveKeepsake(db, true);
    await savePackageState(db, {
      packageId: 'the-starlight-rescue-0.1.0',
      ready: true,
      missingAssets: [],
      failedHashes: [],
    });

    await resetStoryState(db);

    expect(await loadProgress(db, 'the-starlight-rescue')).toBeNull();
    expect(await loadKeepsake(db)).toBeNull();
    expect(await loadPackageState(db, 'the-starlight-rescue-0.1.0')).toBeNull();
    expect(await loadSettings(db)).toEqual({ id: 'app', locale: 'id', astronautId: 'niko' });
    db.close();
  });

  it('creates all stores through the versioned migration', async () => {
    const db = await openTestDb();
    expect(db.objectStoreNames).toContain('settings');
    expect(db.objectStoreNames).toContain('progress');
    expect(db.objectStoreNames).toContain('completion');
    expect(db.objectStoreNames).toContain('packageState');
    expect(db.version).toBe(1);
    db.close();

    const reopened = await openTestDb();
    expect(reopened.version).toBe(1);
    expect(STORES).toEqual(['settings', 'progress', 'completion', 'packageState']);
    reopened.close();
  });

  it('performs persistence without any network service', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const db = await openTestDb();
    await saveSettings(db, { locale: 'en', astronautId: 'aby' });
    await saveProgress(db, makeSnapshot());
    await saveKeepsake(db, false);
    await resetStoryState(db);
    await loadProgress(db, 'the-starlight-rescue');
    db.close();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
