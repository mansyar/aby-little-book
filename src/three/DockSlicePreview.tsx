// Dock slice preview harness (entry via /?scene=S01): the real guided
// engine, the real GLB package, and the real hotspot plumbing working
// together in a browser. It mirrors the Spread08Preview pattern — a
// development harness for slice evidence and browser checks, not production
// UI; the full dock/bookshelf composition lands in Phase 6.
//
// Tap targets here are preview-local stand-ins anchored at the staged scene
// offsets. Authored per-subject tap targets ship with the mass-production
// tap-target review (review-procedure.md), which replaces this table.

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import boatGlb from '../../art/glb/boat.glb?url';
import childGlb from '../../art/glb/child.glb?url';
import dockGlb from '../../art/glb/dock.glb?url';
import lakePropsGlb from '../../art/glb/lake_props.glb?url';
import turtleGlb from '../../art/glb/turtle.glb?url';
import manifestJson from '../../art/manifest/the-sharing-tide-0.1.0.json';
import bibleJson from '../../art/style-bible.json';
import {
  boardBoat,
  type GuidedSession,
  goForward,
  startGuidedSession,
  tapTarget,
} from '../reader/guided';
import type { Scene as SceneContract, TapTarget } from '../scene/package';
import { packageManifestSchema } from '../scene/package';
import { styleBibleSchema } from '../scene/styleBible';
import { useReducedMotion } from '../scene/useReducedMotion';
import {
  browserSpeechProvider,
  type SpeechSynthesisLike,
  type UtteranceLike,
} from '../speech/browserSpeech';
import type { Locale } from '../story/contracts';
import type { Spread } from '../story/dock-contracts';
import { slice, sliceMeta } from '../story/slice';
import { type LayoutId, layoutCamera, poseForBeat } from './camera';
import { DockCanvas } from './DockCanvas';
import { HotspotLayer } from './HotspotLayer';
import { SLICE_STAGING } from './staging';

export type DockSlicePreviewProps = {
  spreadId: 'S01' | 'S02' | 'S03';
  locale: Locale;
  beat: 'rest' | 'arrive';
};

const GLB_URLS: Record<string, string> = {
  dock: dockGlb,
  boat: boatGlb,
  turtle: turtleGlb,
  child: childGlb,
  lake_props: lakePropsGlb,
};

// Stand-in tap targets (see module note): one per slice spread, anchored at
// the staged scene offset with a touch-height lift so the button floats over
// its subject instead of the waterline.
const STAND_IN_TARGETS: Record<'S01' | 'S02' | 'S03', TapTarget[]> = {
  S01: [{ id: 'boat', label: { en: 'Boat', id: 'Perahu' }, position: { x: 2.2, y: 1.0, z: 0.5 } }],
  S02: [
    {
      id: 'turtle',
      label: { en: 'Turtle', id: 'Kura-kura' },
      position: { x: 0.8, y: 0.6, z: 0.6 },
    },
  ],
  S03: [{ id: 'cake', label: { en: 'Cake', id: 'Kue' }, position: { x: 0.8, y: 1.0, z: 0.4 } }],
};

function posterFor(title: string): string {
  // Deterministic stand-in poster: real rest/response stills ship with the
  // Phase 6 package layout (render_previews.py). This only needs to prove
  // the fallback path carries a labelled image.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="820"><rect width="100%" height="100%" fill="#0a1830"/><text x="50%" y="50%" fill="#ffb45e" font-size="48" text-anchor="middle">${title}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function walkTo(spreadId: 'S01' | 'S02' | 'S03'): GuidedSession {
  let session = startGuidedSession(sliceMeta.storyId, ['S01', 'S02', 'S03']);
  if (spreadId === 'S01') {
    return session;
  }
  session = goForward(boardBoat(session, slice, 'boat'), slice);
  if (spreadId === 'S02') {
    return session;
  }
  return goForward(session, slice);
}

export function DockSlicePreview({
  spreadId,
  locale,
  beat,
}: DockSlicePreviewProps): React.JSX.Element {
  const [session, setSession] = useState<GuidedSession>(() => walkTo(spreadId));
  // The engine owns the current spread: the harness requests `spreadId`
  // through an honest walk (board + forward), so a gating regression shows
  // up here as the wrong spread instead of silently rendering the request.
  const currentId: 'S01' | 'S02' | 'S03' =
    session.spreadId === 'S02' || session.spreadId === 'S03' ? session.spreadId : 'S01';
  const [activeId, setActiveId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const bible = useMemo(() => styleBibleSchema.parse(bibleJson), []);
  const manifest = useMemo(() => packageManifestSchema.parse(manifestJson), []);
  const scenes = useMemo(() => {
    const next = new Map<string, SceneContract>();
    for (const scene of manifest.scenes) {
      const bundled = GLB_URLS[scene.id];
      next.set(scene.id, bundled === undefined ? scene : { ...scene, glb: bundled });
    }
    return next;
  }, [manifest]);

  const speech = useMemo(() => {
    // Browser speech when the platform provides it; otherwise an inert
    // provider keeps reading unblocked (headless CI has no voices).
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

  const spread = slice.find((entry: Spread) => entry.id === currentId) ?? slice[0];
  if (spread === undefined) {
    throw new Error('Slice spread S01 is missing');
  }
  // Reduced motion holds the rest pose no matter what the query asks: beats
  // are still-frame cuts, and the calm frame is the rest still.
  const cameraBeat = reducedMotion || beat === 'rest' ? null : 'arrive';
  const layout: LayoutId =
    typeof window !== 'undefined' && window.innerWidth < window.innerHeight
      ? 'phone-portrait'
      : 'ipad-landscape';
  const pose = poseForBeat(layoutCamera(bible, layout), cameraBeat);
  const targets = STAND_IN_TARGETS[currentId];
  // The hotspot layer must project in the stage's pixels, not the window's:
  // the canvas fills this measured stage, so taps land on their subjects.
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 1180, height: 820 });
  useLayoutEffect(() => {
    const measure = (): void => {
      const el = stageRef.current;
      if (el !== null) {
        setStageSize({ width: Math.max(1, el.clientWidth), height: Math.max(1, el.clientHeight) });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const width = stageSize.width;
  const height = stageSize.height;

  const activate = (id: string): void => {
    setSession((current) => tapTarget(current, slice, currentId, id));
    setActiveId(id);
  };

  return (
    <main
      aria-label={`Scene preview ${spread.title[locale]}`}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        margin: 0,
        backgroundColor: '#0a1830',
        color: '#fdf6ec',
      }}
    >
      <div ref={stageRef} style={{ position: 'absolute', inset: 0 }}>
        <DockCanvas
          bible={bible}
          layout={layout}
          beat={cameraBeat}
          label={spread.title[locale]}
          posterSrc={posterFor(spread.title.en)}
          scenes={scenes}
          staged={SLICE_STAGING[currentId]}
        >
          <HotspotLayer
            pose={pose}
            width={width}
            height={height}
            targets={targets}
            locale={locale}
            activeId={activeId}
            speech={speech}
            onActivate={activate}
          />
        </DockCanvas>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px 28px 48px',
          background: 'linear-gradient(to bottom, rgba(10, 24, 48, 0.88), transparent)',
          pointerEvents: 'none',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '2rem' }}>{spread.title[locale]}</h1>
        <p style={{ margin: '8px 0 0', fontSize: '1.125rem' }}>{spread.prose[locale]}</p>
      </div>
    </main>
  );
}
