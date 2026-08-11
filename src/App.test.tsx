import 'fake-indexeddb/auto';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { preparePackage } from './offline/prepare';
import { openDatabase } from './persistence/db';
import { saveKeepsake, savePackageState, saveProgress, saveSettings } from './persistence/repos';
import { SPREAD08_PACKAGE_ID } from './story/spread08';
import { story } from './story/starlight-rescue';

// The App wires the real application: boot restore from IndexedDB, the
// preparation flow (download/verify/commit through preparePackage), reading,
// completion, caregiver settings, and protected reset. preparePackage itself
// is covered 100% in src/offline/prepare.test.ts, so here it is mocked to
// drive the app's own wiring deterministically.

vi.mock('./offline/prepare', () => ({
  preparePackage: vi.fn(),
}));

const READY_PREPARATION = {
  packageId: 'the-starlight-rescue-0.1.0',
  storyVersion: '0.1.0',
  phase: 'ready',
  pending: [],
  unverified: [],
  failed: [],
  receivedBytes: 654428,
  totalBytes: 654428,
  previousReady: null,
  evicted: false,
  error: null,
} as const;

function mockPrepareReady(): void {
  vi.mocked(preparePackage).mockImplementation(async (manifest, deps) => {
    await deps.saveReadiness({
      packageId: manifest.packageId,
      storyVersion: manifest.storyVersion,
      ready: true,
      missingAssets: [],
      failedHashes: [],
    });
    return {
      preparation: READY_PREPARATION,
      readiness: {
        ready: true,
        packageId: 'the-starlight-rescue-0.1.0',
        storyVersion: '0.1.0',
        missingAssets: [],
        failedHashes: [],
      },
    };
  });
}

async function prepareBook(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Prepare the book' }));
  await screen.findByRole('heading', { level: 2, name: 'A Tiny Signal' });
}

async function clearDatabase(name: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      for (const store of ['settings', 'progress', 'completion', 'packageState']) {
        if (!request.result.objectStoreNames.contains(store)) {
          request.result.createObjectStore(store, {
            keyPath: store === 'progress' ? 'storyId' : 'id',
          });
        }
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(
        ['settings', 'progress', 'completion', 'packageState'],
        'readwrite',
      );
      for (const store of ['settings', 'progress', 'completion', 'packageState']) {
        transaction.objectStore(store).clear();
      }
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    };
    request.onerror = () => reject(request.error);
  });
}

describe('application wiring', () => {
  beforeEach(() => {
    mockPrepareReady();
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: { open: vi.fn().mockResolvedValue(null) },
    });
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(async () => {
    vi.clearAllMocks();
    // Clear stores rather than delete the database: the App keeps its own
    // IndexedDB connection open, and deleteDatabase would block on it.
    await clearDatabase('aby-little-book');
  });

  it('renders the accessible application landmark', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the application title as the top-level heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Aby Little Book' })).toBeInTheDocument();
  });

  it('opens on the calm bookshelf with the story card', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'The Starlight Rescue' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prepare the book' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'For grown-ups' })).toBeInTheDocument();
  });

  it('keeps the initial state calm and non-blaming', () => {
    render(<App />);
    const main = screen.getByRole('main');
    expect(main).not.toHaveTextContent(/error|wrong|fail|gagal|salah/i);
  });

  it('prepares the book and opens the reader at the first spread', async () => {
    const user = userEvent.setup();
    render(<App />);
    await prepareBook(user);
    expect(preparePackage).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { level: 2, name: 'A Tiny Signal' })).toBeInTheDocument();
  });

  it('offers Open on the card once the package is ready', async () => {
    const user = userEvent.setup();
    const db = await openDatabase();
    await savePackageState(db, {
      packageId: SPREAD08_PACKAGE_ID,
      ready: true,
      missingAssets: [],
      failedHashes: [],
    });
    db.close();
    render(<App />);
    await screen.findByRole('button', { name: 'Open the book' });
    // The portal preview then starts preparation from Begin.
    await user.click(screen.getByRole('button', { name: 'Open the book' }));
    await screen.findByRole('button', { name: 'Begin' });
    await user.click(screen.getByRole('button', { name: 'Begin' }));
    await screen.findByRole('heading', { level: 2, name: 'A Tiny Signal' });
  });

  it('shows the calm failure state and recovers on retry', async () => {
    const user = userEvent.setup();
    vi.mocked(preparePackage).mockImplementationOnce(async (manifest, deps) => {
      await deps.saveReadiness({
        packageId: manifest.packageId,
        storyVersion: manifest.storyVersion,
        ready: false,
        missingAssets: ['assets/layers/ipad-landscape/bg-space.webp'],
        failedHashes: [],
      });
      return {
        preparation: {
          ...READY_PREPARATION,
          phase: 'failed',
          error: 'Some pages could not be saved.',
          failed: ['assets/layers/ipad-landscape/bg-space.webp'],
        },
        readiness: {
          ready: false,
          packageId: 'the-starlight-rescue-0.1.0',
          storyVersion: '0.1.0',
          missingAssets: [],
          failedHashes: [],
        },
      };
    });
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Prepare the book' }));
    await screen.findByRole('button', { name: 'Try again' });
    expect(screen.getByText(/some pages could not be saved/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('heading', { level: 2, name: 'A Tiny Signal' });
  });

  it('navigates spreads, closes with Escape, and offers Continue', async () => {
    const user = userEvent.setup();
    render(<App />);
    await prepareBook(user);
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    await screen.findByRole('heading', { level: 2, name: 'The Star Lamp' });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('main'), { key: 'Escape' });
    });
    await screen.findByRole('button', { name: 'Continue reading' });
  });

  it('restores saved progress on boot and continues from the saved spread', async () => {
    const user = userEvent.setup();
    const db = await openDatabase();
    await saveProgress(db, {
      storyId: story.id,
      astronautId: 'aby',
      locale: 'en',
      currentSpreadId: 'S02',
      route: null,
      history: ['S01', 'S02'],
      completed: false,
      savedAt: 1000,
    });
    db.close();
    render(<App />);
    await screen.findByRole('button', { name: 'Continue reading' });
    await user.click(screen.getByRole('button', { name: 'Continue reading' }));
    await screen.findByRole('heading', { level: 2, name: 'The Star Lamp' });
  });

  it('restores a completed run with the keepsake and offers Read again', async () => {
    const user = userEvent.setup();
    const db = await openDatabase();
    await saveProgress(db, {
      storyId: story.id,
      astronautId: 'maya',
      locale: 'en',
      currentSpreadId: 'S10',
      route: 'asteroid-garden',
      history: ['S01', 'S02', 'S03', 'A04', 'A05', 'A06', 'S07', 'S08', 'S09', 'S10'],
      completed: true,
      savedAt: 1000,
    });
    await saveKeepsake(db, true);
    db.close();
    render(<App />);
    await screen.findByRole('button', { name: 'Read again' });
    expect(screen.getByText(/lumi glows on your shelf/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Read again' }));
    await screen.findByRole('button', { name: 'Begin' });
  });

  it('switches locale through the caregiver settings and persists it', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await user.click(screen.getByRole('button', { name: 'For grown-ups' }));
    await screen.findByRole('dialog', { name: 'For grown-ups' });
    await user.click(screen.getByRole('button', { name: /open grown-up settings/i }));
    await screen.findByRole('dialog', { name: 'Grown-up settings' });
    await user.click(screen.getByRole('button', { name: 'Bahasa Indonesia' }));
    // Label switches to Indonesian after the locale change; the class is stable.
    const closeButton = container.querySelector('button.caregiver-controls__close');
    expect(closeButton).not.toBeNull();
    await user.click(closeButton as HTMLButtonElement);
    await screen.findByRole('button', { name: 'Siapkan bukunya' });
    // Persisted: a reload-like second boot restores Indonesian.
    const db = await openDatabase();
    const settings = await (await import('./persistence/repos')).loadSettings(db);
    db.close();
    expect(settings?.locale).toBe('id');
  });

  it('protects the reset behind the caregiver gate and clears everything', async () => {
    const user = userEvent.setup();
    const db = await openDatabase();
    await saveProgress(db, {
      storyId: story.id,
      astronautId: 'aby',
      locale: 'en',
      currentSpreadId: 'S10',
      route: 'asteroid-garden',
      history: ['S01', 'S02', 'S03', 'A04', 'A05', 'A06', 'S07', 'S08', 'S09', 'S10'],
      completed: true,
      savedAt: 1000,
    });
    await saveKeepsake(db, true);
    db.close();
    render(<App />);
    await screen.findByRole('button', { name: 'Read again' });
    await user.click(screen.getByRole('button', { name: 'For grown-ups' }));
    await screen.findByRole('dialog', { name: 'For grown-ups' });
    await user.click(screen.getByRole('button', { name: /open grown-up settings/i }));
    await screen.findByRole('dialog', { name: 'Grown-up settings' });
    await user.click(screen.getByRole('button', { name: 'Start the book over' }));
    await screen.findByRole('dialog', { name: 'Start the book over' });
    expect(screen.getByText(/removes reading progress/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Erase everything' }));
    await screen.findByRole('button', { name: 'Prepare the book' });
    // Everything is gone from storage.
    const reopened = await openDatabase();
    const progress = await (await import('./persistence/repos')).loadProgress(reopened, story.id);
    reopened.close();
    expect(progress).toBeNull();
  });

  it('shows the preparing card state while a download runs', async () => {
    let resolveSaveReadiness: () => void = () => undefined;
    vi.mocked(preparePackage).mockImplementationOnce(
      async (manifest, deps) =>
        new Promise((resolve) => {
          resolveSaveReadiness = async () => {
            await deps.saveReadiness({
              packageId: manifest.packageId,
              storyVersion: manifest.storyVersion,
              ready: true,
              missingAssets: [],
              failedHashes: [],
            });
            resolve({
              preparation: READY_PREPARATION,
              readiness: {
                ready: true,
                packageId: 'the-starlight-rescue-0.1.0',
                storyVersion: '0.1.0',
                missingAssets: [],
                failedHashes: [],
              },
            });
          };
        }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Prepare the book' }));
    await screen.findByText(/saving the story/i);
    // The card no longer offers Prepare while the download is pending.
    expect(screen.queryByRole('button', { name: 'Prepare the book' })).toBeNull();
    await act(async () => {
      resolveSaveReadiness();
    });
    await screen.findByRole('heading', { level: 2, name: 'A Tiny Signal' });
  });

  it('keeps settings untouched by a reset', async () => {
    const user = userEvent.setup();
    const db = await openDatabase();
    await saveSettings(db, { locale: 'id', astronautId: 'niko' });
    db.close();
    render(<App />);
    await screen.findByRole('button', { name: 'Siapkan bukunya' });
    await user.click(screen.getByRole('button', { name: 'Untuk orang dewasa' }));
    await screen.findByRole('dialog', { name: 'Untuk orang dewasa' });
    await user.click(screen.getByRole('button', { name: /buka pengaturan/i }));
    await screen.findByRole('dialog', { name: 'Pengaturan dewasa' });
    await user.click(screen.getByRole('button', { name: 'Mulai buku dari awal' }));
    await screen.findByRole('dialog', { name: 'Mulai buku dari awal' });
    await user.click(screen.getByRole('button', { name: 'Hapus semuanya' }));
    await screen.findByRole('button', { name: 'Siapkan bukunya' });
  });
});
