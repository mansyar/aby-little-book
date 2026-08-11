// Semantic output of the layered scene: one section per scene carrying the
// localized description, one decorative <img> per validated layer in authored
// order. Meaning lives in the description, not in the pixels, so every layer
// image is aria-hidden with empty alt.

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { validManifest } from '../story/fixtures';
import { activeLayoutLayers } from './layout';
import { SceneView } from './SceneView';

describe('SceneView', () => {
  it('labels the scene with its title and exposes the localized description', () => {
    render(
      <SceneView
        layers={activeLayoutLayers(validManifest, 'ipad-landscape')}
        title="Share the Light"
        description="Aby held up the star lamp, and warm light wrapped around Lumi."
        basePath="/base"
      />,
    );
    expect(screen.getByLabelText('Share the Light')).toBeInTheDocument();
    expect(screen.getByText('Aby held up the star lamp, and warm light wrapped around Lumi.')).toBeInTheDocument();
  });

  it('renders one decorative image per layer in authored order', () => {
    render(
      <SceneView
        layers={activeLayoutLayers(validManifest, 'ipad-landscape')}
        title="Share the Light"
        description="Warm light wraps around Lumi."
        basePath="/base"
      />,
    );
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('src', '/base/assets/layers/bg-space.webp');
    expect(images[1]).toHaveAttribute('src', '/base/assets/layers/char-aby.webp');
    expect(images[2]).toHaveAttribute('src', '/base/assets/layers/fx-glow.webp');
  });

  it('marks every layer image as decorative and non-draggable', () => {
    render(
      <SceneView
        layers={activeLayoutLayers(validManifest, 'ipad-landscape')}
        title="Share the Light"
        description="Warm light wraps around Lumi."
        basePath="/base"
      />,
    );
    for (const image of screen.getAllByRole('img')) {
      expect(image).toHaveAttribute('alt', '');
      expect(image).toHaveAttribute('aria-hidden', 'true');
      expect(image).toHaveAttribute('draggable', 'false');
    }
  });

  it('renders no images when the active layout has no layers', () => {
    render(<SceneView layers={[]} title="Empty" description="Nothing here." basePath="/base" />);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.getByLabelText('Empty')).toBeInTheDocument();
  });
});
