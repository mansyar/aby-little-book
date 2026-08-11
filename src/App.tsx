import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { type AppEvent, type AppState, initialAppState, reduceAppState } from './app/appState';
import { ErrorBoundary } from './app/ErrorBoundary';
import { DEFAULT_LOCALE, isLocale, type Locale } from './app/locale';
import { shellStrings } from './app/strings';
import {
  CaregiverControls,
  type CaregiverSettings,
  type TextScale,
} from './caregiver/CaregiverControls';
import { CaregiverGate } from './caregiver/CaregiverGate';
import { CAREGIVER_STRINGS } from './caregiver/caregiverStrings';
import { ResetConfirm } from './caregiver/ResetConfirm';
import { CompletionView } from './completion/CompletionView';
import { COMPLETION_STRINGS } from './completion/completionStrings';
import { PrepareView } from './offline/PrepareView';
import { preparePackage } from './offline/prepare';
import { PREPARE_STRINGS } from './offline/prepareStrings';
import { PACKAGE_CACHE_NAME } from './offline/swRoutes';
import { openDatabase } from './persistence/db';
import type { PackageStateRecord } from './persistence/records';
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
} from './persistence/repos';
import { createSession, fromSnapshot } from './reader/engine';
import { ReaderView } from './reader/ReaderView';
import { Spread08Preview } from './reader/Spread08Preview';
import { type BookCardState, BookshelfView } from './shelf/BookshelfView';
import { BOOKSHELF_STRINGS } from './shelf/bookshelfStrings';
import { PreviewView } from './shelf/PreviewView';
import type { PackageReadiness } from './story/contracts';
import { SPREAD08_BASE_PATH, SPREAD08_MANIFEST, SPREAD08_PACKAGE_ID } from './story/spread08';
import { story } from './story/starlight-rescue';

function isPreviewRequest(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return new URLSearchParams(window.location.search).get('preview') === '1';
}

function previewLocale(): Locale {
  const requested = new URLSearchParams(window.location.search).get('locale');
  return requested !== null && isLocale(requested) ? requested : DEFAULT_LOCALE;
}

type PreparationRun = {
  phase: 'downloading' | 'verifying' | 'failed' | 'ready' | 'idle';
  fraction: number;
  error: string | null;
};

type LocalSettings = CaregiverSettings & { astronautId: 'aby' | 'maya' | 'niko' };

export function App() {
  const [state, dispatch] = useReducer(reduceAppState, undefined, initialAppState);
  const [settings, setSettings] = useState<LocalSettings>({
    locale: 'en',
    astronautId: 'aby',
    soundEnabled: true,
    textScale: 'standard',
    reducedMotion: false,
  });
  const [keepsake, setKeepsake] = useState(false);
  const [progressInfo, setProgressInfo] = useState<{ exists: boolean; completed: boolean }>({
    exists: false,
    completed: false,
  });
  const [packageState, setPackageState] = useState<PackageStateRecord | null>(null);
  const [preparation, setPreparation] = useState<PreparationRun>({
    phase: 'idle',
    fraction: 0,
    error: null,
  });
  const [caregiverStep, setCaregiverStep] = useState<'gate' | 'controls' | 'reset'>('gate');
  const dbPromise = useRef<ReturnType<typeof openDatabase> | null>(null);

  const db = useMemo(() => {
    if (dbPromise.current === null) {
      dbPromise.current = openDatabase();
    }
    return dbPromise.current;
  }, []);

  // Boot: restore validated local state (settings, package readiness,
  // keepsake, progress existence for the Continue/Read Again card actions).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const database = await db;
      const [loadedSettings, loadedPackage, loadedKeepsake, loadedProgress] = await Promise.all([
        loadSettings(database),
        loadPackageState(database, SPREAD08_PACKAGE_ID),
        loadKeepsake(database),
        loadProgress(database, story.id),
      ]);
      if (cancelled) {
        return;
      }
      if (loadedSettings !== null) {
        setSettings((current) => ({
          ...current,
          locale: loadedSettings.locale,
          astronautId: loadedSettings.astronautId,
          soundEnabled: loadedSettings.soundEnabled ?? current.soundEnabled,
          textScale: loadedSettings.textScale ?? current.textScale,
          reducedMotion: loadedSettings.reducedMotion ?? current.reducedMotion,
        }));
        dispatch({ type: 'set-locale', locale: loadedSettings.locale });
        dispatch({ type: 'set-astronaut', astronautId: loadedSettings.astronautId });
      }
      setPackageState(loadedPackage);
      setKeepsake(loadedKeepsake === true);
      setProgressInfo(
        loadedProgress === null
          ? { exists: false, completed: false }
          : { exists: true, completed: loadedProgress.completed },
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [db]);

  const persistAtBoundary = (event: AppEvent, next: AppState) => {
    if (event.type === 'update-reader' && next.session !== null) {
      const session = next.session;
      setProgressInfo({ exists: true, completed: session.completed });
      void (async () => {
        const database = await db;
        await saveProgress(database, {
          storyId: session.story.id,
          astronautId: session.astronautId,
          locale: session.locale,
          currentSpreadId: session.currentSpreadId,
          route: session.route,
          history: session.history,
          completed: session.completed,
          savedAt: Date.now(),
        });
        if (session.completed) {
          await saveKeepsake(database, true);
          setKeepsake(true);
        }
      })();
      return;
    }
    if (event.type === 'close-reader' && state.session !== null) {
      const session = state.session;
      setProgressInfo({ exists: true, completed: session.completed });
      void (async () => {
        const database = await db;
        await saveProgress(database, {
          storyId: session.story.id,
          astronautId: session.astronautId,
          locale: session.locale,
          currentSpreadId: session.currentSpreadId,
          route: session.route,
          history: session.history,
          completed: session.completed,
          savedAt: Date.now(),
        });
      })();
    }
  };

  const dispatchAndPersist = (event: AppEvent) => {
    const next = reduceAppState(state, event);
    if (next === state) {
      return;
    }
    persistAtBoundary(event, next);
    dispatch(event);
  };

  const bookCardState = (): BookCardState => {
    if (progressInfo.completed) {
      return 'complete';
    }
    if (progressInfo.exists) {
      return 'in-progress';
    }
    if (packageState?.ready === true) {
      return 'ready';
    }
    if (preparation.phase === 'downloading' || preparation.phase === 'verifying') {
      return 'preparing';
    }
    return 'new';
  };

  const beginPreparation = async () => {
    dispatch({ type: 'begin-preparation' });
    setPreparation({ phase: 'downloading', fraction: 0, error: null });
    const database = await db;
    const result = await preparePackage(SPREAD08_MANIFEST, {
      basePath: SPREAD08_BASE_PATH,
      cacheName: PACKAGE_CACHE_NAME,
      fetchImpl: (input: RequestInfo | URL) => fetch(input),
      cachesImpl: caches,
      saveReadiness: async (readiness: PackageReadiness) => {
        setPackageState({
          packageId: readiness.packageId,
          ready: readiness.ready,
          missingAssets: readiness.missingAssets,
          failedHashes: readiness.failedHashes,
        });
        if (readiness.ready) {
          await savePackageState(database, readiness);
        }
      },
      onProgress: (receivedBytes: number) => {
        setPreparation((current) => ({
          ...current,
          fraction: receivedBytes / SPREAD08_MANIFEST.totalBytes,
        }));
      },
    });
    setPreparation({
      phase: result.preparation.phase,
      fraction: result.preparation.receivedBytes / result.preparation.totalBytes,
      error: result.preparation.error,
    });
    if (result.preparation.phase === 'ready') {
      dispatch({
        type: 'preparation-ready',
        session: createSession(story, settings.astronautId, state.locale),
      });
    }
  };

  const openContinue = async () => {
    const database = await db;
    const progress = await loadProgress(database, story.id);
    if (progress === null) {
      return;
    }
    const restored = fromSnapshot(progress);
    dispatchAndPersist({ type: 'continue-story', session: restored });
  };

  const saveCaregiverSettings = (next: LocalSettings) => {
    setSettings(next);
    dispatch({ type: 'set-locale', locale: next.locale });
    dispatch({ type: 'set-astronaut', astronautId: next.astronautId });
    void (async () => {
      const database = await db;
      await saveSettings(database, {
        locale: next.locale,
        astronautId: next.astronautId,
        soundEnabled: next.soundEnabled,
        textScale: next.textScale,
        reducedMotion: next.reducedMotion,
      });
    })();
  };

  const performReset = () => {
    void (async () => {
      const database = await db;
      await resetStoryState(database);
    })();
    setKeepsake(false);
    setPackageState(null);
    setProgressInfo({ exists: false, completed: false });
    setCaregiverStep('gate');
    dispatch({ type: 'reset' });
  };

  const strings = shellStrings(state.locale);
  if (isPreviewRequest()) {
    // Phase 4 development harness: the Spread 08 vertical slice.
    return (
      <ErrorBoundary locale={previewLocale()}>
        <Spread08Preview locale={previewLocale()} />
      </ErrorBoundary>
    );
  }

  const caregiverSettings: CaregiverSettings = {
    locale: settings.locale,
    soundEnabled: settings.soundEnabled,
    textScale: settings.textScale,
    reducedMotion: settings.reducedMotion,
  };

  let view: React.JSX.Element;
  switch (state.view) {
    case 'bookshelf': {
      view = (
        <BookshelfView
          locale={state.locale}
          strings={BOOKSHELF_STRINGS[state.locale]}
          storyTitle={story.title}
          cardState={bookCardState()}
          keepsake={keepsake}
          onPrepare={() => void beginPreparation()}
          onOpen={() => void dispatchAndPersist({ type: 'open-story' })}
          onContinue={() => void openContinue()}
          onReadAgain={() => void dispatchAndPersist({ type: 'open-story' })}
          onCaregiver={() => {
            setCaregiverStep('gate');
            dispatchAndPersist({ type: 'open-caregiver' });
          }}
        />
      );
      break;
    }
    case 'preview': {
      view = (
        <PreviewView
          strings={BOOKSHELF_STRINGS[state.locale]}
          storyTitle={story.title}
          locale={state.locale}
          onBegin={() => void beginPreparation()}
        />
      );
      break;
    }
    case 'preparation': {
      view = (
        <PrepareView
          strings={PREPARE_STRINGS[state.locale]}
          phase={preparation.phase}
          progressFraction={preparation.fraction}
          error={preparation.error}
          onRetry={() => void beginPreparation()}
        />
      );
      break;
    }
    case 'reader': {
      if (state.session === null) {
        view = (
          <main className="app-shell" aria-label={strings.appName}>
            <h1 className="app-shell__title">{strings.appName}</h1>
            <p className="app-shell__status">{strings.initializing}</p>
          </main>
        );
        break;
      }
      view = (
        <ReaderView
          session={state.session}
          locale={state.locale}
          onSessionChange={(next) => dispatchAndPersist({ type: 'update-reader', session: next })}
          onClose={() => dispatchAndPersist({ type: 'close-reader' })}
        />
      );
      break;
    }
    case 'completion': {
      view = (
        <CompletionView
          strings={COMPLETION_STRINGS[state.locale]}
          storyTitle={story.title}
          locale={state.locale}
          onReplay={() => dispatchAndPersist({ type: 'replay' })}
        />
      );
      break;
    }
    case 'caregiver': {
      view = (
        <div className="caregiver">
          {caregiverStep === 'gate' ? (
            <CaregiverGate
              strings={CAREGIVER_STRINGS[state.locale]}
              onEnter={() => setCaregiverStep('controls')}
              onClose={() => dispatchAndPersist({ type: 'close-caregiver' })}
            />
          ) : null}
          {caregiverStep === 'controls' ? (
            <CaregiverControls
              strings={CAREGIVER_STRINGS[state.locale]}
              settings={caregiverSettings}
              preparing={preparation.phase === 'downloading' || preparation.phase === 'verifying'}
              onLocaleChange={(locale) => saveCaregiverSettings({ ...settings, locale })}
              onSoundChange={(soundEnabled) => saveCaregiverSettings({ ...settings, soundEnabled })}
              onTextScaleChange={(textScale: TextScale) =>
                saveCaregiverSettings({ ...settings, textScale })
              }
              onReducedMotionChange={(reducedMotion) =>
                saveCaregiverSettings({ ...settings, reducedMotion })
              }
              onPrepare={() => {
                setCaregiverStep('gate');
                dispatchAndPersist({ type: 'close-caregiver' });
                void dispatchAndPersist({ type: 'open-story' });
              }}
              onReset={() => setCaregiverStep('reset')}
              onClose={() => dispatchAndPersist({ type: 'close-caregiver' })}
            />
          ) : null}
          {caregiverStep === 'reset' ? (
            <ResetConfirm
              strings={CAREGIVER_STRINGS[state.locale]}
              onCancel={() => setCaregiverStep('controls')}
              onReset={() => performReset()}
            />
          ) : null}
        </div>
      );
      break;
    }
  }

  return <ErrorBoundary locale={state.locale}>{view}</ErrorBoundary>;
}
