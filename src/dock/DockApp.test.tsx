import 'fake-indexeddb/auto';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import manifestJson from '../../art/manifest/the-sharing-tide-0.1.0.json';
import { initialDockState, reduceDockState } from '../app/dockApp.js';
import { openDatabase } from '../persistence/db.js';
import {
  loadDockProgress,
  resetDockStory,
  saveDockProgress,
  saveDockReadiness,
  saveDockSettings,
} from '../persistence/dockRepos.js';
import {
  boardBoat,
  chooseRoute,
  type GuidedSession,
  goForward,
  startGuidedSession,
} from '../reader/guided.js';
import { packageManifestSchema } from '../scene/package.js';
import { ROUTE_PATHS, STORY_SPREADS, sharingTide } from '../story/sharingTide.js';
import { DockApp } from './DockApp.js';

const manifest = packageManifestSchema.parse(manifestJson);
const REED_PATH = ROUTE_PATHS['reed-channel'];

function sessionAt(spreadId: string): GuidedSession {
  let session = boardBoat(startGuidedSession(sharingTide.id, REED_PATH), STORY_SPREADS, 'boat');
  let guard = 0;
  while (session.spreadId !== spreadId && guard < 20) {
    guard += 1;
    if (session.spreadId === 'S04' && session.routeId === null) {
      session = chooseRoute(session, 'reed-channel', REED_PATH);
      continue;
    }
    const next = goForward(session, STORY_SPREADS);
    if (next === session) {
      break;
    }
    session = next;
  }
  return session;
}

async function seed(progress: GuidedSession | null, ready: boolean): Promise<void> {
  const db = await openDatabase();
  await saveDockSettings(db, { locale: 'en' });
  await saveDockReadiness(db, {
    ready,
    packageId: manifest.packageId,
    storyVersion: manifest.storyVersion,
    missingAssets: [],
    failedHashes: [],
  });
  if (progress !== null) {
    await saveDockProgress(db, progress);
  }
  db.close();
}

function stubOfflineFailure(): void {
  vi.stubGlobal('fetch', async () => new Response(null, { status: 404 }));
  vi.stubGlobal('caches', {
    open: async () => ({ put: async () => undefined }),
  });
}

afterEach(async () => {
  vi.unstubAllGlobals();
  const db = await openDatabase();
  await resetDockStory(db);
  db.close();
});

describe('DockApp', () => {
  it('boots to the dock with preparation as the single action', async () => {
    render(<DockApp />);
    expect(await screen.findByRole('button', { name: 'Prepare the boat' })).toBeVisible();
    expect(screen.getByText('The Starlit Dock')).toBeVisible();
  });

  it('a failed preparation says so calmly and offers another try', async () => {
    stubOfflineFailure();
    render(<DockApp />);
    fireEvent.click(await screen.findByRole('button', { name: 'Prepare the boat' }));
    expect(await screen.findByText('Saving the story for offline.')).toBeVisible();
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Back to the dock' })).toBeVisible();
  });

  it('continues a saved float in the guided reader', async () => {
    await seed(sessionAt('S02'), true);
    render(<DockApp />);
    fireEvent.click(await screen.findByRole('button', { name: 'Keep floating' }));
    expect(await screen.findByRole('heading', { name: 'A Shy New Friend' })).toBeVisible();
  });

  it('finishing the ending keeps the lantern on the dock', async () => {
    await seed(sessionAt('S10'), true);
    render(<DockApp />);
    fireEvent.click(await screen.findByRole('button', { name: 'Keep floating' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Finish' }));
    expect(await screen.findByText('The Lantern Glows On')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /again/i }));
    expect(await screen.findByRole('heading', { name: 'Lanterns on the Water' })).toBeVisible();
  });

  it('the grown-ups door changes language and can erase everything', async () => {
    await seed(sessionAt('S02'), true);
    render(<DockApp />);
    fireEvent.click(await screen.findByRole('button', { name: 'For grown-ups' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Open grown-up settings' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Bahasa Indonesia' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Tutup pengaturan dewasa' }));
    // The saved float is unfinished, so the dock offers continuation in ID.
    expect(await screen.findByRole('button', { name: 'Lanjut berlayar' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Untuk orang dewasa' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Buka pengaturan dewasa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mulai buku dari awal' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Hapus semuanya' }));
    // Erased back to a new boat, still speaking Indonesian.
    expect(await screen.findByRole('button', { name: 'Siapkan perahu' })).toBeVisible();
  });

  it('keeps an in-progress float across a reload', async () => {
    await seed(sessionAt('S03'), true);
    const db = await openDatabase();
    const restored = await loadDockProgress(db, sharingTide.id);
    db.close();
    expect(restored?.spreadId).toBe('S03');
    // The reducer refuses to strand the child: closing returns to the dock.
    const docked = reduceDockState(
      { ...initialDockState(), view: 'reader', session: restored },
      { type: 'close-reader' },
    );
    expect(docked.view).toBe('dock');
  });
});
