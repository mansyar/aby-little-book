import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Scene } from '../scene/package.js';
import type { StyleBible } from '../scene/styleBible.js';
import { DockCanvas } from './DockCanvas.js';
import type { StagedScene } from './staging.js';

vi.mock('./useSceneModel.js', () => ({
  useSceneModel: () => ({ status: 'ready' as const }),
}));

vi.mock('./renderer.js', () => ({
  createRenderer: () => ({
    setSize: vi.fn(),
    renderStill: vi.fn(),
    dispose: vi.fn(),
  }),
}));

const bible = {
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

const scenes = new Map<string, Scene>();
const staged: StagedScene[] = [{ sceneId: 'dock', offset: [0, 0, 0] }];

describe('DockCanvas', () => {
  it('renders the poster fallback with full semantics where WebGL is missing', () => {
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
    // jsdom has no WebGL: the poster carries the scene meaning.
    const poster = screen.getByRole('img', { name: 'Lanterns on the Water' });
    expect(poster).toHaveAttribute('src', '/posters/s01.png');
    expect(screen.getByText('prose overlay')).toBeInTheDocument();
  });
});
