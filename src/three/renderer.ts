import { type PerspectiveCamera, type Scene, WebGLRenderer } from 'three';

// Thin Three.js renderer seam. All WebGL construction lives here so the
// React layer stays testable (tests mock this module) and disposal is owned
// in exactly one place. No tone mapping: the default (none) matches the
// Standard view transform the preview pipeline frames with.

export type SliceRenderer = {
  setSize: (width: number, height: number) => void;
  renderStill: (scene: Scene, camera: PerspectiveCamera) => void;
  dispose: () => void;
};

export function createRenderer(canvas: HTMLCanvasElement): SliceRenderer {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  return {
    setSize: (width: number, height: number) => {
      renderer.setSize(width, height, false);
    },
    renderStill: (scene: Scene, camera: PerspectiveCamera) => {
      // Compile (shaders + geometry upload) before presenting so the first
      // frame never hitches — the GL equivalent of pre-decoding.
      renderer.compile(scene, camera);
      renderer.render(scene, camera);
    },
    dispose: () => {
      renderer.dispose();
    },
  };
}
