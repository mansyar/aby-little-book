import { render, screen } from '@testing-library/react';
import { Group } from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { Scene } from '../scene/package.js';
import { sceneSchema } from '../scene/package.js';
import type { StyleBible } from '../scene/styleBible.js';
import { DockCanvas } from './DockCanvas.js';
import type { StagedScene } from './staging.js';
import { useSceneModel } from './useSceneModel.js';

// Loading branch: WebGL is present and every staged scene resolves, but the
// models are still downloading — the poster stays up with a calm,
// determinate progress bar instead of a blank canvas.
vi.mock('./webgl.js', () => ({
  isWebGLAvailable: () => true,
}));

vi.mock('./renderer.js', () => ({
  createRenderer: () => ({
    setSize: vi.fn(),
    renderStill: vi.fn(),
    dispose: vi.fn(),
  }),
}));

vi.mock('./useSceneModel.js', () => ({
  useSceneModel: vi.fn(),
}));

const mockedSceneModel = vi.mocked(useSceneModel);

const bible = {
  palette: { nightSky: '#0a1830', lanternGlow: '#ffb45e' },
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
        max: { x: 1, y: 1, z: 1 },
      },
      textures: [],
      tapTargets: [],
      bakedText: false,
      budgets: { maxTriangles: 30000, maxTextureBytes: 4194304, maxTotalBytes: 2000000 },
    }),
  ],
]);
const staged: StagedScene[] = [{ sceneId: 'dock', offset: [0, 0, 0] }];

function renderLoading(progress: number): void {
  mockedSceneModel.mockReturnValue({ status: 'loading', group: null, progress });
  render(
    <DockCanvas
      bible={bible}
      layout="ipad-landscape"
      beat={null}
      label="Lanterns on the Water"
      posterSrc="/posters/s01.png"
      scenes={scenes}
      staged={staged}
    >
      <article>prose overlay</article>
    </DockCanvas>,
  );
}

describe('DockCanvas while loading', () => {
  it('keeps the poster up with a determinate progress bar', () => {
    renderLoading(0.5);
    const bar = screen.getByRole('progressbar', { name: 'Lanterns on the Water' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByRole('img', { name: 'Lanterns on the Water' })).toBeInTheDocument();
    expect(screen.getByText('prose overlay')).toBeInTheDocument();
  });

  it('starts at zero before any bytes arrive', () => {
    renderLoading(0);
    expect(screen.getByRole('progressbar', { name: 'Lanterns on the Water' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  it('mounts the canvas with no progress bar once ready', () => {
    mockedSceneModel.mockReturnValue({ status: 'ready', group: new Group() });
    render(
      <DockCanvas
        bible={bible}
        layout="ipad-landscape"
        beat={null}
        label="Lanterns on the Water"
        posterSrc="/posters/s01.png"
        scenes={scenes}
        staged={staged}
      >
        <article>prose overlay</article>
      </DockCanvas>,
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('prose overlay')).toBeInTheDocument();
  });
});
