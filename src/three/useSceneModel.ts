import { useEffect, useRef, useState } from 'react';
import { Group } from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Loads staged GLB scene files (Draco-compressed by tools/build_all.py) and
// assembles them into one positioned group. The Draco decoder is served
// locally from /draco/ (copied at build time by scripts/copy-draco.mjs) so
// model decoding works fully offline — no remote decoder URLs.

export type StagedModel = {
  glb: string;
  offset: [number, number, number];
};

export type SceneModel =
  | { status: 'loading'; group: null }
  | { status: 'ready'; group: Group }
  | { status: 'failed'; group: null };

export function useSceneModel(models: StagedModel[]): SceneModel {
  const [state, setState] = useState<SceneModel>({
    status: 'loading',
    group: null,
  });
  // Mount-only load: callers remount per spread (key={spreadId}), so the
  // request list is fixed for the hook's lifetime. A ref carries the list
  // into the effect without retriggering it on every render.
  const modelsRef = useRef(models);
  modelsRef.current = models;

  useEffect(() => {
    let cancelled = false;
    const draco = new DRACOLoader();
    draco.setDecoderPath('/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    const requested = modelsRef.current;
    Promise.all(
      requested.map(async (model) => {
        const gltf = await loader.loadAsync(model.glb);
        gltf.scene.position.set(model.offset[0], model.offset[1], model.offset[2]);
        return gltf.scene;
      }),
    ).then(
      (loaded) => {
        if (cancelled) {
          return;
        }
        const group = new Group();
        for (const scene of loaded) {
          group.add(scene);
        }
        setState({ status: 'ready', group });
      },
      () => {
        if (!cancelled) {
          setState({ status: 'failed', group: null });
        }
      },
    );

    return () => {
      cancelled = true;
      draco.dispose();
    };
  }, []);

  return state;
}
