// Spread 08 representative vertical slice: the real reader engine, scene
// composition, navigation ownership, isolated pronunciation, and the Share
// the Light interaction working together over the approved art. It is a
// preview harness (entry via /?preview=1) used for Phase 4 evidence and
// browser checks; the full bookshelf reader composition lands in Phase 6.

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { chooseRoute, createSession, goBack, goForward, resolveSpread } from '../reader/engine';
import type { ReaderSession } from '../reader/types';
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
import type { Locale } from '../story/contracts';
import { SPREAD08_BASE_PATH, SPREAD08_LAMP_REGION, SPREAD08_MANIFEST } from '../story/spread08';
import { story } from '../story/starlight-rescue';
import { findAstronautGrammar, resolveProse } from '../story/tokens';
import { useReaderGestures } from './useReaderGestures';

const LAMP_SPREAD_ID = 'S08';

export type Spread08PreviewProps = {
  locale: Locale;
  hintDelayMs?: number;
};

export function Spread08Preview({
  locale,
  hintDelayMs = 6000,
}: Spread08PreviewProps): React.JSX.Element {
  // The session is a real engine walk to Spread 08 along the asteroid-garden
  // route, so navigation, completion, and route locks behave as authored.
  const [session, setSession] = useState<ReaderSession>(() => {
    let walk = createSession(story, 'aby', locale);
    walk = goForward(goForward(walk));
    walk = chooseRoute(walk, 'asteroid-garden');
    for (let step = 0; step < 5; step += 1) {
      walk = goForward(walk);
    }
    return walk;
  });
  const [lampActive, setLampActive] = useState(false);
  const reducedMotion = useReducedMotion();

  const speech = useMemo(() => {
    // Browser speech when the platform provides it; otherwise an inert
    // provider keeps reading unblocked. Reviewed local clips stay on the
    // boundary until iPad evidence decides (Phase 4 task scope).
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
  const layout = selectLayout(SPREAD08_MANIFEST, {
    width: typeof window !== 'undefined' ? window.innerWidth : 1180,
    height: typeof window !== 'undefined' ? window.innerHeight : 820,
  });
  const sceneState = lampActive ? 'response' : 'rest';

  const navigate = (direction: 'forward' | 'backward') => {
    pronunciation.cancel();
    setLampActive(false);
    setSession((current) => {
      const next = direction === 'forward' ? goForward(current) : goBack(current);
      return next === current ? current : next;
    });
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

  if (layout === null) {
    return <p className="visually-hidden">No layout available for this viewport.</p>;
  }

  // Only the slice spread has authored art; neighboring spreads show the
  // prose panel alone until Phase 7 produces the full scene set.
  const layers =
    spread.id === LAMP_SPREAD_ID ? layersForState(SPREAD08_MANIFEST, layout.id, sceneState) : [];
  const camera = layout.camera;
  const grammar = findAstronautGrammar(story, session.astronautId, locale);
  const prose = resolveProse(spread.prose[locale], grammar);
  const lampRegion = layout.id === 'desktop' ? null : SPREAD08_LAMP_REGION[layout.id];

  return (
    <main
      ref={readerRef}
      tabIndex={-1}
      className="reader-preview"
      aria-label="Spread 08 preview"
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
        camera={camera}
        basePath={SPREAD08_BASE_PATH}
      />
      {spread.id === LAMP_SPREAD_ID && lampRegion !== null ? (
        <LampInteraction
          region={lampRegion}
          strings={LAMP_STRINGS[locale]}
          hintDelayMs={hintDelayMs}
          reducedMotion={reducedMotion}
          activated={lampActive}
          onActivate={() => setLampActive(true)}
        />
      ) : null}
      {locked ? <p className="visually-hidden">Reading…</p> : null}
    </main>
  );
}
