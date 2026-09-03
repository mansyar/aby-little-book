import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TapTarget } from '../scene/package.js';
import type { SpeechProvider } from '../speech/speech.js';
import type { CameraPose } from './camera.js';
import { HotspotLayer } from './HotspotLayer.js';

// Camera above the lake looking at the origin: the boat target lands
// mid-frame, the moon target sits behind the camera.
const pose: CameraPose = {
  fov: 40,
  position: [0, 3.2, 7.5],
  target: [0, 1.0, 0],
};

const targets: TapTarget[] = [
  {
    id: 'boat',
    label: { en: 'Boat', id: 'Perahu' },
    position: { x: 0, y: 1.0, z: 0 },
  },
  {
    id: 'moon',
    label: { en: 'Moon', id: 'Bulan' },
    position: { x: 0, y: 3.2, z: 20 },
  },
];

function speech(): SpeechProvider {
  const speak: SpeechProvider['speak'] = vi.fn();
  return {
    supported: true,
    speaking: false,
    onEnd: null,
    speak,
    cancel: vi.fn(),
  };
}

function renderLayer(overrides: Partial<Parameters<typeof HotspotLayer>[0]> = {}) {
  const provider = speech();
  const onActivate = vi.fn();
  render(
    <HotspotLayer
      pose={pose}
      width={800}
      height={600}
      targets={targets}
      locale="id"
      activeId={null}
      speech={provider}
      onActivate={onActivate}
      {...overrides}
    />,
  );
  return { provider, onActivate };
}

describe('HotspotLayer', () => {
  it('renders one touch target per visible subject, labelled in locale', () => {
    renderLayer();
    expect(screen.getByRole('button', { name: 'Perahu' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bulan' })).not.toBeInTheDocument();
  });

  it('activates with glow plus the spoken word, never navigating', () => {
    const { provider, onActivate } = renderLayer();
    fireEvent.click(screen.getByRole('button', { name: 'Perahu' }));
    expect(onActivate).toHaveBeenCalledWith('boat');
    expect(onActivate).toHaveBeenCalledTimes(1);
    // Glow plus word: the pressed target shows its word and speaks it.
    const pressed = screen.getByRole('button', { name: 'Perahu' });
    expect(pressed).toHaveAttribute('aria-pressed', 'true');
    expect(pressed).toHaveTextContent('Perahu');
    expect(provider.speak).toHaveBeenCalledWith({
      text: 'Perahu',
      lang: 'id',
    });
  });

  it('stays silent and wordless when speech is unavailable', () => {
    renderLayer({ speech: null });
    fireEvent.click(screen.getByRole('button', { name: 'Perahu' }));
    // The glow still answers the touch; only the spoken word drops out.
    expect(screen.getByRole('button', { name: 'Perahu' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('announces the active word to assistive technology', () => {
    renderLayer({ activeId: 'boat' });
    expect(screen.getByRole('status')).toHaveTextContent('Perahu');
  });
});
