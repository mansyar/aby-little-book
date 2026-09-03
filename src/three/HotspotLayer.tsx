import { type ReactNode, useMemo, useState } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';
import type { TapTarget } from '../scene/package.js';
import type { SpeechProvider } from '../speech/speech.js';
import type { CameraPose } from './camera.js';
import { projectTapTargets } from './hotspots.js';

// Guided hotspot layer: DOM touch targets floating exactly over their 3D
// subjects. DOM buttons (not raycasts) so taps are focusable, labelled in
// locale, and large enough for small fingers. Activation answers with glow
// plus the spoken word — the glow stills answers when speech is unavailable.
// A miss (empty water) renders no button, so it can never navigate.

export type HotspotLayerProps = {
  pose: CameraPose;
  width: number;
  height: number;
  targets: TapTarget[];
  locale: 'en' | 'id';
  /** Parent-owned active target (persists the glow across renders). */
  activeId: string | null;
  speech: SpeechProvider | null;
  onActivate: (id: string) => void;
};

const TOUCH_PX = 48;

export function HotspotLayer({
  pose,
  width,
  height,
  targets,
  locale,
  activeId,
  speech,
  onActivate,
}: HotspotLayerProps): ReactNode {
  // Immediate local glow so the touch answers in the same frame; the parent
  // lifts it into activeId for persistence.
  const [pressedId, setPressedId] = useState<string | null>(null);

  const camera = useMemo(() => {
    const next = new PerspectiveCamera(pose.fov, width / height, 0.1, 100);
    next.position.set(pose.position[0], pose.position[1], pose.position[2]);
    next.lookAt(new Vector3(pose.target[0], pose.target[1], pose.target[2]));
    return next;
  }, [pose, width, height]);

  const projected = useMemo(
    () => projectTapTargets(camera, width, height, targets),
    [camera, width, height, targets],
  );
  const words = useMemo(
    () => new Map(targets.map((target) => [target.id, target.label[locale]])),
    [targets, locale],
  );

  const shownId = activeId ?? pressedId;
  const shownWord = shownId === null ? null : (words.get(shownId) ?? null);

  const activate = (id: string): void => {
    setPressedId(id);
    const word = words.get(id);
    if (word !== undefined) {
      speech?.speak({ text: word, lang: locale });
    }
    onActivate(id);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {projected
        .filter((target) => target.visible)
        .map((target) => {
          const word = words.get(target.id) ?? target.id;
          const pressed = shownId === target.id;
          return (
            <button
              key={target.id}
              type="button"
              aria-label={word}
              aria-pressed={pressed}
              onClick={() => activate(target.id)}
              style={{
                position: 'absolute',
                left: target.x,
                top: target.y,
                transform: 'translate(-50%, -50%)',
                minWidth: TOUCH_PX,
                minHeight: TOUCH_PX,
                pointerEvents: 'auto',
              }}
            >
              <span aria-hidden="true">✦</span>
              {pressed ? <span>{word}</span> : null}
            </button>
          );
        })}
      {shownWord === null ? null : <div role="status">{shownWord}</div>}
    </div>
  );
}
