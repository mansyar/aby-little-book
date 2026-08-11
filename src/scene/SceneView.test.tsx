// Semantic output of the layered scene: one section per scene carrying the
// localized description, one decorative <img> per validated layer in authored
// order, plus the text-safe story panel (visible prose, labelled heading).
// Meaning lives in the description and the prose, not in the pixels, so every
// layer image is aria-hidden with empty alt.

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { validManifest } from '../story/fixtures';
import { activeLayoutLayers } from './layout';
import { SceneView } from './SceneView';

// Decorative layers are aria-hidden with alt="" (role presentation), so the
// image DOM is asserted directly instead of through the accessibility tree.
function imagesOf(container: HTMLElement): HTMLImageElement[] {
  return Array.from(container.querySelectorAll('img'));
}

const panel = { position: 'side' as const, region: { x: 0.55, y: 0.08, width: 0.4, height: 0.84 } };

const landscapeLayout = validManifest.layouts.find((entry) => entry.id === 'ipad-landscape');
if (landscapeLayout === undefined) {
  throw new Error('Fixture has no ipad-landscape layout');
}
const camera = landscapeLayout.camera;

function renderScene(overrides: Partial<React.ComponentProps<typeof SceneView>> = {}) {
  const props = {
    layers: activeLayoutLayers(validManifest, 'ipad-landscape'),
    title: 'Share the Light',
    description: 'Aby held up the star lamp, and warm light wrapped around Lumi.',
    prose: 'He held up his star lamp, and warm light wrapped around Lumi.',
    panel,
    camera,
    basePath: '/base',
    ...overrides,
  };
  return render(<SceneView {...props} />);
}

describe('SceneView', () => {
  it('labels the scene with its title and exposes the localized description', () => {
    renderScene();
    expect(screen.getByLabelText('Share the Light')).toBeInTheDocument();
    expect(
      screen.getByText('Aby held up the star lamp, and warm light wrapped around Lumi.'),
    ).toBeInTheDocument();
  });

  it('renders one decorative image per layer in authored order', () => {
    const { container } = renderScene();
    const images = imagesOf(container);
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('src', '/base/assets/layers/ipad-landscape/bg-space.webp');
    expect(images[1]).toHaveAttribute('src', '/base/assets/layers/ipad-landscape/char-aby.webp');
    expect(images[2]).toHaveAttribute('src', '/base/assets/layers/ipad-landscape/fx-glow.webp');
  });

  it('marks every layer image as decorative and non-draggable', () => {
    const { container } = renderScene();
    for (const image of imagesOf(container)) {
      expect(image).toHaveAttribute('alt', '');
      expect(image).toHaveAttribute('aria-hidden', 'true');
      expect(image).toHaveAttribute('draggable', 'false');
    }
  });

  it('renders no images when the active layout has no layers', () => {
    const { container } = renderScene({ layers: [] });
    expect(imagesOf(container)).toHaveLength(0);
    expect(screen.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeInTheDocument();
  });

  it('renders the story panel with a level-2 heading and the localized prose', () => {
    renderScene();
    expect(screen.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeInTheDocument();
    expect(
      screen.getByText('He held up his star lamp, and warm light wrapped around Lumi.'),
    ).toBeInTheDocument();
  });

  it('places the panel according to the authored text-safe region', () => {
    const { container } = renderScene();
    const panelElement = container.querySelector('.scene__panel');
    expect(panelElement).not.toBeNull();
    expect(panelElement).toHaveClass('scene__panel--side');
    expect(panelElement).toHaveStyle({
      left: '55%',
      top: '8%',
      width: '40%',
      height: '84%',
    });
  });

  it('names the scene section after the visible panel heading', () => {
    const { container } = renderScene();
    const heading = screen.getByRole('heading', { level: 2 });
    expect(container.querySelector('.scene')).toHaveAttribute('aria-labelledby', heading.id);
  });

  it('frames the layer stage with the authored camera aspect and center', () => {
    const { container } = renderScene();
    const stage = container.querySelector('.scene__stage');
    expect(stage).not.toBeNull();
    // jsdom does not compute aspect-ratio, so the authored style attribute is
    // asserted directly (the browser resolves it to the camera framing).
    expect(stage).toHaveAttribute('style', expect.stringContaining('aspect-ratio: 1 / 0.75'));
    expect(stage).toHaveAttribute('style', expect.stringContaining('object-position: 50% 37.5%'));
  });
});
