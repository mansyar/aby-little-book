import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { Color, PerspectiveCamera, Scene } from 'three';
import type { Scene as SceneContract } from '../scene/package.js';
import type { StyleBible } from '../scene/styleBible.js';
import type { CameraBeat, LayoutId } from './camera.js';
import { layoutCamera, poseForBeat } from './camera.js';
import { buildLights } from './lights.js';
import { createRenderer } from './renderer.js';
import type { StagedScene } from './staging.js';
import { useSceneModel } from './useSceneModel.js';
import { isWebGLAvailable } from './webgl.js';

// Hybrid slice canvas: a Three.js scene under the DOM prose overlay. Beats
// are still-frame cuts (rest pose vs 10% push-in response pose) — calm,
// deterministic, and exactly matching the preview stills. The canvas is
// decorative (aria-hidden); all meaning travels in the DOM overlay and the
// poster fallback, so the story is complete with or without WebGL.

export type DockCanvasProps = {
  bible: StyleBible;
  layout: LayoutId;
  beat: CameraBeat | null;
  label: string;
  posterSrc: string;
  scenes: Map<string, SceneContract>;
  staged: StagedScene[];
  children?: ReactNode;
};

export function DockCanvas({
  bible,
  layout,
  beat,
  label,
  posterSrc,
  scenes,
  staged,
  children,
}: DockCanvasProps): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const webgl = useMemo(() => isWebGLAvailable(), []);

  const models = useMemo(() => {
    const resolved: { glb: string; offset: [number, number, number] }[] = [];
    for (const entry of staged) {
      const scene = scenes.get(entry.sceneId);
      if (!scene) {
        return null;
      }
      resolved.push({ glb: scene.glb, offset: entry.offset });
    }
    return resolved;
  }, [scenes, staged]);
  const model = useSceneModel(models ?? []);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Poster path (no WebGL, incomplete staging, or failed load) renders no
    // canvas, so there is nothing to mount here.
    if (!webgl || !canvas || models === null || model.status !== 'ready') {
      return;
    }
    const renderer = createRenderer(canvas);
    const scene = new Scene();
    const { group: lights, background } = buildLights(bible);
    scene.add(lights);
    scene.background = new Color(background);
    scene.add(model.group);

    const rest = layoutCamera(bible, layout);
    const camera = new PerspectiveCamera(rest.fov, 1, 0.1, 100);
    const pose = poseForBeat(rest, beat);
    camera.position.set(pose.position[0], pose.position[1], pose.position[2]);
    camera.lookAt(pose.target[0], pose.target[1], pose.target[2]);

    const resize = (): void => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.renderStill(scene, camera);
    };
    resize();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(canvas);
    return () => {
      observer?.disconnect();
      scene.remove(model.group);
      renderer.dispose();
    };
  }, [webgl, bible, layout, beat, models, model]);

  if (!webgl || models === null || model.status === 'failed') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img aria-label={label} src={posterSrc} alt={label} />
        {children}
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        <canvas
          ref={canvasRef}
          data-scene={model.status}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
      {children}
    </div>
  );
}
