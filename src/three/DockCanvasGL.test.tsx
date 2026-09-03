import { render, screen } from '@testing-library/react';
import { Group } from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { Scene } from '../scene/package.js';
import { sceneSchema } from '../scene/package.js';
import type { StyleBible } from '../scene/styleBible.js';
import { DockCanvas } from './DockCanvas.js';
import type { StagedScene } from './staging.js';

// WebGL-present branch: the canvas mounts (decorative) with the DOM overlay
// carrying the meaning; a failed model load falls back to the poster.
vi.mock('./webgl.js', () => ({
  isWebGLAvailable: () => true,
}));

const renderStill = vi.fn();
vi.mock('./renderer.js', () => ({
  createRenderer: () => ({
    setSize: vi.fn(),
    renderStill,
    dispose: vi.fn(),
  }),
}));

vi.mock('./useSceneModel.js', () => ({
  useSceneModel: () => ({ status: 'ready' as const, group: new Group() }),
}));

const bible = {
  palette: { nightSky: '#0a1830' },
  lightRig: {
    key: { color: '#dfeaff', energy: 3.0 },
    fill: { color: '#ffb45e', energy: 1.2 },
    rim: { color: '#7fb2ff', energy: 0.8 },
    ambient: '#16263f',
  },
  cameras: {
    'ipad-landscape': {
      fov: 40,
      position: [0, 3.2, 7.5],
      target: [0, 1.0, 0],
    },
    'phone-portrait': {
      fov: 50,
      position: [0, 2.6, 6.0],
      target: [0, 1.2, 0],
    },
  },
} as unknown as StyleBible;

const scenes = new Map<string, Scene>([
  [
    'dock',
    sceneSchema.parse({
      id: 'dock',
      glb: '/stories/pkg/dock.glb',
      sha256: 'a'.repeat(64),
      triangles: 1000,
      pivot: { x: 0, y: 0, z: 0 },
      bounds: {
        min: { x: -1, y: 0, z: -1 },
        max: { x: 1, y: 2, z: 1 },
      },
      textures: [],
      tapTargets: [],
      bakedText: false,
      budgets: {
        maxTriangles: 30000,
        maxTextureBytes: 4194304,
        maxTotalBytes: 4194304,
      },
    }),
  ],
]);
const staged: StagedScene[] = [{ sceneId: 'dock', offset: [0, 0, 0] }];

function renderCanvas(beat: 'arrive' | 'return' | null) {
  return render(
    <DockCanvas
      bible={bible}
      layout="ipad-landscape"
      beat={beat}
      label="Lanterns on the Water"
      posterSrc="/posters/s01.png"
      scenes={scenes}
      staged={staged}
    >
      <article>prose overlay</article>
    </DockCanvas>,
  );
}

describe('DockCanvas with WebGL', () => {
  it('mounts the decorative canvas and renders the beat still', () => {
    const { container, unmount } = renderCanvas('arrive');
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(screen.getByText('prose overlay')).toBeInTheDocument();
    expect(renderStill).toHaveBeenCalled();
    unmount();
  });

  it('holds the rest pose when the beat is null (reduced motion)', () => {
    renderStill.mockClear();
    const { unmount } = renderCanvas(null);
    expect(renderStill).toHaveBeenCalled();
    unmount();
  });

  it('falls back to the poster when staging is incomplete', () => {
    const { unmount } = render(
      <DockCanvas
        bible={bible}
        layout="ipad-landscape"
        beat={null}
        label="Lanterns on the Water"
        posterSrc="/posters/s01.png"
        scenes={scenes}
        staged={[{ sceneId: 'turtle', offset: [0, 0, 0] }]}
      >
        <article>prose overlay</article>
      </DockCanvas>,
    );
    expect(screen.getByRole('img', { name: 'Lanterns on the Water' })).toBeInTheDocument();
    unmount();
  });
});
