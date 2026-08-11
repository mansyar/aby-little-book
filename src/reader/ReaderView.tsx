// The reader: engine-driven session navigation over the scene composition,
// route choice, isolated pronunciation, and optional interactions. Art is
// looked up per spread from the runtime manifest registry; spreads without
// authored art yet render the prose panel alone (Phase 7 fills the registry).

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LampInteraction } from '../scene/LampInteraction';
import { LAMP_STRINGS } from '../scene/lampStrings';
import { layersForState, selectLayout } from '../scene/layout';
import { ProseView } from '../scene/ProseView';
import { SceneView } from '../scene/SceneView';
import { useReducedMotion } from '../scene/useReducedMotion';
import {
  browserSpeechProvider,
  type SpeechSynthesisLike,
  type UtteranceLike,
} from '../speech/browserSpeech';
import { usePronunciation } from '../speech/usePronunciation';
import { eligibleWordSegments } from '../speech/words';
import type { Locale, PackageManifest, RouteId } from '../story/contracts';
import { SPREAD08_BASE_PATH, SPREAD08_LAMP_REGION, SPREAD08_MANIFEST } from '../story/spread08';
import { findAstronautGrammar, resolveProse } from '../story/tokens';
import { chooseRoute, goBack, goForward, resolveSpread } from './engine';
import { RouteChoiceView } from './RouteChoiceView';
import { READER_STRINGS, type ReaderStrings } from './readerStrings';
import type { ReaderSession } from './types';
import { useReaderGestures } from './useReaderGestures';

export type SpreadArt = {
  manifest: PackageManifest;
  basePath: string;
  lampRegion: Record<
    'ipad-landscape' | 'phone-portrait',
    { x: number; y: number; width: number; height: number }
  > | null;
};

// Runtime manifest registry: spreads with approved production art. Phase 7
// adds the remaining spreads here as their layers are exported and validated.
export const ART_BY_SPREAD: Readonly<Record<string, SpreadArt>> = {
  S08: {
    manifest: SPREAD08_MANIFEST,
    basePath: SPREAD08_BASE_PATH,
    lampRegion: SPREAD08_LAMP_REGION,
  },
};

export type ReaderViewProps = {
  session: ReaderSession;
  locale: Locale;
  onSessionChange: (next: ReaderSession) => void;
  onClose?: () => void;
  hintDelayMs?: number;
  strings?: ReaderStrings;
};

export function ReaderView({
  session,
  locale,
  onSessionChange,
  onClose,
  hintDelayMs = 6000,
  strings = READER_STRINGS[locale],
}: ReaderViewProps): React.JSX.Element {
  const [lampActive, setLampActive] = useState(false);
  const reducedMotion = useReducedMotion();

  const speech = useMemo(() => {
    // Browser speech when the platform provides it; otherwise an inert
    // provider keeps reading unblocked. Reviewed local clips stay on the
    // boundary until iPad evidence decides.
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
  }, []);
  const pronunciation = usePronunciation({ provider: speech });

  const spread = resolveSpread(session);
  const art = ART_BY_SPREAD[spread.id] ?? null;
  const layout = selectLayout(art?.manifest ?? SPREAD08_MANIFEST, {
    width: typeof window !== 'undefined' ? window.innerWidth : 1180,
    height: typeof window !== 'undefined' ? window.innerHeight : 820,
  });
  const sceneState = lampActive ? 'response' : 'rest';

  const navigate = (direction: 'forward' | 'backward') => {
    pronunciation.cancel();
    setLampActive(false);
    const next = direction === 'forward' ? goForward(session) : goBack(session);
    if (next !== session) {
      onSessionChange(next);
    }
  };

  const choose = (route: RouteId) => {
    pronunciation.cancel();
    const next = chooseRoute(session, route);
    if (next !== session) {
      onSessionChange(next);
    }
  };

  // Keyboard reading starts immediately: the reader container receives focus
  // on entry so arrow keys are handled without a first manual tab.
  const readerRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    readerRef.current?.focus();
  }, []);

  const { handlers, locked } = useReaderGestures({
    onNavigate: navigate,
    lockDurationMs: 250,
  });

  // Close the book (saving progress at the app boundary) with Escape.
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape' && onClose !== undefined) {
      event.preventDefault();
      pronunciation.cancel();
      onClose();
    }
  };

  if (layout === null) {
    return <p className="visually-hidden">No layout available for this viewport.</p>;
  }

  const layers = art !== null ? layersForState(art.manifest, layout.id, sceneState) : [];
  const grammar = findAstronautGrammar(session.story, session.astronautId, locale);
  const prose = resolveProse(spread.prose[locale], grammar);
  const lampRegion =
    art?.lampRegion !== null && art?.lampRegion !== undefined && layout.id !== 'desktop'
      ? art.lampRegion[layout.id]
      : null;

  return (
    <main
      ref={readerRef}
      tabIndex={-1}
      className="reader"
      aria-label={strings.readingStatus}
      onKeyDown={handleKeyDown}
      {...handlers}
    >
      <SceneView
        layers={layers}
        title={spread.title[locale]}
        description={spread.title[locale]}
        prose={
          <ProseView
            segments={eligibleWordSegments(prose, locale)}
            speakingWord={pronunciation.speakingWord}
            unavailable={pronunciation.unavailable}
            onSpeak={(segment) => pronunciation.speakWord(segment, locale)}
          />
        }
        panel={layout.panel}
        camera={layout.camera}
        basePath={art?.basePath ?? ''}
      />
      {session.route === null && spread.id === session.story.choiceSpreadId ? (
        <RouteChoiceView strings={strings} locale={locale} onChoose={choose} />
      ) : null}
      {spread.id === 'S08' && lampRegion !== null ? (
        <LampInteraction
          region={lampRegion}
          strings={LAMP_STRINGS[locale]}
          hintDelayMs={hintDelayMs}
          reducedMotion={reducedMotion}
          activated={lampActive}
          onActivate={() => setLampActive(true)}
        />
      ) : null}
      {locked ? <p className="visually-hidden">{strings.readingStatus}</p> : null}
    </main>
  );
}
