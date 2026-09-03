import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import manifestJson from '../../art/manifest/the-sharing-tide-0.1.0.json';
import { initialDockState, reduceDockState } from '../app/dockApp.js';
import { CaregiverControls, type CaregiverSettings } from '../caregiver/CaregiverControls.js';
import { CaregiverGate } from '../caregiver/CaregiverGate.js';
import { CAREGIVER_STRINGS } from '../caregiver/caregiverStrings.js';
import { ResetConfirm } from '../caregiver/ResetConfirm.js';
import { CompletionView } from '../completion/CompletionView.js';
import { COMPLETION_STRINGS } from '../completion/completionStrings.js';
import { prepareDockPackage } from '../offline/prepareDock.js';
import { PACKAGE_CACHE_NAME } from '../offline/swRoutes.js';
import { openDatabase } from '../persistence/db.js';
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
} from '../persistence/dockRepos.js';
import { GuidedReaderView } from '../reader/GuidedReaderView.js';
import { type GuidedSession, startGuidedSession } from '../reader/guided.js';
import {
  type PackageReadiness,
  packageManifestSchema,
  type Scene as SceneContract,
} from '../scene/package.js';
import {
  browserSpeechProvider,
  type SpeechSynthesisLike,
  type UtteranceLike,
} from '../speech/browserSpeech.js';
import type { SpeechProvider } from '../speech/speech.js';
import { ROUTE_PATHS, STORY_SPREADS, sharingTide } from '../story/sharingTide.js';
import { posterFor } from '../three/poster.js';
import { type BoatState, DockHomeView } from './DockHomeView.js';
import { DOCK_STRINGS } from './dockStrings.js';

// The dock app: Starlit Dock home, explicit offline preparation, guided
// reader, calm completion with the lantern keepsake, and grown-ups controls.
// The view union in the dock reducer is the navigation model; IndexedDB is
// the only memory. Old-world views stay mounted on their own branches until
// the dead-code sweep removes them.

const manifest = packageManifestSchema.parse(manifestJson);
const DOCK_BASE_PATH = `/stories/${manifest.packageId}`;
const REED_PATH = ROUTE_PATHS['reed-channel'];

type PrepPhase = 'idle' | 'working' | 'failed';

export function DockApp(): React.JSX.Element {
  const [dock, dispatch] = useReducer(reduceDockState, undefined, initialDockState);
  const [settings, setSettings] = useState<CaregiverSettings>({
    locale: 'en',
    soundEnabled: true,
    textScale: 'standard',
    reducedMotion: false,
  });
  const [readiness, setReadiness] = useState<PackageReadiness | null>(null);
  const [savedSession, setSavedSession] = useState<GuidedSession | null>(null);
  const [keepsake, setKeepsake] = useState<{ storyId: string; routeId: string | null } | null>(
    null,
  );
  const [prep, setPrep] = useState<{ phase: PrepPhase; fraction: number }>({
    phase: 'idle',
    fraction: 0,
  });
  const [caregiverStep, setCaregiverStep] = useState<'gate' | 'controls' | 'reset'>('gate');
  const dbPromise = useRef<ReturnType<typeof openDatabase> | null>(null);

  const db = useMemo(() => {
    if (dbPromise.current === null) {
      dbPromise.current = openDatabase();
    }
    return dbPromise.current;
  }, []);

  // Boot: restore validated local state — settings, readiness, progress,
  // and the keepsake — so the dock opens on the honest boat state.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const database = await db;
      const [loadedSettings, loadedReadiness, loadedProgress, loadedCompletion] = await Promise.all(
        [
          loadDockSettings(database),
          loadDockReadiness(database, manifest.packageId),
          loadDockProgress(database, sharingTide.id),
          loadDockCompletion(database),
        ],
      );
      if (cancelled) {
        return;
      }
      if (loadedSettings !== null) {
        setSettings((current) => ({
          ...current,
          locale: loadedSettings.locale,
          soundEnabled: loadedSettings.soundEnabled ?? current.soundEnabled,
          textScale: loadedSettings.textScale ?? current.textScale,
          reducedMotion: loadedSettings.reducedMotion ?? current.reducedMotion,
        }));
        dispatch({ type: 'set-locale', locale: loadedSettings.locale });
      }
      setReadiness(loadedReadiness);
      setSavedSession(loadedProgress);
      setKeepsake(loadedCompletion);
    })();
    return () => {
      cancelled = true;
    };
  }, [db]);

  const scenes = useMemo(() => {
    const next = new Map<string, SceneContract>();
    for (const scene of manifest.scenes) {
      next.set(scene.id, { ...scene, glb: `${DOCK_BASE_PATH}/${scene.glb}` });
    }
    return next;
  }, []);

  const speech: SpeechProvider | null = useMemo(() => {
    if (!settings.soundEnabled) {
      return null;
    }
    const synth =
      typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
        ? (window.speechSynthesis as unknown as SpeechSynthesisLike)
        : null;
    return browserSpeechProvider({
      synth,
      utter: (text, lang) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        return utterance as unknown as UtteranceLike;
      },
    });
  }, [settings.soundEnabled]);

  const persistSession = (session: GuidedSession): void => {
    setSavedSession(session);
    void (async () => {
      const database = await db;
      await saveDockProgress(database, session);
    })();
  };

  const runPreparation = async (): Promise<void> => {
    setPrep({ phase: 'working', fraction: 0 });
    if (typeof caches === 'undefined') {
      setPrep({ phase: 'failed', fraction: 0 });
      return;
    }
    const database = await db;
    const result = await prepareDockPackage(manifest, {
      basePath: DOCK_BASE_PATH,
      cacheName: PACKAGE_CACHE_NAME,
      fetchImpl: (input: RequestInfo | URL) => fetch(input),
      cachesImpl: caches,
      saveReadiness: async (receipt: PackageReadiness) => {
        setReadiness(receipt);
        await saveDockReadiness(database, receipt);
      },
      onProgress: (receivedBytes: number, totalBytes: number) => {
        setPrep({ phase: 'working', fraction: receivedBytes / totalBytes });
      },
    });
    if (!result.ready) {
      setPrep({ phase: 'failed', fraction: 0 });
      return;
    }
    setPrep({ phase: 'idle', fraction: 1 });
    const fresh = startGuidedSession(sharingTide.id, REED_PATH);
    persistSession(fresh);
    dispatch({ type: 'preparation-ready', session: fresh, packageId: manifest.packageId });
  };

  const beginPreparation = (): void => {
    dispatch({ type: 'begin-preparation' });
    void runPreparation();
  };

  const boardFresh = (): GuidedSession => startGuidedSession(sharingTide.id, REED_PATH);

  const boatState = (): BoatState => {
    if (prep.phase === 'working') {
      return 'preparing';
    }
    if (savedSession !== null && !savedSession.completed) {
      return 'in-progress';
    }
    if (keepsake !== null || savedSession?.completed === true) {
      return 'complete';
    }
    if (readiness?.ready === true) {
      return 'ready';
    }
    if (prep.phase === 'failed') {
      return 'new';
    }
    return 'new';
  };

  const saveCaregiverSettings = (next: CaregiverSettings): void => {
    setSettings(next);
    dispatch({ type: 'set-locale', locale: next.locale });
    void (async () => {
      const database = await db;
      await saveDockSettings(database, { ...next });
    })();
  };

  const performReset = (): void => {
    void (async () => {
      const database = await db;
      await resetDockStory(database);
    })();
    setSavedSession(null);
    setReadiness(null);
    setKeepsake(null);
    setPrep({ phase: 'idle', fraction: 0 });
    setCaregiverStep('gate');
    dispatch({ type: 'reset' });
  };

  const locale = settings.locale;
  const dockStrings = DOCK_STRINGS[locale];
  const caregiverStrings = CAREGIVER_STRINGS[locale];
  const completionStrings = COMPLETION_STRINGS[locale];

  if (dock.view === 'reader') {
    const session = dock.session as GuidedSession | null;
    if (session === null) {
      return (
        <main>
          <p>{dockStrings.prepareFailed}</p>
        </main>
      );
    }
    const spreadTitle = STORY_SPREADS.find((entry) => entry.id === session.spreadId)?.title;
    return (
      <GuidedReaderView
        session={session}
        locale={locale}
        speech={speech}
        scenes={scenes}
        posterSrc={posterFor(spreadTitle?.[locale] ?? sharingTide.title[locale])}
        onSessionChange={(next) => {
          dispatch({ type: 'update-reader', session: next });
          persistSession(next);
        }}
        onClose={() => dispatch({ type: 'close-reader' })}
        onFinish={() => {
          const completion = { storyId: session.storyId, routeId: session.routeId };
          setKeepsake(completion);
          void (async () => {
            const database = await db;
            await saveDockCompletion(database, completion);
          })();
          dispatch({ type: 'finish', storyId: session.storyId });
        }}
      />
    );
  }

  if (dock.view === 'completion') {
    return (
      <CompletionView
        strings={completionStrings}
        storyTitle={sharingTide.title}
        locale={locale}
        onReplay={() => {
          const fresh = boardFresh();
          persistSession(fresh);
          dispatch({ type: 'replay', session: fresh });
        }}
      />
    );
  }

  if (dock.view === 'caregiver') {
    if (caregiverStep === 'reset') {
      return (
        <ResetConfirm
          strings={caregiverStrings}
          onReset={performReset}
          onCancel={() => setCaregiverStep('controls')}
        />
      );
    }
    if (caregiverStep === 'controls') {
      return (
        <CaregiverControls
          strings={caregiverStrings}
          settings={settings}
          preparing={prep.phase === 'working'}
          onLocaleChange={(next) => saveCaregiverSettings({ ...settings, locale: next })}
          onSoundChange={(enabled) => saveCaregiverSettings({ ...settings, soundEnabled: enabled })}
          onTextScaleChange={(textScale) => saveCaregiverSettings({ ...settings, textScale })}
          onReducedMotionChange={(reducedMotion) =>
            saveCaregiverSettings({ ...settings, reducedMotion })
          }
          onPrepare={() => void runPreparation()}
          onReset={() => setCaregiverStep('reset')}
          onClose={() => {
            setCaregiverStep('gate');
            dispatch({ type: 'close-caregiver' });
          }}
        />
      );
    }
    return (
      <CaregiverGate
        strings={caregiverStrings}
        onEnter={() => setCaregiverStep('controls')}
        onClose={() => dispatch({ type: 'close-caregiver' })}
      />
    );
  }

  if (dock.view === 'preparation' || prep.phase === 'failed') {
    return (
      <main aria-label={dockStrings.dockTitle}>
        <h1>{dockStrings.dockTitle}</h1>
        <p aria-live="polite">{dockStrings.preparing}</p>
        {prep.phase === 'failed' ? (
          <>
            <p>{dockStrings.prepareFailed}</p>
            <button type="button" onClick={() => void runPreparation()}>
              {dockStrings.tryAgain}
            </button>
            <button
              type="button"
              onClick={() => {
                setPrep({ phase: 'idle', fraction: 0 });
                dispatch({ type: 'cancel-preparation' });
              }}
            >
              {dockStrings.backToDock}
            </button>
          </>
        ) : null}
      </main>
    );
  }

  return (
    <DockHomeView
      locale={locale}
      strings={dockStrings}
      storyTitle={sharingTide.title}
      cardState={boatState()}
      keepsake={keepsake !== null}
      onPrepare={beginPreparation}
      onOpen={() => dispatch({ type: 'board-boat', session: boardFresh() })}
      onContinue={() => {
        if (savedSession !== null) {
          dispatch({ type: 'continue-story', session: savedSession });
        }
      }}
      onReadAgain={() => {
        const fresh = boardFresh();
        persistSession(fresh);
        dispatch({ type: 'board-boat', session: fresh });
      }}
      onCaregiver={() => {
        setCaregiverStep('gate');
        dispatch({ type: 'open-caregiver' });
      }}
    />
  );
}
