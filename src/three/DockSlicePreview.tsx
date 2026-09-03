// Dock story preview harness (entry via /?scene=S01&route=reed-channel): the
// real guided engine over the full 10-spread story, the real GLB package, and
// the real hotspot plumbing working together in a browser. It mirrors the
// Spread08Preview pattern — a development harness for slice evidence and
// browser checks, not production UI; the full dock/bookshelf composition
// lands in Phase 6 Task 2.
//
// Tap targets here are preview-local stand-ins anchored at the staged scene
// offsets. Authored per-subject tap targets ship with the mass-production
// tap-target review (review-procedure.md), which replaces this table. Route
// titles, unlike tap targets, are real story content from sharingTide.

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
  chooseRoute,
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
import { sharingTide } from '../story/sharingTide';
import { type LayoutId, layoutCamera, poseForBeat } from './camera';
import { DockCanvas } from './DockCanvas';
import { HotspotLayer } from './HotspotLayer';
import { STORY_STAGING, type StorySpreadId } from './staging';

export type DockSlicePreviewProps = {
  spreadId: StorySpreadId;
  route: RouteId;
  locale: Locale;
  beat: 'rest' | 'arrive';
};

export type RouteId = 'reed-channel' | 'lily-cove';

const ROUTE_PATHS: Record<RouteId, StorySpreadId[]> = {
  'reed-channel': ['S01', 'S02', 'S03', 'S04', 'A05', 'A06', 'S08', 'S10'],
  'lily-cove': ['S01', 'S02', 'S03', 'S04', 'B05', 'B06', 'S08', 'S10'],
};

const STORY_ORDER: StorySpreadId[] = [
  'S01',
  'S02',
  'S03',
  'S04',
  'A05',
  'A06',
  'B05',
  'B06',
  'S08',
  'S10',
];

const STORY_SPREADS: Spread[] = STORY_ORDER.flatMap((id) => {
  const spread = sharingTide.spreads[id];
  return spread === undefined ? [] : [spread];
});

const GLB_URLS: Record<string, string> = {
  dock: dockGlb,
  boat: boatGlb,
  turtle: turtleGlb,
  child: childGlb,
  lake_props: lakePropsGlb,
};

// Stand-in tap targets (see module note): one per interactive spread,
// anchored at the staged scene offset with a touch-height lift so the button
// floats over its subject instead of the waterline.
const STAND_IN_TARGETS: Record<StorySpreadId, TapTarget[]> = {
  S01: [{ id: 'boat', label: { en: 'Boat', id: 'Perahu' }, position: { x: 2.2, y: 1.0, z: 0.5 } }],
  S02: [
    {
      id: 'turtle',
      label: { en: 'Turtle', id: 'Kura-kura' },
      position: { x: 0.8, y: 0.6, z: 0.6 },
    },
  ],
  S03: [{ id: 'cake', label: { en: 'Cake', id: 'Kue' }, position: { x: 0.8, y: 1.0, z: 0.4 } }],
  S04: [],
  S08: [],
  S10: [],
  A05: [
    {
      id: 'turtle',
      label: { en: 'Turtle', id: 'Kura-kura' },
      position: { x: -0.8, y: 0.6, z: 0.5 },
    },
  ],
  A06: [
    {
      id: 'lantern',
      label: { en: 'Lantern', id: 'Lentera' },
      position: { x: 0, y: 0.2, z: 2.1 },
    },
  ],
  B05: [
    {
      id: 'turtle',
      label: { en: 'Turtle', id: 'Kura-kura' },
      position: { x: -0.8, y: 0, z: 0.5 },
    },
  ],
  B06: [{ id: 'cake', label: { en: 'Cake', id: 'Kue' }, position: { x: 0, y: 0, z: 0.9 } }],
};

function posterFor(title: string): string {
  // Deterministic stand-in poster: real rest/response stills ship with the
  // Phase 6 package layout (render_previews.py). This only needs to prove
  // the fallback path carries a labelled image.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="820"><rect width="100%" height="100%" fill="#0a1830"/><text x="50%" y="50%" fill="#ffb45e" font-size="48" text-anchor="middle">${title}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function walkTo(spreadId: StorySpreadId, route: RouteId): GuidedSession {
  const path = ROUTE_PATHS[route];
  // Boarding commits the required S01 interaction but never moves the
  // session; the loop below advances one honest engine transition at a
  // time, so requesting S01 itself stays put.
  let session = boardBoat(startGuidedSession(sharingTide.id, path), STORY_SPREADS, 'boat');
  // The engine owns the walk: each commit is a real engine transition, so a
  // gating regression shows up here as the wrong spread instead of silently
  // rendering the request. Holds return the same reference, so the loop
  // always terminates.
  while (session.spreadId !== spreadId) {
    if (session.spreadId === 'S04' && session.routeId === null) {
      session = chooseRoute(session, route, path);
    }
    const next = goForward(session, STORY_SPREADS);
    if (next === session) {
      break;
    }
    session = next;
  }
  return session;
}

function asStorySpreadId(spreadId: string): StorySpreadId {
  return (STORY_ORDER as string[]).includes(spreadId) ? (spreadId as StorySpreadId) : 'S01';
}

export function DockSlicePreview({
  spreadId,
  route,
  locale,
  beat,
}: DockSlicePreviewProps): React.JSX.Element {
  const [session, setSession] = useState<GuidedSession>(() => walkTo(spreadId, route));
  // The engine owns the current spread: the harness requests `spreadId`
  // through an honest walk (board + forward + choose), so a gating
  // regression shows up here as the wrong spread instead of silently
  // rendering the request.
  const currentId = asStorySpreadId(session.spreadId);
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

  const spread = sharingTide.spreads[currentId] ?? sharingTide.spreads.S01;
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
    setSession((current) => tapTarget(current, STORY_SPREADS, currentId, id));
    setActiveId(id);
  };

  const choose = (routeId: RouteId): void => {
    setSession((current) =>
      goForward(chooseRoute(current, routeId, ROUTE_PATHS[routeId]), STORY_SPREADS),
    );
  };

  const showChoice = currentId === 'S04' && session.routeId === null;

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
          staged={STORY_STAGING[currentId]}
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
      {showChoice && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            padding: '48px 28px 32px',
            background: 'linear-gradient(to top, rgba(10, 24, 48, 0.88), transparent)',
            pointerEvents: 'auto',
          }}
        >
          {sharingTide.routes.map((storyRoute) => (
            <button
              key={storyRoute.id}
              type="button"
              onClick={() => choose(storyRoute.id as RouteId)}
              style={{
                backgroundColor: '#16263f',
                color: '#ffb45e',
                border: '2px solid #ffb45e',
                borderRadius: '999px',
                padding: '12px 28px',
                fontSize: '1.125rem',
              }}
            >
              {storyRoute.title[locale]}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
