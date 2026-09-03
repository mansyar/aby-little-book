import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import bibleJson from '../../art/style-bible.json';
import type { Locale } from '../app/locale';
import type { Scene as SceneContract } from '../scene/package.js';
import { styleBibleSchema } from '../scene/styleBible.js';
import { DockCanvas } from '../three/DockCanvas.js';
import { posterFor } from '../three/poster.js';
import { HOME_STAGING } from '../three/staging.js';
import type { DockStrings } from './dockStrings';

// The boat card states mirror the old book card: the dock home's single
// primary action follows the story state, so a child always sees one
// obvious next step. "New" and "preparing" gate on the explicit offline
// preparation; boarding is only offered once the package is ready.
//
// The card floats over the living dock scene: the canvas is decorative
// scenery at its rest beat (never a camera move), every word and action
// stays in the DOM overlay, and the labelled poster covers no-WebGL or
// unstaged packages — the same fallback contract as the reader.

export type BoatState = 'new' | 'preparing' | 'ready' | 'in-progress' | 'complete';

export interface DockHomeViewProps {
  locale: Locale;
  strings: DockStrings;
  storyTitle: { en: string; id: string };
  cardState: BoatState;
  keepsake?: boolean;
  scenes?: Map<string, SceneContract>;
  posterSrc?: string;
  onPrepare: () => void;
  onOpen: () => void;
  onContinue: () => void;
  onReadAgain: () => void;
  onCaregiver: () => void;
}

export function DockHomeView({
  locale,
  strings,
  storyTitle,
  cardState,
  keepsake = false,
  scenes,
  posterSrc: posterSrcProp,
  onPrepare,
  onOpen,
  onContinue,
  onReadAgain,
  onCaregiver,
}: DockHomeViewProps): React.JSX.Element {
  const title = storyTitle[locale];
  const bible = useMemo(() => styleBibleSchema.parse(bibleJson), []);
  const stagedScenes = scenes ?? new Map<string, SceneContract>();
  const posterSrc = posterSrcProp ?? posterFor(title);

  // Measured stage pixels pick the landscape/portrait camera, mirroring the
  // reader so the home frames the same way at any viewport.
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
  const layout = size.width >= size.height ? 'ipad-landscape' : 'phone-portrait';

  return (
    <main className="dock" aria-label={strings.dockTitle}>
      <div ref={stageRef} className="dock__scene">
        <DockCanvas
          bible={bible}
          layout={layout}
          beat={null}
          label={strings.dockTitle}
          posterSrc={posterSrc}
          scenes={stagedScenes}
          staged={HOME_STAGING}
        />
      </div>
      <div className="dock__content">
        <h1 className="dock__app-title">Aby Little Book</h1>
        <p className="dock__place">{strings.dockTitle}</p>
        <section className="dock__shore" aria-label={strings.dockTitle}>
          <article className="boat-card" aria-labelledby="boat-card-title">
            <h2 id="boat-card-title" className="boat-card__title">
              {title}
            </h2>
            <p className="boat-card__status" aria-live="polite">
              {cardState === 'preparing' ? strings.preparing : ''}
            </p>
            {keepsake ? <p className="boat-card__keepsake">{strings.keepsake}</p> : null}
            <div className="boat-card__actions">
              {cardState === 'new' && (
                <button type="button" className="boat-card__action" onClick={onPrepare}>
                  {strings.prepare}
                </button>
              )}
              {cardState === 'ready' && (
                <button type="button" className="boat-card__action" onClick={onOpen}>
                  {strings.open}
                </button>
              )}
              {cardState === 'in-progress' && (
                <button type="button" className="boat-card__action" onClick={onContinue}>
                  {strings.continueLabel}
                </button>
              )}
              {cardState === 'complete' && (
                <button type="button" className="boat-card__action" onClick={onReadAgain}>
                  {strings.readAgain}
                </button>
              )}
            </div>
          </article>
        </section>
        <button type="button" className="dock__caregiver" onClick={onCaregiver}>
          {strings.caregiver}
        </button>
      </div>
    </main>
  );
}
