import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import bibleJson from '../../art/style-bible.json';
import type { Locale } from '../app/locale.js';
import type { Scene as SceneContract } from '../scene/package.js';
import { styleBibleSchema } from '../scene/styleBible.js';
import { useReducedMotion } from '../scene/useReducedMotion.js';
import type { SpeechProvider } from '../speech/speech.js';
import { ROUTE_PATHS, type RouteId, STORY_SPREADS, sharingTide } from '../story/sharingTide.js';
import { type CameraBeat, layoutCamera, poseForBeat } from '../three/camera.js';
import { DockCanvas } from '../three/DockCanvas.js';
import { HotspotLayer } from '../three/HotspotLayer.js';
import { STORY_STAGING } from '../three/staging.js';
import { TAP_TARGETS_BY_SPREAD } from '../three/tapTargets.js';
import {
  boardBoat,
  cameraBeatFor,
  chooseRoute,
  finishGuided,
  type GuidedSession,
  goBack,
  goForward,
  tapTarget,
} from './guided.js';

// The real guided reader: the full Sharing Tide over the hybrid stage. DOM
// owns every word and choice (bilingual, focusable, announced); the canvas
// is decorative scenery with a poster fallback, exactly like the harness.
// Navigation is engine-honest: held transitions return the same reference,
// so Next/Finish appear only when the engine can actually move.

const STRINGS: Record<
  Locale,
  {
    next: string;
    back: string;
    finish: string;
    close: string;
    missingSpread: string;
  }
> = {
  en: {
    next: 'Next',
    back: 'Back',
    finish: 'Finish',
    close: 'Close the book',
    missingSpread: 'This page is missing.',
  },
  id: {
    next: 'Lanjut',
    back: 'Kembali',
    finish: 'Selesai',
    close: 'Tutup buku',
    missingSpread: 'Halaman ini hilang.',
  },
};

export type GuidedReaderViewProps = {
  session: GuidedSession;
  locale: Locale;
  speech: SpeechProvider | null;
  scenes: Map<string, SceneContract>;
  posterSrc: string;
  onSessionChange: (next: GuidedSession) => void;
  onClose: () => void;
  onFinish: () => void;
};

export function GuidedReaderView({
  session,
  locale,
  speech,
  scenes,
  posterSrc,
  onSessionChange,
  onClose,
  onFinish,
}: GuidedReaderViewProps): React.JSX.Element {
  const bible = useMemo(() => styleBibleSchema.parse(bibleJson), []);
  const reducedMotion = useReducedMotion();
  const [beat, setBeat] = useState<CameraBeat | null>(null);
  const strings = STRINGS[locale];

  // Keyboard reading starts immediately: focus on entry so arrows and
  // Escape work without a first manual tab.
  const readerRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    readerRef.current?.focus();
  }, []);

  // Measured stage pixels drive both the aspect layout and hotspot
  // projection, so buttons sit on their subjects at any viewport.
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 1180, height: 820 });
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (stage === null) {
      return;
    }
    const measure = (): void => {
      setSize({ width: stage.clientWidth || 1180, height: stage.clientHeight || 820 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const spread = STORY_SPREADS.find((entry) => entry.id === session.spreadId);
  if (spread === undefined) {
    return (
      <main>
        <p>{strings.missingSpread}</p>
      </main>
    );
  }

  const layout = size.width >= size.height ? 'ipad-landscape' : 'phone-portrait';
  const staged = STORY_STAGING[session.spreadId as keyof typeof STORY_STAGING] ?? [];
  const targets =
    TAP_TARGETS_BY_SPREAD[session.spreadId as keyof typeof TAP_TARGETS_BY_SPREAD] ?? [];
  const pose = poseForBeat(layoutCamera(bible, layout), beat);
  const tapped = session.taps[spread.id];
  const activeId =
    tapped !== undefined && tapped.length > 0 ? (tapped[tapped.length - 1] ?? null) : null;

  const canAdvance = goForward(session, STORY_SPREADS) !== session;
  const atEnd = session.index >= session.path.length - 1;
  const choosing = spread.interaction?.kind === 'route-choice' && session.routeId === null;

  const commit = (next: GuidedSession): void => {
    if (next !== session) {
      onSessionChange(next);
    }
  };

  const navigate = (direction: 'forward' | 'back'): void => {
    speech?.cancel();
    setBeat(cameraBeatFor(direction, reducedMotion ? 'reduced' : 'full'));
    commit(direction === 'forward' ? goForward(session, STORY_SPREADS) : goBack(session));
  };

  const activate = (targetId: string): void => {
    const tapped = tapTarget(session, STORY_SPREADS, spread.id, targetId);
    // Boarding is a tap with a consequence: touching the boat on the dock
    // spread records the word and commits the required interaction in a
    // single session update, so observers see one change, not two.
    commit(
      spread.interaction?.kind === 'board' && spread.interaction.target === targetId
        ? boardBoat(tapped, STORY_SPREADS, targetId)
        : tapped,
    );
  };

  const choose = (routeId: RouteId): void => {
    speech?.cancel();
    // Choosing switches the session onto that route's path (both share the
    // S01-S04 prefix, so the index stays put) and stays on the choice
    // spread; Next appears once the engine sees the requirement met.
    commit(chooseRoute(session, routeId, ROUTE_PATHS[routeId]));
  };

  const finish = (): void => {
    speech?.cancel();
    const done = finishGuided(session, STORY_SPREADS);
    if (done.completed) {
      onFinish();
    }
  };

  return (
    <main
      ref={readerRef}
      tabIndex={-1}
      aria-label={spread.title[locale]}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          speech?.cancel();
          onClose();
        }
      }}
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#0a1830' }}
    >
      <div ref={stageRef} style={{ position: 'absolute', inset: 0 }}>
        <DockCanvas
          bible={bible}
          layout={layout}
          beat={beat}
          label={spread.title[locale]}
          posterSrc={posterSrc}
          scenes={scenes}
          staged={staged}
        >
          <HotspotLayer
            pose={pose}
            width={size.width}
            height={size.height}
            targets={targets}
            locale={locale}
            activeId={activeId}
            speech={speech}
            onActivate={activate}
          />
        </DockCanvas>
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }}>
        <h1>{spread.title[locale]}</h1>
        <p>{spread.prose[locale]}</p>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        {choosing
          ? sharingTide.routes.map((route) => (
              <button key={route.id} type="button" onClick={() => choose(route.id as RouteId)}>
                {route.title[locale]}
              </button>
            ))
          : null}
        {session.index > 0 ? (
          <button type="button" onClick={() => navigate('back')}>
            {strings.back}
          </button>
        ) : null}
        {canAdvance && !atEnd ? (
          <button type="button" onClick={() => navigate('forward')}>
            {strings.next}
          </button>
        ) : null}
        {atEnd ? (
          <button type="button" onClick={finish}>
            {strings.finish}
          </button>
        ) : null}
        <button type="button" onClick={onClose}>
          {strings.close}
        </button>
      </div>
    </main>
  );
}
